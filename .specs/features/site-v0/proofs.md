# site-v0 proofs

**HEAD**: b41b711
**Tree**: clean
**Shell**: /bin/sh
**Result**: 70 pass, 6 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run dist / ✓ NAV-01 every route has lang pt-BR, title and description` | pass |
| C2 | `run e2e / ✓ NAV-02 header links order and aria-current` | pass |
| C3 | `run e2e / ✓ NAV-03 ouvir agora opens Spotify in new tab` | pass |
| C4 | `run e2e / ✓ NAV-04 bottom bar below 768px highlights current item` | pass |
| C5 | `run e2e / ✓ NAV-05 menu opens drawer and focuses first link` | pass |
| C6 | `run e2e / ✓ NAV-06 Esc closes drawer and restores focus` | pass |
| C7 | `run dist / ✓ NAV-07 footer has links, privacy, socials and copyright` | pass |
| C8 | `run dist / ✓ NAV-08 no internal link resolves to 404` | pass |
| C9 | `run e2e / ✓ NAV-09 unknown path shows 404 with link to Início` | pass |
| C10 | `browser captures/inicio.running.png` | **diverges** (screens.md) |
| C11 | `browser captures/mobile-inicio.running.png` | **diverges** (screens.md) |
| C12 | `run dist / ✓ HOME-03 hero features Pandora with clip and Spotify actions` | pass |
| C13 | `run dist / ✓ HOME-04 compact Spotify embed of featured release` | pass |
| C14 | `run unit / ✓ HOME-05 latest releases returns 4 newest first` | pass |
| C15 | `run e2e / ✓ HOME-06 clip loads YouTube player only after activation` | pass |
| C16 | `run e2e / ✓ HOME-07 shows at most 3 upcoming shows` | pass |
| C17 | `run dist / ✓ HOME-07 empty shows state links Instagram and YouTube` | pass |
| C18 | `run e2e / ✓ HOME-08 merch lists 3 featured products` | pass |
| C19 | `run dist / ✓ HOME-09 stats row omitted when stats data empty` | pass |
| C20 | `browser captures/discografia.running.png` | **diverges** (screens.md) |
| C21 | `browser captures/mobile-discografia.running.png` | **diverges** (screens.md) |
| C22 | `run dist / ✓ DISC-03 catalog lists the 7 releases newest first` | pass |
| C23 | `run dist / ✓ DISC-04 featured tracklist in album order with m:ss durations` | pass |
| C24 | `run e2e / ✓ DISC-05 filter shows only its kind and sets aria-pressed` | pass |
| C25 | `run dist / ✓ DISC-06 lyrics block omitted without lyrics` | pass |
| C26 | `run dist / ✓ DISC-07 lists 11 videos with official clips first` | pass |
| C27 | `run dist / ✓ DISC-08 streaming links only for present platforms` | pass |
| C28 | `run e2e / ✓ DISC-09 without JavaScript all releases and videos show and filters hide` | pass |
| C29 | `browser captures/shows.running.png` | pass |
| C30 | `browser captures/mobile-shows.running.png` | **diverges** (screens.md) |
| C31 | `run unit / ✓ SHOW-03 show dated today in São Paulo is upcoming` | pass |
| C32 | `run unit / ✓ SHOW-04 tabs order upcoming asc, past desc, festivals upcoming only` | pass |
| C33 | `run e2e / ✓ SHOW-05 tabs recompute with browser date` | pass |
| C34 | `run e2e / ✓ SHOW-06 empty tab shows message with social links` | pass |
| C35 | `run e2e / ✓ SHOW-07 row action matches status` | pass |
| C36 | `run e2e / ✓ SHOW-08 booking form opens mailto with Booking subject` | pass |
| C37 | `run dist / ✓ SHOW-09 VIP card omitted when VIP data empty` | pass |
| C38 | `run unit / ✓ SHOW-10 same-date shows ordered by city` | pass |
| C39 | `browser captures/loja.running.png` | pass |
| C40 | `run e2e / ✓ LOJA-02 category filter shows only that category` | pass |
| C41 | `run unit / ✓ LOJA-03 sorts by price asc, desc and newest` | pass |
| C42 | `run e2e / ✓ LOJA-04 comprar opens product link, em breve disabled without link` | pass |
| C43 | `run dist / ✓ LOJA-05 card shows category, name, price, badge and sizes as text` | pass |
| C44 | `run unit / ✓ LOJA-06 empty product list renders Produtos em breve` | pass |
| C45 | `run e2e / ✓ LOJA-07 long product name truncates with title` | pass |
| C46 | `browser captures/contato.running.png` | pass |
| C47 | `run dist / ✓ CONT-02 department cards mailto contato with department subject` | pass |
| C48 | `run dist / ✓ CONT-03 form has fields with required marks` | pass |
| C49 | `run e2e / ✓ CONT-04 invalid submit shows messages and focuses first invalid field` | pass |
| C50 | `run e2e / ✓ CONT-05 configured endpoint POST shows success` | pass |
| C51 | `run e2e / ✓ CONT-06 failed POST keeps form and shows error` | pass |
| C52 | `run unit / ✓ CONT-07 mailto has subject Departamento - nome and filled fields` | pass |
| C53 | `run dist / ✓ CONT-08 press kit lists files with type and size` | pass |
| C54 | `run dist / ✓ CONT-09 redes section links five profiles` | pass |
| C55 | `browser captures/fas.running.png` | pass |
| C56 | `run e2e / ✓ FAS-02 wallpaper filter shows only category` | pass |
| C57 | `run dist / ✓ FAS-03 wallpaper card has download link and metadata` | pass |
| C58 | `run dist / ✓ FAS-04 mural and telegram sections omitted when empty` | pass |
| C59 | `run dist / ✓ PRIV-01 privacy page states data, purpose, contact and date` | pass |
| C60 | `run dist / ✓ PRIV-02 consent labels link to privacidade` | pass |
| C61 | `run unit / ✓ DATA-01 every collection uses a file loader under the content root` | pass |
| C62 | `run unit / ✓ DATA-02 invalid data reports file and field` | pass |
| C63 | `run unit / ✓ DATA-03 every placeholder file is listed in PLACEHOLDERS.md` | pass |
| C64 | `run dist / ✓ DATA-04 no image from temporary design hosts` | pass |
| C65 | `run unit / ✓ DATA-05 release without cover renders the Eutenia mark tile` | pass |
| C66 | `run unit / ✓ DATA-06 available show without ticket url fails schema` | pass |
| C67 | `run e2e / ✓ QUAL-01 tokens applied: background, fonts, zero radius` | pass |
| C68 | `run e2e / ✓ QUAL-02 no serious or critical axe violations` | pass |
| C69 | `run e2e / ✓ QUAL-03 every control reachable by keyboard with visible focus` | pass |
| C70 | `npx lhci autorun` | **fail** |
| C71 | `run e2e / ✓ QUAL-05 without JavaScript every page shows content and links` | pass |
| C72 | `run unit / ✓ DEPLOY-01 workflow deploys on push to main and daily 09:00 UTC` | pass |
| C73 | `run unit / ✓ DEPLOY-02 README covers run, data, form endpoint, store url, base path` | pass |
| Build | `npm run build` | pass |
| Build | `npm run check` | pass |
| Build | `npm run lint` | pass |

## Output

`Run dist` - exit 0

```
 ✓ |dist| tests/dist/inicio.test.ts > Início (dist, real content) > HOME-09 stats row omitted when stats data empty 0ms
 ✓ |dist| tests/dist/contato.test.ts > Contato (dist, real content) > CONT-02 department cards mailto contato with department subject 9ms
 ✓ |dist| tests/dist/contato.test.ts > Contato (dist, real content) > CONT-02 merch card claims no online store or orders 2ms
 ✓ |dist| tests/dist/contato.test.ts > Contato (dist, real content) > CONT-03 form has fields with required marks 6ms
 ✓ |dist| tests/dist/contato.test.ts > Contato (dist, real content) > CONT-08 press kit lists files with type and size 3ms
 ✓ |dist| tests/dist/contato.test.ts > Contato (dist, real content) > CONT-09 redes section links five profiles 1ms
 ✓ |dist| tests/dist/fas.test.ts > Fãs (dist, real content) > FAS-03 wallpaper card has download link and metadata 8ms
 ✓ |dist| tests/dist/fas.test.ts > Fãs (dist, real content) > FAS-04 mural and telegram sections omitted when empty 2ms
 ✓ |dist| tests/dist/shows.test.ts > Shows (dist, real content) > SHOW-09 VIP card omitted when VIP data empty 3ms
 ✓ |dist| tests/dist/smoke.test.ts > smoke: build wrote dist/index.html in pt-BR 2ms

 Test Files  10 passed (10)
      Tests  29 passed (29)
   Start at  11:22:35
   Duration  494ms (import 37%, tests 27%, transform 26%, worker 10%)
