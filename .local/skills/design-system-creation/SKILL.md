---
name: design-system-creation
description: Create or import a design system from a user's brand, website, Figma file, codebase, GitHub repository, chosen style, or provided assets. Use ONLY when the user explicitly asks to build, generate, set up, import, reuse, or adopt a design system, component library, token set, or shared visual language — do not invoke it proactively or as a prerequisite for unrelated UI work. A request to "import the design system from" a repository or URL belongs here, not in the project import flow. Drives the intake → extraction → tokens.json flow that feeds the design-system artifact.
---

# Design system creation

This skill builds a design system as a `design-system` artifact: a DTCG
`tokens.json` (the single source of truth), the component library themed
from it, and a living style-guide preview. Other artifacts (web, mobile) consume
it so the whole product shares one visual language.

Your job is to gather the right inspiration, turn it into a complete
`tokens.json`, and call out any components the source needs that the default
template doesn't ship. Draw from the user's own assets as much as possible — a
provided brand, repo, `DESIGN.md`, Figma file, or reference image beats a generic
style every time.

**When a design system is provided, build from it — full stop.** Providing a
Figma file / codebase / `DESIGN.md` is the source of truth for building; even if
you get conflicting information, these are the source of truth. Build straight
from it and gather only what that source genuinely lacks (see the matching branch
under "Extraction"). The **only** reason to go back to the user about the source
itself is that you genuinely cannot read it (see the reachability checks) — never
because its contents surprised you.

## When to use

- The user asks to "create / build / set up a design system", "make a component
  library", "define our tokens", or "lock in our visual language".
- The user asks to import, reuse, or adopt a design system from a website, Figma
  file, codebase, or GitHub repository. Treat the source as design input for a
  `design-system` artifact, not as a request to import the repository as the
  project.
- The user wants brand consistency across a project that has no shared design
  system yet — and asks for one.

Only on an explicit ask. Don't reach for this proactively or as a prerequisite
for unrelated UI work — if the user just wants a screen or component built, build
it.

**Not for:** one-off styling that doesn't produce a reusable, multi-artifact
design system. If the request is a single component or screen, a slide deck's
look (use `slides`), or a standalone brand palette with no component library
(use `branding-generator`), prefer that narrower path instead.

## The flow at a glance

Gather intake, then extract, then build. The intake collects the options below;
the style picker (Stage 2) is conditional — you decide whether to show it based on
what the intake returned. Then **read** the tokens from whatever you got, author
`tokens.json`, build the artifact, and **reconcile the source's components** into
it.

---

## Stage 1 — Intake

Collect the context you can work from. Everything but the name is optional — an
empty field is expected, so just move on. **Omit any option the user has already
given you** — don't re-ask for a name, link, or file they already provided in this
request.

Offer these options:

- **Design system name** (required) — derive the artifact `title` and slug from it.
- **Describe your product** — a sentence or two about the product and its
  audience; let it steer the look when you have nothing else to go on.
- **Website URL** — a live site whose look to match.
- **GitHub repository URL** — a GitHub repository with a design system you want to
  reuse.
- **Figma file URL** — a Figma file with components you want to reuse.
- **Uploads**, one card with a source row per asset:
  - **Logo** — logo image files.
  - **Fonts** — font files.
  - **Code & `DESIGN.md`** — a repo zip, theme files, or a `DESIGN.md`.
  - **Reference images & Figma files** — screenshots of a style you like, or an
    exported Figma file for reference.
  - A free-form note for extra instructions (e.g. "dark and light mode; use the
    attached brand logo").

When the user has already handed you a source you can read — an accessible
website, a Figma URL, a `DESIGN.md`, or a GitHub URL — build from it and gather
only what it doesn't already provide (Step 2 below filters accordingly), skipping
whatever's left when the source covers everything.

### How to gather it
Gather the intake in **two steps**, reading whatever links you're given between
them.

**Step 1 — identity and authoritative sources.** Collect the design system name
(required), the short "Describe your product" description, and the Website /
GitHub / Figma links — omitting anything the user already gave you. If the request
already supplied all of these, don't ask an empty step — skip step 1 and go
straight to reading and extracting the links.

Then read whatever links they gave — run the reachability and extraction checks
below — so you know what you already have before asking for anything else.
Whenever any of those checks would have you ask the user for an upload on the spot
— code for a repo you couldn't read, screenshots or assets for an unreachable
Figma or a login-walled website, licensed font files, or any other fallback
upload — don't ask separately; fold every such ask into step 2.

**Step 2 — reference assets (conditional).** Ask for everything by default. But
modify your requests to not ask for things the user has already provided either
directly, or via extraction. Omit asking for a thing only when you are 100% sure
you already have it, or when this source plainly doesn't need it (for example, a
matched website needs no code upload).

The assets you should ask the user for:

- **Logo** — ask for a logo unless you already have one to use. A logo counts as
  in hand when it's in a readable Figma file or repo, the user attached one, or
  you safely downloaded and staged it from the website during extraction (staging
  is enough here; the package itself is created later, at build time). Ask when
  the only logo you found was a bare `extractBranding` report, or a URL the safety
  checks turned away (private/redirecting host, failed download, unsafe SVG).
- **Reference images / style examples** — ask for reference images unless you
  already have a parseable visual basis to read a look from. A basis counts as in
  hand when you have a website you're matching that read with usable signals, a
  readable Figma, a readable repo or `DESIGN.md`, an existing workspace app or
  artifact you can read, uploaded code you've opened, or a reference image the
  user attached that opens.
- **Fonts** — ask for the licensed font files unless you already have **loadable
  or uploaded** type in hand (fetchable `@font-face` files from a matched source,
  or font files the user uploaded that load). That means asking whenever you're
  left without loadable fonts — a matched source that exposed only a family name
  with no fetchable file (a proprietary face like Proxima Nova that maps to a
  Google Font substitute) or no family at all, **and** the no-source case where
  the user may want to upload their own. For an inspiration-only site, keep the
  Google Font substitute instead of asking.
