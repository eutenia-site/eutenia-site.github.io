# mobile-v1 proofs

**HEAD**: b719959
**Tree**: clean
**Shell**: /bin/sh
**Result**: 24 pass, 1 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run e2e / ✓ [mobile] MOB-01 every visible text is at least 12px` | pass |
| C2 | `run e2e / ✓ [mobile] MOB-02 every control has a 44x44 hit area` | pass |
| C3 | `run e2e / ✓ [mobile] MOB-03 every field renders at 16px or more` | pass |
| C4 | `run e2e / ✓ [desktop] MOB-04 desktop pages match site-v0 pictures` | pass |
| C5 | `npx vitest run` | pass |
| C6 | `npx playwright test` | pass |
| C7 | `npx lhci autorun` | pass |
| C8 | `run e2e / ✓ [mobile] MOB-06 loja shows products two per row` | pass |
| C9 | `run e2e / ✓ [mobile] MOB-07 product card hides sizes on phones` | pass |
| C10 | `browser captures/mobile-discografia.running.png` | **not judged** (screens.md) |
| C11 | `run e2e / ✓ [mobile] MOB-08 discografia shows releases and videos two per row` | pass |
| C12 | `run e2e / ✓ [mobile] MOB-09 fas shows wallpapers two per row` | pass |
| C13 | `run e2e / ✓ [mobile] MOB-10 long names clamp at two lines with full title` | pass |
| C14 | `run e2e / ✓ [mobile] MOB-11 odd last item is left aligned at one column` | pass |
| C15 | `run e2e / ✓ [mobile] MOB-12 filtered items stay two per row` | pass |
| C16 | `run e2e / ✓ [mobile] MOB-13 contato departments heading on first screen` | pass |
| C17 | `run e2e / ✓ [mobile] MOB-14 fas wallpapers heading on first screen` | pass |
| C18 | `run e2e / ✓ [mobile] MOB-15 loja filter bar on first screen` | pass |
| C19 | `run e2e / ✓ [mobile] MOB-16 contato hero shows enviar mensagem` | pass |
| C20 | `run e2e / ✓ [mobile] MOB-17 enviar mensagem scrolls to the form heading` | pass |
| C21 | `run e2e / ✓ [mobile] MOB-18 fas leaves bottom bar unmarked` | pass |
| C22 | `run e2e / ✓ [mobile] MOB-19 two columns at 360px without horizontal scroll` | pass |
| Build | `npm run build` | pass |
| Build | `npm run check` | pass |
| Build | `npm run lint` | pass |

## Output

`Run e2e` - exit 0

```
  ✓  166 [mobile] › tests/e2e/quality.spec.ts:193:1 › QUAL-05 without JavaScript every page shows content and links (3.0s)
  ✓  167 [mobile] › tests/e2e/shows.spec.ts:9:1 › SHOW-05 tabs recompute with browser date (539ms)
  ✓  168 [mobile] › tests/e2e/shows.spec.ts:38:1 › SHOW-06 empty tab shows message with social links (663ms)
  ✓  170 [mobile] › tests/e2e/shows.spec.ts:99:1 › SHOW-08 booking form opens mailto with Booking subject (710ms)
  ✓  169 [mobile] › tests/e2e/shows.spec.ts:63:1 › SHOW-07 row action matches status (1.6s)
  ✓  172 [mobile] › tests/e2e/shows.spec.ts:187:1 › QUAL-03 shows tabs move with arrow keys (471ms)
  ✓  171 [mobile] › tests/e2e/shows.spec.ts:136:1 › SHOW-08 untouched optional selects stay out of mailto body and POST (1.1s)
  ✓  173 [mobile] › tests/e2e/shows.spec.ts:216:1 › SHOW-01 tabs sit at the bottom of the hero band; VIP and status pills inline (401ms)
  ✓  164 [mobile] › tests/e2e/quality.spec.ts:108:1 › QUAL-02 no serious or critical axe violations (9.5s)
  ✓  174 [mobile] › tests/e2e/shows.spec.ts:246:1 › SHOW-02 mobile rows are one compact line with a red accent when on sale (490ms)
  ✓  175 [mobile] › tests/e2e/shows.spec.ts:275:1 › SHOW-09 mobile VIP card puts price and red button side by side; vote card is desktop only (446ms)
  ✓  176 [mobile] › tests/e2e/smoke.spec.ts:3:1 › smoke: fixtures build serves the home page under the base path (919ms)

  61 skipped
  115 passed (51.4s)
```

`npx vitest run` - exit 0

```
RUN  v5.1.0 /home/deivid/Projects/Eutenia/site


 Test Files  21 passed (21)
      Tests  106 passed (106)
   Start at  20:07:34
   Duration  4.57s (transform 35%, tests 35%, import 27%, worker 2%)
```

`npx playwright test` - exit 0

```
  ✓  166 [mobile] › tests/e2e/quality.spec.ts:193:1 › QUAL-05 without JavaScript every page shows content and links (3.3s)
  ✓  167 [mobile] › tests/e2e/shows.spec.ts:9:1 › SHOW-05 tabs recompute with browser date (586ms)
  ✓  168 [mobile] › tests/e2e/shows.spec.ts:38:1 › SHOW-06 empty tab shows message with social links (593ms)
  ✓  170 [mobile] › tests/e2e/shows.spec.ts:99:1 › SHOW-08 booking form opens mailto with Booking subject (610ms)
  ✓  169 [mobile] › tests/e2e/shows.spec.ts:63:1 › SHOW-07 row action matches status (1.5s)
  ✓  172 [mobile] › tests/e2e/shows.spec.ts:187:1 › QUAL-03 shows tabs move with arrow keys (551ms)
  ✓  171 [mobile] › tests/e2e/shows.spec.ts:136:1 › SHOW-08 untouched optional selects stay out of mailto body and POST (1.4s)
  ✓  173 [mobile] › tests/e2e/shows.spec.ts:216:1 › SHOW-01 tabs sit at the bottom of the hero band; VIP and status pills inline (495ms)
  ✓  174 [mobile] › tests/e2e/shows.spec.ts:246:1 › SHOW-02 mobile rows are one compact line with a red accent when on sale (544ms)
  ✓  175 [mobile] › tests/e2e/shows.spec.ts:275:1 › SHOW-09 mobile VIP card puts price and red button side by side; vote card is desktop only (366ms)
  ✓  176 [mobile] › tests/e2e/smoke.spec.ts:3:1 › smoke: fixtures build serves the home page under the base path (446ms)
  ✓  164 [mobile] › tests/e2e/quality.spec.ts:108:1 › QUAL-02 no serious or critical axe violations (9.6s)

  61 skipped
  115 passed (50.7s)
```

`npx lhci autorun` - exit 0

```
Started a web server with "npm run build && npx astro preview --port 4321 --ignore-lock"...
Running Lighthouse 3 time(s) on http://localhost:4321/eutenia-site/
Run #1...done.
Run #2...done.
Run #3...done.
Done running Lighthouse!


Dumping 3 reports to disk at /home/deivid/Projects/Eutenia/site/.lighthouseci/reports...
Done writing reports to disk.

Done running autorun.
Checking assertions against 1 URL(s), 3 total run(s)

All results processed!
```