```

`Run e2e` - exit 0

```
  ✓  101 [mobile] › tests/e2e/quality.spec.ts:126:1 › QUAL-03 every control reachable by keyboard with visible focus (4.7s)
  ✓  103 [mobile] › tests/e2e/shows.spec.ts:9:1 › SHOW-05 tabs recompute with browser date (641ms)
  ✓  104 [mobile] › tests/e2e/shows.spec.ts:38:1 › SHOW-06 empty tab shows message with social links (623ms)
  ✓  106 [mobile] › tests/e2e/shows.spec.ts:99:1 › SHOW-08 booking form opens mailto with Booking subject (928ms)
  ✓  105 [mobile] › tests/e2e/shows.spec.ts:63:1 › SHOW-07 row action matches status (1.5s)
  ✓  108 [mobile] › tests/e2e/shows.spec.ts:187:1 › QUAL-03 shows tabs move with arrow keys (731ms)
  ✓  107 [mobile] › tests/e2e/shows.spec.ts:136:1 › SHOW-08 untouched optional selects stay out of mailto body and POST (1.3s)
  ✓  109 [mobile] › tests/e2e/shows.spec.ts:216:1 › SHOW-01 tabs sit at the bottom of the hero band; VIP and status pills inline (474ms)
  ✓  110 [mobile] › tests/e2e/shows.spec.ts:246:1 › SHOW-02 mobile rows are one compact line with a red accent when on sale (473ms)
  ✓  111 [mobile] › tests/e2e/shows.spec.ts:275:1 › SHOW-09 mobile VIP card puts price and red button side by side; vote card is desktop only (468ms)
  ✓  112 [mobile] › tests/e2e/smoke.spec.ts:3:1 › smoke: fixtures build serves the home page under the base path (829ms)
  ✓  100 [mobile] › tests/e2e/quality.spec.ts:108:1 › QUAL-02 no serious or critical axe violations (11.6s)

  27 skipped
  85 passed (46.7s)