- **Code, theme files, or `DESIGN.md`** — ask for these unless a source already
  gives you the component inventory: a matched website (screenshots + `webFetch`),
  or a readable repo / Figma / `DESIGN.md`, covers it, so omit the ask there. A
  repo you *can* read is a code source even with no `tokens.json` — read its CSS,
  Tailwind config, theme objects, and component styles directly instead of
  re-requesting an upload. Otherwise ask — the no-source case, so the user can
  hand you a repo archive, `DESIGN.md`, or theme files, and the case where a repo
  they pointed at was unreadable (private repo, SSO, typo).
- **A free-form note** for extra instructions (e.g. "dark and light mode; use the
  attached brand logo") — include it alongside the other asks; on its own it never
  justifies a step 2.

Give the uploads a **separate source row per asset** — its own logo row, fonts
row, reference-images row, and code row — rather than a combined "Logos & fonts"
row. `fileUpload` conditionality works at the source-row level, so separate rows
let you include exactly the assets you're asking for (e.g. request fonts while
omitting the logo you already staged).

When no field applies — every asset is either already in hand or not needed for
this source — skip step 2 entirely (never ask with an empty field set) and go
straight to build.

**How to present each step** is the only thing that changes with
`gate_stacked_elicitations`:

Present each step as **one stacked `AskQuestion` form** — pass `layout: "stacked"`
so all of a step's fields sit on a single page under one Submit:

```json
{
  "question": "What should we know about your design system?",
  "layout": "stacked",
  "fields": [ /* the step's fields — as AskQuestion fields */ ]
}
```

Title each step's form with a question: step 1 as shown above, and step 2
"What assets can you share?".


### Check a GitHub link before proceeding

If the user gave a GitHub URL, confirm you can actually read it **before** you
rely on it — you clone with the user's credentials, so a link can be valid yet
unreachable by you (private repo, SSO, typo). If you can't reach it, **do not give
up or silently move on** — the repo is usually the richest source. Tell the user
you couldn't reach it and ask them to make it reachable (reconnect GitHub / grant
access) or upload the code instead, folding that ask into step 2. Fall back to the
other sources or the style picker only after you've asked and they decline.

### Check a Figma link before proceeding

If the user gave a Figma URL, confirm you can actually read it **before** you
rely on it — reading a Figma file needs the user's Figma connection, so a valid
link can still be unreachable (Figma not connected, no Dev-seat access, wrong
file permissions). Figma is **not** connectable through `ProposeIntegration` /
the `integrations` skill — it has its own setup: the **Login with Figma** action
on the Figma URL chip in the composer, or the Connectors/Integrations settings.
If it isn't connected, ask the user to connect it there. Once connected, verify
the file actually opens over the Figma MCP (a quick metadata/variables read on
the linked node). If you still can't reach the file, don't silently skip it: tell
the user why and ask them to fix access or upload their assets instead. Once it
reads, extract from it per "Extracting from a linked Figma file" below.

### Check a website link before proceeding

If the user gave a website URL, confirm you can read it before relying on it.
Live sites are read through Firecrawl — `extractBranding`, external-URL
`screenshot`, and `webFetch`. These tools are independent: `extractBranding` can
fail for branding-specific reasons (e.g. an oversized or malformed brand kit) on
a site that `screenshot` and `webFetch` still read fine. So **judge reachability
by the site, not by any single tool** — abandon the website path only when the
site itself can't be read.

- **Cannot reach useful context** — the tools error outright (bad URL, Firecrawl
  isn't enabled), or they succeed but return only a blocker (login wall, anti-bot
  challenge, region block). A successful `screenshot` that shows "Sign in" or a
  `webFetch` that returns the login form markdown is not useful context, even
  though the tools didn't error — classify it the same as an unreachable site.
  Tell the user plainly ("I couldn't reach the site's content — it showed a login
  wall" or "I can't reach external sites right now") and offer the fallback:
  upload screenshots/assets or use the style picker. Don't silently skip, and
  don't extract branding from the blocker page itself.
- **Site reads, but `extractBranding` failed or returned a thin/empty kit.** The
  site delivered useful content, so it's usable — a failed or low brand kit is
  not "cannot reach useful context", so don't fall back to uploads/picker. Match
  the site from `screenshot` and `webFetch`, and fill tokens by hand from what
  they show.

To read a site's brand, call `extractBranding({ url })` and confirm the parsed
profile contains usable visual signals.
A reachable URL is not enough on its own: when the kit is thin or empty, judge the
site by whether `screenshot`/`webFetch` still read it (per the reachability rule
above) — match it from those captures rather than treating the empty kit as a
reason to fall back.

**Then ask how they want to use the site — this changes everything downstream.**
A URL is ambiguous: "make my design system look like Stripe" and "I like Stripe's
vibe, take some cues" are very different asks. Once the site reads, ask a single
question with two options:

- **Match it** — replicate this site's design system faithfully (its palette,
  type, and components become the source of truth). Choose this and the site is a
  parseable source: extract from it per "Extracting from a website" below and
  retain the captures.
- **Inspiration only** — use the site loosely as one visual cue, not a spec.
  Choose this and you do **not** faithfully extract or retain it; treat it like an
  `inspiration` reference image (see "Classify reference images and screenshots"):
  screenshot it once for a loose read of its vibe/palette, fold that into the
  look, and still run the Stage 2 style picker unless another source anchors the
  design.

Default to asking; don't assume. If the user already made the intent explicit
("match X" / "just take inspiration from X"), skip the question and follow it.

## Stage 2 — Style picker (conditional)

**Only ask this if the intake gave you no *parseable* basis for a look.** Skip
stage 2 only when the user gave you source you can actually extract from: a
`DESIGN.md`, a reachable GitHub repo, uploaded code, a linked Figma file, a
website URL the user wants to **match** (not merely draw inspiration from — see
"Check a website link"), or reference images you can open. Do
**not** skip stage 2 on the strength of inputs this flow can't parse — font
binaries (`.woff2`/`.ttf`) on their own give you no palette or component basis,
so fall through to the style picker. When in doubt about whether an upload is
parseable, ask stage 2 rather than guess a look with nothing to go on.

