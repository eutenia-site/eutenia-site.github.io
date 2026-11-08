# Site Eutenia v0 Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/site-v0/design.md`
**Status**: Approved
**Approved**: 2026-11-07 - user: "q27 aprovo q28 vamos de subagents"
**Build**: `npm run build; npm run check; npm run lint`
**Run unit**: `npx vitest run --project unit --reporter=verbose`
**Run dist**: `npm run build && npx vitest run --project dist --reporter=verbose`
**Run e2e**: `npx playwright test --reporter=list`

---

## Test Coverage Matrix

> Generated from spec and design; no tests exist yet - test types chosen with the stack (Q4, delegated: "utilize a stack que achar melhor"). Guidelines found: none - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Regras `src/lib/*.ts` | unit | All branches; 1:1 to spec ACs; every listed edge case | `tests/unit/*.test.ts` | `npx vitest run --project unit` |
| Schemas `src/content.config.ts` | unit | Each required field, each refine, error names file + field | `tests/unit/schemas.test.ts` | `npx vitest run --project unit` |
| Componentes com estado vazio/fallback | unit (Astro Container API) | Empty and fallback branches | `tests/unit/components.test.ts` | `npx vitest run --project unit` |
| HTML gerado com conteúdo real | integration (lê `dist/`) | Every page: content ACs, hidden sections, links, hosts | `tests/dist/*.test.ts` | `npm run build && npx vitest run --project dist` |
| Páginas e ilhas (build com fixtures) | e2e (Playwright, desktop 1280 + mobile 390) | Every control: happy + empty + error paths; axe; teclado; sem JS | `tests/e2e/*.spec.ts` | `npx playwright test` |
| Repo files (workflow, README, PLACEHOLDERS) | unit | Required content present | `tests/unit/repo.test.ts` | `npx vitest run --project unit` |
| Config / estilos / dados | none | build gate only | - | build gate only |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Tasks with unit tests only | `npx vitest run --project unit` |
| Full | Tasks with dist or e2e tests | `npx vitest run --project unit && npm run build && npx vitest run --project dist && npx playwright test` |
| Build | Config/style/data-only tasks and phase ends | `npm run build && npm run check && npm run lint && npx vitest run` |

---

## Execution Plan

### Phase 1: Foundation

```
T1 → T2 → T3 → T4 → T5
```

### Phase 2: Content

```
T6 → T7 → T8 → T9
```

### Phase 3: Rules

```
T10 → T11 → T12 → T13 → T14
```

### Phase 4: Shell & shared UI

```
T15 → T16 → T17 → T18 → T19 → T20 → T21
```

### Phase 5: Pages I

```
T22 → T23 → T24 → T25
```

### Phase 6: Pages II

```
T26 → T27 → T28 → T29 → T30
```

### Phase 7: Quality & delivery

```
T31 → T32 → T33 → T34
```

---

## Task Breakdown

### T1: Scaffold the Astro project

**What**: `package.json` with Astro 7, Tailwind 4, TypeScript, Prettier and the scripts `dev`, `build`, `check`, `lint`, `test`; `astro.config.mjs` reading `SITE`/`BASE` (default `https://eutenia-site.github.io` + `/eutenia-site`) and `EUTENIA_CONTENT` → `outDir` `dist-fixtures`; `tsconfig.json`; `.gitignore`; `.prettierrc`.
**Where**: `package.json`
**Depends on**: None
**Requirement**: DEPLOY-01

**Done when**:

- [x] `npm run build` produces `dist/index.html` under base `/eutenia-site/`
- [x] `npm run check` and `npm run lint` pass

**Tests**: none
**Gate**: build
**Commit**: `chore: scaffold Astro + Tailwind project`

---

### T2: Design tokens and global styles

**What**: Tailwind 4 `@theme` with every colour, font, spacing token and the glow/border utilities from `captures/DESIGN.md`; radius 0 default; pill radius for badges; base body styles.
**Where**: `src/styles/global.css`
**Depends on**: T1
**Reuses**: `design/**/code.html` tailwind config, `captures/DESIGN.md`
**Requirement**: QUAL-01

**Done when**:

- [x] Tokens match DESIGN.md values (Onyx Void `#0a0b0e`, Blood Surge `#ff2a3b`, Oswald/Plus Jakarta Sans)
- [x] Build passes

**Tests**: none
**Gate**: build
**Commit**: `feat(style): Cinematic Heavy design tokens`

---

### T3: Test harness

