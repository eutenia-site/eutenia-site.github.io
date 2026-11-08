# Experiência mobile v1 Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: none - Medium scope, no new pattern; layout changes held to `captures/DESIGN.md`
**Status**: Approved
**Approved**: 2026-11-08 - user: "aprovo e vamos de subagents"
**Build**: `npm run build; npm run check; npm run lint`
**Run e2e**: `npx playwright test --reporter=list`

---

## Test Coverage Matrix

> Generated from codebase (site-v0 matrix, `playwright.config.ts`, `vitest.config.ts`, `package.json`). Guidelines found: none - strong defaults applied. Every mobile-v1 requirement is about what renders at a viewport width, so the layer is e2e (Playwright, fixtures build, projects `desktop` 1280 and `mobile` 390).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Estilos e páginas abaixo de 768px | e2e (mobile 390, and 360 where named) | Every AC: measured on every page it names; edge cases odd count and long names | `tests/e2e/mobile-*.spec.ts` | `npx playwright test` |
| Desktop 1280 inalterado | e2e (desktop) | Each page with a site-v0 picture compared pixel by pixel | `tests/e2e/mobile-desktop.spec.ts` | `npx playwright test` |
| Regras `src/lib/*.ts`, HTML gerado | unit / dist (site-v0) | No change expected; existing suites keep passing | `tests/unit`, `tests/dist` | `npx vitest run` |
| Pictures for the screens sub-agent | none | build gate only | `tests/e2e/captures.spec.ts` | `npm run captures` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Not used: no task adds unit tests | `npx vitest run --project unit` |
| Full | Every task with e2e tests | `npx playwright test tests/e2e/mobile-*.spec.ts && npx playwright test` |
| Build | Capture-only task and phase ends | `npm run build && npm run check && npm run lint && npx vitest run` |

---

## Execution Plan

### Phase 1: Legível e tocável

```
T1 → T2 → T3 → T4
```

### Phase 2: Listas em 2 colunas

```
T5 → T6 → T7
```

### Phase 3: Primeira tela útil

```
T8 → T9 → T10 → T11
```

---

## Task Breakdown

### T1: Freeze the desktop pictures and guard them

**What**: Copy the six site-v0 desktop `*.running.png` to `tests/e2e/baselines/` and add a desktop e2e test that screenshots each page at 1280 (same settle and scroll as `captures.spec.ts`) and compares it with its baseline, failing above 0.01% differing pixels.
**Where**: `tests/e2e/mobile-desktop.spec.ts` (new; baselines beside it)
**Depends on**: None
**Reuses**: `saveCapture` steps in `tests/e2e/captures.spec.ts`; Playwright `toMatchSnapshot` with `maxDiffPixelRatio`
**Requirement**: MOB-04

**Done when**:

- [x] The test passes at the current HEAD for inicio, discografia, shows, loja, fas and contato (proves the guard and the baseline agree before any change)
- [x] Changing one desktop colour locally makes it fail (tried once, reverted)
- [x] Gate check passes: `npx playwright test tests/e2e/mobile-*.spec.ts && npx playwright test`

**Tests**: e2e
**Gate**: full
**Commit**: `test(mobile): freeze desktop pictures and guard them at 1280`

---

### T2: Mobile type floor

**What**: Below 768px, raise `--text-label-sm` to 0.75rem (line-height 1rem) and render inputs, selects and textareas at 16px; add the e2e audit that walks the 8 pages at 390 and lists every visible text node under 12px and every field under 16px.
**Where**: `src/styles/global.css`
**Depends on**: T1
**Reuses**: token block `--text-label-sm` in `global.css`; audit approach in spec Sources
**Requirement**: MOB-01, MOB-03

**Done when**:

- [x] `tests/e2e/mobile-legibility.spec.ts` asserts 0 text nodes < 12px and 0 fields < 16px on `/`, `/discografia/`, `/shows/`, `/loja/`, `/fas/`, `/contato/`, `/privacidade/`, `/nao-existe/` (fixtures build), naming the offending node in the failure
- [x] It failed before the CSS change (16 pages × hits reported) and passes after
- [x] T1 guard still passes
- [x] Gate check passes: `npx playwright test tests/e2e/mobile-*.spec.ts && npx playwright test`

**Tests**: e2e
**Gate**: full
**Commit**: `fix(mobile): raise small labels to 12px and fields to 16px below 768px`

---

### T3: Mobile tap targets in global styles

**What**: Below 768px, give every block-level link, button, select, summary and tab a 44×44 minimum hit area with a rule in `global.css` (inline links inside a sentence are untouched by construction), and add the e2e audit of hit areas on the 8 pages.
**Where**: `src/styles/global.css`
**Depends on**: T2
**Reuses**: audit helper from T2
**Requirement**: MOB-02

