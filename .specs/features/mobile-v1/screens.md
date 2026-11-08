# Experiência mobile v1 screens

**Verifier**: independent sub-agent (author != verifier)
**Round**: 1
**Head**: dc59442
**Picture**: taken by this sub-agent with `npm run captures` (fixtures build, `EUTENIA_CONTENT=fixtures`), Playwright window 390 wide, full page (390x5624). The capture is a 214x1600 preview of a 390-wide design, judged as composition at 390.

Applied from `## Differences from the source`: AD-011 (labels 12px, fields 16px), AD-012 (catalog and videos 2 per row, release card without description, video card with thumbnail, title in up to 2 lines and year). Applied from the site-v0 departures still in effect: Spotify embed in place of the custom player (AD-006), no fact claims (durations badge, credits, genre), tracklist as number, name and duration, play icon in place of the "AUDIO // PRO" chip, single footer, "Comprar" in place of purchase wording (AD-005). Sample data (release names, covers, track names, counts, prices, which platforms) is not compared.

| Screen | Compared with | Verdict | Finding |
| --- | --- | --- | --- |
| `captures/mobile-discografia.running.png` | `captures/mobile-discografia.png` | diverges | 12 rows differ |

### `captures/mobile-discografia.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| header: menu icon left, wordmark `EUTENIA`, chip `AUDIO // PRO` and play icon right | same | play icon only, wordmark centred, as the other mobile captures (site-v0 departure) |
| hero eyebrow: red dot + `CATÁLOGO OFICIAL DE ÁUDIO & VÍDEO` as plain text | differs | the eyebrow is drawn inside a bordered box |
| hero title `DISCOGRAFIA & MÍDIA` | same | note: larger type, wraps to 2 lines (`DISCOGRAFIA &` / `MÍDIA`) where the capture fits one |
| hero blurb, 2 lines under the title | same | `Álbuns, EPs, Singles e Videoclipes Oficiais da Eutenia.`; the capture's genre wording is a fact claim left out |
| filter row: `TODOS` (active, red) · `ÁLBUNS & EPS` · `SINGLES` · `VIDEOCLIPES`, scrolls sideways, cut at the right edge | differs | same labels, active state and sideways scroll, but square-cornered tabs where the capture draws pill chips |
| featured heading: red eyebrow `DESTAQUE MUNDIAL`, release title as headline left, year chip right | differs | fixed headline `LANÇAMENTO EM DESTAQUE` after a red bar, chip `ÁLBUM • 2024` right; the release title moves into the card under the cover (`EUTENIA — PANDORA`) |
| featured cover: two pill badges top-left, round red play button centred on the cover | differs | no badges on the cover; type and name as overlay text bottom-left (`ÁLBUM` / `PANDORA`), square red play button bottom-right |
| credits row under the cover: `PRODUÇÃO` name / `DURAÇÃO` | same | absent (credits and duration are fact claims, site-v0 departure); a meta line `ÁLBUM • 11 FAIXAS • 44 MIN 46 SEG` from the data sits there |
| featured card holds no description and no other control between cover and tracklist | differs | adds a description paragraph and a `PRESS KIT` button between cover and tracklist |
| tracklist header `FAIXAS SELECIONADAS` left, `4 MÚSICAS` right | differs | no header; the track rows follow the press kit button directly |
| track rows: one per row, current track marked, play icon, name, subtitle, duration right | same | number, name and duration in bordered rows, no play icon or current mark (site-v0 departure, no per-track audio) |
| no lyric block in the featured card | differs | adds a `PRÉVIA DA LETRA: "PANDORA"` block with a `RECOLHER` toggle and two quoted lines after the tracklist |
| platforms: label `DISPONÍVEL NAS PLATAFORMAS`, buttons 2 per row with an arrow | differs | label `OUÇA NAS PLATAFORMAS DE STREAMING:`; buttons 2 per row with a leading icon (which platforms is data) |
| player: mini player bar with cover, title, controls and progress, above the bottom bar | same | Spotify embed box after the featured card, not fixed (AD-006); note: the third-party embed did not paint in the headless run, so the box is empty in the picture |
| catalog heading: red eyebrow `CATÁLOGO COMPLETO`, headline `TODOS OS LANÇAMENTOS`, count `N TÍTULOS` right | differs | no eyebrow; red bar and headline `CATÁLOGO COMPLETO DE LANÇAMENTOS` on 2 lines; count `8 TÍTULOS` right |
| catalog grid: 2 per row | same | 2 per row; odd last item absent here (8 items) |
| release card: cover, type badge top-left, round red play bottom-right, title, year left and track count right, no description | same | note: badge filled red rather than outlined, title in uppercase condensed type; long title cut at 2 lines with ellipsis (`MEU FIM (FEAT. CAIO...`) |
| videos heading: red eyebrow `PRODUÇÃO AUDIOVISUAL`, headline `VIDEOCLIPES OFICIAIS`, link `YOUTUBE` with external icon on the right of the headline | differs | eyebrow and headline (after a red bar) match; the link reads `INSCREVER-SE NO CANAL OFICIAL` with a play icon and sits on its own line under the headline |
| videos grid: 2 per row (AD-012), last odd item left-aligned at one column | same | 2 per row; the 11th video left-aligned at one column |
| video card: thumbnail with round red play centred, title, share icon right; year (AD-012) | differs | title in up to 2 lines with ellipsis, share icon and year as listed, but the play mark on the thumbnail is a large square red block, not the round button the capture (and the release cards) draw |
| merch strip: eyebrow `MERCH EXCLUSIVO`, product name, description, `GARANTIR` button right, no image | differs | product thumbnail added on the left, eyebrow `MERCH OFICIAL`, a price line in place of the description, `COMPRAR` button right (wording per AD-005) |
| footer: none drawn, page ends at the player and the bottom bar | same | single-line footer (logo, links, ©, social), site-v0 departure |
| bottom bar: `INÍCIO` · `MÚSICA` (current) · `SHOWS` · `LOJA` · `CONTATO` with icons | same | note: fixed bar; the full-page screenshot paints it once at the first window's bottom (y about 832) |
| render: no overlap, no cut text, no horizontal page scroll | same | nothing overlaps or is cut beyond the intended 2-line ellipses; the filter row scrolls inside itself |
