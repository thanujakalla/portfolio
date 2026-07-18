# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A single-page cinematic portfolio for **Thanuja Kalla** (Business Analyst ·
SAP Analytics Cloud · Power BI), themed as **"The Story"** — SAC dashboards
are literally called *stories*, so sections read as pages of one
(`Page 01 · The Work`, scroll cue "open the story", footer "End of story —
for now."). The WebGL background mirrors the pitch: particles drift as noise
at the top and organize into a bar chart as you scroll — messy data becoming
a decision.

Live: **https://thanujakalla.github.io/portfolio/** (GitHub Pages,
repo `thanujakalla/portfolio`).

## Commands

```bash
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/ (base: /portfolio/)
npm run preview    # serve the production build
```

Deploy = push to `main`; `.github/workflows/deploy.yml` builds and publishes
Pages automatically (~30 s). Confirm with
`gh run list --repo thanujakalla/portfolio --limit 1`.

## Architecture

Vite + vanilla JS (ES modules, no framework). Four source files:

- **`index.html`** — all markup, including two hand-drawn inline-SVG scenes.
  Section order: hero → `.kinetic` (pinned type interlude) → `#work`
  (timeline) → `#stories` (case accordions; SAC delivery is
  `.case--featured`, learning portal uses a real screenshot poster) →
  `#curriculum` → `#now`-slot → `#author` (**intentionally `hidden`** — do
  not delete or un-hide without being asked) → `#balcony` (Zermatt /
  Matterhorn scene with the woman silhouette) → `#offduty` (hobby cards:
  brew game, watchlist toy, travel) → `#contact` → footer.
- **`src/main.js`** — all behavior. Interactive features that must work for
  everyone (`initBrewGame()`, `initWatchlist()`) run at top level; **all
  animation lives inside `initMotion()`**, which is skipped entirely under
  `prefers-reduced-motion`. Lenis + GSAP ticker also feed `setBoost` /
  `setOrder` to the scene and drive the `.readline` progress bar.
- **`src/scene.js`** — Three.js `THREE.Points` with a custom GLSL shader.
  Exposes `setBoost(v)` (scroll surge), `setOrder(v)` (0→1 chaos→bar-chart),
  `setCursor(x, y)`. Don't modify unless the task requires it.
- **`src/style.css`** — design tokens at the top; **root font-size is
  81.25%** (deliberate 80% optical scale) — size in rem, and keep vw-based
  clamps modest.

## Hard rules

1. **Relative URLs only** in HTML/JS (`images/foo.jpg`, `now.json`) — prod
   serves under `/portfolio/`, so root-absolute paths 404. Meta/OG tags are
   the exception: full `https://thanujakalla.github.io/portfolio/...`.
2. **Reduced motion** must always yield a complete static site (no Lenis/
   GSAP, everything visible; user-initiated interactions still work).
3. **Cursor effects** gate behind the existing `finePointer` const.
4. **Resume as single source of truth** for facts — never invent employers,
   dates, or numbers. Keep the resume's numbers exact (20%, 30%, 6×).
5. **Privacy:** the phone number was deliberately removed from the site and
   redacted from both PDFs — never reintroduce it.
6. Copy voice: confident, slightly playful, first person, short cinematic
   sentences, concrete numbers over adjectives. `<em>` renders italic teal;
   `<strong>` renders amber.
7. Match existing idioms (BEM-ish classes, GSAP patterns, `const`, small
   functions). No new dependencies or frameworks without asking.
8. A11y basics are non-negotiable: `aria-hidden` on decorative layers,
   `role="status"` on live readouts, real buttons/links, visible focus.

## Verification workflow

Never call visual work done from a green build alone. After `npm run build`:
run the dev server, drive headless Chrome
(`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, via
`playwright-core` installed in a scratch dir — not this repo), assert zero
`pageerror`s, screenshot the changed feature, **and look at the screenshot**.
Repeat with `reducedMotion: 'reduce'`. Note: pinned sections make
scroll-position math unreliable — prefer bounded wheel loops or element
screenshots over `scrollIntoView` with exact offsets (Lenis fights direct
scroll writes).

## Current facts (keep consistent)

- Contact location: **Dallas, TX** (education card keeps St. Louis for SLU).
- Email `kallathanuja027@gmail.com` · LinkedIn `/in/thanuja-kalla/`.
- Resume download: `public/Thanuja_Kalla_Resume.pdf` (phone-redacted).
- Side project: SAC AI Learning Portal —
  https://thanujakalla.github.io/sap-sac-ai-learning-portal/ (work in
  progress; Days 1–10 live).
- No custom domain for now — user explicitly deferred it; don't propose DNS
  work.

## Roadmap

`PLAN.md` holds five self-contained agent task briefs (OG card, preloader,
SEO/analytics, micro-interactions, "now" strip) with their own shared-context
block, acceptance checklists, and an orchestrator runbook. Execute one task
at a time — they touch overlapping files. Task 3's analytics step needs a
GoatCounter code from the user.
