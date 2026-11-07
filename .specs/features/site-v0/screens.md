# Site Eutenia v0 screens

**Verifier**: independent sub-agent (author != verifier)
**Round**: 1

Pictures retaken by this sub-agent with `npm run captures` (fixtures build, Playwright, 1280 / 390 wide) at HEAD 5f91347. The retake differed from the committed pictures only by render noise (32-218 pixels of 5.6M), so the committed `*.running.png` were kept. The captures other than `loja.png` are downscaled previews and were judged by composition at 1280 / 390 (spec Q19). Sample data in the captures (names, dates, prices, "Carbono") is not compared. Applied from `## Differences from the source`: nav with Fãs and Contato (AD-004), Spotify embed in place of the custom player, blank offline (AD-006), no cart, shipping or payment blocks (AD-005), single e-mail and no phone (AD-007), "Política de Privacidade" in the footer (AD-008), Pandora / Indestrutível (AD-009), empty-data sections hidden (AD-002). Copy that asserts unconfirmed facts (4K, view counts, director credits, city counts, "<24h", "Temporada 2025", "em tempo real", "Enviar sua foto", member counts, studio credits, shipping and warranty terms) counts as approved when missing; missing non-factual UI does not.

| Screen | Compared with | Verdict | Finding |
| --- | --- | --- | --- |
| `captures/inicio.running.png` | `captures/inicio.png` | diverges | 4 rows differ |
| `captures/mobile-inicio.running.png` | `captures/mobile-inicio.png` | diverges | 5 rows differ |
| `captures/discografia.running.png` | `captures/discografia.png` | diverges | 8 rows differ |
| `captures/mobile-discografia.running.png` | `captures/mobile-discografia.png` | diverges | 5 rows differ |
| `captures/shows.running.png` | `captures/shows.png` | diverges | 3 rows differ |
| `captures/mobile-shows.running.png` | `captures/mobile-shows.png` | diverges | 5 rows differ |
| `captures/loja.running.png` | `captures/loja.png` | matches | |
| `captures/fas.running.png` | `captures/fas.png` | diverges | 2 rows differ |
| `captures/contato.running.png` | `captures/contato.png` | diverges | 2 rows differ |

### `captures/inicio.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| header: logo left, six links centred with the current one underlined red, three icon links right | same | logo mark is a red dot after the word, the capture a red bar before it (captures disagree: fas and loja draw the dot) |
| header: "OUVIR AGORA" as a filled red primary button | differs | outlined secondary button (the loja capture draws it outlined; inicio, discografia, shows, fas and contato draw it filled red) |
| hero: full-bleed stage photo, centred stack | same | |
| hero: red-outlined badge pill above the title | same | text "ÚLTIMO LANÇAMENTO • ÁLBUM" (data) |
| hero: title "EUTENIA" and subtitle with the release name underlined red | same | |
| hero: two-line description paragraph under the subtitle ("A brutalidade sonora…") | differs | no paragraph; the subtitle goes straight to the buttons |
| hero: primary red "ASSISTIR CLIPE OFICIAL" + outlined "OUVIR NO SPOTIFY" side by side | same | |
| hero: stats row, three values with labels and dividers, middle value red | same | fixture labels |
| player bar band under the hero | same | Spotify embed band, blank offline (AD-006) |
| "Últimos lançamentos": eyebrow, heading, "VER DISCOGRAFIA COMPLETA →" right, rule | same | |
| releases: four cards in a row, cover, title + year, type line, footer row type + "OUVIR ▶" | same | per-card description lines are data |
| releases: "NOVO SINGLE" red badge on the newest card's cover | differs | no badge on any card |
| clip section: bordered panel, chip "CLIPE OFICIAL", title, red "ASSISTIR NO YOUTUBE" left, thumbnail with red play right | same | title wraps to two lines; description, duration and 4K meta are fact claims, omitted |
| shows: eyebrow, heading, "VER TODAS AS DATAS →" right | same | heading "PRÓXIMOS SHOWS" instead of a tour name (fact claim) |
| shows: three rows, date block, city + venue with pin, status pill, red "INGRESSOS" | same | |
| merch: heading, "VISITAR LOJA COMPLETA →", three cards with image, badge, name, price, bag icon button | same | |
| newsletter: bordered panel, eyebrow, "JUNTE-SE À EUTENIA ARMY", text, e-mail field + red "FAZER PARTE", "Sem spam" note | same | |
| footer: logo + band blurb + social icons left; two headed link columns (NAVEGAÇÃO, COMUNIDADE & LEGAL); bottom row © + tagline | differs | logo left with one horizontal link row right, bottom row © + five social icons; no blurb, no headed columns (the discografia, shows, loja and contato captures draw the row layout the product uses) |

