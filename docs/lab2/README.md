# Grill · Viva day page (CSC413-8 Lab 2)

**Domain in one line:** Grill is an automated viva for colleges: it asks timed questions that cite a student's own code, then sets a change request graded by hidden tests, and the examiner confirms or overrides the score.

This page is what a student or examiner opens on viva day: check in, learn how the clock works, watch a 42-second tour, and read a skill report. It adapts to who is using it, on what device and in what situation, **with no JavaScript**.

## Run it

The page is part of the Grill site. In the project repo it lives at `landing/viva-day.html`, next to the marketing page (`landing/index.html`), which links to it as "Viva day". The submission ZIP contains the same page renamed to `index.html`.

Captions need a web server: Chrome blocks `<track>` files loaded from `file://`.

```bash
python3 -m http.server 8000 --directory landing   # repo: open http://localhost:8000/viva-day.html
python3 -m http.server 8000                       # unzipped submission: open http://localhost:8000
```

Styling uses Tailwind CSS (rule 2 of the teacher's note), compiled **ahead of time** into a plain `css/viva-day.css`. The page loads that one stylesheet and no script. The other site pages keep their own CSS and are not part of this lab.

```bash
npm install
npm run build:viva              # landing/src/viva-day.input.css -> landing/css/viva-day.css
npm run pack:lab2 -- <RegNo>    # dist/<RegNo>_Lab2_Grill.zip (refuses to pack if any JS is found)
```

| In the repo | In the ZIP | What it is |
|---|---|---|
| `landing/viva-day.html` | `index.html` | The page |
| `landing/css/viva-day.css` | `css/viva-day.css` | Compiled CSS (generated, don't edit) |
| `landing/src/viva-day.input.css` | `src/viva-day.input.css` | Tailwind source: colour tokens, custom variants, `::cue`, countdown, print layout |
| `landing/captions/viva-tour.en.vtt` | `captions/…` | Captions with two voices and sound cues |
| `landing/captions/viva-tour.chapters.vtt` | `captions/…` | Chapter track |
| `landing/assets/viva-*`, `icon.svg` | `assets/` | Video (WebM + MP4), poster, three viva SVGs, icon |
| `docs/lab2/screenshots/` | `screenshots/` | Evidence, including `print-report.pdf` |

---

## Part A · Context matrix

| # | Category | Context (a real Grill user) | How the page detects it | What changes on the page | Why this helps this user | What I rejected and why |
|---|---|---|---|---|---|---|
| 1 | **Viewport** | A student on a phone, held upright, checking in on the way to the lab | `(width < 40rem)` on `<picture>` and `max-sm:`; `(width < 48rem)` via `max-md:` / `md:hidden` | The screenshot becomes a **different image**: a close-up of the question card instead of code + question side by side. The tour video moves to the **end** of the page and shows its size (0.45 MB) first. Step 3 adds a notice: *sit the viva on a laptop, the change request editor needs ≥ 48rem*. The sticky header becomes static. | 17 lines of code are unreadable at 320 px; the question card is what matters. Phone users come to check in, not to watch a video on mobile data. Saying up front that the editor needs a laptop avoids a failed viva. | Squeezing the code editor to phone width (unusable, and an unfair viva). Hiding the video completely on phones (some students only have a phone to prepare on). |
| 2 | **Viewport** | Same student turns the phone sideways to watch the tour | `(orientation: landscape) and (height < 30rem)` (custom variant `short-landscape`) | The header stops being sticky and the video is capped at 85vh, so it fits the screen | On a 360 px-tall screen a sticky header hides a third of the video | Forcing full screen (needs JS) |
| 3 | **Input** | An examiner reviewing on a classroom tablet (touch) vs. at a desk with a mouse | `(pointer: coarse)` → `pointer-coarse:`; `(hover: hover) and (pointer: fine)` → custom `hover-fine:` | **Touch:** larger hit areas on nav links, radios, buttons, file picker and summaries, and every question's "Why" reason is always open. **Mouse:** reasons fold away and open on hover **or keyboard focus** (`:focus-within`), so 8 questions can be scanned quickly. Instruction text changes to match. | A finger needs ~44 px targets and can't hover. A mouse user scanning a whole cohort benefits from a compact list. | Hiding reasons behind hover for everyone (touch and keyboard users would never see them). Hiding the reasons on touch to save space (the examiner needs evidence to confirm a score). |
| 4 | **Preference** | A student with vestibular sensitivity who set *reduce motion*, anxious before a timed viva | `(prefers-reduced-motion: reduce)` → `motion-reduce:`, plus a `@media` block in `input.css` | The live countdown ring stops ticking. Instead, a **still bar** shows the same meaning: ember for normal time, then an **amber, striped** zone labelled *last 30 s*. The pulsing "Viva window open" dot stops; the badge gets a thicker border and bold text. Smooth scrolling is only on for `no-preference`. | The ring's message ("amber means hurry") is kept without movement. The stripes mean it also works without colour. | Just switching animations off (the user would lose the "amber = last 30 s" meaning). Removing the clock (they still need to know how time works). |
| 5 | **Preference** | An examiner projecting results in a bright staff room / a user with low vision | `(prefers-color-scheme: light)`; `(prefers-contrast: more)` and both combined | **Light:** every colour token is re-picked for light (not inverted), and `<picture>` serves a **light version** of the viva screen. **More contrast:** pure black/white, 2 px borders, captions larger with the student's voice underlined, and verdict chips gain **symbols** (✓ ~ ✗) so results don't rely on colour. | A dark screenshot on a light page dazzles on a projector. Green/amber/red alone fails colour-blind users and greyscale. | Only flipping `filter: invert()` (breaks the image colours and the brand ember). |
| 6 | **Output** | An examiner printing a student's report for the viva file / the student keeping a copy | `@media print` (`print:` variants) and `@page { size: A4 }` | Printing gives an **A4 Viva Skill Report**, not the web page: nav, check-in, clock, video and help are hidden. Every code citation prints its full **GitHub URL** (`::after` + `attr(href)`), so a reader can check the exact lines. A **"PROVISIONAL · NOT A FINAL GRADE"** watermark is printed on every page while the score is unconfirmed. Signature lines appear only on paper. Page header/footer show cohort and "Page x of y". Questions never split across pages. | Paper is the record. It has to stand alone (no hover, no links to click) and must never pass a provisional AI score off as final. | Printing the whole page (8 pages of UI). Printing without URLs (citations would be uncheckable). |
| 7 | **Domain situation** | A score the AI proposed but no examiner has confirmed yet | `[data-state="provisional"]` on the report (`group-data-[state=provisional]/report:`) | A "Provisional" banner with a **Why?** popover appears on screen, and the watermark appears in print | Students mustn't treat an advisory score as their grade; examiners need to see what still needs them | A small grey "status: provisional" label (too easy to miss on a grade) |
| 8 | **Domain situation** | A question where the timer ran out before the student answered | `.answer:empty` | The empty answer box shows *"No answer within the time limit. Scored 0 for this question; the follow-up was skipped."* in amber | Explains the zero instead of showing an empty box that looks like a bug | Writing that text into the HTML of every empty answer (the CSS rule handles it in one place) |
| 9 | **Domain situation / role** | Who is looking: student or examiner, and whether the student has approved extra time | `body:has(#role-examiner:checked)` and `body:has(#extra-time:checked)` (custom variants `examiner:` and `extra-time:`) | **Examiner:** the student check-in form disappears; a review queue appears (filterable to provisional sessions only); the report gets a **Confirm or override** popover with a validated reason field; "Ask for a re-check" is hidden. **Extra time:** step 3's times change to 1.5× (2 min 15 s per question, 18 min total), a PDF upload for the letter appears, and the clock further down runs **135 s instead of 90 s**. | One page serves both roles without links to separate pages. The accommodation is shown everywhere the student reads about time, so they plan correctly. | Reordering the page for examiners with CSS `order` (the visual order would no longer match keyboard tab order); I added a "Jump to report" link instead. |

### Media queries used (10, from 4 categories + domain selectors)

| Query | Category | Range syntax |
|---|---|---|
| `(width < 40rem)` in `<picture>` and `max-sm:` | Viewport | ✓ |
| `(width >= 40rem)` / `(width >= 48rem)` / `(width < 48rem)` (`sm:`, `md:`, `max-md:`) | Viewport | ✓ |
| `(orientation: landscape) and (height < 30rem)` | Viewport | ✓ |
| `(pointer: coarse)` | Input | |
| `(hover: hover) and (pointer: fine)` | Input | |
| `(prefers-reduced-motion: reduce)` and `no-preference` | Preference | |
| `(prefers-color-scheme: light)` | Preference | |
| `(prefers-contrast: more)` (also combined with light) | Preference | |
| `print` + `@page` | Output | |

Tailwind v4 writes its breakpoints in range syntax, e.g. `@media (width >= 48rem)`; you can see this in `css/viva-day.css`.

---

## Selector map

### Pseudo-classes (16)

| Pseudo-class | Where | Why / simpler option I didn't use |
|---|---|---|
| `:has()` | `body:has(#role-examiner:checked)`, `body:has(#extra-time:checked)`, form `has-user-invalid:` border, field `group-has-user-invalid/field:` messages, `group-has-[#lang-py:checked]/form:` swaps the submit button, `has-checked:` on role labels, `has-[.fail]:` on a test row, `[&:has(#f-prov:checked)_li[data-state=confirmed]]:hidden` | Lets a choice deep in the form restyle the whole page. Rejected: sibling `~` selectors, which only work if the controlled element comes after the input in the same parent. |
| `:checked` | Role radios, extra-time checkbox, language radios, review filter | Native, keyboard-accessible state |
| `:user-invalid` | Invite, repo, branch, override score and reason | Red border + message only **after** the user has interacted. Rejected `:invalid` for the messages, because it would shout errors at an empty form on page load. |
| `:user-valid` | Green border and "✓ Repo link looks right" | Positive feedback after a correct entry |
| `:invalid` | `invalid:[counter-increment:todo]` | Counting still-incomplete required fields is fine before interaction; it's a to-do count, not an error |
| `:not()` | `[&:not(:has(:invalid))]:border-ok/60` on the form | Turns the whole form border green when nothing is left to fix |
| `:placeholder-shown` | `peer-placeholder-shown:block` on the repo hint | The hint shows only while the field is empty, then makes room for the result message |
| `:focus-visible` | Global 3 px ember outline; `has-focus-visible:` puts the ring on the role **label** because its radio is visually hidden | Rejected `:focus`, which also draws rings on mouse clicks |
| `:focus` | Skip link `focus:not-sr-only` | The skip link must appear for any focus |
| `:focus-within` | `group-focus-within/q:` opens a question's reason on mouse devices | Keyboard users get what hover users get |
| `:hover` | Same reasons on hover; nav links | Only meaningful on `hover-fine` devices |
| `:target` | `#checked-in` confirmation after submit, `#override-logged`, `#q1`–`#q8` deep links ring the question, `#waitlist` | Examiners can share a link like `…#q6` to point at one answer. Rejected separate pages. |
| `:empty` | `.answer:empty::before` | Unanswered (timed-out) question |
| `:nth-child(odd of .test)` | Hidden-tests table striping | Plain `:nth-child(odd)` would count the sandbox note row and break the stripes |
| `:popover-open` | `open:` variant on popovers (warn ring on "Why provisional?") | |
| `:where()` / `:is()` | Custom variants `&:where(body:has(...) *)`; Tailwind's `group-*` variants compile to `:is(:where(.group) …)` | `:where` keeps specificity at zero, so utilities still override cleanly |

### Pseudo-elements (8)

| Pseudo-element | Where | Meaning it adds |
|---|---|---|
| `::cue` / `::cue(v[voice=…])` / `::cue(.sfx)` / `::cue(.code)` | `src/viva-day.input.css` | Grill's lines in ember, the student's in blue italic, sound cues in amber, code in mono. Larger, and underlined for the student, in high contrast. |
| `::marker` | `.questions > li::marker { content: "Q" counter(list-item) }`; `marker:text-ember` on `<summary>` | Questions numbered **Q1–Q8** from the list counter |
| `::before` | `.step-label::before` → "Step 1 ·" via `counter(step)`; `.answer:empty::before`; verdict symbols ✓ ~ ✗; print watermark | Step numbers stay right even when the examiner path skips the student step |
| `::after` | `counter(todo)` "N required items still to complete"; countdown `counter(left)`; printed `attr(href)` URLs; "✓ Repo link looks right" | Live counts and printed URLs without JS |
| `::placeholder` | `placeholder:text-muted/60` | Example values look clearly different from real input |
| `::selection` | Ember highlight | Brand-consistent selection |
| `::backdrop` | `backdrop:bg-black/70` on popovers | Dims the report behind the override form |
| `::file-selector-button` | `file:` utilities on the accommodation-letter upload | Matches the page's buttons, with a bigger target on touch |

---

## Part C · Challenges

**Claimed for marks: C1 and C2.** C3, C4 and C5 are also built; see below.

- **C1 · Stateful flow with zero JS.** Step 1 (role radio) decides whether step 2 is the student check-in or the examiner review queue. In step 2, *Python* swaps step 3's button for a waiting-list link, and *extra time* changes step 3's times, adds a file upload and changes the clock section further down. Built only with `:checked` + `:has()`, `:target` and `<details>`. Works by keyboard: Tab to a radio group, arrow keys to choose, Space for checkboxes.
- **C2 · Designed print output.** A4 Viva Skill Report: UI hidden, citation URLs printed with `::after { content: " <" attr(href) ">" }`, a provisional watermark on every page, signature lines, `@page` header/footer with page x of y, `break-inside: avoid` on questions. See `screenshots/print-report.pdf`.
- **C3 · Designed accessibility modes.** Still clock bar with stripes; badge emphasis; high-contrast tokens for dark and light with ✓ ~ ✗ symbols. Screenshots `04`, `04b`, `05`.
- **C4 · Speaker-aware captions.** `<v Grill>`, `<v Student>`, `<c.sfx>` and `<c.code>` in the VTT, styled with `::cue(v[voice="…"])` and `::cue(.class)`. Cues 4–7 use `line:8%` so captions move to the top while the answer box is at the bottom of the frame.
- **C5 · Validation without JS.** `:user-invalid` / `:user-valid` / `:placeholder-shown`; the form container changes through `:has()`; messages are sibling elements and `::after`; a CSS counter shows how many required items are left.

---

## Evidence (`screenshots/`)

| File | Context |
|---|---|
| `01-desktop-dark.png` | Desktop, 1440 px, default dark |
| `02-phone-320.png` | Phone 320 px, touch: close-up image, video moved to the end |
| `03-desktop-light.png` | Light colour scheme, light viva image |
| `04-contrast-more-dark.png`, `04b-contrast-more-light.png` | `prefers-contrast: more`, symbols on verdicts |
| `05-reduced-motion-clock.png` vs `05b-motion-clock.png` | Still clock vs moving clock |
| `06-checkin-extra-time-python.png`, `06b-clock-extra-time.png` | Flow state: invalid invite, valid repo, Python and extra time chosen |
| `07-examiner-view.png`, `07b-examiner-override-popover.png` | Examiner role and the override popover |
| `08-target-q6-empty-answer.png` | `:target` deep link to Q6 and the `:empty` answer |
| `09-…`, `09b-captions-…` | Captions in the Grill and Student voices |
| `10-phone-landscape-tour.png` | Short landscape phone |
| `11-print-preview-1..3.png`, `print-report.pdf` | Print output |

Checked in Chrome: no horizontal scroll at 320 px, at 640 px (≈200% zoom on a 1280 px window) or at 740 × 360 landscape; every control reachable by Tab with a visible 3 px focus ring; 0 `<script>` elements and no `on…=` attributes.

## Browser differences

Marked in Chrome (latest). Differences I know of:

- **`::cue(v[voice="…"])` and `::cue(.class)`:** Firefox ignores selectors inside `::cue()`, so all captions there look the same (plain `::cue` still works).
- **`@page` margin boxes (`@top-left`, page x of y):** Chrome 131+ only. Firefox and Safari print without the running header and footer.
- **Animating `--left` with `@property` to drive the countdown:** needs Firefox 128+ / Safari 16.4+. Older browsers show a still "90s".
- **`popover`, `:user-invalid`, `:has()`, `:nth-child(… of S)`:** supported in current Chrome, Edge, Firefox and Safari.
- **`<track>` from `file://`:** blocked in Chrome, hence the "Run it" step.

## Credits

All media was made for this project: the three viva screen SVGs and the icon; the tour video, built from HTML scenes rendered in Chrome and encoded with ffmpeg; its beeps and chime, ffmpeg sine tones; and both WebVTT files, written by hand. Everything in the report and review queue is sample data; no real students. Fonts are the system fonts on the viewer's machine.

---

## AI usage log

**Context for the evaluator:** the course teacher allowed agentic AI for this exercise. The page, media, captions and this README were produced with **Claude Code (Claude Opus 5.5)** acting as an agent in the repo, with me directing the domain and reviewing the result. The matrix above was drafted by the AI from Grill's product brief and then checked by me.

| Tool | What I asked (one line) | What I kept | What I changed or rejected, and why |
|---|---|---|---|
| Claude Code | Build the Lab 2 page for the Grill domain with Tailwind, no JS | Page structure, check-in flow, report, print layout | Moved Tailwind from the CDN to a compiled `styles.css` (see wrong suggestion 1) |
| Claude Code | Make our own video and captions without stock media | Video rendered from HTML scenes + ffmpeg; two-voice VTT | No voice-over, because no text-to-speech was available; captions carry the dialogue and the sound cues instead |
| Claude Code | Let the role and extra-time choices change the rest of the page | `body:has(#…:checked)` as Tailwind custom variants `examiner:` / `extra-time:` | Put the role radios **outside** the check-in form (see wrong suggestion 2) |
| Claude Code | Reorder the page for examiners | Rejected | CSS `order` would break keyboard tab order; added a "Jump to report" link instead |
| Claude Code | Test every context in Chrome and capture evidence | DevTools-protocol screenshots, overflow checks, print PDF | Found and fixed a 320 px overflow and a label-layout bug before submitting |

**AI suggestions that were wrong or unsuitable, and how they were caught:**

1. **Tailwind via `<script src="https://cdn.tailwindcss.com">`.** The AI's first Tailwind dashboard in this repo loaded Tailwind this way. That is a `<script>` tag and would cap the lab at 4/10. Caught by checking it against hard constraint 1. Fixed by compiling with the Tailwind CLI so the page ships only `styles.css`.
2. **Hidden `required` fields.** The first plan put the examiner path inside the same form as the student's required fields. A field hidden with `display: none` but still `required` blocks submission, and Chrome shows "An invalid form control is not focusable". Fixed by keeping the role radios and the examiner panel outside the student form.
3. **Escaping overflow.** In the earlier dashboard, an `sr-only` table header (absolutely positioned) escaped its scroll container and caused sideways scrolling on phones. Found by measuring `scrollWidth` at 375 px. Fixed by adding `relative` to the scroll container; the same fix is used on this page's test table.
4. **Test-harness false negative.** The first automated test typed into fields with `execCommand`, which Chrome doesn't count as user input, so `:user-invalid` never fired and validation looked broken. Real keyboard input (DevTools `Input.insertText` + Tab) showed it works.
