# Thanuja Kalla — Portfolio

A cinematic single-page portfolio for **Thanuja Kalla** — Business Analyst, SAP Analytics Cloud Consultant, and Power BI Developer.

**Live:** https://thanujakalla.github.io/portfolio/

## The concept — "The Story"

SAP Analytics Cloud dashboards are literally called *stories*, so the whole site reads like one: sections are pages (`Page 01 · The Work`, `Page 02 · Signature Stories`), the scroll cue says *"open the story"*, and the footer closes with *"End of story — for now."*

The background carries the same narrative. A WebGL field of drifting "data motes" starts as slow, messy noise at the top of the page; as you scroll, most particles fade away and the survivors organize into a clean bar chart — **messy data becoming a decision**, which is the job.

## Highlights

- **Hero** — masked word reveals, mono eyebrow, cursor-following lamp glow, film grain.
- **Kinetic interlude** — a pinned, scroll-scrubbed 3D type sequence: *Data arrives messy. / I clean it. Model it. Question it. / Until it reads like a decision.*
- **The Work** — a scroll-lit timeline of roles with exact resume numbers.
- **Signature Stories** — accordion case studies with cursor-tilting chart posters, including a featured end-to-end SAC delivery story and a work-in-progress [SAC AI Learning Portal](https://thanujakalla.github.io/sap-sac-ai-learning-portal/).
- **The dream** — a pinned, three-layer parallax illustration: a woman on a high-rise balcony over Central Park at dusk, hand-drawn in inline SVG (skyline, park canopy, twinkling lamps, steam rising off a mug).
- **Off duty** — a working "Perfect Brew" hold-and-release game, a "Suggest my next series" watchlist toy, and a travel card with a looping paper plane.
- **The read-line** — a thin amber-to-teal progress bar that only completes if you see the story through; the same progress is what organizes the particles.

## Tech stack

| Layer | Choice |
|---|---|
| Build | [Vite](https://vitejs.dev/) + vanilla JS (ES modules, no framework) |
| Animation | [GSAP](https://gsap.com/) with ScrollTrigger + SplitText |
| Scrolling | [Lenis](https://lenis.darkroom.engineering/) smooth inertial scroll |
| Background | [Three.js](https://threejs.org/) `THREE.Points` with a custom GLSL vertex/fragment shader |
| Fonts | Self-hosted via @fontsource — Fraunces (display serif), Inter (body), JetBrains Mono (labels) |

## Project structure

```
index.html            All markup — sections, inline SVG scenes, favicon
src/main.js           Choreography: Lenis, GSAP timelines, games, reveals
src/scene.js          WebGL particle field (chaos → order shader)
src/style.css         Design tokens, three-font system, all styling
public/               Resume PDF served as a download
.github/workflows/    GitHub Pages deploy on every push to main
```

## Running locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
```

## Deployment

Every push to `main` triggers the GitHub Actions workflow, which builds the site and deploys `dist/` to GitHub Pages. The Vite `base` is set to `/portfolio/` for production builds only, so local dev stays at `/`.

## Accessibility & craft

- `prefers-reduced-motion: reduce` → Lenis and GSAP are skipped entirely, the WebGL scene renders one static frame, and everything is visible; the interactive games still work (they're user-initiated).
- Cursor effects are gated behind `pointer: fine`; `devicePixelRatio` is capped at 1.75; particle count halves under 768px.
- Semantic HTML with `aria-expanded` accordions, `role="status"` live regions on game readouts, and `aria-hidden` decorative layers.
- Visible `:focus-visible` outlines, styled `::selection`, responsive down to 360px.

---

*Written the way it was lived: one stubborn iteration at a time.*
