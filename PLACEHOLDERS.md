# Placeholders

Every file under `public/placeholders/` is provisional. The images come from the Stitch design prototypes (AI-generated art, not the band); the downloads are tiny files that only say "placeholder". Replace each file with the official one, keep the same path (or update the path in the data file named below), and remove its row here.

## Produtos (`src/content/data/products.json`)

| File                                                  | Used by                      | Replace with              |
| ----------------------------------------------------- | ---------------------------- | ------------------------- |
| `public/placeholders/produtos/camiseta-pandora.jpg`   | Camiseta Pandora             | Foto oficial da camiseta  |
| `public/placeholders/produtos/moletom-logo.jpg`       | Moletom Canguru Eutenia Logo | Foto oficial do moletom   |
| `public/placeholders/produtos/camiseta-chymia-ii.jpg` | Camiseta Chymia II           | Foto oficial da camiseta  |
| `public/placeholders/produtos/vinil-pandora.jpg`      | Vinil 12" Pandora            | Foto oficial do vinil     |
| `public/placeholders/produtos/cd-pandora.jpg`         | CD Digipack Pandora          | Foto oficial do CD        |
| `public/placeholders/produtos/bone-eutenia.jpg`       | Boné Snapback Eutenia        | Foto oficial do boné      |
| `public/placeholders/produtos/palhetas-eutenia.jpg`   | Pack de Palhetas Eutenia     | Foto oficial das palhetas |
| `public/placeholders/produtos/poster-pandora.jpg`     | Pôster Pandora (A2)          | Foto oficial do pôster    |

The products themselves are placeholders too: names, prices and specs are examples with no purchase link, so every card shows "Em breve". Replace them with the real catalog and set `url` (or `lojaUrl` in `src/config/site.json`).

## Wallpapers (`src/content/data/wallpapers.json`)

Each image is both the preview and the download (`imagem` and `arquivo`). Update `formato`, `resolucao`, `tipo` and `tamanho` with the official file.

| File                                           | Used by                    | Replace with                              |
| ---------------------------------------------- | -------------------------- | ----------------------------------------- |
| `public/placeholders/wallpapers/pandora.jpg`   | Wallpaper Pandora          | Wallpaper oficial com a arte de Pandora   |
| `public/placeholders/wallpapers/chymia-ii.jpg` | Wallpaper Chymia II        | Wallpaper oficial com a arte de Chymia II |
| `public/placeholders/wallpapers/ao-vivo.jpg`   | Wallpaper Eutenia ao vivo  | Foto oficial de palco                     |
| `public/placeholders/wallpapers/espelho.jpg`   | Wallpaper Espelho          | Wallpaper oficial com a arte de Espelho   |
| `public/placeholders/wallpapers/meu-fim.jpg`   | Wallpaper Meu Fim          | Wallpaper oficial com a arte de Meu Fim   |
| `public/placeholders/wallpapers/logotipo.jpg`  | Wallpaper Logotipo Eutenia | Logotipo oficial em alta resolução        |

## Fotos

| File                                             | Used by                                                    | Replace with                                           |
| ------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------ |
| `public/placeholders/fotos/hero-palco.jpg`       | Início, fundo do hero                                      | Foto oficial da banda no palco (horizontal, >= 1600px) |
| `public/placeholders/fotos/vocalista-palco.jpg`  | Início, faixa da comunidade                                | Foto oficial ao vivo                                   |
| `public/placeholders/fotos/shows-bastidores.jpg` | Shows, fundo do cabeçalho                                  | Foto oficial da banda                                  |
| `public/placeholders/fotos/contato-ao-vivo.jpg`  | Contato, imagem ao lado do formulário                      | Foto oficial ao vivo                                   |
| `public/placeholders/fotos/mural-exemplo.jpg`    | `src/content/_exemplos/mural.json` (exemplo, fora do site) | Foto real enviada pelo fã, com autorização             |

## Downloads

| File                                               | Used by                    | Replace with                               |
| -------------------------------------------------- | -------------------------- | ------------------------------------------ |
| `public/placeholders/downloads/rider-tecnico.pdf`  | Press kit (`press.json`)   | Rider técnico oficial                      |
| `public/placeholders/downloads/mapa-de-palco.pdf`  | Press kit (`press.json`)   | Mapa de palco e input list oficiais        |
| `public/placeholders/downloads/fotos-oficiais.zip` | Press kit (`press.json`)   | Pacote de fotos oficiais em alta resolução |
| `public/placeholders/downloads/logo-pack.zip`      | Press kit (`press.json`)   | Logotipos oficiais (SVG, EPS, PNG)         |
| `public/placeholders/downloads/kit-avatares.zip`   | Kit do fã (`fan-kit.json`) | Pacote oficial de avatares e headers       |
| `public/placeholders/downloads/kit-badges.zip`     | Kit do fã (`fan-kit.json`) | Pacote oficial de badges e emblemas        |

After replacing a download, update its `tamanho` (and `tipo`, if it changed) in the data file.