When you do ask, present a style picker: 6 distinct style options tailored to the
stage-1 description — each previewed as a mini sample of that look — plus a
"define your own" option that lets the user describe a style in their own words
and a "pick for me" option. Whatever they land on (a preset or their own
description) becomes the seed for `tokens.json`.

Decision rule (keyed on whether you have a *parseable* source, the same test as
the prose above):

```
parseable source available  ->  extract from it (skip stage 2)
  parseable = a DESIGN.md file, a reachable GitHub repo, uploaded code, an
              existing workspace app to build the system from, reference images
              you can open, a website URL the user wants to MATCH (read through
              Firecrawl), or a linked Figma file you can read over the Figma MCP
no parseable source         ->  ask the style picker
  e.g. font binaries on their own are NOT parseable — fall through to the picker
  e.g. a website used for INSPIRATION ONLY does not skip the picker — its loose
       cues seed the look, but still run the picker unless another source anchors
       the design
```

A linked Figma file and a website URL the user wants to **match** are parseable
sources: skip the intake stages that don't apply and extract from them (see the
Figma and website branches under "Extraction" below). A website offered for
inspiration only is not — treat it as a loose cue and still run the picker.

---

## Extraction — turn inspiration into tokens

The target schema is the design-system artifact's `tokens.json` (DTCG): the full
set of color roles in BOTH `light` and `dark`,
`typography.fontFamily.{sans,serif,mono}`, `radius.base`, and `spacing.base`. See
`references/token-schema.md` for the authoritative role list — it owns the role
count and names, so map against it rather than any number quoted here.

**Keep role names consistent.** The core palette is always `primary`,
`secondary`, `accent` — present in every design system, named exactly these, and
shown first in the preview. When extracting, MAP the source's colors onto the
standard roles; never invent new role names (no `brand`/`main`/`highlight`) or
drop standard ones. A color with no clear role maps to the nearest supporting
role or a `chart*` slot.

**Extracting from a linked Figma file.** If the user linked or pasted a Figma
file for this request, it's the highest-signal source. You read it yourself over
the Figma MCP — there is no separate skill or codegen step.

1. **Connect and locate.** Make sure Figma is connected. Figma is **not**
   connectable through `ProposeIntegration` / the `integrations` skill — it has
   its own setup: **Login with Figma** on the Figma URL chip in the composer, or
   the Connectors/Integrations settings. If it isn't connected, ask the user to
   connect it there. Take the `fileKey` and, if the URL points at a node
   (`?node-id=...`), the node id — extract from that node when given one,
   otherwise sweep the file's pages. Once connected, a Figma MCP server appears in
   your MCP prompt state; read its skill file for the exact tool names — use the
   `skillPath` it exposes (it lives under `.local/mcp_skills/<server>/SKILL.md`,
   where `<server>` derives from the connection's display name, so don't assume
   `figma`).
2. **Read the design system** using those tools: **variables/tokens** (e.g.
   `get_variable_defs`) across all collections and modes; **structure and
   components** (e.g. `get_metadata`, `get_code`) for component/component-set
   names, variant properties, and text; **screenshots** (e.g. `get_screenshot`)
   of the style-guide/documentation pages for your own reference. Prefer
   published/library assets over one-off local layers.
3. **Harvest documentation.** Capture the file's own guidance per "Capture the
   source's guidelines" below — the Figma sources are component/style/variable
   descriptions, Dev Mode annotations, and documentation text frames.
4. **Map onto the roles.** Read the file's native variable/style values and map
   them onto the roles in `references/token-schema.md` — the core palette
   (`primary`/`secondary`/`accent`) and every supporting role, in both light and
   dark. Don't invent role names; map the source's colors onto the standard ones.
   Fill any role the file didn't cover by hand using the gap-filling rules below.
5. **Reconcile components** per "Reconcile the source's components into the design
   system": add components the file defines beyond the template, and update any it
   defines differently than stock (e.g. `Button` variants/sizes) to match the
   file — the source is authoritative, so don't leave those as the scaffold.
