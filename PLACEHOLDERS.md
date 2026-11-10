# Placeholders

Every file under `public/placeholders/` is provisional. The images come from the Stitch design prototypes (AI-generated art, not the band); the downloads are tiny files that only say "placeholder". Replace each file with the official one, keep the same path (or update the path in the data file named below), and remove its row here.

## Produtos (`src/content/data/products.json`)

The current catalog uses real product photos in `public/produtos/`, grouped into galleries. Names and prices can be edited in `products.json`. Each product's `url` must be filled with its PagSeguro checkout link before its purchase button becomes available.

The old images in `public/placeholders/produtos/` remain for test fixtures; they are no longer used by the real catalog.

| File                                                  | Used by                    |
| ----------------------------------------------------- | -------------------------- |
| `public/placeholders/produtos/bone-eutenia.jpg`       | Legacy product placeholder |
| `public/placeholders/produtos/camiseta-chymia-ii.jpg` | Product gallery tests      |
| `public/placeholders/produtos/camiseta-pandora.jpg`   | Product and gallery tests  |
| `public/placeholders/produtos/cd-pandora.jpg`         | Product test fixtures      |
| `public/placeholders/produtos/moletom-logo.jpg`       | Product and gallery tests  |
| `public/placeholders/produtos/palhetas-eutenia.jpg`   | Product test fixtures      |
| `public/placeholders/produtos/poster-pandora.jpg`     | Product test fixtures      |
| `public/placeholders/produtos/vinil-pandora.jpg`      | Product test fixtures      |

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
| `public/placeholders/fotos/hero-palco.jpg`       | Foto de exemplo para testes; o Início usa a arte de Pandora | Foto oficial da banda no palco (horizontal, >= 1600px) |
| `public/placeholders/fotos/vocalista-palco.jpg`  | Início, faixa da comunidade                                | Foto oficial ao vivo                                   |
| `public/placeholders/fotos/shows-bastidores.jpg` | Shows, fundo do cabeçalho                                  | Foto oficial da banda                                  |
| `public/placeholders/fotos/contato-ao-vivo.jpg`  | Foto de exemplo (fora da página Contato)                   | Foto oficial ao vivo                                   |
| `public/placeholders/fotos/mural-exemplo.jpg`    | `src/content/_exemplos/mural.json` (exemplo, fora do site) | Foto real enviada pelo fã, com autorização             |

## Downloads

| File                                               | Used by                    | Replace with                               |
| -------------------------------------------------- | -------------------------- | ------------------------------------------ |
| `public/placeholders/downloads/rider-tecnico.pdf`  | Downloads (`press.json`)   | Rider técnico oficial                      |
| `public/placeholders/downloads/mapa-de-palco.pdf`  | Downloads (`press.json`)   | Mapa de palco e input list oficiais        |
| `public/placeholders/downloads/fotos-oficiais.zip` | Downloads (`press.json`)   | Pacote de fotos oficiais em alta resolução |
| `public/placeholders/downloads/logo-pack.zip`      | Downloads (`press.json`)   | Logotipos oficiais (SVG, EPS, PNG)         |
| `public/placeholders/downloads/kit-avatares.zip`   | Kit do fã (`fan-kit.json`) | Pacote oficial de avatares e headers       |
| `public/placeholders/downloads/kit-badges.zip`     | Kit do fã (`fan-kit.json`) | Pacote oficial de badges e emblemas        |

After replacing a download, update its `tamanho` (and `tipo`, if it changed) in the data file.
