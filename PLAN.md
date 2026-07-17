# Implementation Plan — agent task briefs

Five independent tasks upgrading this portfolio. Each brief is written for an
agent starting cold: read **Shared context** first, then execute one task
end-to-end. Tasks are independent; run them in any order, but one at a time
(they touch overlapping files).

---

## Shared context (read before any task)

### What this project is

A single-page cinematic portfolio for Thanuja Kalla (Business Analyst / SAP
Analytics Cloud / Power BI), themed as "The Story" — SAC dashboards are called
*stories*, and the site reads like one. Dark palette, serif display type,
WebGL particle background that organizes from noise into a bar chart as you
scroll. Tone of all copy: confident, slightly playful, first-person, short
cinematic sentences.

### Stack & file map

- **Vite + vanilla JS** (no framework), GSAP (ScrollTrigger, SplitText),
  Lenis smooth scroll, Three.js custom shader background.
- `index.html` — all markup. Sections in order: hero → `.kinetic` →
  `#work` → `#stories` (case accordions) → `#curriculum` → `#author`
  (hidden via `hidden` attr) → `#balcony` (New York scene) → `#offduty`
  (hobby cards) → `#contact` → footer.
- `src/main.js` — all behavior. Structure: imports → `reducedMotion` /
  `finePointer` consts → `createScene(...)` → `initBrewGame()` /
  `initWatchlist()` (these run for everyone) → `if (reducedMotion) {...}
  else { initMotion() }` — **everything animated lives inside
  `initMotion()`**.
- `src/scene.js` — WebGL particles. Has `setBoost`, `setOrder`, `setCursor`.
  Do not modify unless a task says so.
- `src/style.css` — design tokens at top (`--ink`, `--paper`, `--amber`,
  `--teal`, `--chili`, `--serif`, `--sans`, `--mono`). Root font-size is
  81.25% — size everything in rem.
- `public/` — copied verbatim to build output (resume PDF, `images/`).
- Deploy: push to `main` → GitHub Actions builds and deploys to
  **https://thanujakalla.github.io/portfolio/**.

### Hard rules (apply to every task)

1. **Base path.** Production builds use Vite `base: '/portfolio/'`. All URLs
   in HTML/JS must be **relative** (`images/foo.jpg`, `now.json`) — never
   root-absolute (`/images/foo.jpg`). Exception: OG/meta URLs must be the
   full absolute `https://thanujakalla.github.io/portfolio/...`.
2. **Reduced motion.** `prefers-reduced-motion: reduce` must get a fully
   working static site: no Lenis, no GSAP timelines, everything visible.
   New animated features go inside `initMotion()`; new interactive features
   (user-initiated) go outside it, like `initBrewGame()`.
3. **Pointer gating.** Cursor-following effects only when
   `matchMedia('(pointer: fine)')` matches (use the existing `finePointer`
   const). Nothing cursor-based on touch devices.
4. **Match existing style.** Vanilla JS, small functions, `const`, template
   literals, GSAP idioms already in the file. CSS uses the custom properties
   and BEM-ish class names (`.block__part--variant`). No new dependencies,
   no frameworks, no build plugins unless the task says so.
5. **Don't touch what the task doesn't name.** No refactors, no reformatting
   of untouched code, no version bumps.
6. **Accessibility.** Decorative elements get `aria-hidden="true"`. Live
   text updates get `role="status" aria-live="polite"`. Interactive elements
   are real `<button>`/`<a>` with visible `:focus-visible` (already styled
   globally).

### Verification recipe (run at the end of every task)

```bash
npm run build          # must succeed with no new warnings
npm run dev            # serves http://localhost:5173
```

