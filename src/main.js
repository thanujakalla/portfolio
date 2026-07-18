import '@fontsource-variable/fraunces';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import './style.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { createScene } from './scene.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// GitHub Pages caches index.html for 10 min with no way to override it —
// this proves which build is actually live instead of guessing from a reload.
document.documentElement.dataset.build = `${__BUILD_SHA__}@${__BUILD_TIME__}`;
console.log(`build ${__BUILD_SHA__} · ${__BUILD_TIME__}`);

const sceneApi = createScene(document.getElementById('scene'), { reducedMotion });

/* —————————————————— the brew game & watchlist (work regardless of motion prefs) —————————————————— */
initBrewGame();
initWatchlist();

function initBrewGame() {
  const root = document.querySelector('.brew');
  if (!root) return;
  const fill = root.querySelector('.brew__fill');
  const btn = root.querySelector('.brew__btn');
  const verdict = root.querySelector('.brew__verdict');
  const lo = Number(root.dataset.zoneLo);
  const hi = Number(root.dataset.zoneHi);

  let raf = null;
  let level = 0;
  let brewing = false;

  const verdicts = (v) => {
    if (v >= 100) return 'It boiled over. Root-cause analysis: you got distracted. ☕🔥';
    if (v < 25) return 'That’s just hot water with ambition. Steep longer.';
    if (v < lo) return 'Under-brewed. Send it back to UAT.';
    if (v <= hi) return 'Barista-grade. Six-time Top Performer energy. ☕✨';
    return 'Over-brewed. Strong enough to query itself.';
  };

  function tick() {
    level = Math.min(100, level + 1.1);
    fill.style.transform = `scaleX(${level / 100})`;
    if (level >= 100) return release();
    raf = requestAnimationFrame(tick);
  }

  function press() {
    if (brewing) return;
    brewing = true;
    level = 0;
    verdict.textContent = '';
    btn.textContent = 'Brewing…';
    raf = requestAnimationFrame(tick);
  }

  function release() {
    if (!brewing) return;
    brewing = false;
    cancelAnimationFrame(raf);
    verdict.textContent = verdicts(level);
    btn.textContent = 'Brew again';
  }

  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); press(); });
  window.addEventListener('pointerup', release);
  btn.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); press(); }
  });
  btn.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Enter') release();
  });
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}

/* —————————————————— the watchlist: suggest my next series —————————————————— */
function initWatchlist() {
  const screen = document.querySelector('.tv__screen');
  const btn = document.querySelector('.tv__btn');
  if (!screen || !btn) return;

  const picks = [
    'Wednesday — horror-adjacent, rom-com-curious. Approved.',
    'The Haunting of Hill House — for the horror heart.',
    'Nobody Wants This — a rom-com with zero jump scares.',
    'Dark — a time-series problem with feelings.',
    'You — romance and red flags, all clearly labeled.',
    'Derry Girls — no ghosts, all chaos, pure joy.',
    'Stranger Things — the crossover episode of both loves.',
    'Emily in Paris — for palate cleansing between screams.',
  ];
  let deck = [];
  btn.addEventListener('click', () => {
    if (!deck.length) deck = [...picks].sort(() => Math.random() - 0.5);
    screen.classList.remove('is-on');
    void screen.offsetWidth; // restart the flicker animation
    screen.textContent = deck.pop();
    screen.classList.add('is-on');
  });
}

/* —————————————————— reduced motion: static site, quiet exit —————————————————— */
if (reducedMotion) {
  document.querySelectorAll('[data-scroll]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView(); }
    })
  );
} else {
  initMotion();
}