**What**: `vitest.config.ts` with projects `unit` (Astro `getViteConfig`, Container API) and `dist`; `playwright.config.ts` with projects `desktop` (1280x800) and `mobile` (390x844), `webServer` building with `EUTENIA_CONTENT=fixtures` and serving `dist-fixtures` under the base path; one smoke test each.
**Where**: `vitest.config.ts`
**Depends on**: T2

**Done when**:

- [x] `npx vitest run` and `npx playwright test` each run one passing smoke test

**Tests**: unit
**Gate**: full
**Commit**: `test: vitest and playwright harness`

---

### T4: Format helpers

**What**: `formatPrice`, `formatDuration`, `formatShowDate` (pt-BR, `America/Sao_Paulo`).
**Where**: `src/lib/format.ts`
**Depends on**: T3
**Requirement**: DISC-04, LOJA-05

**Done when**:

- [x] Unit tests: `11990 → "R$ 119,90"`, `244 → "4:04"`, `59 → "0:59"`, `3600 → "60:00"`, date parts

**Tests**: unit
**Gate**: quick
**Commit**: `feat(lib): price, duration and date formatting`

---

### T5: Content schemas

**What**: `src/content.config.ts` with `file()` loaders for releases, videos, shows, products, wallpapers, press, mural, fanKit, vip, stats, and the `site` config schema; content root chosen by `EUTENIA_CONTENT`; refine "status disponivel/ultimos needs ingressoUrl".
**Where**: `src/content.config.ts`
**Depends on**: T4
**Requirement**: DATA-01, DATA-02, DATA-06

**Done when**:

- [x] Unit tests for each refine and required field; error message names file and field
- [x] Unit test DATA-01: every collection uses a file loader under the content root

**Tests**: unit
**Gate**: quick
**Commit**: `feat(content): collection schemas`

---

### T6: Real discography and video data

**What**: `releases.json` (7 releases, tracks, durations, links, Pandora `destaque`) and `videos.json` (11 videos, Indestrutível `destaque`) from `context.md`; covers downloaded from Deezer to `src/assets/capas/`.
**Where**: `src/content/data/releases.json`
**Depends on**: None (runs after Phase 1)
**Requirement**: DISC-03, DISC-07, HOME-03

**Done when**:

- [x] Build passes with the real data
- [x] 7 covers in `src/assets/capas/`

**Tests**: none
**Gate**: build
**Commit**: `feat(content): real discography and videos`

---

### T7: Site config and empty optional collections

**What**: `src/config/site.json` (contato@eutenia.com.br, social URLs, empty endpoints, empty `lojaUrl`); empty `shows`, `mural`, `vip`, `stats` files; filled examples copied to `src/content/_exemplos/`.
**Where**: `src/config/site.json`
**Depends on**: T6
**Requirement**: DATA-01, AD-002, AD-007

**Done when**:

- [x] Build passes; `_exemplos` files validate against their schemas (unit test)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(content): site config and empty optional collections`

---

### T8: Placeholder assets and manifest

**What**: Download every design image to `public/placeholders/` (products, wallpapers, photos), placeholder download files (wallpapers, press kit, fan kit), placeholder product/wallpaper/press data; `PLACEHOLDERS.md` listing each file and its replacement.
**Where**: `PLACEHOLDERS.md`
**Depends on**: T7
**Requirement**: DATA-03, DATA-04

**Done when**:

- [x] Unit test DATA-03: every file under `public/placeholders/` appears in `PLACEHOLDERS.md`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(content): local placeholder assets and manifest`

---

### T9: Test fixtures content

**What**: `tests/fixtures/content/` mirroring every collection with filled data: shows past/today/future/festival/sold-out/em-breve/same-date, products with and without URL and a long name, mural, VIP, stats, a form endpoint.
**Where**: `tests/fixtures/content/`
**Depends on**: T8

**Done when**:

- [x] `EUTENIA_CONTENT=fixtures npm run build` passes

**Tests**: none
**Gate**: build
**Commit**: `test: fixture content for page tests`

---

### T10: Shows rules

**What**: `isUpcoming`, `showTabs` (asc/desc, festivals, same-date by city).
**Where**: `src/lib/shows.ts`
**Depends on**: None (runs after Phase 2)
**Requirement**: SHOW-03, SHOW-04, SHOW-10

**Done when**:

- [x] Unit tests 1:1 to SHOW-03/04/10, incl. 23:59 BRT and 00:00 BRT boundaries

**Tests**: unit
**Gate**: quick
**Commit**: `feat(lib): upcoming/past show rules`

---

### T11: Catalog rules