6. **Harvest the logo.** Export the file's primary logo/wordmark node as an image
   over the Figma MCP (a rendered PNG — don't redraw it) and stage it for
   retention into `docs/references/logos/` per "Retain brand assets", so the
   preview's logo step leads with the real mark. If you can only get an SVG, apply
   that section's SVG-sanitization rule before saving it.

**Extracting from a website.** This branch is for when the user wants to **match**
a site (per the intent question in "Check a website link"); for inspiration-only,
don't run this — take a single loose screenshot cue and fall back to the picker.
When the user wants to match a live site URL, that site is the look to replicate,
and you read it through Firecrawl.

1. **Brand kit — `extractBranding({ url })`.** Your token starting point: prefer
   `structuredJson` (tokens mapped to our roles, light+dark); also `brandingJson`,
   `pageColors` (each color tagged with the CSS properties it's used on), and
   `logos`. Inspect the returned object for exact fields. Stage `brandingJson`,
   decoded data-URI images, and each `logos` asset into a temporary capture dir
   (**not** `artifacts/<slug>/` — it doesn't exist until the build step). Two rules:
   - **Scrub `brandingJson` before writing it anywhere** — strip
     userinfo/query/fragment from the asset URLs it embeds; keep the raw value only
     in memory so a signed token never hits disk.
   - **Download `logos` only from public hosts, and don't follow redirects to
     non-public ones.** Skip any target — advertised URL *or* redirect
     destination — that is private/loopback/link-local/metadata
     (`169.254.169.254`, `localhost`/`127.*`, `10.*`, `192.168.*`, `*.internal`);
     disable redirect-following or re-check the final URL before saving.

   Retention below moves the staged files into the package — the logo per "Retain
   brand assets", the screenshots and token JSON per "Retain website captures".
2. **Discover key pages — `webFetch` the homepage.** Firecrawl reads one URL per
    call and doesn't crawl, so pick the pages yourself: `webFetch` the homepage for
    its copy/structure and the links in its markdown, then choose **up to 5
    distinct page types** (home, pricing, product, dashboard, sign-up, docs) — one
    per type. Prefer the real URLs the page links. `webFetch` returns markdown, not
    a full link inventory, so header/footer-nav links can be missing; when a type
    you'd expect isn't linked, fall back to the site's conventional path
    (`/pricing`, `/docs`, `/login`) and **confirm it resolves with a `screenshot`
    or `webFetch` before using it** — skip guesses that 404.
3. **Screenshot each page — external-URL `screenshot`.** One call per URL. It's a
   default-viewport capture (no full-page/viewport/dark-mode control), so treat it
   as a look-and-feel reference. Read gradients, accent hues, type scale,
   hierarchy, spacing, and elevation off it. Stage each **named for its page**
   (`home.png`, `pricing.png`). Also **name the one or two things that catch the
   eye first** (hero gradient, oversized display type, signature accent,
   illustration style, shape/density) and record them as top-line brand guidelines
   — the system should lead with the dominant visual signal, not just tokens.
4. **Merge, don't pile up.** Extract tokens **once** (step 1); the other pages are
   for screenshots and the component inventory only — don't re-run `extractBranding`
   per page. Exception: a genuinely different surface (dark app vs light marketing)
   may get a second extraction — cap at two, reconcile into a **single** token set,
   never parallel palettes.
5. **Map onto the roles — audit, then promote.** `pageColors` mixes the real
   palette with gradient stops, resets, and one-off tints, so don't force all of it
   into tokens: **promote only role-defining colors**, judging by each entry's
   `count` and `properties` (a color on `background`/`--background` is a surface,
   `color` is text, `--primary` the primary…). Map onto the core palette
   (`primary`/`secondary`/`accent`) and supporting roles in both light and dark;
   check the screenshot when `properties` is ambiguous. Keep `chart1`–`chart5` for
   real data-viz/secondary hues, not leftovers. Retain the full sweep for
   reference, and derive the mode the site doesn't ship.
6. **Reconcile components.** Inventory the components seen across the pages
   (buttons/variants, cards, nav, forms, badges) per "Reconcile the source's
   components into the design system", and capture the non-tokenizable feel
   (imagery style, motion, copy tone) as usage guidelines.

**Fonts you can't load.** When the site uses a proprietary face with no
`@font-face` file you can fetch and it isn't on Google Fonts, map it to the
closest Google Fonts equivalent rather than shipping a wrong default — the
`website-cloning` skill's SKILL.md has a mapping table (e.g. Proxima
Nova/Circular/National → DM Sans, Graphik → Inter, GT Walsheim → Plus Jakarta
Sans, Tiempos → Playfair Display, Founders Grotesk → Space Grotesk). Record the
substitution in the usage guidelines **and tell the user** when you present:
name the proprietary font, say it can't be bundled (licensing/no public file),
and give the free stand-in you used — e.g. "The site uses Proxima Nova, a
licensed font I can't ship, so the design system uses DM Sans as the closest
free match." Don't let the substitution be a silent surprise.

**Then offer to use their own files:** ask the user to upload the real font
files (`.woff2`/`.woff`/`.ttf`/`.otf`) if they're licensed to — many teams own
the license to their brand font. If they do, wire them in so they **survive token
regeneration and reach every consumer of the package**, not just the preview:

- Point the `typography.fontFamily` token at the real family and drop the
  stand-in.
- Declare `@font-face` in `scripts/theme-template.css` — the generator **reads
  this file on every build** and emits it into the generated `src/index.css`, so a
  `@font-face` block added here survives token regeneration, while one hand-added
  to `src/index.css` is overwritten. (`src/index.css` is the generated output —
  the one to never hand-edit; `theme-template.css` is the source template despite
  its boilerplate banner.)
- **Embed each font file as a base64 `data:` URI in that `@font-face`'s `src`**
  rather than pointing at a separate asset path. This is the canonical,
  scaffold-independent location: the font travels inside the emitted CSS, so it
  resolves wherever the package's `styles.css` is imported — the preview *and*
  every consuming app — with no asset-path slot to wire up (the scaffold defines
  none). Keep the size down by inlining only the weights/subsets the tokens use.
- If you can't obtain a self-hostable file (only a licensed webfont URL, say),
  keep the Google-Fonts match the generator already loads and tell the user the
  uploaded font can't be bundled portably.

The real font always wins over the mapped substitute, but only if it's wired
where regeneration and consumers can both see it — a font that only works in the
preview isn't actually in the design system.

**Extracting from an existing project/artifact already in the workspace.** If the
user wants a design system *for an app that already exists here* (a sibling
artifact under `artifacts/<app>/`, or the repl's main app), you don't need an
upload or a clone — read that directory directly. Read the app's current look,
then build the design system from it; once it's built you can offer to migrate
the app onto it (see "Migrating an existing app onto the new design system"). The
app's own brand assets count too: copy its logo/icon files (from its `public/` or
`src/assets`) and stage them for retention into `docs/references/logos/` per
"Retain brand assets" so the preview leads with the real mark — sanitizing or
rasterizing any SVG per that section's rule before saving it.

**A `DESIGN.md` file (Google Labs `design.md`).** A `DESIGN.md` already IS a
design system — tokens in YAML front matter plus prose on how they're used — so
treat it as authoritative and base the system on it. Convert its tokens to DTCG
as your starting point:

```
npx @google/design.md export --format dtcg <path-to-DESIGN.md>
```

Then map onto `references/token-schema.md` like any other source: its color names
aren't ours, it's single-mode (derive light and dark), and its typography is per
text-scale (bucket the families into sans/serif/mono). Capture its prose and
Do's/Don'ts as usage guidelines per "Capture the source's guidelines" below. Keep
the `DESIGN.md` itself at the package root next to `tokens.json` as the design
system's human-readable companion.

**Normalize the Components section before reconciling.** `DESIGN.md` `components`
entries are usually component-token / variant keys, not one React primitive per
key — e.g. `button-primary` and `button-primary-hover` are the primary `Button`'s
default and hover styles, not two components. Group these keys back into real
primitives and their variants/states first (`button-*` → `Button` with `primary`
variant + hover/active states), then feed *that* normalized set into the
add/update reconciliation below — so `button-primary`/`button-primary-hover`
updates the stock `Button`'s variants rather than adding two bogus components.

Read the source's theme directly, in context, and map what you find onto the
roles in `references/token-schema.md` by hand. Open the relevant files in the
source (a cloned repo, an unzipped archive, or an existing `artifacts/<app>/`)
and pull the values yourself — there is no extraction script; you are the
extractor. Projects style themselves in different ways, so adapt to whatever the
source actually uses — the list below covers the common cases, not an assumption
that every project has them. Where to look, and how to fill the gaps:

- **A token-driven theme — wherever it lives** (web CSS / Tailwind config / token
  JSON, or a JS/native theme object like an Expo app's `constants/colors.ts`) —
  is the highest-signal source. It usually fills nearly every role; read both
  light and dark modes and map the colors, radius, and font families onto the
  roles.
- **Reference images**: classify each one first (see "Classify reference images
  and screenshots" below — its class governs how literally to follow it), then
  open it and read the palette, type, and radius off the pixels by eye and fill
  the roles by hand.
- **Fonts**: find the font families the source uses, bucket them into
  sans/serif/mono, and make sure the preview `index.html` loads them.
- **Missing roles / colors you can't resolve**: don't guess at values you can't
  read confidently (e.g. an `oklch()` you'd have to approximate). For every role
  with no value, fill it in deliberately — derive light↔dark counterparts, choose
  `*-foreground` colors with adequate contrast, and pick chart colors that
  harmonize. **Never ship a `tokens.json` with a missing role** —
  `build-tokens.mjs` throws if any `__DS_*__` placeholder is left unfilled.

Whatever the source, **review every value before use** — map it onto the exact
roles in `references/token-schema.md`, keep the light/dark key sets identical,
and author the artifact's `tokens.json` directly (no intermediate draft file).

**Capture the source's guidelines, not just its tokens.** Wherever the source
documents *how* the system is meant to be used, pull that in too and record it in
the artifact's `SKILL.md` (its usage notes / "What's here"), so consumers inherit
the rules instead of just the colors. Where that guidance lives, by source:

- **`DESIGN.md`**: its prose and Do's/Don'ts sections.
- **Figma**: component/style/variable descriptions, Dev Mode annotations, and the
  documentation/usage text frames (its text nodes).
- **A codebase**: component doc comments, Storybook stories/MDX, and any design
  or contributing READMEs.

Fold these into concise usage rules; don't copy prose verbatim. Also record the
guidelines implied by structure (spacing/size scales, type ramp, radius steps,
naming hierarchy, the variant/state matrix). If a source carries no such
documentation, note that rather than inventing rules. Later, **expose** the
design-and-composition guidelines from these notes in the preview (see the
preview setup step) so readers see them, not just consumers of the package.

**Harvest the brand's logo, not just its tokens.** A logo is part of the visual
language, so pull the brand's real logo from whatever source you have — a
codebase/app's `public/` or `src/assets`, a `logo` the user uploaded, a
logo/wordmark node exported from a linked Figma file, or a website's `logos` /
inline-SVG `brandingJson` from `extractBranding` — and stage the genuine file for
retention (see "Retain brand assets"), so the preview can lead with it. Keep
a vector (SVG) original when the source has one — sanitizing or rasterizing it per
that section's rule before it's saved into the package — and capture light- and
dark-background variants when the source ships both. **Never invent, redraw, or
approximate a logo** — if the source has none, skip it and leave the preview's
text heading. This is a real asset copy, separate from the token-generated
`favicon.svg`.

When you have no source at all (stage-2 style pick), seed the tokens from the
chosen option's palette + the stage-1 description and complete every role by
hand using the same rules.

## Classify reference images and screenshots

Classify every reference image and every screenshot you capture along **two**
axes. Both matter: the *kind* decides how literally to follow it and whether to
retain it; the *subject* is what lets a later, more specific request find the
right one.

**1. Kind** — how to treat it:

| Kind | What it is | How to treat it | Retain? |
|---|---|---|---|
| `site-screenshot` | a capture of a real website/product | replication target — extract faithfully | yes |
| `app-ui` / `mobile-ui` | a dashboard or native-app screen | replication target — also feeds the component inventory | yes |
| `style-guide` | a palette sheet, moodboard, or design-system export | near-authoritative token source | yes |
| `brand-asset` | a logo, poster, or packaging shot | palette/type only — don't infer layout from it | yes |
| `inspiration` | a generic aesthetic image | loose direction — don't replicate literally | no |

**The user's intent outranks the image's subject.** The *kind* describes what the
image depicts, not what the user wants done with it — the same match-vs-inspiration
question you ask for a URL applies to uploads. If the user handed over an image as
inspiration ("I like this look"), treat it as `inspiration` (loose direction,
don't replicate) **even when it's a real website/product screenshot** — a Stripe
screenshot shared as "something I like" is not a license to clone Stripe. Only
treat a real-site screenshot as a `site-screenshot` replication target when the
user actually wants to match that source. When an upload is ambiguous, ask which
they mean rather than defaulting to replication.

**2. Subject** — *what page or surface it shows*, in plain terms: "home page",
"pricing page", "dashboard", "sign-up form", "product detail", "nav bar",
"footer", "button close-up". This is the label a future request keys off: when
the user later says "build the home page," the retained capture whose subject is
"home page" is the visual base to rebuild from. Record the subject on every
retained capture (and name the file after it — `home.png`, `pricing.png`) so it's
findable, and prefer capturing distinct, nameable surfaces over near-duplicate
shots of the same one.

Anything derived from a real site or product (`site-screenshot`, `app-ui`,
`mobile-ui`) — whether the user uploaded it or you captured it — gets retained per
"Retain website captures" below, tagged with both its kind and its subject. Loose
`inspiration` images don't; they steer the look but aren't a rebuild reference.

## Retain brand assets

Keep the brand's real logo in the design-system package so the preview — and a
later "rebuild this in our look" request — draws from the genuine mark instead of
an invented one.

**Order matters — retain into the package only after it exists.** While
extracting you *staged* the logo into a temporary dir, because `createArtifact`
fails if `artifacts/<slug>/` already exists. So retention runs as part of the
build step, right **after** `createArtifact` scaffolds the package: move the
staged files into `artifacts/<slug>/docs/references/logos/` (under `docs/`, not
`src/` — that package enforces a `.tsx`-only rule and export globs), keeping each
size (`logo.svg`, `logo@2x.png`, `favicon-32.png`, …) and noting which file is
the primary logo. Keep other brand imagery that isn't the mark itself (a poster,
packaging shot, or social-share/`og:image`) in the general `docs/references/`
area, not in `logos/` — the preview's logo step reads `logos/`, so it must hold
only real marks.

For a **website** source, `extractBranding` often reports the primary mark as an
**inline SVG inside `brandingJson`** (e.g. `{"images":{"logo":"<svg ..."}}`) and
deliberately omits it from the `logos` array — so check `brandingJson` for an
inline SVG logo and extract it yourself (sanitized or rasterized per the rule
below), otherwise the real mark never reaches `docs/references/logos/`.

**Never retain or serve a page-controlled SVG as-is.** An SVG can carry
`<script>`, event handlers, `<foreignObject>`, or external references, and once
it lands in the package it's a same-origin asset that can execute outside the
`<img>` path. Before saving any SVG logo, either sanitize it to a static subset
(strip `<script>`/`<foreignObject>`/`on*` handlers and external
`href`/`xlink:href` references) or rasterize it to PNG — and for the preview,
prefer a rasterized PNG.

## Retain website captures

For a **website** source, retain more than the logo (the logo is covered by
"Retain brand assets" above) so a later "rebuild this like the site" / "build the
home page" request replicates from real evidence instead of re-scraping. Again
**after** `createArtifact` scaffolds the package, move into
`artifacts/<slug>/docs/references/`:

- the external-URL **screenshots**, each file named for its subject
  (`home.png`, `pricing.png`, …);
- the **`structuredJson`** design tokens, the **`pageColors`** sweep, and the raw
  **`brandingJson`** from `extractBranding`, for reference — but **scrub asset
  URLs out of both `brandingJson` and `structuredJson` first**. Both are
  page-derived and can embed logo/favicon/og-image URLs that carry signed or
  unlisted tokens (the model-extracted `structuredJson` just as much as the kit),
  so strip userinfo/query/fragment from every URL they contain — the same
  stripping the manifest uses below — or keep only the token fields (colors,
  fonts, radius, shadows) you'll actually reuse and drop the URL-bearing ones.

Add a `docs/references/README.md` manifest with one row per retained item: file
name, **subject** (home page / pricing page / dashboard / sign-up form /
component close-up), source URL, kind (`site-screenshot`/`style-guide`/…),
capture date, and what you extracted from it — the subject column is what a later
"build the X page" request looks up. **Store only a sanitized source URL**: keep
the scheme, host, and path, but strip userinfo, the query string, and the
fragment (e.g. record `https://app.example.com/pricing`, not
`https://user:pw@preview.example.com/pricing?token=…#x`) — scraped/preview URLs
can carry signed tokens or secrets you don't want persisted in the artifact. If
even the path looks sensitive (a signed preview host), record just the host or
"provided URL" instead. Note the `docs/references/` folder in the artifact's
`docs/AGENTS.md` "What's here" so a future rebuild finds it.

## Build the artifact

1. `createArtifact({ artifactType: "design-system", slug, previewPath: "/<slug>/", title, description })`.
   This scaffolds the package and loads its `docs/AGENTS.md`. Call this on a fresh
   slug — it fails if `artifacts/<slug>/` already exists.
2. **If you staged assets, retain them now** that the package exists: move the
   staged logo into `docs/references/logos/` (see "Retain brand assets",
   sanitizing or rasterizing any SVG first). For a website source, also move the
   screenshots and the scrubbed token JSON into `docs/references/` and write the
   manifest (see "Retain website captures"). This covers uploaded
   `site-screenshot`/`app-ui`/`mobile-ui`/`style-guide`/`brand-asset` references
   too (per "Classify reference images and screenshots") — with the same
   subject/kind manifest row, so a rebuild from uploaded evidence isn't lost.
3. Replace the scaffolded `tokens.json` with your finished tokens — the values
   you mapped from the source onto `references/token-schema.md`.
4. Trim `index.html` to load only the font families your tokens use.
5. Let the dev server regenerate `src/index.css`, `src/generated/tokens.tsx`, and
   the favicon. If you run the `tokens` build script manually, run it **in the
   design-system package** — that script is defined there, not at the repl root.
   **Never hand-edit the generated files.**
6. **If you extracted from an existing app, reconcile its components into the
   package now** (see "Reconcile the source's components into the design system"
   below): add components the app introduced and update any the app modified vs
   the stock component library. Do this *before* presenting — and crucially
   before any migration, since migration deletes the app's local components, so
   anything the app changed must be captured into the package first or those
   changes are lost.
7. **Set up the preview's header, navigation, and guidelines.** The preview is a
   documentation site: a persistent left sidebar of grouped sections with nested
   pages, and a main area showing one page at a time with the active page
   highlighted. Customize it in `src/preview/registry.tsx`:
   - **Overview / header** — set `DESIGN_SYSTEM.title` to
     `[Brand / Product Name] Design System` and `DESIGN_SYSTEM.description` to one
     short line on what the system serves. The Overview page also shows a live
     at-a-glance built from core components (Button, Badge, Input, Switch, Card,
     Label); keep those imports valid and the samples representative if you rename
     or restyle those components.
   - **Left nav** — the Overview entry (`OVERVIEW_ENTRY`) always renders first;
     build `NAV_GROUPS` after it in this order, including only the groups the
     source actually supports: Brand, Colors, Fonts, Layout, the component
     categories, then Content, Charts, Motion, and Applied examples if
     applicable. The scaffold organizes stock components into Actions, Forms &
     inputs, Overlays, Menus & navigation, Data display, Feedback, and Structure;
     keep those categories or rename and regroup them to match the source. Each
     group is a section header and its entries are the nested pages beneath it. Split a
     group into focused pages (e.g. Colors → Brand colors, Neutral colors,
     Semantic colors) rather than one dense page; never leave an empty or
     unsupported section. Give every page a **globally unique `id`** (it is the
     deep-link slug and active-page key) — group-qualify names that recur across
     groups, e.g. `brand-icons` vs `components-icons`; the registry throws on
     duplicate ids. Foundation pages live in `src/preview/foundations.tsx`; add
     focused preview-only `.tsx` pages for the rest.
   - **Design guidelines** — you already captured the source's usage guidelines
     into the artifact's `SKILL.md` (see "Capture the source's guidelines");
     **expose** the design-and-composition ones in the preview on the relevant
     pages using the `Guidelines` helper in `src/preview/parts.tsx` — colour and
     component usage do's and don'ts, spacing and hierarchy principles, and voice
     and tone (Content). Surface only design and composition guidance, never
     technical/implementation notes (import paths, prop tables, framework code).
     Only add a `Guidelines` block for guidance you actually derived from the
     source; **never invent guidelines**. The scaffold ships none, so if a source
     documents no usage rules, show no `Guidelines` blocks rather than authoring
     plausible-sounding ones.

   Use the source's own terminology, but prefer these nested pages when present:
   Brand (Logo, Illustrations, Icons, Imagery); Colors (Brand, Neutral, Semantic,
   Text/background/border); Fonts (Font families, Type scale, Headings, Body,
   Labels, Captions); Layout (Spacing, Grid, Radius/elevation, Surfaces,
   States/motion); Components (Icons, Buttons, Links, Inputs, Selects, Forms and
   controls, Cards, Badges, Banners/alerts, Dialogs, Navigation, Data display,
   Tables, Feedback, Search, Filters); Content (Voice and tone, Labels,
   Placeholder text); Charts (Colors, Typography, Bar, Line, Heatmap, Tables);
   Motion (Guidelines, Examples); Applied examples (Home, Dashboard, Form flow,
   Mobile screen, Product-specific examples).
8. **Show the brand logo in the preview.** When you retained a logo, copy the
   primary logo from `docs/references/logos/` and render it in the persistent
   preview header alongside the title, sized so it reads cleanly on light and
   dark. Also add a Brand > Logo page to `NAV_GROUPS`. Use a **raster (PNG)
   mark**, or an SVG only after sanitizing it per "Retain brand assets". **Resolve
   the asset path against the artifact's base**: the preview runs under Vite
   `base: BASE_PATH`, so a root-absolute `src="/logo.png"` points at the workspace
   root and shows a broken image for a non-root artifact. Either put the file in
   `public/` and prefix it with the base —
   `src={`${import.meta.env.BASE_URL}logo.png`}` — or put it in `src/` and
   `import logoUrl from './logo.png'` so Vite rewrites the URL. If no logo was
   found, skip this rather than inventing one.
9. `presentArtifact({ artifactId })`. The design system is non-deployable — do
   **not** call `suggestDeploy`.
10. **If you created the design system from an existing app, ask the user whether
   they'd like to migrate that app onto it** (see "Migrating an existing app onto
   the new design system" below). Recommend it — migrating keeps the app
   consistent with other projects that consume the design system — but let them
   decide, and only migrate if they say yes.

## Migrating an existing app onto the new design system

When you created the design system *from* an existing app (the extraction
on-ramp above), offer to switch that app over to consume it. **Recommend it** —
migrating keeps the app's look in lockstep with every other project that uses the
design system, so future token changes propagate everywhere instead of leaving
this app frozen on a forked copy. But it's the user's call: ask, and migrate only
if they agree.

If they do, the scaffolded package's own docs are the source of truth for
*how* to migrate — read `artifacts/<slug>/docs/AGENTS.md` ("Consuming this design
system") and follow it. The one ordering rule that lives
here, not there: only migrate **after** you've reconciled the app's component
changes into the package (build step 6), because migration deletes the app's
local components — anything the app changed that isn't already in the package
would be lost.

## Reconcile the source's components into the design system

The default template ships a full component library (`src/components/ui/`) plus a
style-guide shell with a persistent grouped left nav. The default Overview shows
the core palette, typography, and system principle so screenshot previews remain
useful; Colors, Fonts, and Layout are focused foundation pages. The scaffold is
intended to cover every stock user-facing component family with a base story in
`src/preview/demos/`, registered under a component category in
`src/preview/registry.tsx`. Treat it as a deterministic starting point, but do not
assume it is complete or correct: inventory the final components, verify each
seeded story works with its component's API, repair broken or stale stories, and
add and register stories for any uncovered components. Do not recreate stories
that are already present and working.

The browser is driven by `DESIGN_SYSTEM`, `OVERVIEW_ENTRY`, and `NAV_GROUPS` in
`src/preview/registry.tsx`, with story modules under
`src/preview/demos/<component>.tsx`. **Diff the source's component set against the template's**
— don't assume they match the defaults. For an existing app the source is its own
`src/components/ui/` (and any other component dirs); for an **authoritative design
system** (a Figma file, `DESIGN.md`, or design-system codebase) it's that source's
component set / catalog. List the source's components yourself and compare against
the template: for components the template doesn't have, add them; for components
the template *does* have, compare and reconcile.

**After reconciling, reconcile the stories with the resulting component set.**
Inventory the final modules under `src/components/ui/` and compare that inventory
with the demo filenames and registry imports/entries. Make sure every user-facing
component module is covered by exactly one story; related modules in the same
component family may share that story. Update a seeded story when the source
changed that component's API, create and register a story when the source added a
component. Register each family story once. A story must exercise all variants,
sizes, and important states exposed by that artifact's component — do not leave a
stock story that no longer matches the source. Cover all exports that belong to
the same component family in one story (for example, `Toast` + the mount-only
`Toaster` belong in the Toast story). Use the seeded stories and
`src/preview/parts.tsx` as structural examples, then group the final stories under
categories that match the source. Before presentation, repeat the inventory
comparison; no user-facing component may be absent from the browser.

When authoring interactive stories:

- Render overlays closed with a usable trigger; do not make the preview open with
  a dialog, sheet, drawer, menu, or popover covering the browser.
- Frame layout-level components (such as Sidebar and Resizable) inside bounded
  containers so they cannot take over the preview page.
- Mount each notification provider/toaster needed by its story.
- Chart configs must use resolved theme colors such as
  `var(--color-chart-1)`, not the raw HSL channels in `var(--chart-1)`.

When reconciling components:

- **New component the source defines** (e.g. a `Stepper`, `Timeline`, `PricingCard`
  the default component library doesn't include): add it under the package's
  `src/components/ui/`, theme it strictly with the token CSS vars (no hardcoded
  hex), then add its story module at `src/preview/demos/<component>.tsx` and
  register it in `src/preview/registry.tsx` under the right category so it appears in the
  component browser. Every file you add to the package must use the `.tsx` extension — including
  pure-logic helpers, hooks, and token modules with no JSX — so the package's
  `*.tsx` export globs keep resolving. Never add a `.ts` file to the package.
  If it's really just an app-specific composition (not a reusable primitive),
  leave it in the app instead.
- **Component the source defines differently than stock** (e.g. the source's
  `Button` has different variants, sizes, or markup than the template's):
  **update the package's copy to match the source** so the shared component
  reflects the source, not the scaffold — for an authoritative Figma/`DESIGN.md`
  source this is required, since a stock `Button` left untouched would silently
  contradict the source of truth. Re-theme any hardcoded values to token CSS vars
  as you port the change. If you added or renamed variants/sizes, update that
  component's demo in `src/preview/demos/` so the browser shows the new options.

Write down, in the artifact's `docs/AGENTS.md` "What's here" section, any
component you added or meaningfully changed beyond the default set so consumers
know it exists.

Match the source's component set as closely as the tokens let you; the design
system should cover what the product actually builds with, including its local
component customizations.

## Saving the design system to the Replit workspace

When the user asks to save the design system (to their Replit workspace, "for the
team", as a template, or for reuse in other projects), first load and follow the
`prepare-artifact-template` skill. Do not start the save until its verification
is complete. Then call the `saveArtifactAsTemplate` callback with the
design-system artifact — see the `artifact-templates` skill for the full
interface and error handling. Never claim the design system is saved without
calling it; there is no other save path from chat. Saving is asynchronous: on
success report that publishing has *started*, not that it is saved. If the result
is `NOT_AUTHORIZED`, explain the permission problem in your own words without
quoting the raw message or retrying.

## Checklist before you present

- [ ] `tokens.json` has every color role from `references/token-schema.md` in
      **both** light and dark.
- [ ] Fonts in the tokens are actually loaded by `index.html`.
- [ ] `pnpm tokens` / dev server regenerated cleanly (no missing-placeholder
      error).
- [ ] The Overview/header names the brand and describes the system; the left
      sidebar lists grouped sections in order (Overview, Brand, Colors, Fonts,
      Layout, component categories, then Content, Charts, Motion, Applied examples
      if applicable) with nested pages, the active page highlighted, and no empty
      or unsupported sections.
- [ ] The design and composition guidelines captured during extraction are
      exposed on the relevant preview pages (colour and component usage,
      spacing/hierarchy, voice and tone); no technical/implementation guidance is
      included, and every guideline traces to the source — no invented or
      placeholder guidance survives (a source with no usage rules shows no
      `Guidelines` blocks).
- [ ] Components and variants the source defines are reconciled: new components
      are added, and overlapping stock components (e.g. `Button`) include the
      source's variants, sizes, states, and markup.
- [ ] The final `src/components/ui/` inventory, demo filenames, and registry
      imports/entries agree: every user-facing module is covered by exactly one
      story under `src/preview/demos/`, and every family story has one entry in
      `src/preview/registry.tsx`. Related modules in one component family may share
      a story. Each story covers that artifact's variants, sizes, important
      states, and related exports. Mount-only helpers may be covered by their
      parent component story.
- [ ] Every source file you added to the package is a `.tsx` file (no `.ts`).
- [ ] If the source had a logo, it's retained under `docs/references/logos/` (each
      size; SVGs sanitized or rasterized; og:image/social-share art excluded) and
      the persistent preview header and Brand > Logo page show it via a
      base-path-safe asset path; if it had none, no logo is invented.
- [ ] You based the look on the user's assets when they gave any; the style
      picker was only used as a fallback.
- [ ] For a website source, you read the `extractBranding` outputs
      (`structuredJson` + `brandingJson` + `pageColors`) and a rendered screenshot,
      audited the full `pageColors` sweep, and promoted the role-defining colors
      into tokens (without forcing stray literals into semantic/chart slots).
- [ ] Website captures were staged during extraction and moved into
      `artifacts/<slug>/docs/references/` **after** `createArtifact`, each
      screenshot named/labeled by its subject (home page, pricing, …), with a
      `README.md` manifest whose subject column a later "build the X page" request
      can look up.
- [ ] For a website source, the dominant visual signal (what catches the eye
      first in the screenshots) is documented as a top-line brand guideline.
