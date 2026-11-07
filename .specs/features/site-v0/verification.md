# Site Eutenia v0 verification

**Verdict**: FAIL
**Proofs**: `proofs.md` at 5f91347
**Verifier**: independent sub-agent (author != verifier)

Diff judged: `41197f8..5f91347`. Own examples run at `HEAD` as throwaway probes outside the repo (fixture build on a scratch port, a `BASE=/` build, an invalid-data build, unit probes): Loja sort select, contato mailto body, booking mailto with untouched selects, the SHOW-03 boundary in the browser (23:59 vs 00:00 BRT), home show recompute, hero clip action, Shows tabs by arrow keys, axe with the drawer open and with form errors, a show date with a time of day, a build with an invalid date, a root base path build, fragment targets and non-href references in `dist/`.

## Checks

| Check | Test | Holds |
| --- | --- | --- |
| C1 | `tests/dist/nav.test.ts` `NAV-01 every route has lang pt-BR, title and description` | yes |
| C2 | `tests/e2e/nav.spec.ts` `NAV-02 header links order and aria-current` | yes - skips a 404 route, but NAV-01/NAV-08 catch a missing page |
| C3 | `tests/e2e/nav.spec.ts` `NAV-03 ouvir agora opens Spotify in new tab` | yes |
| C4 | `tests/e2e/nav.spec.ts` `NAV-04 bottom bar below 768px highlights current item` | yes |
| C5 | `tests/e2e/nav.spec.ts` `NAV-05 menu opens drawer and focuses first link` | yes |
| C6 | `tests/e2e/nav.spec.ts` `NAV-06 Esc closes drawer and restores focus` | yes |
| C7 | `tests/dist/nav.test.ts` `NAV-07 footer has links, privacy, socials and copyright` | yes |
| C8 | `tests/dist/quality.test.ts` `NAV-08 no internal link resolves to 404` | partial - scans only double-quoted href, src and srcset in HTML; meta `content` (og:image), CSS `url()` and `xlink:href` are not checked (all resolve today, by probe) |
| C9 | `tests/e2e/not-found.spec.ts` `NAV-09 unknown path shows 404 with link to Início` | yes |
| C10 | `captures/inicio.running.png` | judged by the screens sub-agent (screens.md) |
| C11 | `captures/mobile-inicio.running.png` | judged by the screens sub-agent (screens.md) |
| C12 | `tests/dist/inicio.test.ts` `HOME-03 hero features Pandora with clip and Spotify actions` | no - asserts the Spotify href equals the data, which is the artist page, not the release; asserts the clip action is `#clipe` (a scroll), not that it opens the clip |
| C13 | `tests/dist/inicio.test.ts` `HOME-04 compact Spotify embed of featured release` | yes - src equals the data, which is a track of Pandora, not the album (see F1) |
| C14 | `tests/unit/catalog.test.ts` `HOME-05 latest releases returns 4 newest first` | yes |
| C15 | `tests/e2e/inicio.spec.ts` `HOME-06 clip loads YouTube player only after activation` | yes |
| C16 | `tests/e2e/inicio.spec.ts` `HOME-07 shows at most 3 upcoming shows` | yes |
| C17 | `tests/dist/inicio.test.ts` `HOME-07 empty shows state links Instagram and YouTube` | yes |
| C18 | `tests/e2e/inicio.spec.ts` `HOME-08 merch lists 3 featured products` | yes |
| C19 | `tests/dist/inicio.test.ts` `HOME-09 stats row omitted when stats data empty` | yes |
| C20 | `captures/discografia.running.png` | judged by the screens sub-agent (screens.md) |
| C21 | `captures/mobile-discografia.running.png` | judged by the screens sub-agent (screens.md) |
| C22 | `tests/dist/discografia.test.ts` `DISC-03 catalog lists the 7 releases newest first` | yes |
| C23 | `tests/dist/discografia.test.ts` `DISC-04 featured tracklist in album order with m:ss durations` | yes |
| C24 | `tests/e2e/discografia.spec.ts` `DISC-05 filter shows only its kind and sets aria-pressed` | yes |
| C25 | `tests/dist/discografia.test.ts` `DISC-06 lyrics block omitted without lyrics` | yes |
| C26 | `tests/dist/discografia.test.ts` `DISC-07 lists 11 videos with official clips first` | yes |
| C27 | `tests/dist/discografia.test.ts` `DISC-08 streaming links only for present platforms` | yes - the Spotify entry is the artist page (see F1) |
| C28 | `tests/e2e/discografia.spec.ts` `DISC-09 without JavaScript all releases and videos show and filters hide` | yes |
| C29 | `captures/shows.running.png` | judged by the screens sub-agent (screens.md) |
| C30 | `captures/mobile-shows.running.png` | judged by the screens sub-agent (screens.md) |
| C31 | `tests/unit/shows.test.ts` `SHOW-03 show dated today in São Paulo is upcoming` | yes - date-only values; a date with a time of day breaks (F5) |
| C32 | `tests/unit/shows.test.ts` `SHOW-04 tabs order upcoming asc, past desc, festivals upcoming only` | yes |
| C33 | `tests/e2e/shows.spec.ts` `SHOW-05 tabs recompute with browser date` | yes - probe also holds at 23:59 / 00:00 BRT in the browser |
| C34 | `tests/e2e/shows.spec.ts` `SHOW-06 empty tab shows message with social links` | yes |
| C35 | `tests/e2e/shows.spec.ts` `SHOW-07 row action matches status` | yes |
| C36 | `tests/e2e/shows.spec.ts` `SHOW-08 booking form opens mailto with Booking subject` | yes |
| C37 | `tests/dist/shows.test.ts` `SHOW-09 VIP card omitted when VIP data empty` | yes |
| C38 | `tests/unit/shows.test.ts` `SHOW-10 same-date shows ordered by city` | yes |
| C39 | `captures/loja.running.png` | judged by the screens sub-agent (screens.md) |
| C40 | `tests/e2e/loja.spec.ts` `LOJA-02 category filter shows only that category` | yes |
| C41 | `tests/unit/catalog.test.ts` `LOJA-03 sorts by price asc, desc and newest` | yes - unit only; the Organizar select wiring has no test, but a probe shows it orders correctly |
| C42 | `tests/e2e/loja.spec.ts` `LOJA-04 comprar opens product link, em breve disabled without link` | yes |
| C43 | `tests/dist/loja.test.ts` `LOJA-05 card shows category, name, price, badge and sizes as text` | yes |
| C44 | `tests/unit/components.test.ts` `LOJA-06 empty product list renders Produtos em breve` | yes |
| C45 | `tests/e2e/loja.spec.ts` `LOJA-07 long product name truncates with title` | yes |
| C46 | `captures/contato.running.png` | judged by the screens sub-agent (screens.md) |
| C47 | `tests/dist/contato.test.ts` `CONT-02 department cards mailto contato with department subject` | yes |
| C48 | `tests/dist/contato.test.ts` `CONT-03 form has fields with required marks` | yes |
| C49 | `tests/e2e/contato.spec.ts` `CONT-04 invalid submit shows messages and focuses first invalid field` | yes |
| C50 | `tests/e2e/contato.spec.ts` `CONT-05 configured endpoint POST shows success` | yes |
| C51 | `tests/e2e/contato.spec.ts` `CONT-06 failed POST keeps form and shows error` | yes - 500 in e2e; the 10 s timeout is held by the unit test `CONT-06 no response within 10 s returns erro` |
| C52 | `tests/unit/forms.test.ts` `CONT-07 mailto has subject Departamento - nome and filled fields` | no - the test hands `buildMailto` a Departamento line itself; the contato form removes departamento before calling it, so the real body lacks it |
| C53 | `tests/dist/contato.test.ts` `CONT-08 press kit lists files with type and size` | yes |
| C54 | `tests/dist/contato.test.ts` `CONT-09 redes section links five profiles` | yes |
| C55 | `captures/fas.running.png` | judged by the screens sub-agent (screens.md) |
| C56 | `tests/e2e/fas.spec.ts` `FAS-02 wallpaper filter shows only category` | yes |
| C57 | `tests/dist/fas.test.ts` `FAS-03 wallpaper card has download link and metadata` | yes |
| C58 | `tests/dist/fas.test.ts` `FAS-04 mural and telegram sections omitted when empty` | yes |
| C59 | `tests/dist/privacidade.test.ts` `PRIV-01 privacy page states data, purpose, contact and date` | yes - the page also makes a false statement no test reads (F6) |
| C60 | `tests/dist/privacidade.test.ts` `PRIV-02 consent labels link to privacidade` | yes |
| C61 | `tests/unit/schemas.test.ts` `DATA-01 every collection uses a file loader under the content root` | yes |
| C62 | `tests/unit/schemas.test.ts` `DATA-02 invalid data reports file and field` | yes - one of the three named cases (missing field); a probe build with an invalid date also names the file and `data` |
| C63 | `tests/unit/repo.test.ts` `DATA-03 every placeholder file is listed in PLACEHOLDERS.md` | yes |
| C64 | `tests/dist/quality.test.ts` `DATA-04 no image from temporary design hosts` | yes - probe: the only external hosts in dist are Spotify, YouTube, ytimg, Google Fonts, socials, Deezer |
| C65 | `tests/unit/components.test.ts` `DATA-05 release without cover renders the Eutenia mark tile` | yes |
| C66 | `tests/unit/schemas.test.ts` `DATA-06 available show without ticket url fails schema` | yes |
| C67 | `tests/e2e/quality.spec.ts` `QUAL-01 tokens applied: background, fonts, zero radius` | partial - colour, fonts and radius asserted; the spacing tokens the criterion names are not |
| C68 | `tests/e2e/quality.spec.ts` `QUAL-02 no serious or critical axe violations` | yes - the iframe-internal exclusion (target path longer than one) only drops nodes inside the third-party Spotify/YouTube documents; a probe with the drawer open and with form errors also had none |
| C69 | `tests/e2e/quality.spec.ts` `QUAL-03 every control reachable by keyboard with visible focus` | partial - skips tabindex=-1 tab buttons "because arrow keys move focus", but no test presses an arrow key (a probe shows they work today) |
| C70 | `npx lhci autorun` (`lighthouserc.json`, mobile preset, minScore 0.9 perf and a11y, real build) | yes |
| C71 | `tests/e2e/quality.spec.ts` `QUAL-05 without JavaScript every page shows content and links` | yes |
| C72 | `tests/unit/repo.test.ts` `DEPLOY-01 workflow deploys on push to main and daily 09:00 UTC` | yes |
| C73 | `tests/unit/repo.test.ts` `DEPLOY-02 README covers run, data, form endpoint, store url, base path` | yes |