**What**: `latestReleases`, `filterByKind`, `filterProducts`, `sortProducts`, `visibleFilters`.
**Where**: `src/lib/catalog.ts`
**Depends on**: T10
**Requirement**: HOME-05, DISC-05, LOJA-02, LOJA-03

**Done when**:

- [x] Unit tests per function incl. empty input and ties

**Tests**: unit
**Gate**: quick
**Commit**: `feat(lib): catalog filtering and sorting`

---

### T12: Section visibility rule

**What**: `hasContent(data)` for arrays, objects and strings.
**Where**: `src/lib/sections.ts`
**Depends on**: T11
**Requirement**: HOME-09, SHOW-09, FAS-04

**Done when**:

- [x] Unit tests: `[]`, `{}`, `""`, `null` → false; filled → true

**Tests**: unit
**Gate**: quick
**Commit**: `feat(lib): empty-section rule`

---

### T13: Form rules

**What**: `validate`, `buildMailto`, `submitForm` (POST JSON, 10 s timeout).
**Where**: `src/lib/forms.ts`
**Depends on**: T12
**Requirement**: CONT-04, CONT-05, CONT-06, CONT-07

**Done when**:

- [x] Unit tests: required, e-mail format, mailto subject/body encoding, ok, HTTP 500, timeout

**Tests**: unit
**Gate**: quick
**Commit**: `feat(lib): form validation, mailto and submit`

---

### T14: Path helper

**What**: `url(path)` prefixing `BASE_URL`, idempotent on trailing slashes.
**Where**: `src/lib/paths.ts`
**Depends on**: T13
**Requirement**: NAV-08

**Done when**:

