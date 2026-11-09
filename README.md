# Site oficial da Eutenia

Site estático da banda Eutenia: Início, Discografia, Shows, Loja, Fãs, Contato e Política de Privacidade. É feito com [Astro](https://astro.build) e Tailwind CSS. Todo o conteúdo (lançamentos, clipes, shows, produtos, wallpapers, press kit) mora em arquivos JSON. Para mudar o site, edite esses arquivos e publique. Não há banco de dados nem servidor.

O site é publicado no GitHub Pages em `https://eutenia-site.github.io/`. O repositório se chama `eutenia-site.github.io`, então o GitHub serve o site na raiz do endereço da organização.

## Requisitos

- Node.js 24 ou mais novo (vem com o npm)
- Git
- Para os testes de navegador: os navegadores do Playwright (`npx playwright install chromium`)
- Para o Lighthouse: Google Chrome instalado (veja [Lighthouse](#lighthouse))

## Rodar no computador

Atalho: `make` instala as dependências (se precisar) e abre o site em modo de desenvolvimento. `make help` lista os outros comandos (`make preview`, `make fixtures`, `make test`, `make e2e`...).

Ou, com o npm direto:

```sh
npm install          # instala as dependências (uma vez)
npm run dev          # abre o site em http://localhost:4321/ e recarrega ao salvar
npm run build        # gera o site final em dist/
npm run preview      # serve o dist/ gerado, para conferir antes de publicar
```

## Testes

```sh
npm test                      # todos os testes Vitest (regras, dados, HTML gerado)
npx vitest run --project unit # só os testes rápidos de regras e dados
npx playwright test           # testes de navegador (desktop 1280 e celular 390), com dados de teste
npm run captures              # salva as fotos de tela em .specs/features/site-v0/captures/*.running.png
npm run check                 # checagem de tipos do Astro
npm run lint                  # formatação (Prettier); `npm run format` corrige
npx lhci autorun              # Lighthouse no Início (desempenho e acessibilidade >= 90)
```

Os testes de navegador usam os dados de `tests/fixtures/content/`, não os dados reais. O `npm run captures` só roda quando chamado: um `npx playwright test` comum não altera as fotos.

### Lighthouse

`npx lhci autorun` gera o site, serve com `astro preview` em `http://localhost:4321/` e roda o Lighthouse no Início com o perfil de celular. Os relatórios ficam em `.lighthouseci/reports/` (nada é enviado para fora). O Lighthouse precisa do Chrome. Sem Chrome no sistema, use o Chromium do Playwright:

```sh
CHROME_PATH=$(node -e "console.log(require('playwright').chromium.executablePath())") npx lhci autorun
```

## Editar o conteúdo

Cada arquivo é uma lista JSON. Datas no formato `AAAA-MM-DD`. Preços em centavos (`11990` = R$ 119,90). Se um campo obrigatório faltar ou estiver errado, o `npm run build` para e diz qual arquivo e qual campo corrigir.

Caminhos de imagem e de download como `placeholders/...` são relativos à pasta `public/`. Coloque o arquivo novo em `public/` e aponte o caminho para ele.

| Arquivo                              | O que controla                      | Campos                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content/data/releases.json`     | Discografia e lançamentos do Início | `id`, `titulo`, `tipo` (`album`, `ep`, `single`, `ao-vivo`), `data`, `capa` (imagem em `src/assets/capas/`, caminho relativo ao JSON), `faixas` (`titulo`, `duracaoSeg`), `destaque` (o lançamento em destaque no Início), `letraPrevia`, `descricao`, `spotifyEmbed`, `links` (`spotify`, `appleMusic`, `deezer`, `youtubeMusic`, `tidal`) |
| `src/content/data/videos.json`       | Videoclipes                         | `id` (o código do vídeo no YouTube), `titulo`, `data`, `oficial`, `destaque`, `releaseId`                                                                                                                                                                                                                                                   |
| `src/content/data/shows.json`        | Agenda de shows                     | `id`, `data`, `cidade`, `uf`, `local`, `endereco`, `tipo` (`show`, `festival`), `status` (`disponivel`, `ultimos`, `esgotado`, `em-breve`), `ingressoUrl` (obrigatório para `disponivel` e `ultimos`), `selo`                                                                                                                               |
| `src/content/data/products.json`     | Loja e merch do Início              | `id`, `nome`, `categoria` (`camisetas`, `moletons`, `midia-fisica`, `acessorios`, `edicoes-limitadas`), `precoCentavos`, `imagem`, `selo`, `tamanhos`, `especificacao`, `url` (link de compra; sem ele o botão mostra "Em breve"), `destaque` (aparece no Início), `adicionadoEm`                                                           |
| `src/content/data/wallpapers.json`   | Wallpapers da página Fãs            | `id`, `titulo`, `descricao`, `categoria` (`capas`, `ao-vivo`, `logotipos`), `formato`, `resolucao`, `imagem`, `arquivo`, `tipo`, `tamanho`                                                                                                                                                                                                  |
| `src/content/data/press.json`        | Press kit da página Contato         | `id`, `titulo`, `descricao`, `tipo`, `tamanho`, `arquivo`, `icone` (nome de um ícone do [Material Symbols](https://fonts.google.com/icons))                                                                                                                                                                                                 |
| `src/content/data/fan-kit.json`      | Kit do fã da página Fãs             | os campos do press kit e `selo`                                                                                                                                                                                                                                                                                                             |
| `src/content/data/mural.json`        | Mural dos fãs                       | `id`, `categoria`, `texto`, `autor`, `cidade`, `imagem`                                                                                                                                                                                                                                                                                     |
| `src/content/data/vip.json`          | Card VIP da página Shows            | `id`, `selo`, `titulo`, `descricao`, `beneficios` (`titulo`, `descricao`), `valorCentavos`, `url`, `observacao`                                                                                                                                                                                                                             |
| `src/content/data/stats.json`        | Números do Início                   | `id`, `valor`, `rotulo`                                                                                                                                                                                                                                                                                                                     |
| `src/config/site.json`               | Configuração geral                  | `email`, `formEndpoint`, `newsletterEndpoint`, `votoCidadeEndpoint`, `lojaUrl`, `telegramUrl`, `social` (`spotify`, `instagram`, `youtube`, `facebook`, `x`)                                                                                                                                                                                |
| `src/content/paginas/privacidade.md` | Texto da Política de Privacidade    | `titulo` e `atualizadoEm` no topo, texto abaixo                                                                                                                                                                                                                                                                                             |

Os shows mudam de "Próximos" para "Passados" sozinhos, pelo horário de Brasília. O site é gerado de novo todo dia (veja [Publicação](#publicação)), e a página Shows também refaz as abas no navegador do visitante.

### Seções opcionais

Mural, VIP, números (stats) e a agenda de shows começam vazios (`[]`). Uma seção vazia não aparece no site; a agenda vazia mostra "Nenhum show anunciado no momento". Para ativar uma seção, copie o modelo de `src/content/_exemplos/` para `src/content/data/` e troque os exemplos pelos dados reais:

```sh
cp src/content/_exemplos/shows.json src/content/data/shows.json
```

Modelos disponíveis: `shows.json`, `mural.json`, `vip.json`, `stats.json`. Os exemplos têm dados inventados: nunca publique sem trocá-los.

### Ícones

O site baixa só os ícones que usa. Ao colocar um `icone` novo em `press.json` ou `fan-kit.json`, nada mais é preciso. Ao usar um ícone novo no código, acrescente o nome em `src/lib/icons.ts`. Um teste avisa se faltar algum.

## Configuração (`src/config/site.json`)

Deixe um campo como `""` para desligar o recurso.

- **`formEndpoint`**: endereço que recebe os formulários de Contato e de Booking, por exemplo um formulário do [Formspree](https://formspree.io) (`https://formspree.io/f/xxxxxxx`). Crie o formulário no Formspree, copie o endereço e cole aqui. Vazio: o botão de enviar abre o programa de e-mail do visitante com a mensagem pronta para `contato@eutenia.com.br`.
- **`newsletterEndpoint`**: endereço do formulário de newsletter (Formspree, Mailchimp etc.). Vazio: a newsletter não aparece no Início.
- **`votoCidadeEndpoint`**: endereço do formulário "vote na sua cidade" da página Shows. Vazio: o formulário não aparece.
- **`lojaUrl`**: link da loja externa. Produtos sem `url` própria passam a apontar para cá. Vazio: esses produtos mostram "Em breve".
- **`telegramUrl`**: link do grupo no Telegram. Vazio: a seção do Telegram não aparece na página Fãs.

## Endereço do site (base path e domínio)

O endereço vem de duas variáveis lidas no build (`astro.config.mjs`):

- `SITE`: o domínio, padrão `https://eutenia-site.github.io`
- `BASE`: a pasta, padrão `/` (a raiz). Só mude se o site for servido numa subpasta, como num repositório de projeto (`/nome-do-repo`)

Todo link interno passa por `url()` de `src/lib/paths.ts`, então trocar `BASE` muda o site inteiro.

Para usar um domínio próprio, por exemplo `eutenia.net`:

1. Crie o arquivo `public/CNAME` contendo só `eutenia.net`.
2. No workflow `.github/workflows/deploy.yml`, no passo `npm run build`, defina `SITE=https://eutenia.net` e `BASE=/` (o padrão, escrito por clareza):
   ```yaml
   - run: npm run build
     env:
       SITE: https://eutenia.net
       BASE: /
   ```
3. No provedor do domínio, aponte o DNS para o GitHub Pages ([instruções](https://docs.github.com/pt/pages/configuring-a-custom-domain-for-your-github-pages-site)).
4. Em Settings > Pages do repositório, informe o domínio e marque "Enforce HTTPS".

## Publicação

O workflow `.github/workflows/deploy.yml` publica o site no GitHub Pages:

- a cada push na branch `main`;
- todo dia às 06:00 de Brasília (09:00 UTC), para os shows que já passaram irem para "Passados";
- quando alguém clica em "Run workflow" na aba Actions.

Ele instala as dependências, roda os testes rápidos, gera o site e publica a pasta `dist/`. Se um teste falhar, nada é publicado e o site antigo continua no ar.

Para ligar a publicação (uma vez): em Settings > Pages do repositório, em "Build and deployment", escolha a fonte **GitHub Actions**.

## Trocar os placeholders antes do lançamento

Várias imagens e arquivos ainda são provisórios. A lista completa, com o que colocar no lugar de cada um, está em [`PLACEHOLDERS.md`](PLACEHOLDERS.md).

**Atenção:** as imagens de placeholder vieram dos protótipos de design e foram geradas por IA. Elas não mostram a banda e algumas têm texto gerado por IA. Troque todas antes de divulgar o site publicamente. Os produtos da Loja também são exemplos (nomes, preços e sem link de compra).

## Links do Spotify

Em `releases.json`, `links.spotify` aponta para o álbum no Spotify em Pandora e Chymia II, que também têm `spotifyEmbed` com o embed do álbum. Carbonizar, Cego, Meu Fim, Espelho e Chymia I ainda não têm link do Spotify: o site mostra só as plataformas presentes (hoje, Deezer). Para adicionar, abra o lançamento no Spotify, use "Compartilhar > Copiar link" e coloque o link (`https://open.spotify.com/album/...`) em `links.spotify`; se quiser o player do álbum, coloque em `spotifyEmbed` o mesmo endereço com `/embed/` depois do domínio (`https://open.spotify.com/embed/album/...`). Nunca use o link da página da artista em um lançamento.
