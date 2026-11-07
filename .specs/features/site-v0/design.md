# Site Eutenia v0 Design

**Spec**: `.specs/features/site-v0/spec.md`
**Status**: Approved

---

## Architecture Overview

Astro gera HTML estático a partir de arquivos de dados. Toda regra que muda o que o visitante vê, como filtrar, ordenar, separar shows, validar formulário, montar o `mailto:` ou esconder seções vazias, mora em funções puras de `src/lib/`. Essas funções rodam no build, nas páginas `.astro`, e no navegador, em `<script>` que as importam, e o Vitest testa as mesmas funções. O navegador só recebe JS em quatro lugares: barra de filtros, abas de shows, player de vídeo no clique e formulários.

```mermaid
flowchart LR
  D[src/content/*.json<br/>src/config/site.json] -->|content collections + zod| B[astro build]
  L[src/lib/*.ts<br/>regras puras] --> B
  B --> H[dist/ HTML+CSS<br/>base path /eutenia-site/]
  L -->|import em script| C[ilhas no navegador<br/>filtros, abas, vídeo, forms]
  H --> GH[GitHub Pages]
  A[Actions: push main + cron 09:00 UTC] --> B
  C -->|POST| F[Formspree, se configurado]
  C -->|senão| M[mailto:contato@eutenia.com.br]
```

Alternativas consideradas: Next.js com export estático, que manda React inteiro para quatro ilhas pequenas, e HTML puro com Tailwind via CDN, como os protótipos do Stitch, que não tem schema, não testa e é pesado em performance. Astro venceu porque gera zero JS por padrão e já traz content collections tipadas (AD-001).

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component | Location | How to Use |
| --------- | -------- | ---------- |
| Protótipos HTML do Stitch | `design/stitch_eutenia_band_official_website/*/code.html` | Fonte de marcação, classes e textos de UI para cada seção; tokens Tailwind copiados para `@theme` |
| Design system | `captures/DESIGN.md` | Tokens de cor, tipo, espaço, raio 0, glows |
| Dados reais | `context.md` (Deezer, Spotify, YouTube) | `releases.json`, `videos.json` |

### Integration Points

| System | Integration Method |
| ------ | ------------------ |
| Spotify | `<iframe>` embed compacto (`open.spotify.com/embed/album/<id>`), links de artista/álbum |
| YouTube | Miniatura `i.ytimg.com/vi/<id>/hqdefault.jpg` + `youtube-nocookie.com/embed/<id>?autoplay=1` inserido no clique |
| Formspree | `fetch` POST `application/json` para `site.formEndpoint`; timeout 10 s via `AbortController` |
| GitHub Pages | `actions/upload-pages-artifact` + `actions/deploy-pages` |

---

## Components

### Regras (`src/lib/`)

- **format.ts**: `formatPrice(cents) → "R$ 119,90"`, `formatDuration(sec) → "m:ss"`, `formatShowDate(iso) → {dia, mes, ano}` em pt-BR.
- **shows.ts**: `isUpcoming(show, now, tz='America/Sao_Paulo')`, `showTabs(shows, now) → {proximos, passados, festivais}` com ordenação asc/desc e desempate por cidade (SHOW-03/04/10).
- **catalog.ts**: `latestReleases(releases, n)`, `filterByKind(items, kind)`, `filterProducts(products, category)`, `sortProducts(products, order)`, `visibleFilters(filters, items)` (Q26).
- **sections.ts**: `hasContent(data) → boolean`, a regra única de seção vazia (AD-002).
- **forms.ts**: `validate(fields, schema) → errors`, `buildMailto(to, departamento, fields) → string`, `submitForm(endpoint, data, {timeoutMs}) → 'ok'|'erro'`.
- **paths.ts**: `url(path)` prefixa `import.meta.env.BASE_URL`; nenhuma página monta URL interna sem ele (NAV-08).

### Layout (`src/layouts/`, `src/components/layout/`)

- **BaseLayout.astro**: `<html lang="pt-BR">`, title/description por página, fontes Oswald + Plus Jakarta Sans + Material Symbols (preconnect, `display=swap`), skip link.
- **Header.astro**: marca, menu na ordem do AD-004, `aria-current`, "OUVIR AGORA", ícones sociais; botão de menu mobile que abre o **MobileDrawer** (`<dialog>`, Esc nativo e devolução de foco).
- **BottomBar.astro**: barra fixa `< 768px` (NAV-04).
- **Footer.astro**: NAV-07.

### UI (`src/components/ui/`)

Button (primary/secondary/ghost), Badge (pill), SectionHeader (eyebrow + título + link), EmptyState, CoverTile (fallback com a marca, DATA-05), SpotifyEmbed.

### Ilhas