## Findings

| Finding | Severity | Check / criterion | Evidence | Fix | Closed |
| --- | --- | --- | --- | --- | --- |
| F1 - "OUVIR NO SPOTIFY" opens the artist page, not Pandora, and no test fails; every release's `links.spotify` is the artist URL and the embed is one track | Major | C12 / HOME-03 (also C13 HOME-04, C27 DISC-08) | `src/content/data/releases.json:57`; `tests/dist/inicio.test.ts:51` asserts href equals the data; README:134 documents the gap | put the Pandora album URL in `links.spotify` (and an album embed if wanted) and assert the hero href is an `open.spotify.com/album/` URL; or append the departure to the spec with user confirmation | |
| F2 - the hero's primary action only scrolls to `#clipe`; the clip does not open (probe: 0 iframes after the click) | Minor | C12 / HOME-03 | `src/pages/index.astro:85`; `tests/dist/inicio.test.ts:39` asserts `#clipe` | make the hero action load the lazy player (or open the YouTube watch URL) and assert the player appears; or get the user to confirm scrolling satisfies "opens its official clip" | |
| F3 - the contato form in mailto mode (the real build's mode: `formEndpoint` is empty) leaves Departamento out of the body; probe body = nome, e-mail, mensagem only | Minor | C52 / CONT-07 | `src/components/ContactForm.astro:404` filters `departamento`; `tests/unit/forms.test.ts:54` passes the line in by hand | keep departamento in the body and add an e2e on `/contato/` in mailto mode asserting the body lines | |
| F4 - booking optional selects have no empty option, so an untouched form reports "Tipo de evento: Festival Multicultural / Rock" and "Capacidade estimada do local: Até 800 pessoas" as if chosen (probe), in the mailto body and the POST | Minor | SHOW-08, CONT-07 (no check) | `src/components/ContactForm.astro:216` adds the placeholder option only for required selects | add an empty option to optional selects and test that untouched selects are absent from the body | |
| F5 - a show date with a time of day is accepted by the schema, and 21:00 BRT parses to 00:00Z, which `calendarDay` takes as a date-only value: the show shows as the next day (11 MAR for a 10 MAR show) and stays upcoming a day too long (probe) | Minor | C31 / SHOW-03 | `src/lib/format.ts:42` (UTC-midnight heuristic); `src/content.config.ts:35` (`z.coerce.date()` accepts datetimes) | restrict show `data` to `AAAA-MM-DD` in the schema (the README already says so) or drop the heuristic; add a unit case with a 21:00-03:00 show | |
| F6 - the privacy page says Spotify and YouTube players "só carregam quando você os aciona", but the Spotify iframe on Início loads with the page (`src` set, only `loading="lazy"`, right under the hero); Google Fonts requests are not mentioned either | Major | no check (PRIV-01 page, false statement on the real build) | `src/content/paginas/privacidade.md:36`; `src/components/ui/SpotifyEmbed.astro` | correct the text (or make the Spotify embed click-to-load) and add a dist assertion that ties the statement to the page | |
| F7 - the Contato "Merch & Loja" card offers "rastreamento de pedidos da loja online oficial e suporte pós-venda" while the store sells nothing (every product is "Em breve", `lojaUrl` empty): a made-up fact on the real build | Minor | no check (Assumptions: no invented facts) | `src/pages/contato.astro:33` | rewrite the card copy so it does not claim orders or an online store exist | |
| F8 - the NAV-08 checker reads only double-quoted `href`, `src` and `srcset` in HTML; og:image (`content=`), CSS `url()` and `xlink:href` would break without a failing test (all resolve today, by probe) | Minor | C8 / NAV-08 | `tests/dist/quality.test.ts:12` | also check site-origin URLs in `meta content` and `url()` references in `dist/_astro/*.css` | |
| F9 - QUAL-01 asserts colour, fonts and zero radius but no spacing token, which the criterion names | Minor | C67 / QUAL-01 | `tests/e2e/quality.spec.ts:51` (style probe has no spacing value) | assert one or two DESIGN.md spacing tokens (e.g. page gutter at 390 and 1280) | |
| F10 - QUAL-03 skips the tabindex=-1 Shows tab buttons on the grounds that arrow keys move focus, but no test presses ArrowLeft or ArrowRight; the tabs would become keyboard-unreachable with every test green | Minor | C69 / QUAL-03 | `tests/e2e/quality.spec.ts:112`; arrow handling in `src/components/ShowTabs.astro` script | add an e2e step: focus the active tab, press ArrowRight, assert focus and `aria-selected` on "Passados" | |