function initMotion() {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ——— smooth scroll ——— */
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('[data-scroll]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      lenis.scrollTo(a.getAttribute('href'), { offset: 0 });
    })
  );

  /* ——— scene boost = scroll velocity + kinetic surge; order = how far the story has been read ——— */
  let kineticBoost = 0;
  const readline = document.querySelector('.readline');
  gsap.ticker.add(() => {
    const v = Math.min(Math.abs(lenis.velocity) / 90, 0.8);
    const progress = gsap.utils.clamp(0, 1, lenis.progress ?? 0);
    sceneApi.setBoost(Math.min(1.2, v + kineticBoost));
    sceneApi.setOrder(progress);
    if (readline) readline.style.transform = `scaleX(${progress})`;
  });

  /* ——— cursor: glow, camera parallax ——— */
  if (finePointer) {
    const glow = document.querySelector('.glow');
    const glowX = gsap.quickTo(glow, 'x', { duration: 1, ease: 'power2.out' });
    const glowY = gsap.quickTo(glow, 'y', { duration: 1, ease: 'power2.out' });
    window.addEventListener('pointermove', (e) => {
      glowX(e.clientX);
      glowY(e.clientY);
      sceneApi.setCursor(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    });
  }

  /* ——— hero ——— */
  gsap.set('.hero__word', { yPercent: 118 });
  gsap.set('.hero__eyebrow, .hero__tag, .scroll-cue', { opacity: 0, y: 20 });
  gsap.timeline({ delay: 0.25 })
    .to('.hero__word', { yPercent: 0, duration: 1.3, ease: 'power4.out', stagger: 0.14 })
    .to('.hero__eyebrow, .hero__tag, .scroll-cue', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 }, '-=0.7');

  gsap.to('.hero', {
    yPercent: -18,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  /* ——— kinetic interlude ——— */
  const phrases = gsap.utils.toArray('.kinetic__phrase');
  const splits = phrases.map((p) => new SplitText(p, { type: 'chars', charsClass: 'char' }));
  const kinetic = gsap.timeline({
    scrollTrigger: {
      trigger: '.kinetic',
      start: 'top top',
      end: '+=3200',
      pin: true,
      scrub: true,
      onUpdate: (self) => { kineticBoost = Math.sin(self.progress * Math.PI) * 1.2; },
      onLeave: () => { kineticBoost = 0; },
      onLeaveBack: () => { kineticBoost = 0; },
    },
  });

  phrases.forEach((phrase, i) => {
    const chars = splits[i].chars;
    const isFinal = phrase.classList.contains('kinetic__phrase--final');
    kinetic
      .fromTo(phrase, { z: -1500, opacity: 0 }, { z: 0, opacity: 1, duration: 1.2, ease: 'power2.out' }, i * 3)
      .fromTo(chars, { rotateX: -80, opacity: 0 }, { rotateX: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out' }, i * 3 + 0.15);
    if (!isFinal) {
      kinetic.to(chars, {
        z: () => gsap.utils.random(400, 900),
        opacity: 0,
        duration: 1,
        stagger: { each: 0.012, from: 'random' },
        ease: 'power2.in',
      }, i * 3 + 2);
    } else {
      kinetic.to(phrase, { scale: 1.07, duration: 1.4, ease: 'power1.inOut' }, i * 3 + 1.4);
    }
  });

  /* ——— global fade-up reveals ——— */
  gsap.utils.toArray(
    '.eyebrow:not(.hero__eyebrow):not(.balcony__eyebrow), .section-title, .role, .case, .edu__card, .about__lead, .about__facts, .hobby, .contact__line, .contact__mail, .contact__links'
  ).forEach((el) => {
    gsap.from(el, {
      y: 44,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  /* ——— work timeline ——— */
  gsap.to('.timeline__progress', {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 55%', scrub: true },
  });
  gsap.utils.toArray('.role').forEach((role) => {
    ScrollTrigger.create({
      trigger: role,
      start: 'top 75%',
      toggleClass: { targets: role, className: 'is-lit' },
      once: false,
    });
  });

  /* ——— case accordions ——— */
  document.querySelectorAll('.case').forEach((item) => {
    const head = item.querySelector('.case__head');
    const body = item.querySelector('.case__body');
    const inner = item.querySelector('.case__inner');
    const poster = item.querySelector('.case__poster');

    head.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(open));
      if (open) {
        gsap.to(body, { height: inner.offsetHeight, duration: 0.85, ease: 'power3.inOut', onComplete: () => { body.style.height = 'auto'; ScrollTrigger.refresh(); } });
        gsap.fromTo(inner.children, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, delay: 0.2, ease: 'power3.out' });
      } else {
        gsap.to(body, { height: 0, duration: 0.7, ease: 'power3.inOut', onComplete: () => ScrollTrigger.refresh() });
      }
    });

    if (finePointer && poster) {
      const rx = gsap.quickTo(poster, 'rotationX', { duration: 0.6, ease: 'power2.out' });
      const ry = gsap.quickTo(poster, 'rotationY', { duration: 0.6, ease: 'power2.out' });
      item.addEventListener('pointermove', (e) => {
        const r = poster.getBoundingClientRect();
        ry(gsap.utils.clamp(-10, 10, ((e.clientX - r.left) / r.width - 0.5) * 20));
        rx(gsap.utils.clamp(-10, 10, -((e.clientY - r.top) / r.height - 0.5) * 20));
      });
      item.addEventListener('pointerleave', () => { rx(0); ry(0); });
    }
  });

  /* ——— balcony: pinned pan + char reveal ——— */
  const balconyTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.balcony__pin',
      start: 'top top',
      end: '+=1600',
      pin: true,
      scrub: true,
    },
  });
  balconyTl
    .to('.layer--far', { xPercent: -3.5, ease: 'none' }, 0)
    .to('.layer--mid', { xPercent: -8, ease: 'none' }, 0)
    .to('.layer--near', { xPercent: -14, ease: 'none' }, 0);

  const titleSplit = new SplitText('.balcony__title', { type: 'chars', charsClass: 'char' });
  gsap.from(titleSplit.chars, {
    yPercent: 110,
    opacity: 0,
    duration: 0.9,
    stagger: 0.05,
    ease: 'power4.out',
    scrollTrigger: { trigger: '.balcony__pin', start: 'top 60%' },
  });

  if (finePointer) {
    const amps = [{ sel: '.layer--far', amp: 8 }, { sel: '.layer--mid', amp: 18 }, { sel: '.layer--near', amp: 32 }];
    const movers = amps.map(({ sel, amp }) => ({ to: gsap.quickTo(sel, 'x', { duration: 1.1, ease: 'power2.out' }), amp }));
    window.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      movers.forEach(({ to, amp }) => to(-nx * amp));
    });
  }

  /* ——— magnetic hover ——— */
  if (finePointer) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      const my = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }
}