- **FilterBar.astro + script**: botões com `aria-pressed`, aplica `filterBy…` e `sortProducts` nos itens com `data-*`; escondida sem JS (`hidden` removido pelo script).
- **LazyYouTube.astro**: `<a href="youtube.com/watch?v=">` com miniatura (funciona sem JS); com JS troca por iframe no clique.
- **ShowTabs.astro**: renderiza no build as três listas com `showTabs(build time)`; o script recalcula com `new Date()`.
- **ContactForm.astro**: campos por props (Contato completo, Booking na página Shows); script usa `validate` + `submitForm` ou `buildMailto`.

### Páginas (`src/pages/`)

`index`, `discografia`, `shows`, `loja`, `fas`, `contato`, `privacidade` (Markdown de `src/content/paginas/privacidade.md`), `404`. Cada seção é um componente em `src/components/sections/<pagina>/`, renderizado só se `hasContent`.

---

## Data Models

```typescript
// src/content.config.ts - file() loaders, zod via astro/zod
Release  { id, titulo, tipo: 'album'|'ep'|'single'|'ao-vivo', data: date, capa?: image,
           faixas: {titulo, duracaoSeg}[], destaque?: bool, letraPrevia?: string,
           links: {spotify?, appleMusic?, deezer?, youtubeMusic?, tidal?}, descricao? }
Video    { id /*youtube*/, titulo, data: date, oficial: bool, destaque?: bool, releaseId? }
Show     { id, data: date, cidade, uf, local, endereco, tipo: 'show'|'festival',
           status: 'disponivel'|'ultimos'|'esgotado'|'em-breve', ingressoUrl?, selo? }
           // refine: status in (disponivel, ultimos) => ingressoUrl obrigatório (DATA-06)
Product  { id, nome, categoria: enum 6, precoCentavos, imagem, selo?, tamanhos?: string[],
           especificacao?, url?, destaque?, adicionadoEm: date }
Wallpaper{ id, titulo, descricao, categoria: enum 3, formato, resolucao, arquivo, tamanho, imagem }
PressFile{ id, titulo, descricao, tipo, tamanho, arquivo, icone }
Mural / FanKit / Vip / Stats  // coleções opcionais; vazias na v0 (Q21)
// src/config/site.json
Site     { email: 'contato@eutenia.com.br', formEndpoint: '', newsletterEndpoint: '',
           votoCidadeEndpoint: '', lojaUrl: '', telegramUrl: '',
           social: {spotify, instagram, youtube, facebook, x} }
```

Os testes de página usam um segundo conjunto de dados, `tests/fixtures/content/`, selecionado por `EUTENIA_CONTENT=fixtures` e com build em `dist-fixtures/`. Esse conjunto tem shows passados, de hoje e futuros, produtos com e sem URL, mural e VIP preenchidos e um endpoint de formulário. Os testes de conteúdo real (`tests/dist/`) leem o `dist/` do build normal.

---

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
| -------------- | -------- | ----------- |
| Dado fora do schema | zod falha o build com arquivo + campo | Banda vê o erro no Action; site no ar não muda |
| POST do formulário falha / 10 s | `submitForm` → `'erro'` | Formulário mantido + mensagem com o e-mail (CONT-06) |
| Release sem capa | CoverTile com a marca | Tile neutro (DATA-05) |
| Seção sem dados | `hasContent` false | Seção omitida |
| Rota inexistente | `404.astro` (Pages serve `404.html`) | Página 404 com link para Início |

---

## Risks & Concerns

| Concern | Location (file:line) | Impact | Mitigation |
| ------- | -------------------- | ------ | ---------- |
| Imagens do Stitch são URLs temporárias geradas por IA | `design/**/code.html` | Quebram a qualquer momento | Baixadas no T8 para `public/placeholders/`, DATA-04 proíbe o host |
| Capturas, exceto a Loja, são miniaturas de largura desconhecida | `captures/*.png` | Comparação visual imprecisa | Q19: julgar a 1280/390 por composição, não por pixel |
| Shows "próximos" ficam velhos num site estático | `shows.ts` | Show passado listado como próximo | Recalcular no navegador (SHOW-05) + cron diário |
| TypeScript 7 pode não ser suportado por `@astrojs/check` | `package.json` | `astro check` falha | Fixar a versão de TS que o `@astrojs/check` aceitar no T1 |
| Base path `/eutenia-site/` | links internos | 404 no Pages | `url()` único + teste de links do dist (NAV-08) |

---

## Tech Decisions

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| Versões | Astro 7.x, Tailwind 4 (`@tailwindcss/vite`), Vitest, Playwright, axe-core, Lighthouse CI | Versões estáveis atuais (npm, 2026-11-07) |
| Ilhas | `<script>` nativo do Astro em TS, sem framework de UI | Quatro ilhas pequenas; zero runtime |
| Imagens próprias | `astro:assets` (`<Image>`) para capas e placeholders em `src/assets/` | AVIF/WebP + dimensões → Lighthouse ≥ 90 |
| Fixtures | Build separado com `EUTENIA_CONTENT=fixtures` | Interações testáveis sem pôr dados falsos no site real |
| Lint | `prettier --check` + `astro check` | Projeto pequeno; ESLint fica para depois |