- [x] Unit tests with base `/eutenia-site/` and `/`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(lib): base-aware url helper`

---

### T15: Base layout

**What**: `BaseLayout.astro` with lang, title, description, OG tags, fonts, skip link, global.css; capture spec `tests/e2e/captures.spec.ts` skeleton saving `<capture>.running.png`.
**Where**: `src/layouts/BaseLayout.astro`
**Depends on**: None (runs after Phase 3)
**Requirement**: NAV-01

**Done when**:

- [x] dist test NAV-01 passes for the routes that exist

**Tests**: integration
**Gate**: full
**Commit**: `feat(layout): base layout`

---

### T16: Header and mobile drawer

**What**: Header per AD-004 with `aria-current`, "OUVIR AGORA", social icons, menu button + `<dialog>` drawer.
**Where**: `src/components/layout/Header.astro`
**Depends on**: T15
**Requirement**: NAV-02, NAV-03, NAV-05, NAV-06

**Done when**:

- [x] e2e NAV-02/03/05/06 pass

**Tests**: e2e
**Gate**: full
**Commit**: `feat(layout): header and mobile drawer`

---

### T17: Mobile bottom bar

**What**: Bottom bar below 768px with active item, per `captures/mobile-inicio.png`.
**Where**: `src/components/layout/BottomBar.astro`
**Depends on**: T16
**Requirement**: NAV-04

**Done when**:

- [x] e2e NAV-04 passes

**Tests**: e2e
**Gate**: full
**Commit**: `feat(layout): mobile bottom bar`

---

### T18: Footer

**What**: Footer per NAV-07.
**Where**: `src/components/layout/Footer.astro`
**Depends on**: T17
**Requirement**: NAV-07

**Done when**:

- [x] dist NAV-07 passes

**Tests**: integration
**Gate**: full
**Commit**: `feat(layout): footer`

---

### T19: UI primitives

**What**: Button, Badge, SectionHeader, EmptyState, CoverTile (fallback mark), SpotifyEmbed.
**Where**: `src/components/ui/`
**Depends on**: T18
**Requirement**: DATA-05, HOME-04

**Done when**:

- [x] Container test DATA-05 passes

**Tests**: unit
**Gate**: quick
**Commit**: `feat(ui): shared primitives`

---

### T20: Filter bar island

**What**: `FilterBar.astro` + script using `catalog.ts`; `aria-pressed`; hidden without JS; optional sort select.
**Where**: `src/components/FilterBar.astro`
**Depends on**: T19
**Requirement**: DISC-05, LOJA-02, FAS-02

**Done when**:

- [x] Covered by page e2e in T23, T27, T28

**Tests**: e2e
**Gate**: full
**Commit**: `feat(ui): filter bar island`

---

### T21: Lazy YouTube

**What**: Thumbnail link that becomes a `youtube-nocookie` iframe on activation.
**Where**: `src/components/LazyYouTube.astro`
**Depends on**: T20
**Requirement**: HOME-06, DISC-07

**Done when**:

- [x] Covered by e2e HOME-06 in T22

**Tests**: e2e
**Gate**: full
**Commit**: `feat(ui): click-to-load YouTube`

---

### T22: Início page

**What**: `/` per `.specs/features/site-v0/captures/inicio.png` and `.specs/features/site-v0/captures/mobile-inicio.png`.
**Where**: `src/pages/index.astro`
**Depends on**: None (runs after Phase 4)
**Requirement**: HOME-01 … HOME-09

**Done when**:

- [x] dist HOME-03/04/07/09 and e2e HOME-06/07/08 pass
- [x] `inicio.running.png` and `mobile-inicio.running.png` saved

**Tests**: e2e
**Gate**: full
**Commit**: `feat(pages): início`

---

### T23: Discografia page

**What**: `/discografia/` per `.specs/features/site-v0/captures/discografia.png` and `.specs/features/site-v0/captures/mobile-discografia.png`.
**Where**: `src/pages/discografia.astro`
**Depends on**: T22
**Requirement**: DISC-01 … DISC-09

**Done when**:

- [x] dist DISC-03/04/06/07/08 and e2e DISC-05/09 pass; both captures saved

**Tests**: e2e
**Gate**: full
**Commit**: `feat(pages): discografia & mídia`

---

### T24: Contact form component

**What**: `ContactForm.astro` (field set by props, consent → `/privacidade/`) + script with `forms.ts`.
**Where**: `src/components/ContactForm.astro`
**Depends on**: T23
**Requirement**: CONT-03 … CONT-07, PRIV-02

**Done when**:

- [x] Covered by e2e in T25 and T26

**Tests**: e2e
**Gate**: full
**Commit**: `feat(ui): contact form island`

---

### T25: Shows page

**What**: `/shows/` per `.specs/features/site-v0/captures/shows.png` and `.specs/features/site-v0/captures/mobile-shows.png`, with ShowTabs island and booking form.
**Where**: `src/pages/shows.astro`
**Depends on**: T24
**Requirement**: SHOW-01 … SHOW-09

**Done when**:

- [x] e2e SHOW-05/06/07/08 and dist SHOW-09 pass; both captures saved

**Tests**: e2e
**Gate**: full
**Commit**: `feat(pages): turnê & shows`

---

### T26: Contato page

**What**: `/contato/` per `.specs/features/site-v0/captures/contato.png`.
**Where**: `src/pages/contato.astro`
**Depends on**: None (runs after Phase 5)
**Requirement**: CONT-01 … CONT-09

**Done when**:

- [x] dist CONT-02/03/08/09 and e2e CONT-04/05/06 pass; capture saved

**Tests**: e2e
**Gate**: full
**Commit**: `feat(pages): contato & booking`

---

### T27: Loja page

**What**: `/loja/` per `.specs/features/site-v0/captures/loja.png` minus AD-005 departures.
**Where**: `src/pages/loja.astro`
**Depends on**: T26
**Requirement**: LOJA-01 … LOJA-07

**Done when**:

- [x] e2e LOJA-02/04/07, dist LOJA-05, container LOJA-06 pass; capture saved

**Tests**: e2e
**Gate**: full
**Commit**: `feat(pages): loja`

---

### T28: Fãs page

**What**: `/fas/` per `.specs/features/site-v0/captures/fas.png` minus empty sections.
**Where**: `src/pages/fas.astro`
**Depends on**: T27
**Requirement**: FAS-01 … FAS-04

**Done when**:

- [x] e2e FAS-02, dist FAS-03/04 pass; capture saved

**Tests**: e2e
**Gate**: full
**Commit**: `feat(pages): fãs & wallpapers`

---

### T29: Privacidade page

**What**: `/privacidade/` from `src/content/paginas/privacidade.md` (dados, finalidade, contato, data).
**Where**: `src/pages/privacidade.astro`
**Depends on**: T28
**Requirement**: PRIV-01, PRIV-02

**Done when**:

- [x] dist PRIV-01/02 pass

**Tests**: integration
**Gate**: full
**Commit**: `feat(pages): política de privacidade`

---

### T30: 404 page

**What**: `404.astro` in the design system with link to Início.
**Where**: `src/pages/404.astro`
**Depends on**: T29
**Requirement**: NAV-09

**Done when**:

- [x] e2e NAV-09 passes

**Tests**: e2e
**Gate**: full
**Commit**: `feat(pages): 404`

---

### T31: Cross-site quality suite

**What**: e2e for QUAL-01/02/03/05 over every page on both projects; dist tests NAV-08 (link check) and DATA-04 (no temporary hosts).
**Where**: `tests/e2e/quality.spec.ts`
**Depends on**: None (runs after Phase 6)
**Requirement**: QUAL-01, QUAL-02, QUAL-03, QUAL-05, NAV-08, DATA-04

**Done when**:

- [x] All pass; any violation fixed in the page that caused it

**Tests**: e2e
**Gate**: full
**Commit**: `test: accessibility, keyboard, no-JS and link checks`

---

### T32: Lighthouse CI

**What**: `lighthouserc.json` running the built Início with the mobile preset, asserting performance and accessibility >= 0.9.
**Where**: `lighthouserc.json`
**Depends on**: T31
**Requirement**: QUAL-04

**Done when**:

- [x] `npx lhci autorun` exits 0

**Tests**: e2e
**Gate**: full
**Commit**: `test: lighthouse budget for início`

---

### T33: GitHub Pages workflow

**What**: Workflow: on push to `main`, `workflow_dispatch` and `cron: '0 9 * * *'`; install, unit tests, build, upload and deploy to Pages.
**Where**: `.github/workflows/deploy.yml`
**Depends on**: T32
**Requirement**: DEPLOY-01

**Done when**:

- [x] Unit test DEPLOY-01 passes

**Tests**: unit
**Gate**: quick
**Commit**: `ci: deploy to GitHub Pages with daily rebuild`

---

### T34: README

**What**: How to run locally, edit each data file, activate optional sections from `_exemplos`, configure form endpoint, store URL, base path and domain, replace placeholders.
**Where**: `README.md`
**Depends on**: T33
**Requirement**: DEPLOY-02

**Done when**:

- [x] Unit test DEPLOY-02 passes

**Tests**: unit
**Gate**: quick
**Commit**: `docs: README for the band`

---

## Checks

**C1** - Every route has lang pt-BR, its own title and meta description (NAV-01, AC 1)
Proof: run dist | ✓ NAV-01 every route has lang pt-BR, title and description

**C2** - Header lists Início, Discografia, Shows, Loja, Fãs, Contato in order with aria-current on the current page (NAV-02, AC 2)
Proof: run e2e | ✓ NAV-02 header links order and aria-current

**C3** - OUVIR AGORA opens the Spotify artist page in a new tab (NAV-03, AC 3)
Proof: run e2e | ✓ NAV-03 ouvir agora opens Spotify in new tab

**C4** - Below 768px the bottom bar shows Início, Música, Shows, Loja, Contato with the current item highlighted (NAV-04, AC 4)
Proof: run e2e | ✓ NAV-04 bottom bar below 768px highlights current item

**C5** - The menu button opens the drawer with six links and socials and focuses the first link (NAV-05, AC 5)
Proof: run e2e | ✓ NAV-05 menu opens drawer and focuses first link

**C6** - Esc or close button closes the drawer and returns focus to the menu button (NAV-06, AC 6)
Proof: run e2e | ✓ NAV-06 Esc closes drawer and restores focus

**C7** - Footer has page links, Política de Privacidade, five socials and the copyright with contato@eutenia.com.br (NAV-07, AC 7)
Proof: run dist | ✓ NAV-07 footer has links, privacy, socials and copyright

**C8** - No internal link or asset in dist resolves to a missing file under the base path (NAV-08, AC 8)
Proof: run dist | ✓ NAV-08 no internal link resolves to 404

**C9** - An unknown path shows the 404 page with a link to Início (NAV-09, AC 9)
Proof: run e2e | ✓ NAV-09 unknown path shows 404 with link to Início

**C10** - `/` at 1280px matches captures/inicio.png (HOME-01, AC 1)
Proof: browser captures/inicio.running.png

**C11** - `/` at 390px matches captures/mobile-inicio.png (HOME-02, AC 2)
Proof: browser captures/mobile-inicio.running.png

**C12** - The hero features Pandora with a clip action and OUVIR NO SPOTIFY linking the album (HOME-03, AC 3)
Proof: run dist | ✓ HOME-03 hero features Pandora with clip and Spotify actions

**C13** - A compact Spotify embed of Pandora sits in the player position (HOME-04, AC 4)
Proof: run dist | ✓ HOME-04 compact Spotify embed of featured release

**C14** - Últimos lançamentos returns the 4 newest releases, newest first (HOME-05, AC 5)
Proof: run unit | ✓ HOME-05 latest releases returns 4 newest first

**C15** - The Indestrutível clip loads no YouTube iframe until activated (HOME-06, AC 6)
Proof: run e2e | ✓ HOME-06 clip loads YouTube player only after activation

**C16** - With 5 upcoming shows the home lists exactly 3 (HOME-07, AC 7)
Proof: run e2e | ✓ HOME-07 shows at most 3 upcoming shows

**C17** - With no upcoming show the home shows Nenhum show anunciado no momento with Instagram and YouTube links (HOME-07, AC 7)
Proof: run dist | ✓ HOME-07 empty shows state links Instagram and YouTube

**C18** - The merch section lists the 3 products marked destaque (HOME-08, AC 8)
Proof: run e2e | ✓ HOME-08 merch lists 3 featured products

**C19** - With empty stats data the stats row is absent (HOME-09, AC 9)
Proof: run dist | ✓ HOME-09 stats row omitted when stats data empty

**C20** - `/discografia/` at 1280px matches captures/discografia.png (DISC-01, AC 1)
Proof: browser captures/discografia.running.png

**C21** - `/discografia/` at 390px matches captures/mobile-discografia.png (DISC-02, AC 2)
Proof: browser captures/mobile-discografia.running.png

**C22** - The catalog lists the 7 real releases newest first with cover, type, year and track count (DISC-03, AC 3)
Proof: run dist | ✓ DISC-03 catalog lists the 7 releases newest first

**C23** - The featured block lists Pandora's 11 tracks in album order with m:ss durations (Indestrutível 4:04) (DISC-04, AC 4)
Proof: run dist | ✓ DISC-04 featured tracklist in album order with m:ss durations

**C24** - Activating Singles shows only singles and sets aria-pressed true (DISC-05, AC 5)
Proof: run e2e | ✓ DISC-05 filter shows only its kind and sets aria-pressed

**C25** - Without lyrics data the Prévia da letra block is absent (DISC-06, AC 6)
Proof: run dist | ✓ DISC-06 lyrics block omitted without lyrics

**C26** - Videoclipes lists 11 videos with the two Clipe Oficial first (DISC-07, AC 7)
Proof: run dist | ✓ DISC-07 lists 11 videos with official clips first

**C27** - Streaming links appear only for platforms present in the release data (DISC-08, AC 8)
Proof: run dist | ✓ DISC-08 streaming links only for present platforms

**C28** - Without JavaScript all releases and videos show and the filters are hidden (DISC-09, AC 9)
Proof: run e2e | ✓ DISC-09 without JavaScript all releases and videos show and filters hide

**C29** - `/shows/` at 1280px matches captures/shows.png (SHOW-01, AC 1)
Proof: browser captures/shows.running.png

**C30** - `/shows/` at 390px matches captures/mobile-shows.png (SHOW-02, AC 2)
Proof: browser captures/mobile-shows.running.png

**C31** - A show dated today in America/Sao_Paulo is upcoming until 23:59 BRT and past at 00:00 next day (SHOW-03, AC 3)
Proof: run unit | ✓ SHOW-03 show dated today in São Paulo is upcoming

**C32** - Próximos is ascending, Passados descending, Festivais only upcoming festivals (SHOW-04, AC 4)
Proof: run unit | ✓ SHOW-04 tabs order upcoming asc, past desc, festivals upcoming only

**C33** - With the browser clock after a show's date, that show appears under Passados (SHOW-05, AC 5)
Proof: run e2e | ✓ SHOW-05 tabs recompute with browser date

**C34** - An empty tab shows Nenhum show anunciado no momento with Instagram and YouTube links (SHOW-06, AC 6)
Proof: run e2e | ✓ SHOW-06 empty tab shows message with social links

**C35** - Row action: COMPRAR INGRESSO new tab for disponivel/ultimos, disabled ESGOTADO, AVISE-ME to Instagram (SHOW-07, AC 7)
Proof: run e2e | ✓ SHOW-07 row action matches status

**C36** - Booking form submit without endpoint opens mailto with subject Booking - <nome> (SHOW-08, AC 8)
Proof: run e2e | ✓ SHOW-08 booking form opens mailto with Booking subject

**C37** - With empty VIP data the VIP card is absent (SHOW-09, AC 9)
Proof: run dist | ✓ SHOW-09 VIP card omitted when VIP data empty

**C38** - Two shows on the same date are ordered by city name (SHOW-10, edge case)
Proof: run unit | ✓ SHOW-10 same-date shows ordered by city

**C39** - `/loja/` at 1280px matches captures/loja.png minus AD-005 departures (LOJA-01, AC 1)
Proof: browser captures/loja.running.png

**C40** - Activating Moletons shows only moletons and sets aria-pressed (LOJA-02, AC 2)
Proof: run e2e | ✓ LOJA-02 category filter shows only that category

**C41** - Menor preço sorts ascending, Maior preço descending, Mais recentes by adicionadoEm descending (LOJA-03, AC 3)
Proof: run unit | ✓ LOJA-03 sorts by price asc, desc and newest

**C42** - COMPRAR opens the product URL in a new tab; a product without URL shows disabled EM BREVE (LOJA-04, AC 4)
Proof: run e2e | ✓ LOJA-04 comprar opens product link, em breve disabled without link

**C43** - Cards show category, name, price R$ 119,90, badge and sizes as non-interactive text (LOJA-05, AC 5)
Proof: run dist | ✓ LOJA-05 card shows category, name, price, badge and sizes as text

**C44** - An empty product list renders Produtos em breve with an Instagram link (LOJA-06, AC 6)
Proof: run unit | ✓ LOJA-06 empty product list renders Produtos em breve

**C45** - A long product name truncates to one line and its title holds the full name (LOJA-07, edge case)
Proof: run e2e | ✓ LOJA-07 long product name truncates with title

**C46** - `/contato/` at 1280px matches captures/contato.png minus departures (CONT-01, AC 1)
Proof: browser captures/contato.running.png

**C47** - The four department cards link mailto:contato@eutenia.com.br with the department in the subject (CONT-02, AC 2)
Proof: run dist | ✓ CONT-02 department cards mailto contato with department subject

**C48** - The form has the 8 fields with nome, e-mail, departamento, mensagem and consent required (CONT-03, AC 3)
Proof: run dist | ✓ CONT-03 form has fields with required marks

**C49** - Submitting empty shows Campo obrigatório, invalid e-mail shows Informe um e-mail válido, focus on first invalid field (CONT-04, AC 4)
Proof: run e2e | ✓ CONT-04 invalid submit shows messages and focuses first invalid field

**C50** - With an endpoint, a valid submit POSTs and shows Mensagem enviada! Responderemos em breve. (CONT-05, AC 5)
Proof: run e2e | ✓ CONT-05 configured endpoint POST shows success

**C51** - A 500 response keeps the filled form and shows the error with contato@eutenia.com.br (CONT-06, AC 6)
Proof: run e2e | ✓ CONT-06 failed POST keeps form and shows error

**C52** - Without endpoint the mailto subject is <Departamento> - <nome> and the body lists filled fields (CONT-07, AC 7)
Proof: run unit | ✓ CONT-07 mailto has subject Departamento - nome and filled fields

**C53** - Press kit lists each file with type and size linking to the file (CONT-08, AC 8)
Proof: run dist | ✓ CONT-08 press kit lists files with type and size

**C54** - Redes oficiais links the five social profiles from site config (CONT-09, AC 9)
Proof: run dist | ✓ CONT-09 redes section links five profiles

**C55** - `/fas/` at 1280px matches captures/fas.png minus empty sections (FAS-01, AC 1)
Proof: browser captures/fas.running.png

**C56** - Activating a wallpaper filter shows only that category with aria-pressed (FAS-02, AC 2)
Proof: run e2e | ✓ FAS-02 wallpaper filter shows only category

**C57** - Each wallpaper card shows badge, resolution, title, description, type, size and a download link (FAS-03, AC 3)
Proof: run dist | ✓ FAS-03 wallpaper card has download link and metadata

**C58** - With empty mural and Telegram data those sections are absent (FAS-04, AC 4)
Proof: run dist | ✓ FAS-04 mural and telegram sections omitted when empty

**C59** - /privacidade/ states collected data, purpose, contato@eutenia.com.br and last-updated date (PRIV-01, AC 1)
Proof: run dist | ✓ PRIV-01 privacy page states data, purpose, contact and date

**C60** - Every consent label links to /privacidade/ (PRIV-02, AC 2)
Proof: run dist | ✓ PRIV-02 consent labels link to privacidade

**C61** - Every collection is defined with a file loader under the content root (DATA-01, AC 1)
Proof: run unit | ✓ DATA-01 every collection uses a file loader under the content root

**C62** - An invalid data file fails with a message naming the file and the field (DATA-02, AC 2)
Proof: run unit | ✓ DATA-02 invalid data reports file and field

**C63** - Every file under public/placeholders appears in PLACEHOLDERS.md (DATA-03, AC 3)
Proof: run unit | ✓ DATA-03 every placeholder file is listed in PLACEHOLDERS.md

**C64** - No page references lh3.googleusercontent.com (DATA-04, AC 4)
Proof: run dist | ✓ DATA-04 no image from temporary design hosts

**C65** - A release without cover renders the Eutenia mark tile (DATA-05, edge case)
Proof: run unit | ✓ DATA-05 release without cover renders the Eutenia mark tile

**C66** - A disponivel show without ingressoUrl fails the schema naming the show (DATA-06, edge case)
Proof: run unit | ✓ DATA-06 available show without ticket url fails schema

**C67** - Body background is the void token, headings Oswald, body Plus Jakarta Sans, cards radius 0 (QUAL-01, AC 5)
Proof: run e2e | ✓ QUAL-01 tokens applied: background, fonts, zero radius

**C68** - Every page has zero serious or critical axe violations at 1280 and 390 (QUAL-02, AC 6)
Proof: run e2e | ✓ QUAL-02 no serious or critical axe violations

**C69** - Every control is reachable by Tab and shows a visible focus outline (QUAL-03, AC 7)
Proof: run e2e | ✓ QUAL-03 every control reachable by keyboard with visible focus

**C70** - Lighthouse mobile on Início scores >= 90 performance and accessibility (QUAL-04, AC 8)
Proof: `npx lhci autorun`

**C71** - Without JavaScript every page shows its content and links (QUAL-05, AC 9)
Proof: run e2e | ✓ QUAL-05 without JavaScript every page shows content and links

**C72** - The workflow deploys to Pages on push to main and on cron 0 9 * * * (DEPLOY-01, AC 10)
Proof: run unit | ✓ DEPLOY-01 workflow deploys on push to main and daily 09:00 UTC

**C73** - README covers local run, data files, form endpoint, store URL and base path/domain (DEPLOY-02, AC 11)
Proof: run unit | ✓ DEPLOY-02 README covers run, data, form endpoint, store url, base path

---

## Handoff

**Settled mid-build:** Q29 Spotify album links (Pandora, Chymia II) - user: "q29 os links de albums ..."; Q30 keep full booking form on mobile Shows (AD-010) - user: "q30 recomendacao"
**Dispatched:** batch worker 1 (T2-T9, phases 1-2) at HEAD 9685e3f - T1 done inline by orchestrator (greenfield scaffold needed before the Build line could run); returned af0852c. batch worker 2 (T10-T14, phase 3) at HEAD af0852c; returned 08f4f2a. batch worker 3 (T15-T21, phase 4) at HEAD 08f4f2a; returned 8ac9a58. batch worker 4 (T22-T25, phase 5) at HEAD 8ac9a58; returned 55b9054. batch worker 5 (T26-T30, phase 6) at HEAD 55b9054; returned 597dd67. batch worker 6 (T31-T34, phase 7) at HEAD 597dd67; returned 1f28d9b. Verifier round 1 at HEAD 5f91347; screens sub-agent round 1 at HEAD 5f91347; Verifier returned 3993a19; screens round 1 returned 9837497. fix worker (verification F2-F10 + screens differences) at HEAD 3993a19; fix worker returned 841f7a1. screens sub-agent round 2 (rows that differed) at HEAD 8a37b75
**Walked:** 2026-11-07 on the real-content build (`npm run build && npx astro preview`, base /eutenia-site/): Início shows the Pandora hero, the empty shows state "Nenhum show anunciado no momento", and the Indestrutível clip becomes a youtube-nocookie iframe on click. Discografia lists 7 releases + 11 videos; "Singles" leaves 4 visible (Carbonizar, Cego, Meu Fim, Espelho). Shows shows the tabs and the empty state + booking form. Loja shows 8 placeholder products, all "EM BREVE". Contato empty submit shows 5 "Campo obrigatório" with focus on Nome. Fãs shows Wallpapers + Kit do fã (mural/Telegram hidden). /nao-existe/ shows "PÁGINA NÃO ENCONTRADA". Mobile 390: menu opens the drawer with 6 links + 5 socials and Esc closes it. The filled states drawn by the captures (shows list, VIP, mural, stats, products with links) come from the fixtures build: `EUTENIA_CONTENT=fixtures npm run build && EUTENIA_CONTENT=fixtures npx astro preview`; `npm run captures` retakes every `*.running.png` from that build.

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7

Phase 1:  T1 → T2 → T3 → T4 → T5
Phase 2:  T6 → T7 → T8 → T9
Phase 3:  T10 → T11 → T12 → T13 → T14
Phase 4:  T15 → T16 → T17 → T18 → T19 → T20 → T21
Phase 5:  T22 → T23 → T24 → T25
Phase 6:  T26 → T27 → T28 → T29 → T30
Phase 7:  T31 → T32 → T33 → T34
```