**Done when**:

- [x] `tests/e2e/mobile-touch.spec.ts` asserts every visible control on the 8 pages has a box >= 44×44, except inline links whose parent is running text, the skip link, and a checkbox whose `label` box is >= 44×44 (spec Assumptions)
- [x] The controls the rule cannot reach are listed in the commit body for T4
- [x] T1 guard still passes
- [x] Gate check passes: `npx playwright test tests/e2e/mobile-*.spec.ts && npx playwright test`

**Tests**: e2e
**Gate**: full
**Commit**: `fix(mobile): give controls a 44px hit area below 768px`

---

### T4: Tap targets the global rule cannot reach

**What**: Fix each control T3 left under 44×44 (expected: header menu/play/logo, footer link row, filter chips, share/play icon buttons) with `max-md:` classes on that control, keeping the desktop classes as they are.
**Where**: `src/components/layout/Header.astro` (and each component T3 lists - one commit, controls named in it)
**Depends on**: T3
**Reuses**: `max-md:` Tailwind variant
**Requirement**: MOB-02

**Done when**:

- [x] `tests/e2e/mobile-touch.spec.ts` passes with no allow-list beyond the spec Assumptions
- [x] T1 guard still passes
- [x] Gate check passes: `npx playwright test tests/e2e/mobile-*.spec.ts && npx playwright test`

**Tests**: e2e
**Gate**: full
**Commit**: `fix(mobile): enlarge header, footer, chip and icon controls on phones`

---

### T5: Loja in 2 columns

**What**: Below 768px, the product grid lays out 2 cards per row, the card hides the sizes, and the name clamps at 2 lines keeping `title`.
**Where**: `src/components/ProductGrid.astro`
**Depends on**: None (phase 1 complete)
**Reuses**: existing `data-product`, `data-product-name` hooks
**Requirement**: MOB-06, MOB-07, MOB-10, MOB-11, MOB-12, MOB-19

**Done when**:

- [x] `tests/e2e/mobile-grids.spec.ts` (Loja block) asserts at 390 and at 360: cards in pairs sharing a top edge, the 7th (odd) card left-aligned at one column width, no sizes text visible, the long name cut at 2 lines with full `title`, 2 per row after "Moletons" filter, and `scrollWidth` = viewport width
- [x] T1 guard still passes (desktop card unchanged, LOJA-05 still green)
- [x] Gate check passes: `npx playwright test tests/e2e/mobile-*.spec.ts && npx playwright test`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(mobile): show products two per row on phones`

---

### T6: Discografia catalog and videos in 2 columns

**What**: Below 768px, the release catalog and the video list lay out 2 per row; the release card drops its description, the video card shows thumbnail, title clamped at 2 lines and year (no credit line).
**Where**: `src/pages/discografia.astro`
**Depends on**: T5
**Reuses**: `CoverTile`, `LazyYouTube`, `FilterBar`
**Requirement**: MOB-08, MOB-10, MOB-11, MOB-12, MOB-19

**Done when**:

- [x] `tests/e2e/mobile-grids.spec.ts` (Discografia block) asserts at 390 and 360: releases and videos in pairs, odd last item left-aligned, no description visible in release cards, long titles clamped with full `title`, 2 per row after "Singles" filter, no horizontal page scroll
- [x] T1 guard still passes
- [x] Gate check passes: `npx playwright test tests/e2e/mobile-*.spec.ts && npx playwright test`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(mobile): show releases and videos two per row on phones`

---

### T7: Wallpapers in 2 columns

**What**: Below 768px, the Fãs wallpaper grid lays out 2 per row, each card keeping image, title, metadata and its "DOWNLOAD" link.
**Where**: `src/pages/fas.astro`
**Depends on**: T6
**Reuses**: wallpaper filter (`FilterBar`)
**Requirement**: MOB-09, MOB-11, MOB-12, MOB-19

**Done when**:

- [x] `tests/e2e/mobile-grids.spec.ts` (Fãs block) asserts at 390 and 360: wallpapers in pairs, every card has a visible DOWNLOAD link >= 44×44, odd last item left-aligned, 2 per row after a category filter, no horizontal page scroll
- [x] T1 guard still passes
- [x] Gate check passes: `npx playwright test tests/e2e/mobile-*.spec.ts && npx playwright test`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(mobile): show wallpapers two per row on phones`

---

### T8: Compact Contato hero with "ENVIAR MENSAGEM"

**What**: Below 768px, shrink the Contato hero so the "DEPARTAMENTOS & CONTATOS DIRETOS" heading starts above y=778 at 390×844, and add the `max-md`-only link "ENVIAR MENSAGEM" to `#mensagem-titulo`'s section, with `scroll-margin-top` clearing the sticky header.
**Where**: `src/pages/contato.astro`
**Depends on**: None (phase 2 complete)
**Reuses**: `Button` component, `scroll-mt-*` utilities
**Requirement**: MOB-13, MOB-16, MOB-17