### `captures/mobile-inicio.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| header: menu left, "EUTENIA" centred, play icon right | same | |
| hero: badge pill + year, big release title, left-aligned | same | |
| hero: description paragraph under the title ("A brutalidade sonora do metalcore nacional…") | differs | no paragraph |
| hero: full-width red "ASSISTIR CLIPE" and full-width outlined "OUVIR NO SPOTIFY", stacked | same | |
| hero: three stats in a row | same | |
| section headers: link right of the heading ("VER TUDO >", "CARBONO TOUR" chip, "VER CATÁLOGO →") | differs | link on its own line under the heading ("VER DISCOGRAFIA COMPLETA →", "VER TODAS AS DATAS →", "VISITAR LOJA COMPLETA →") |
| releases: horizontal carousel, next card peeking | same | |
| release card: cover with mini player controls, title + duration, credit line, icon row and outlined "OUVIR AGORA" button | differs | cover, title + year, type line, "ÁLBUM · OUVIR ▶" row; no controls, icons or button |
| clip block | same | not drawn in the capture's crop at this place; product shows it between releases and shows, as desktop |
| shows: stacked cards, date block, city, venue, status pill, button | same | Abertura / Censura line is a fact claim, omitted |
| shows: button label "COMPRAR INGRESSO" | differs | "INGRESSOS" (the desktop capture uses "INGRESSOS") |
| merch: two cards side by side, badge, name truncated, price | same | |
| merch card: full-width labelled button under the price ("ADICIONAR" / "PRE-ORDER") | differs | square bag icon button beside the price |
| newsletter panel, e-mail field and full-width red button | same | |
| player dock above the bottom bar | same | Spotify embed placed after the hero, not fixed (AD-006) |
| bottom bar: Início · Música · Shows · Loja · Contato, current item red | same | the full-page picture shows the fixed bar at y≈835 (first viewport); a 390x844 viewport shot scrolled to the end draws it at the bottom |

### `captures/discografia.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| header: logo, links, icons | same | |
| header: "OUVIR AGORA" filled red | differs | outlined button |
| hero: eyebrow chip, "DISCOGRAFIA & MÍDIA", subtitle, filter buttons with "TODOS" red | same | |
| hero: "ESTILO: POST-HARDCORE · MODERN METAL" chips at the right | differs | no style chips |
| featured header: red bar + "LANÇAMENTO EM DESTAQUE", pill right | same | |
| featured panel: two columns, cover left, details right | same | cover sits vertically centred in a tall left column (11 tracks), leaving empty space above it |
| featured cover: label + name overlay and a round red play button | differs | label + name overlay, no play button |
| featured details: meta line, title "EUTENIA — <release>", description | same | description is a studio credit (fact claim), omitted |
| featured details: outlined "PRESS KIT" button | differs | no press kit button |
| tracklist rows: number, play icon, name + note, "LETRA" link, duration | differs | number, name, duration; no play icon, no "LETRA" link |
| "Prévia da letra" block with quote and "Recolher" | differs | absent: the fixture's featured release has no `letraPrevia` (it sits on another release), so DISC-06 hides the block and the filled state is not drawn |
| streaming buttons row under "OUÇA NAS PLATAFORMAS DE STREAMING" | same | platforms from data |
| player bar over the featured block | same | Spotify embed band below the panel (AD-006) |
| catalog header: red bar + heading, count right | same | "8 TÍTULOS" |
| catalog: three-column grid, cover with year badge, type • faixas, title | same | |
| catalog card: description paragraph, footer row genre tag left + "OUVIR / TRACKLIST" button right | differs | no description, no genre tag; button "OUVIR" |
| videos header: red bar + "VIDEOCLIPES OFICIAIS", "INSCREVER-SE NO CANAL OFICIAL" right | same | subtitle (4K, directors) is a fact claim, omitted |
| video cards: four-column grid, thumbnail with red play, title, meta line | same | square play button where the capture draws a circle (DESIGN.md: zero radius except pills); views / director are fact claims |
| video thumbnail: duration badge bottom-right | differs | no duration badge |
| footer | same | tagline "Heavy Music / Post-Hardcore from São Paulo" is a fact claim |

