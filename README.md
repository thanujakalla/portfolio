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
- **The dream** — a pinned, three-layer parallax illustration: a woman on a snowy chalet balcony in Switzerland, hand-drawn in inline SVG — a snow-lit peak in alpenglow, falling snow at three depths, snow-capped roofs and railings, twinkling village windows, and a little train sliding behind the chalets.
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

### Verifying a deploy actually landed

GitHub Pages caches `index.html` for **10 minutes** (`Cache-Control: max-age=600`) and there's no way to override that on Pages — so a plain reload right after a push can still show you yesterday's page even though the new build already succeeded. The code itself is never stale (every JS/CSS file is content-hashed, so a new build always ships under a new filename) — only the HTML shell can lag.

To check what's *actually* live, don't eyeball it — read the build stamp:

- Open DevTools Console on the live site — it logs `build <sha> · <ISO time>` on every load.
- Or check `document.documentElement.dataset.build` in the console.
- Compare the `<sha>` against `git log -1 --format=%h` for what you just pushed.

If the stamp is old: hard-refresh (**Cmd+Shift+R** / **Ctrl+Shift+R**) or open the URL in an incognito window — both bypass the browser's local cache and force a fresh fetch. Waiting also works; the CDN edge itself updates well before the 10-minute mark (usually near-instant, per `x-cache: MISS` on a fresh check), so it's almost always your own browser holding the old copy, not GitHub.

## Accessibility & craft

- `prefers-reduced-motion: reduce` → Lenis and GSAP are skipped entirely, the WebGL scene renders one static frame, and everything is visible; the interactive games still work (they're user-initiated).
- Cursor effects are gated behind `pointer: fine`; `devicePixelRatio` is capped at 1.75; particle count halves under 768px.
- Semantic HTML with `aria-expanded` accordions, `role="status"` live regions on game readouts, and `aria-hidden` decorative layers.
- Visible `:focus-visible` outlines, styled `::selection`, responsive down to 360px.

---

*Written the way it was lived: one stubborn iteration at a time.*