**Done when**:

- [x] `tests/e2e/mobile-first-screen.spec.ts` asserts at 390×844: heading top < 778; "ENVIAR MENSAGEM" visible; tapping it leaves the form heading fully below the header (top >= header bottom, bottom <= 778), with JavaScript and with JavaScript disabled; the link is hidden at 1280
- [x] T1 guard still passes
- [x] Gate check passes: `npx playwright test tests/e2e/mobile-*.spec.ts && npx playwright test`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(mobile): compact contato hero with a jump to the message form`

---

### T9: Compact Fãs hero

**What**: Below 768px, shrink the Fãs hero so the "WALLPAPERS OFICIAIS" heading starts above y=778 at 390×844.
**Where**: `src/pages/fas.astro`
**Depends on**: T8
**Reuses**: type tokens `text-headline-lg-mobile`
**Requirement**: MOB-14, MOB-18

**Done when**:

- [x] `tests/e2e/mobile-first-screen.spec.ts` asserts at 390×844 the heading top < 778, and that on `/fas/` the bottom bar shows its 5 labels in order with no `aria-current`
- [x] T1 guard still passes
- [x] Gate check passes: `npx playwright test tests/e2e/mobile-*.spec.ts && npx playwright test`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(mobile): compact fas hero`

---

### T10: Compact Loja hero

**What**: Below 768px, shrink the Loja hero card so the category filter bar starts above y=778 at 390×844.
**Where**: `src/pages/loja.astro`
**Depends on**: T9
**Reuses**: type tokens `text-headline-lg-mobile`
**Requirement**: MOB-15

**Done when**:

- [x] `tests/e2e/mobile-first-screen.spec.ts` asserts at 390×844 the filter bar top < 778
- [x] T1 guard still passes
- [x] Gate check passes: `npx playwright test tests/e2e/mobile-*.spec.ts && npx playwright test`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(mobile): compact loja hero`

---

### T11: Take the mobile-v1 picture

**What**: Add a `DIR` per entry in `captures.spec.ts` so `npm run captures` also saves `.specs/features/mobile-v1/captures/mobile-discografia.running.png`, and run it.
**Where**: `tests/e2e/captures.spec.ts`
**Depends on**: T10
**Reuses**: `saveCapture`
**Requirement**: MOB-08

**Done when**:

- [x] `.specs/features/mobile-v1/captures/mobile-discografia.running.png` exists, 390 wide, taken from the fixtures build at HEAD
- [x] A plain `npx playwright test` leaves the tree clean
- [x] Gate check passes: `npm run build && npm run check && npm run lint && npx vitest run`

**Tests**: none
**Gate**: build
**Commit**: `test(mobile): save the mobile-v1 discografia picture`

---

## Checks

**C1** - At 390px no visible text node on the 8 pages is under 12px (MOB-01, AC 1)
Proof: run e2e | ✓ [mobile] MOB-01 every visible text is at least 12px

**C2** - At 390px every visible control on the 8 pages has a hit area of at least 44×44, apart from the listed exceptions (MOB-02, AC 2)
Proof: run e2e | ✓ [mobile] MOB-02 every control has a 44x44 hit area

**C3** - At 390px every input, select and textarea renders at 16px or more (MOB-03, AC 3)
Proof: run e2e | ✓ [mobile] MOB-03 every field renders at 16px or more

**C4** - At 1280px the six pages differ from their site-v0 pictures by at most 0.01% of pixels (MOB-04, AC 4)
Proof: run e2e | ✓ [desktop] MOB-04 desktop pages match site-v0 pictures

**C5** - Every site-v0 unit and dist test still passes (MOB-05, AC 5)
Proof: `npx vitest run`

**C6** - Every site-v0 e2e test still passes, axe, focus and no-JavaScript included (MOB-05, AC 5)
Proof: `npx playwright test`

**C7** - Lighthouse mobile on Início still scores >= 90 performance and accessibility (MOB-05, AC 5)
Proof: `npx lhci autorun`

**C8** - At 390px the Loja shows product cards 2 per row (MOB-06, AC 1)
Proof: run e2e | ✓ [mobile] MOB-06 loja shows products two per row

**C9** - At 390px the product card shows photo, name, price and button and no sizes (MOB-07, AC 2)
Proof: run e2e | ✓ [mobile] MOB-07 product card hides sizes on phones

**C10** - Discografia at 390px is composed as `mobile-discografia.png` with catalog and videos 2 per row (MOB-08, AC 3)
Proof: browser captures/mobile-discografia.running.png

**C11** - At 390px the release catalog and the videos are 2 per row, release cards without description (MOB-08, AC 3)
Proof: run e2e | ✓ [mobile] MOB-08 discografia shows releases and videos two per row

**C12** - At 390px the wallpapers are 2 per row, each with its DOWNLOAD link (MOB-09, AC 4)
Proof: run e2e | ✓ [mobile] MOB-09 fas shows wallpapers two per row

**C13** - A name longer than 2 lines is cut at 2 lines with an ellipsis and the full name in `title` (MOB-10, AC 5)
Proof: run e2e | ✓ [mobile] MOB-10 long names clamp at two lines with full title

**C14** - The last card of an odd-count grid sits left-aligned at one column width (MOB-11, AC 6)
Proof: run e2e | ✓ [mobile] MOB-11 odd last item is left aligned at one column

**C15** - After a filter at 390px the visible items stay 2 per row (MOB-12, AC 7)
Proof: run e2e | ✓ [mobile] MOB-12 filtered items stay two per row

**C16** - At 390×844 the Contato "DEPARTAMENTOS & CONTATOS DIRETOS" heading starts above y=778 (MOB-13, AC 1)
Proof: run e2e | ✓ [mobile] MOB-13 contato departments heading on first screen

**C17** - At 390×844 the Fãs "WALLPAPERS OFICIAIS" heading starts above y=778 (MOB-14, AC 2)
Proof: run e2e | ✓ [mobile] MOB-14 fas wallpapers heading on first screen

**C18** - At 390×844 the Loja category filter bar starts above y=778 (MOB-15, AC 3)
Proof: run e2e | ✓ [mobile] MOB-15 loja filter bar on first screen

**C19** - At 390px the Contato hero shows "ENVIAR MENSAGEM"; at 1280 it does not (MOB-16, AC 4)
Proof: run e2e | ✓ [mobile] MOB-16 contato hero shows enviar mensagem

**C20** - "ENVIAR MENSAGEM" leaves the form heading fully visible below the sticky header, with and without JavaScript (MOB-17, AC 5)
Proof: run e2e | ✓ [mobile] MOB-17 enviar mensagem scrolls to the form heading

**C21** - On `/fas/` at 390px the bottom bar shows its 5 items with none marked current (MOB-18, AC 6)
Proof: run e2e | ✓ [mobile] MOB-18 fas leaves bottom bar unmarked

**C22** - At 360px Loja, Discografia and Fãs keep 2 per row with no horizontal page scroll (MOB-19, Edge Cases)
Proof: run e2e | ✓ [mobile] MOB-19 two columns at 360px without horizontal scroll

---

## Handoff

**Settled mid-build:** Q31 LOJA-07 (nome em 1 linha) vale so a partir de 768px e roda so no projeto desktop; abaixo de 768px vale MOB-10 (2 linhas) - user: "recomendacoes, retome a fase 2 e depois lote 2"
**Dispatched:** batch worker 1 (T1-T7, phases 1-2) at HEAD e110322; returned e2fc4db blocked at T5 (LOJA-07 vs MOB-10, settled Q31); batch worker 1 resumed for T5-T7 at HEAD e2fc4db, returned e5d10c7; batch worker 2 (T8-T11, phase 3) at HEAD e5d10c7, returned 90a1cf7
**Walked:** 2026-11-08 on the real-content build (`npm run build && npx astro preview`, base /eutenia-site/), 390x844 and 360x844: P1 legível - labels read at 12px, e-mail links and chips tall enough; P1 listas - Loja 2 por linha sem tamanhos (cards de vinil/CD mostram "Especificação", que não é tamanho), Discografia catálogo e 11 vídeos 2 por linha, Fãs wallpapers 2 por linha com DOWNLOAD; nenhuma rolagem horizontal a 360. P2 primeira tela - Contato mostra "ENVIAR MENSAGEM" e o título dos departamentos na primeira tela, o toque leva a "MANDE SUA PROPOSTA OU MENSAGEM" logo abaixo do cabeçalho; Fãs mostra "WALLPAPERS OFICIAIS" na primeira tela; Loja mostra os filtros na primeira tela. Alturas a 390 (v0 → agora): Loja 6774 → 3079 (-55%), Fãs 4317 → 2687 (-38%), Discografia 7623 → 5474 (-28%, abaixo da meta de 35% do Success Criteria). The Discografia picture comes from the fixtures build: `EUTENIA_CONTENT=fixtures npm run build && EUTENIA_CONTENT=fixtures npx astro preview`; `npm run captures` retakes it.

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 → T2 → T3 → T4
Phase 2:  T5 → T6 → T7
Phase 3:  T8 → T9 → T10 → T11
```