### `captures/mobile-discografia.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| header: menu, "EUTENIA", right element "AUDIO // PRO" chip | differs | play icon |
| hero: eyebrow, title, subtitle, horizontally scrolling filters, "TODOS" red | same | filters square, the capture pills (DESIGN.md zero radius) |
| featured: eyebrow + title + year pill | same | |
| featured cover: "DELUXE EDITION / MASTER 24-BIT" chips, round play button, Produção / Duração meta row under the cover | differs | label + name overlay only; no play button, no meta row (duration sits in the meta line) |
| tracklist rows with number, name, duration | same | capture shows 4 selected tracks with a now-playing state; product lists all 11 |
| streaming buttons in a two-column grid | same | |
| player dock at the bottom | same | Spotify embed band after the panel (AD-006) |
| catalog: heading + count, two-column grid | same | |
| catalog card: type badge and round play button over the cover, title, year + faixas below | differs | year badge on cover, type • faixas above the title, "OUVIR" button row |
| videos: heading + "YOUTUBE ↗", one-column large cards | same | |
| video card: duration badge, credit line and share icon | differs | thumbnail, title, year; no duration, no share icon |
| merch promo block "MERCH EXCLUSIVO / VINIL DUPLO … / GARANTIR" | differs | absent |
| bottom bar with "MÚSICA" current | same | |

### `captures/shows.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| header: logo, links with "SHOWS" current, icons | same | |
| header: "OUVIR AGORA" filled red | differs | outlined button |
| hero: eyebrow, "TURNÊ & SHOWS", description | same | stats box (06 cidades, 100%) is a fact claim, omitted |
| tabs "PRÓXIMOS SHOWS / PASSADOS / FESTIVAIS" at the bottom of the hero band | differs | tabs moved below the hero, at the top of the left content column |
| "AGENDA OFICIAL" label | same | "ATUALIZADO EM TEMPO REAL" omitted (fact claim) |
| show rows: date block with year, city/UF eyebrow, venue, address with pin, status pill, red "COMPRAR INGRESSO ↗" | same | |
| show row with VIP: "VIP M&G DISPONÍVEL" pill inline after the city eyebrow, status pill beside the button | differs | VIP pill on its own line under the city, status pill stacked above the button |
| sold-out row greyed with disabled "ESGOTADO"; "EM BREVE" row with outlined "AVISE-ME" | same | |
| VIP card: chips, title, text, photo, benefit list with icons, price, outlined "GARANTIR UPGRADE VIP", note | same | |
| "SUA CIDADE FORA DA ROTA?" card with input + "VOTAR" | same | |
| booking: left column eyebrow, "CONTRATAR A BANDA", text, two contact cards, rider download row | same | single e-mail (AD-007) |
| booking form panel: heading, two-column fields, selects, textarea, consent + red "ENVIAR PROPOSTA" | same | |
| footer | same | tagline is a fact claim |

### `captures/mobile-shows.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| header | same | |
| hero: eyebrow, title, text | same | city / autoral stat chips are fact claims, omitted |
| tabs as pills in a row | same | |
| "CALENDÁRIO OFICIAL" label | same | "• AO VIVO" marker omitted (fact claim) |
| show rows: compact single row (date box, status pill over city, venue, button on the right) with a red left accent on rows on sale | differs | two-tier card: date + city/venue on top, status pill and full-width-ish button underneath; no red left accent |
| sold-out row dimmed with "ESGOTADO"; "AVISE-ME" outlined | same | |
| VIP card: photo top, title, text, benefits, price and red button side by side | differs | price row, then full-width outlined button under it |
| no "Sua cidade fora da rota" card | differs | the vote card is drawn after the VIP card |
| booking: compact CTA block "LEVE O EUTENIA PARA A SUA CIDADE" with "WHATSAPP DA PRODUÇÃO" and "BAIXAR RIDER TÉCNICO (PDF)" | differs | full "CONTRATAR A BANDA" section: two contact cards, rider row and the whole form (the WhatsApp button is out by AD-007; SHOW-08 asks for the form) |
| footer: "O CAOS NÃO ESPERA." tagline and one-line © | differs | standard footer: logo, link rows, ©, social icons |
| bottom bar with "SHOWS" current | same | |