Then drive a real browser. `playwright-core` may already be installed in the
scratch area; otherwise `npm i playwright-core` in a temp dir (NOT in this
repo) and launch headless Chrome at
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`:

- Load the page, wait ~2 s, collect `pageerror` events — must be zero.
- Screenshot the feature you built and **look at the screenshot**.
- Repeat with `reducedMotion: 'reduce'` in the browser context — the site
  must render fully and your feature must degrade per rule 2.

Commit with a clear message + `Co-Authored-By` trailer per repo convention,
push to `main`, then confirm the deploy:
`gh run list --repo thanujakalla/portfolio --limit 1` → `success`.

---

## Task 1 — Open Graph / social card

**Goal:** pasting the site URL into LinkedIn/Slack/iMessage shows a branded
1200×630 card instead of a blank tile.

### Steps

1. Create `og/card.html` (repo root; it is source material, not served):
   a standalone page, exactly 1200×630, no external requests. Recreate the
   hero look with inline CSS: background `#0b0e14`; scatter ~40 small
   teal (`#6fd3c7`) and ~8 amber (`#e6a651`) dots of 2–5 px at random
   positions (hardcode them; a tiny inline `<script>` that generates them
   at load is also fine); centered text —
   - mono eyebrow (ui-monospace fallback stack is fine since @fontsource
     isn't available here): `A STORY IN DATA · BUSINESS ANALYST — SAC · POWER BI`
     in `#e6a651`, letter-spacing 0.25em, ~20px;
   - `Thanuja` in a Georgia/serif stack, ~110px, `#f2ece2`;
   - `Kalla` italic in `#6fd3c7`, same size, on the next line or same line
     (match the hero: two stacked lines, tight line-height);
   - bottom-right corner, muted mono ~16px: `thanujakalla.github.io/portfolio`.
2. Screenshot it headless at exactly 1200×630:
   `"$CHROME" --headless --window-size=1200,630 --screenshot=og-raw.png file:///…/og/card.html`
   (write the raw capture to a temp dir), then convert:
   `sips -s format jpeg -s formatOptions 85 og-raw.png --out public/images/og.jpg`.
   Look at the image — text must not be clipped or off-center.
3. In `index.html` `<head>`, after the existing `<meta name="description">`,
   add:
   ```html
   <meta name="theme-color" content="#0b0e14" />
   <link rel="canonical" href="https://thanujakalla.github.io/portfolio/" />
   <meta property="og:type" content="website" />
   <meta property="og:title" content="Thanuja Kalla — Data, told as a story" />
   <meta property="og:description" content="Business Analyst · SAP Analytics Cloud · Power BI. Messy data in, decisions out." />
   <meta property="og:url" content="https://thanujakalla.github.io/portfolio/" />
   <meta property="og:image" content="https://thanujakalla.github.io/portfolio/images/og.jpg" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   <meta name="twitter:card" content="summary_large_image" />
   ```
4. Verify: build; `curl -sI` the deployed og.jpg URL after push → `200` and
   `image/jpeg`; check the tags render in view-source of the deployed page.

### Acceptance

- [ ] `public/images/og.jpg` is 1200×630, < 200 KB, visually on-brand
- [ ] All meta URLs are absolute with the `/portfolio/` path
- [ ] `og/card.html` committed so the card is regenerable
- [ ] Deployed og.jpg returns 200

---

## Task 2 — Preloader ("opening moment")

**Goal:** first visit shows a ≤1.6 s sequence — `connecting to source…` →
`modeling…` → `rendering story` — then wipes up into the existing hero
reveal. Repeat visits in the same session and reduced-motion users skip it.

### Steps

1. **Markup** — in `index.html`, immediately after `<body>`:
   ```html
   <div class="loader" aria-hidden="true">
     <p class="loader__line">connecting to source…</p>
     <p class="loader__line">modeling…</p>
     <p class="loader__line">rendering story</p>
   </div>
   ```
2. **Critical CSS** — small `<style>` block in `<head>` (before the JS
   module loads) so there is no flash: `.loader` is `position: fixed;
   inset: 0; z-index: 90; background: #0b0e14; display: grid;
   place-items: center;`. Lines are stacked in the same grid cell
   (`grid-area: 1/1`), mono font stack, uppercase, letter-spacing 0.25em,
   ~0.8rem, color `#e6a651`, `opacity: 0`. Also add
   `html.no-loader .loader { display: none; }`.
3. **Skip logic** — inline `<script>` in `<head>` (before the module):
   ```html
   <script>
     if (sessionStorage.getItem('seen') ||
         matchMedia('(prefers-reduced-motion: reduce)').matches) {
       document.documentElement.classList.add('no-loader');
     } else { sessionStorage.setItem('seen', '1'); }
   </script>
   ```
4. **Animation** — in `src/main.js`, inside `initMotion()`, **wrap the
   existing hero intro timeline** in a new `runIntro()` flow:
   - If `document.documentElement.classList.contains('no-loader')`:
     remove the loader element, run the existing hero timeline unchanged.
   - Else build one GSAP timeline: each `.loader__line` fades in
     (`opacity: 0→1, y: 8→0`, 0.28 s) and out (0.22 s), sequentially —
     total ≈ 1.2 s; then the loader wipes `yPercent: -100` with
     `power4.inOut` (0.7 s) and `display: none` on complete; the existing
     hero word/eyebrow reveal starts at `-=0.4` on the same timeline.
     Also call `sceneApi.setBoost(1)` at wipe start and back to normal
     (boost decays via the existing ticker) so particles "wake up".
   - Hard cap: start this timeline immediately — do **not** await fonts or
     network. The loader is theater, not a real gate.
5. In the reduced-motion branch (the `if (reducedMotion)` block), remove
   the loader element outright: `document.querySelector('.loader')?.remove()`.

### Acceptance

- [ ] Cold load: sequence plays once, hero interactive in ≤ 2 s
- [ ] Reload in same session: no loader at all, hero reveal unchanged
- [ ] Reduced-motion context: no loader, page fully visible, zero errors
- [ ] No layout shift or white flash before the loader paints

---

## Task 3 — SEO, structured data & analytics

**Goal:** machine-readable identity, crawlability, and privacy-friendly
analytics. **Ask the user for their GoatCounter site code before starting
step 4; if they don't have one, skip step 4 and say so in your report.**

### Steps

1. **JSON-LD** — in `index.html` before `</head>`:
   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "Person",
     "name": "Thanuja Kalla",
     "jobTitle": "Business Analyst",
     "description": "Business Analyst, SAP Analytics Cloud Consultant, and Power BI Developer.",
     "url": "https://thanujakalla.github.io/portfolio/",
     "email": "mailto:kallathanuja027@gmail.com",
     "address": { "@type": "PostalAddress", "addressLocality": "St. Louis", "addressRegion": "MO" },
     "alumniOf": [
       { "@type": "CollegeOrUniversity", "name": "Saint Louis University" },
       { "@type": "CollegeOrUniversity", "name": "GITAM University" }
     ],
     "knowsAbout": ["SAP Analytics Cloud", "SAP Datasphere", "Power BI", "SQL", "Python", "Data Modeling", "KPI Reporting"],
     "sameAs": ["https://www.linkedin.com/in/thanuja-kalla/", "https://github.com/thanujakalla"]
   }
   </script>
   ```
   Do not invent additional facts — this data mirrors the page.
2. **robots.txt** — `public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://thanujakalla.github.io/portfolio/sitemap.xml
   ```
3. **sitemap.xml** — `public/sitemap.xml` with the single URL
   `https://thanujakalla.github.io/portfolio/` (standard urlset schema).