```

`Run unit` - exit 0

```
 ✓ |unit| tests/unit/schemas.test.ts > required fields and refines > valid entries parse 7ms
 ✓ |unit| tests/unit/schemas.test.ts > required fields and refines > DATA-06 available show without ticket url fails schema 1ms
 ✓ |unit| tests/unit/schemas.test.ts > required fields and refines > show rejects unknown status, invalid date and missing city 1ms
 ✓ |unit| tests/unit/schemas.test.ts > required fields and refines > SHOW-03 show date accepts only AAAA-MM-DD, not a date with time 1ms
 ✓ |unit| tests/unit/schemas.test.ts > required fields and refines > release requires title, known type, valid date and tracks with durations 1ms
 ✓ |unit| tests/unit/schemas.test.ts > required fields and refines > video requires title, date and oficial flag 1ms
 ✓ |unit| tests/unit/schemas.test.ts > required fields and refines > product requires a known category, integer price and date added 1ms
 ✓ |unit| tests/unit/schemas.test.ts > required fields and refines > wallpaper requires its file and a known category 1ms
 ✓ |unit| tests/unit/schemas.test.ts > required fields and refines > site config requires the contact e-mail and the five social urls 1ms
 ✓ |unit| tests/unit/schemas.test.ts > DATA-02 > DATA-02 invalid data reports file and field 1483ms

 Test Files  11 passed (11)
      Tests  77 passed (77)
   Start at  11:23:24
   Duration  3.56s (tests 39%, transform 35%, import 25%, worker 1%)
```

`npx lhci autorun` - exit 1

```

Dumping 3 reports to disk at /home/deivid/Projects/Eutenia/site/.lighthouseci/reports...
Done writing reports to disk.

Checking assertions against 1 URL(s), 3 total run(s)

1 result(s) for http://localhost:4321/eutenia-site/ :

  ✘  categories.performance failure for minScore assertion
        expected: >=0.9
           found: 0.89
      all values: 0.88, 0.89, 0.89

Assertion failed. Exiting with status code 1.
assert command failed. Exiting with status code 1.
```
