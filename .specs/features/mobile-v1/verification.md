# Mobile v1 verification

**Verdict**: FAIL
**Proofs**: `proofs.md` at b719959 (code unchanged up to dc59442; last code commit 90a1cf7)
**Verifier**: independent sub-agent (author != verifier)

## Checks

| Check | Test | Holds |
| --- | --- | --- |
| C1 | `mobile-legibility.spec.ts` `MOB-01 every visible text is at least 12px` | yes - walks every visible text node on the 8 pages, `toEqual([])` |
| C2 | `mobile-touch.spec.ts` `MOB-02 every control has a 44x44 hit area` | no - audits only 390px; the rule is "narrower than 768px" and the consent checkbox label is 40px tall at 600-767px |
| C3 | `mobile-legibility.spec.ts` `MOB-03 every field renders at 16px or more` | yes |
| C4 | `mobile-desktop.spec.ts` `MOB-04 desktop pages match site-v0 pictures` | partly - baselines are byte-identical to the site-v0 `*.running.png` and `threshold: 0`, `maxDiffPixelRatio: 0.0001`; covers 6 of the 8 pages (no `/privacidade/`, no 404) |
| C5 | `npx vitest run` | yes |
| C6 | `npx playwright test` | yes - only change to a v0 test is LOJA-07 skipped below 768px (Q31, confirmed) |
| C7 | `npx lhci autorun` (`lighthouserc.json`, Início, minScore 0.9 perf and a11y) | yes |
| C8 | `mobile-grids.spec.ts` `MOB-06 loja shows products two per row` | yes - `expectTwoPerRow` fails on 1 or 3 per row, at 390 and 360 |
| C9 | `mobile-grids.spec.ts` `MOB-07 product card hides sizes on phones` | yes - `[data-product-sizes]` exists in the markup, fixtures have sizes |
| C10 | `browser captures/mobile-discografia.running.png` | judged by the screens sub-agent |
| C11 | `mobile-grids.spec.ts` `MOB-08 discografia shows releases and videos two per row` | yes |
| C12 | `mobile-grids.spec.ts` `MOB-09 fas shows wallpapers two per row` | yes |
| C13 | `mobile-grids.spec.ts` `MOB-10 long names clamp at two lines with full title` | yes - height = 2 lines, clipped, `-webkit-line-clamp: 2`, `title` = full name, for product, release and video |
| C14 | `mobile-grids.spec.ts` `MOB-11 odd last item is left aligned at one column` | yes |
| C15 | `mobile-grids.spec.ts` `MOB-12 filtered items stay two per row` | yes - Loja, Discografia and Fãs filters |
| C16 | `mobile-first-screen.spec.ts` `MOB-13 contato departments heading on first screen` | yes |
| C17 | `mobile-first-screen.spec.ts` `MOB-14 fas wallpapers heading on first screen` | yes |
| C18 | `mobile-first-screen.spec.ts` `MOB-15 loja filter bar on first screen` | yes |
| C19 | `mobile-first-screen.spec.ts` `MOB-16 contato hero shows enviar mensagem` | yes - visible at 390, hidden at 1280 |
| C20 | `mobile-first-screen.spec.ts` `MOB-17 enviar mensagem scrolls to the form heading` | yes - with and without JavaScript, top >= header bottom, bottom <= 778 |
| C21 | `mobile-first-screen.spec.ts` `MOB-18 fas leaves bottom bar unmarked` | yes - 5 labels in order, no `aria-current` (the only current marker in `BottomBar.astro`) |
| C22 | `mobile-grids.spec.ts` `MOB-19 two columns at 360px without horizontal scroll` | yes |

Own examples (throwaway, not committed): the C1/C2/C3 audits re-run at 767px and 360px on the 8 pages, with the menu drawer open and on each Shows tab; the Loja grid at 767px. Text, fields, grid and drawer hold; the consent checkbox breaks (finding 1). The only inline-link exemptions taken are "Contato: contato@..." in the footer, the e-mail in the Privacidade text and "Política de Privacidade" in the consent label, all inside a sentence.

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| 1. MOB-02: the consent checkbox has a 40px hit area between ~600px and 767px | `consentimento` label measures 667x40 at 767px, 500x40 at 600px on `/contato/` and `/shows/` (80px tall at 390 and 360, where the label wraps); C2's test runs only at 390 | give the consent label a 44px minimum height below 768px and run the C2 audit at 767px as well as 390px | b17e93b |
| 2. MOB-04 is proven on 6 of the 8 pages | `mobile-desktop.spec.ts` `PAGES` has no `privacidade/` and no 404; the spec names "any of those pages" | freeze 1280 pictures of `/privacidade/` and the 404 from `e110322` and add them to `PAGES`, or narrow C4/MOB-04 by a new criterion | b46e907 |