4. **Analytics (only with a real site code from the user)** — before
   `</body>`:
   ```html
   <script data-goatcounter="https://CODE.goatcounter.com/count"
           async src="//gc.zgo.at/count.js"></script>
   ```
   This is the one allowed external script. Verify a pageview registers.
5. **Validate** — JSON-LD parses (paste into a validator or `JSON.parse`
   the block's text content in the browser console); Lighthouse SEO score
   100 (`npx lighthouse` or DevTools); deployed robots/sitemap return 200.

### Acceptance

- [ ] JSON-LD valid, mirrors on-page facts only
- [ ] robots.txt + sitemap.xml deployed and reachable
- [ ] Lighthouse: SEO 100, accessibility unchanged (100)
- [ ] Analytics either live (pageview confirmed) or explicitly skipped

---

## Task 4 — Micro-signature interactions

**Goal:** four small "designed" details. Every one gated per Hard Rules 2–3.
Build in this order; each sub-feature is independently shippable.

### 4a. Cursor ring

- New fixed element `<div class="cursor-ring" aria-hidden="true"></div>`
  (append via JS inside `initMotion()`, only if `finePointer`).
- CSS: 2.2rem circle, `border: 1px solid rgba(242,236,226,.4)`,
  `border-radius: 50%`, `position: fixed`, `z-index: 70`,
  `pointer-events: none`, centered with negative margins, small mono glyph
  rendered via a `::after` reading `content: attr(data-glyph)` on the ring
  won't work for pseudo—put the glyph in the div's text content instead,
  styled mono 0.7rem, amber, centered with flex.
- JS: two `gsap.quickTo` (x/y, duration 0.35, `power3.out`) on
  `pointermove`. **Do not** hide the native cursor.
- Context morphing: elements opt in via `data-cursor="+"` /
  `data-cursor="↗"` / `data-cursor="▸"`. Add those attributes to
  `.case__head` (`+`), external links incl. `.case__link` (`↗`), and
  `.brew__btn` / `.tv__btn` (`▸`). On `pointerover`/`pointerout`
  (delegated on `document`, using `e.target.closest('[data-cursor]')`),
  set the ring's text and toggle a `.is-active` class that scales it to
  1.4 and tints the border amber (CSS transition, 0.25 s).

### 4b. "sac" easter egg

- Listen for `keydown` on `window`; track the last 3 letter keys; when they
  spell `s`,`a`,`c` (case-insensitive) and `document.activeElement` is not
  an input/textarea, fire once per session (module-scope flag).
- Effect: spawn ~50 `<span>` into a fixed, `pointer-events: none`,
  `aria-hidden` container: each 0.5–0.9rem wide, 1.5–3.5rem tall, 2px
  radius, teal (85%) or amber (15%), random x across the viewport, starting
  above it. Animate with GSAP: fall to below the viewport over 1.4–2.2 s,
  slight rotation, `power1.in`, stagger 0–0.6 s random; remove the
  container `onComplete`.
- Simultaneously show a mono toast bottom-center: `hidden KPI unlocked ✦`,
  amber, fades in/out over ~2.5 s, `role="status"`.
- Works in both motion modes (it's user-initiated) — but in reduced motion
  show **only the toast**, no falling bars.

### 4c. Accordion tick (opt-in sound)

- Header: add a `<button class="sound" aria-pressed="false"
  aria-label="Toggle interface sounds">` after the status dot, rendering a
  small mono `♪` with a diagonal strike-through when off (CSS, default).
- WebAudio, no files: on toggle-on create one `AudioContext`; a tick =
  oscillator (sine, ~880 Hz → 440 Hz pitch drop over 60 ms) through a gain
  envelope (0.08 → 0 exponential, 80 ms total).
- Play on: accordion open/close, brew release, watchlist suggest.
  Wire by dispatching from those existing handlers through one exported
  `tick()` helper that no-ops when muted.
- Persist preference in `localStorage('sound')`; never autoplay anything;
  create the AudioContext only on first enable (browser policy).

### 4d. Active-section nav

- In `initMotion()`, for each nav target (`#work`, `#stories`,
  `#curriculum`, `#offduty`, `#contact`) create a
  `ScrollTrigger { start: 'top 55%', end: 'bottom 55%' }` that toggles
  `.is-active` on the matching `.site-head nav a`.
- CSS: `.site-head nav a.is-active::after { transform: scaleX(1); }`
  (reuses the existing underline element) — hover behavior unchanged.

### Acceptance

- [ ] Ring follows with lag, morphs over the three contexts, absent on touch
- [ ] Typing `sac` rains bars + toast once per session; toast-only under
      reduced motion; typing in a form field never triggers it
- [ ] Sound OFF by default, survives reload, tick ≤ 100 ms, no autoplay
      warnings in console
- [ ] Nav underline tracks the section in view while scrolling
- [ ] Lighthouse scores unchanged; zero console errors in both motion modes

---

## Task 5 — "Now" strip (editable without code)

**Goal:** a one-line "currently" strip the owner updates by editing a JSON
file on github.com — commit → auto-deploy, no local tooling.

### Steps

1. `public/now.json`:
   ```json
   {
     "updated": "2026-07-18",
     "items": [
       "Building Day 11 of the SAC learning portal",
       "Watching: Bridgerton · Ginny & Georgia",
       "Open to BI / SAC / Power BI roles"
     ]
   }
   ```
2. Markup — in `index.html`, between the `#curriculum` section's close and
   the `#author` section, a slim section (not full padding — override with
   a `.now` class, ~2.5rem vertical):
   ```html
   <section class="now" id="now" aria-label="Currently">
     <p class="eyebrow">Margin note · Now</p>
     <p class="now__line"></p>
   </section>
   ```
3. CSS — `.now__line`: mono, 0.8rem, `--muted` color, items joined by
   ` · ` with the `as of {updated}` suffix in a dimmer span
   (`opacity: .55`).
4. JS — top-level (outside `initMotion()`, it must work for everyone), an
   `initNow()` following the `initWatchlist()` pattern:
   ```js
   fetch('now.json').then(r => r.ok ? r.json() : Promise.reject())
     .then(({ items, updated }) => { /* build text, insert */ })
     .catch(() => document.getElementById('now')?.remove());
   ```
   Use `textContent` (not innerHTML) for the items. Relative URL is
   mandatory (Hard Rule 1).
5. Add `.now` to the fade-up reveal selector list inside `initMotion()`
   (the long `gsap.utils.toArray('...')` string).
6. README — add a short "Updating the Now strip" section: edit
   `public/now.json` on github.com → Commit changes → live in ~1 minute.

### Acceptance

- [ ] Strip renders between Curriculum and the New York interlude
- [ ] Deleting/breaking now.json removes the section cleanly (no errors,
      no empty gap animations)
- [ ] Works under reduced motion and on mobile width (360px)
- [ ] README explains the github.com edit flow in ≤ 5 lines

---

## Runbook for the orchestrator

- Dispatch one task per agent, sequentially (shared files: `index.html`,
  `src/main.js`, `src/style.css`). Give each agent this file plus the task
  number.
- After each agent reports: skim its diff, run the Verification recipe
  yourself if the report lacks screenshots, then let it commit/push before
  starting the next task.
- Task 3 needs the GoatCounter code from the user; Task 1 and 2 are the
  highest-visibility wins if prioritizing.