### `captures/loja.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| top strip "Frete grátis… 6x sem juros" and cart icon with counter | same | absent (AD-005) |
| header: logo, links with "LOJA" current, icons, outlined "OUVIR AGORA" | same | |
| hero panel: chip, "LOJA OFICIAL EUTENIA", description, rule, trust items | same | only "SUPORTE DIRETO DA BANDA"; quality and shipping items and the craftsmanship sentence are fact claims |
| filter row: "TODOS" red + five categories, "ORGANIZAR:" + "MAIS RECENTES" right | same | sort is a select |
| product grid: four columns, image with badge, category, name truncated, price | same | |
| card: "TAMANHO" / spec label with chips | same | non-interactive (AD-005) |
| card: full-width red "ADICIONAR AO CARRINHO" | same | red "COMPRAR ↗" or grey "EM BREVE" (AD-005) |
| bottom three-column service panel | same | absent (AD-005; shipping and returns are fact claims) |
| footer: logo, link row, ©, payment chips | same | social icons in place of payment chips (AD-005) |

### `captures/fas.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| header: logo with red dot, links with "FÃS" current, icons | same | |
| header: "OUVIR AGORA" filled red | differs | outlined button |
| hero: eyebrow pill, two-line title with "EUTENIA ARMY" red, text, quick-nav buttons | same | |
| hero: two stat boxes on the right, label over value with an icon (shield, download) | differs | value over label, no icons (fixture stats) |
| wallpapers: eyebrow + heading left, filters right with "TODOS" red | same | |
| wallpaper cards: three columns, format + resolution chips, category, title, text, file info, red download button | same | button label "DOWNLOAD" |
| mural: eyebrow, heading, text, "#EUTENIAARMY" box right | same | "ENVIAR SUA FOTO" omitted (approved) |
| mural cards: photo with category tag, quote, handle + city | same | 2 fixture cards; the second has no image and draws a grey tile |
| Telegram strip with icon, title, text, red "ENTRAR NO EXÉRCITO VIP →" | same | |
| kit do fã: eyebrow, heading, text, cards with icon, tag, title, text, file info, outlined button | same | 2 fixture cards |
| footer | same | |

### `captures/contato.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| header: logo, links with "CONTATO" current, icons | same | |
| header: "OUVIR AGORA ▸" filled red | differs | outlined button |
| hero: eyebrow pill, "CONTATO & BOOKING" with "BOOKING" red, text, "BOOKING ABERTO" status right | same | season, response time and "Temporada 2025" are fact claims |
| departments: eyebrow, heading, four cards with icon, tag, title, text, e-mail box, action link | same | single e-mail (AD-007); "SÃO PAULO • BRASIL // GMT-3" omitted (fact claim) |
| left column: "MANDE SUA PROPOSTA OU MENSAGEM" with "PROPOSTA" red, text, live photo card | same | "ENVIO DIRETO CRIPTOGRAFADO" chip and "BOOKING AGENT ONLINE" bar are fact claims; urgency phone card out (AD-007) |
| form panel: "FORMULÁRIO OFICIAL" tag, two-column name / e-mail and phone / department | same | |
| form: city and date grouped in an inset sub-panel with small labels | differs | plain two-column row like the others |
| form: message textarea, consent, full-width red "ENVIAR PROPOSTA PARA A PRODUÇÃO" | same | attachment field removed (Assumptions) |
| press kit: eyebrow, heading, text right, four cards with icon, type • size, title, text, "BAIXAR" | same | |
| socials: centred heading and text, five cards with icon, name, handle, action | same | |
| footer | same | |
