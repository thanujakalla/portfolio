import * as THREE from 'three';

// The background tells the same story as the site:
// raw data motes drift in slow disorder at the top of the page,
// and as you scroll (uOrder 0 → 1) the noise thins out and the
// survivors settle into a clean, softly breathing bar chart —
// messy data becoming a recommendation.

const DEPTH = 300;

const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aTint;
  attribute float aKeep;
  attribute vec3 aTarget;
  uniform float uTime;
  uniform float uBoost;
  uniform float uOrder;
  uniform float uPixelRatio;
  varying float vTint;
  varying float vAlpha;

  void main() {
    // — chaotic life: slow, consistent forward drift —
    vec3 chaos = position;
    float travel = uTime * (5.0 + uBoost * 14.0);
    chaos.z = mod(chaos.z + travel, ${DEPTH}.0) - ${DEPTH}.0;
    chaos.x += sin(uTime * 0.14 + aPhase) * 1.6;
    chaos.y += cos(uTime * 0.11 + aPhase * 1.7) * 1.2;

    // — ordered life: a bar chart of dots, barely breathing —
    vec3 tidy = aTarget;
    tidy.x += sin(uTime * 0.2 + aPhase) * 0.25;
    tidy.y += cos(uTime * 0.17 + aPhase) * 0.2;

    float order = smoothstep(0.0, 1.0, uOrder);
    vec3 pos = mix(chaos, tidy, order);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (1.0 + uBoost * 0.25) * (130.0 / -mv.z);

    // fade in from the far plane, fade out near the camera
    float far = smoothstep(-${DEPTH}.0, -${DEPTH}.0 + 70.0, pos.z);
    float near = 1.0 - smoothstep(-18.0, -5.0, pos.z);
    // as order rises, most particles quietly leave the stage
    float survive = mix(1.0, aKeep, smoothstep(0.15, 0.75, uOrder));
    vAlpha = far * near * survive;
    vTint = aTint;
  }
`;

const fragment = /* glsl */ `
  uniform float uBoost;
  varying float vTint;
  varying float vAlpha;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float disc = smoothstep(0.5, 0.06, d);
    vec3 teal = vec3(0.435, 0.827, 0.780);
    vec3 amber = vec3(0.902, 0.651, 0.318);
    vec3 color = mix(teal, amber, vTint) * (1.0 + uBoost * 0.5);
    gl_FragColor = vec4(color, disc * vAlpha * 0.5);
  }
`;

export function createScene(container, { reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, DEPTH + 50);
  camera.position.set(0, 0, 4);

  const count = window.innerWidth < 768 ? 1100 : 3000;
  const positions = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const tints = new Float32Array(count);
  const keeps = new Float32Array(count);

  // ordered destination: 22 columns of stacked dots, an ascending chart
  const COLS = 22;
  const colHeight = Array.from({ length: COLS }, (_, c) => 10 + 38 * Math.pow((c + 1) / COLS, 1.6));

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 110;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 70;
    positions[i * 3 + 2] = -Math.random() * DEPTH;

    const col = i % COLS;
    targets[i * 3] = (col / (COLS - 1) - 0.5) * 88 + (Math.random() - 0.5) * 1.4;
    targets[i * 3 + 1] = -26 + Math.random() * colHeight[col];
    targets[i * 3 + 2] = -80 + (Math.random() - 0.5) * 6;

    sizes[i] = 1.2 + Math.random() * 2.4;
    phases[i] = Math.random() * Math.PI * 2;
    tints[i] = Math.random() < 0.15 ? 1 : 0;
    keeps[i] = Math.random() < 0.3 ? 1 : 0;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geo.setAttribute('aTint', new THREE.BufferAttribute(tints, 1));
  geo.setAttribute('aKeep', new THREE.BufferAttribute(keeps, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uTime: { value: 0 },
      uBoost: { value: 0 },
      uOrder: { value: 0 },
      uPixelRatio: { value: dpr },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  scene.add(new THREE.Points(geo, mat));

  let targetBoost = 0;
  let targetOrder = 0;
  const cursor = { x: 0, y: 0 };

  function render(time) {
    mat.uniforms.uTime.value = time;
    // lerp everything so changes have weight, never jolts
    mat.uniforms.uBoost.value += (targetBoost - mat.uniforms.uBoost.value) * 0.05;
    mat.uniforms.uOrder.value += (targetOrder - mat.uniforms.uOrder.value) * 0.045;
    camera.position.x += (cursor.x * 3 - camera.position.x) * 0.03;
    camera.position.y += (-cursor.y * 2 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, -DEPTH / 3);
    renderer.render(scene, camera);
  }

  if (reducedMotion) {
    render(12); // one atmospheric static frame
  } else {
    renderer.setAnimationLoop((t) => render(t / 1000));
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (reducedMotion) render(12);
  });

  return {
    setBoost(v) { targetBoost = v; },
    setOrder(v) { targetOrder = v; },
    setCursor(x, y) { cursor.x = x; cursor.y = y; },
  };
}
