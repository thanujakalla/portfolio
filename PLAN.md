# Implementation Plan — the road to $20k

Scope: items **3, 4, 6, 7, 9** from the upgrade list. Ordered by suggested build
sequence (dependencies first, quick wins early). Each item lists the approach,
files touched, and a done-when checklist.

---

## Phase 1 — #4: Open Graph / social card

*The link is the first impression — most visitors arrive from LinkedIn.*

1. Design a 1200×630 card in the site's visual language: near-black ink
   background, "Thanuja Kalla" in Fraunces with the italic teal *Kalla*,
   mono eyebrow, a strip of the particle field. Render it by screenshotting
   a small standalone HTML file at exactly 1200×630 → `public/images/og.jpg`
   (keep the HTML in `og/` so the card is regenerable).
2. Add to `<head>`: `og:title`, `og:description`, `og:image` (absolute URL
   on the github.io address), `og:url`, `twitter:card = summary_large_image`,
   `theme-color`.
3. Validate with an OG preview tool + a real paste into LinkedIn.

**Done when:** pasting the site URL into LinkedIn/iMessage/Slack shows the
branded card, not a blank tile.

---

## Phase 2 — #3: Opening moment (preloader)

*Sets the narrative before a single word is read; hides font/WebGL pop-in.*

**Approach:** a full-viewport `.loader` overlay in `index.html` (inline-styled
so it renders before CSS loads): three mono lines that resolve in sequence —
`connecting to source…` → `modeling…` → `rendering story` — then the overlay
wipes upward and the existing hero reveal timeline fires.

1. Markup + minimal inline critical CSS in `<head>` (background, centered mono
   text) so there is zero flash of unstyled page.
2. In `main.js`: gate on `Promise.all([document.fonts.ready, scene-first-frame])`
   with a **hard cap of 1.6 s** — the loader must never outlast a fast
   connection's patience. Then a GSAP timeline: lines stagger out, overlay
   `yPercent: -100` with `power4.inOut`, hero reveal starts at `-=0.3`.
3. Skip entirely under `prefers-reduced-motion` (remove overlay instantly)
   and on repeat visits within the session (`sessionStorage` flag).
4. Fire `sceneApi.setBoost(1)` briefly on reveal so the particles "wake up"
   with the page.

**Done when:** cold load shows the three-line sequence once, total time to
interactive hero ≤ 2 s on broadband, reduced-motion and revisit paths skip it.

---

## Phase 3 — #9: SEO, structured data & analytics

*Invisible work that decides whether recruiters find the site — and whether
she knows they did.*

1. **Meta:** canonical URL, `theme-color`, refined `<meta name="description">`
   (the OG tags arrive in 4a).
2. **Structured data:** one JSON-LD `Person` block — name, jobTitle,
   knowsAbout (SAC, Datasphere, Power BI, SQL, Python), alumniOf (SLU, GITAM),
   sameAs (LinkedIn, GitHub), url. Validate with Google's Rich Results test.
3. **Crawlability:** `public/robots.txt` (allow all + sitemap pointer) and a
   minimal `public/sitemap.xml` (single URL — it's a one-pager).
4. **Analytics:** GoatCounter (free, no cookies, no consent banner needed) —
   one `<script>` tag, `data-goatcounter` endpoint. Verify pageviews register;
   confirm no console errors and no Lighthouse "best practices" penalty.
   *Needs: a 2-minute GoatCounter account signup.*
5. **A11y/perf regression check:** Lighthouse run before/after; keep
   accessibility and SEO at 100.

**Done when:** Rich Results test passes, `robots.txt`/`sitemap.xml` serve,
first pageview shows in the dashboard, Lighthouse SEO = 100.

---

## Phase 4 — #6: Micro-signature interactions

*The details people screenshot. Every one is gated behind `pointer: fine`
and disabled under reduced motion.*

1. **Custom cursor:** a small ring that lerps behind the pointer
   (`gsap.quickTo`, ~0.35 s), morphing per context via `data-cursor`
   attributes: `+` over accordion heads, `↗` over external links, `▸` over
   the game buttons. Native cursor stays visible (`cursor: none` is a
   usability trap — we augment, not replace). One fixed element, one
   `pointermove` listener, CSS transforms only.
2. **Konami-lite easter egg:** typing `s a c` anywhere (outside inputs)
   triggers a 2-second confetti of tiny teal/amber chart-bar rectangles
   raining past the viewport (~60 absolutely-positioned divs, GSAP physics,
   removed on complete). A mono toast says `hidden KPI unlocked`. Fires max
   once per session.
3. **Accordion sound (opt-in):** a muted-by-default speaker toggle in the
   header; when enabled, a soft ~80 ms tick (WebAudio oscillator — no audio
   files) on accordion open/close and brew-game release. Preference persisted
   in `localStorage`; never autoplays.
4. **Nav underline upgrade:** the current hover underline gets an active-section
   state driven by a `ScrollTrigger` per section (`toggleClass` on the matching
   nav link) — small, but makes the header feel wired to the page.

**Done when:** all four ship behind capability gates, zero effect on mobile,
reduced-motion, or Lighthouse scores; the easter egg fires once and never
interrupts reading.

---

## Phase 5 — #7: The "now" strip (living proof)

*Signals the site is alive, not a monument.*

**Approach:** a `public/now.json` she can edit from the GitHub web UI —
committing it auto-redeploys via the existing Actions workflow. No CMS,
no server.

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

1. Markup: a slim mono strip between Curriculum and the New York interlude —
   eyebrow `Margin note · Now`, the items as a dot-separated line, and
   `as of {updated}` in muted text.
2. `main.js`: `fetch('now.json')` (relative path — works under any base),
   render items, hide the strip entirely on fetch failure (never a broken
   section). Add the strip to the global reveal selector.
3. A short `HOW-TO-UPDATE.md` note (or README section) showing her the
   exact GitHub edit-file flow — the whole point is that *she* updates it
   without touching code.

**Done when:** editing `now.json` on github.com updates the live site within
a minute, with no local tooling involved.

---

## Sequencing & effort

| Phase | Item | Effort | Blocked on |
|---|---|---|---|
| 1 | OG card | ~1 hr | — |
| 2 | Preloader | ~2 hrs | — |
| 3 | SEO + analytics | ~1.5 hrs | GoatCounter signup |
| 4 | Micro-interactions | ~3 hrs | — |
| 5 | Now strip | ~1 hr | — |

Rule for every phase: build → verify in a real browser (screenshots, console
clean, Lighthouse spot-check) → commit → push (auto-deploys) → confirm live.
