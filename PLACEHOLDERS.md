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

## Fotos

| File                                             | Used by                                                    | Replace with                                           |
| ------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------ |
| `public/placeholders/fotos/hero-palco.jpg`       | Foto de exemplo para testes; o Início usa a arte de Pandora | Foto oficial da banda no palco (horizontal, >= 1600px) |
| `public/placeholders/fotos/vocalista-palco.jpg`  | Início, faixa da comunidade                                | Foto oficial ao vivo                                   |
| `public/placeholders/fotos/shows-bastidores.jpg` | Shows, fundo do cabeçalho                                  | Foto oficial da banda                                  |
| `public/placeholders/fotos/contato-ao-vivo.jpg`  | Foto de exemplo (fora da página Contato)                   | Foto oficial ao vivo                                   |

## Mídia

| File                                               | Used by                    | Replace with                               |
| -------------------------------------------------- | -------------------------- | ------------------------------------------ |
| `public/placeholders/midia/rider-tecnico.pdf`  | Mídia (`press.json`)   | Rider técnico oficial                      |
| `public/placeholders/midia/mapa-de-palco.pdf`  | Mídia (`press.json`)   | Mapa de palco e input list oficiais        |
| `public/placeholders/midia/logo-pack.zip`      | Mídia (`press.json`)   | Logotipos oficiais (SVG, EPS, PNG)         |

After replacing a download, update its `tamanho` (and `tipo`, if it changed) in the data file.
