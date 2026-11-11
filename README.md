# Site oficial da Eutenia

Site estático da banda Eutenia: Início, Discografia, Shows, Loja, Mídia, Contato e Política de Privacidade. É feito com [Astro](https://astro.build) e Tailwind CSS. Todo o conteúdo (lançamentos, clipes, shows, produtos, fotos, press kit) mora em arquivos JSON. Para mudar o site, edite esses arquivos e publique. Não há banco de dados nem servidor.

O domínio principal configurado no projeto é `https://eutenia.com.br/`, hospedado no GitHub Pages. O repositório continua sendo `eutenia-site.github.io` e o site é servido na raiz (`BASE: /`). A ativação depende também do DNS e das configurações de Pages no GitHub.

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
| `src/content/data/products.json`     | Loja e merch do Início              | `id`, `nome`, `categoria` (`camisetas`, `moletons`, `midia-fisica`, `acessorios`, `edicoes-limitadas`), `precoCentavos`, `imagem` ou `imagens` (lista de fotos), `selo`, `tamanhos`, `especificacao`, `url` (link de compra; sem ele o botão mostra "Em breve"), `destaque` (aparece no Início), `adicionadoEm`                             |
| `src/content/data/press.json`        | Página Materiais para contratantes  | `id`, `titulo`, `categoria` (`apresentacao`, `tecnico`, `divulgacao`, `pacote`), `descricao`, `tipo`, `tamanho`, `arquivo`, `icone` (nome de um ícone do [Material Symbols](https://fonts.google.com/icons))                                                                                                                                |
| `src/content/data/vip.json`          | Card VIP da página Shows            | `id`, `selo`, `titulo`, `descricao`, `beneficios` (`titulo`, `descricao`), `valorCentavos`, `url`, `observacao`                                                                                                                                                                                                                             |
| `src/content/data/stats.json`        | Números do Início                   | `id`, `valor`, `rotulo`, `anoInicial` (opcional)                                                                                                                                                                                                                                                                                                                     |
| `src/config/site.json`               | Configuração geral                  | `email`, `formEndpoint`, `newsletterEndpoint`, `votoCidadeEndpoint`, `lojaUrl`, `social` (`youtube`, `spotify`, `instagram`, `facebook`, `x`, `tiktok`)                                                                                                                                                                      |
| `src/content/paginas/privacidade.md` | Texto da Política de Privacidade    | `titulo` e `atualizadoEm` no topo, texto abaixo                                                                                                                                                                                                                                                                                             |

Os shows mudam de "Próximos" para "Passados" sozinhos, pelo horário de Brasília. O site é gerado de novo todo dia (veja [Publicação](#publicação)), e a página Shows também refaz as abas no navegador do visitante.

### Mídia da banda

Na página **Mídia** (`/midia/`), os arquivos de `src/content/data/press.json` ficam reunidos em **Materiais para contratantes**. O campo `categoria` identifica o tipo de material:

- `apresentacao`: press kit em PDF, com a apresentação da banda.
- `tecnico`: rider, mapa de palco e especificações para shows.
- `divulgacao`: fotos e logotipos.
- `pacote`: ZIP opcional com o conjunto completo de arquivos.

O botão **Baixar press kit** de Shows baixa o PDF de apresentação. Em Shows, **Especificações para shows** abre `/midia/#materiais-contratantes`. Todos os downloads ficam em `/midia/#materiais-contratantes`.

Coloque os arquivos em `public/midia/` e atualize `arquivo`, `tipo`, `tamanho` e `disponivel: true` no JSON. Arquivos com `disponivel: false` aparecem como **Em breve**, sem link para exemplos. Para oferecer **Baixar tudo (ZIP)**, crie o ZIP com os materiais finais e preencha o registro `pacote-completo`; a faixa fica abaixo dos cards individuais e o botão fica habilitado quando ele tiver `arquivo` e `disponivel: true`. Atualize o pacote sempre que trocar um arquivo individual. Press kit, rider com mapa de palco e logo pack já usam os arquivos oficiais; o ZIP completo ainda aguarda cadastro. `public/midia/eutenia-fotos-oficiais.zip` é um ZIP vazio reservado para substituição pelas fotos finais: seu download permanece desabilitado até atualizar o conteúdo, o tamanho e `disponivel: true`.

A seção **Fotos** (`/midia/#fotos`) usa `src/content/data/photos.json`. Coloque os arquivos em `public/fotos/` e cadastre `id`, `titulo`, `imagem` (prévia), `arquivo` (download), e opcionalmente `descricao` e `credito`. A galeria e as setas da visualização ampliada seguem a ordem dos registros no JSON. Com o JSON vazio, a seção mostra **Em breve**. Exemplo de registro:

```json
{
  "id": "banda-2026",
  "titulo": "Eutenia",
  "imagem": "fotos/banda-previa.jpg",
  "arquivo": "fotos/banda-alta.jpg",
  "credito": "Nome do fotógrafo"
}
```


### Fotos dos produtos

Em `src/content/data/products.json`, use `imagens` para uma lista de fotos. A primeira é a capa e a ordem da lista é a ordem do carrossel:

```json
"imagens": [
  "produtos/camiseta-pandora/dsc01572.webp",
  "produtos/camiseta-pandora/dsc01581.webp"
]
```

Coloque as fotos em `public/produtos/`. O campo antigo `imagem` continua funcionando para uma foto; se os dois campos forem usados, `imagem` fica como capa. Quando há mais de uma foto, use as setas ou o teclado para navegar. Na Loja, deslizar sobre a foto também troca a imagem. No Início, deslizar percorre os produtos em destaque; as setas trocam as fotos de cada produto. Sem JavaScript, a capa continua visível.

Os três modelos atuais usam fotos reais da banda, com nomes e preços provisórios. Ajuste `nome` e `precoCentavos` antes de divulgar a loja: `11990` representa R$ 119,90.

### Compra pelo PagSeguro

Cada produto em `src/content/data/products.json` tem o campo `url` para seu link de pagamento do PagSeguro:

```json
"url": ""
```

Cole o link completo do produto entre as aspas. Ao clicar em **Comprar**, o visitante será direcionado ao checkout na mesma aba. Isso vale para a Loja, os destaques do Início e a promoção da Discografia. Com `url` vazio ou ausente, o produto mostra **Em breve**.

### Seções opcionais

VIP, números (stats) e a agenda de shows aceitam listas vazias (`[]`). Uma seção vazia não aparece no site; a agenda vazia mostra "Nenhum show anunciado no momento". Para ativar uma seção, copie o modelo de `src/content/_exemplos/` para `src/content/data/` e troque os exemplos pelos dados reais:

```sh
cp src/content/_exemplos/shows.json src/content/data/shows.json
```

Modelos disponíveis: `shows.json`, `vip.json`, `stats.json`. Os exemplos têm dados inventados: nunca publique sem trocá-los.

As estatísticas do Início e de **Materiais para contratantes** vêm de `src/content/data/stats.json`, pelo mesmo componente. Todos os itens aparecem na ordem do JSON, com as cores alternadas começando pelo vermelho. A grade se adapta à quantidade de indicadores. Em um indicador de anos de atividade, use `anoInicial: 2012`: o valor é calculado no build e a cada abertura da página, pelo ano de Brasília, sem precisar editar o número todo ano.

### Atualização automática das estatísticas

O deploy já roda diariamente às **06:00 de Brasília**, além dos pushes em `main` e das execuções manuais. Antes do build, `scripts/update-stats.mjs` consulta as páginas públicas do [YouTube](https://www.youtube.com/@Eutenia/about), do [Instagram](https://www.instagram.com/euteniaoficial/) e do [Spotify](https://open.spotify.com/artist/1b1VNVxpK917LlNACwCIKM) e atualiza `youtube_views`, `youtube_subscribers` e `instagram_seguidores`. Não exige login, token nem chave de API. Não faz consultas no navegador dos visitantes. Os contadores positivos recebem o prefixo `+`. Milhares ficam sem decimal (`+9k`, `+15k`); milhões e bilhões mantêm uma casa com ponto (`+1.8M`, `+1.0M`). Os valores são truncados, sem arredondar para cima.

Para atualizar, basta executar **Actions → Deploy → Run workflow**, publicar em `main` ou aguardar o próximo deploy diário.

O YouTube é lido exclusivamente pela seção Sobre do canal, com validação do ID da Eutenia; inscritos e views de vídeos ou de canais recomendados são ignorados. No Instagram, o script lê a quantidade de seguidores da descrição pública e confirma o perfil `@euteniaoficial`. Os scripts só interpretam HTML e JSON, sem executar código das páginas ou usar endpoints privados.

O próprio `stats.json` é a reserva dos últimos valores válidos. Se uma página bloquear a consulta, pedir login, mudar de formato ou não entregar um número válido, o indicador correspondente fica como já estava no arquivo, sem ser apagado ou zerado. A atualização das outras redes continua normalmente. Os valores manuais, como streams do Spotify, também são preservados; abreviações antigas com vírgula são normalizadas para o mesmo padrão com ponto.

Depois de um deploy bem-sucedido em `main`, a etapa `persist-stats` salva apenas `src/content/data/stats.json` no repositório, com um commit do `github-actions[bot]`, quando os valores realmente mudarem. Esse commit usa `GITHUB_TOKEN` e não dispara outro deploy. A etapa recebe exatamente o JSON que foi publicado, com permissão `contents: write` apenas para essa gravação; não precisa cadastrar outro secret nem usar token pessoal. Não há cache separado das estatísticas no Actions.

Se `main` receber outro commit durante a publicação, a gravação automática é ignorada para preservar as alterações mais novas; o próximo deploy tentará novamente. Não há force push. Caso regras da branch ou políticas da organização impeçam o bot de gravar, a etapa `persist-stats` apontará o erro, mas o site já terá sido publicado. Nesse caso, ajuste a permissão do bot nas regras do repositório.

**Limitações:** as páginas públicas não são APIs estáveis e podem bloquear consultas feitas pelo GitHub Actions. Mudanças no HTML podem exigir manutenção do leitor. O número público de inscritos do YouTube é arredondado. O total de streams do Spotify (`valor` do indicador `spotify_streams`) continua manual. O indicador independente `spotify_monthly_listeners` mostra os ouvintes mensais lidos automaticamente da descrição pública do perfil, com validação do artista. Ele aparece ao lado de Streams Spotify no Início e em Materiais para contratantes. Se a consulta falhar, mantém o valor já salvo. O agendamento do GitHub pode sofrer atrasos; a atualização é diária, não em tempo real.

**API opcional do YouTube:** caso queira substituir a leitura da página por uma integração oficial, habilite **YouTube Data API v3** no Google Cloud, crie uma chave restrita a essa API e cadastre o secret `YOUTUBE_API_KEY` em **Settings → Secrets and variables → Actions**. Com a chave presente, o script usa a API; sem ela, usa a página pública. A variável opcional `YOUTUBE_CHANNEL_ID` seleciona o canal por ID; o padrão é a Eutenia. Nenhuma credencial deve ser colocada em arquivos públicos.

Documentação: [YouTube — canais](https://developers.google.com/youtube/data/reference/rest/v3/channels/list), [estatísticas públicas](https://developers.google.com/youtube/data/reference/rest/v3/channels#statistics), [Spotify — artista](https://developer.spotify.com/documentation/web-api/reference/get-an-artist).

### Ícones

O site baixa só os ícones que usa. Ao colocar um `icone` novo em `press.json`, nada mais é preciso. Ao usar um ícone novo no código, acrescente o nome em `src/lib/icons.ts`. Um teste avisa se faltar algum.

## Configuração (`src/config/site.json`)

Deixe um campo como `""` para desligar o recurso.

- **`formEndpoint`**: endereço que recebe os formulários de Contato e de Booking, por exemplo um formulário do [Formspree](https://formspree.io) (`https://formspree.io/f/xxxxxxx`). Crie o formulário no Formspree, copie o endereço e cole aqui. Vazio: o botão de enviar abre o programa de e-mail do visitante com a mensagem pronta para `contatoeutenia@gmail.com`; o visitante precisa concluir o envio no aplicativo. Esses formulários aparecem apenas em telas menores que 768 px. No computador, o endereço é selecionável e há um botão **Copiar e-mail**, sem envio pela página.
- **`newsletterEndpoint`**: endereço do formulário de newsletter (Formspree, Mailchimp etc.). Vazio: a newsletter não aparece no Início.
- **`votoCidadeEndpoint`**: endereço do formulário "vote na sua cidade" da página Shows. Vazio: o formulário não aparece.
- **`lojaUrl`**: campo legado, mantido por compatibilidade. Para vender pelo PagSeguro, configure o link no campo `url` de cada produto em `products.json`.

## Endereço do site (base path e domínio)

O endereço vem de duas variáveis lidas no build (`astro.config.mjs`):

- `SITE`: o domínio, padrão `https://eutenia.com.br`
- `BASE`: a pasta, padrão `/` (a raiz). Só mude se o site for servido numa subpasta, como num repositório de projeto (`/nome-do-repo`)

Todo link interno passa por `url()` de `src/lib/paths.ts`, então trocar `BASE` muda o site inteiro.

O projeto está preparado para **eutenia.com.br**:

- `public/CNAME` contém apenas `eutenia.com.br`.
- O build do workflow define `SITE: https://eutenia.com.br` e `BASE: /`.
- Canonical e URLs de compartilhamento são geradas com esse domínio.

`CNAME` mantém o domínio documentado no artefato. Como a publicação usa **GitHub Actions**, esse arquivo sozinho não configura o domínio no serviço; é necessário salvá-lo em Settings > Pages ([documentação oficial](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)).

Para ativar o domínio:

1. Em [Settings > Pages do repositório](https://github.com/eutenia-site/eutenia-site.github.io/settings/pages), preencha **Custom domain** com `eutenia.com.br` e salve.
2. No provedor de DNS do domínio, configure os seguintes registros:

   | Tipo  | Nome | Valor                  |
   | ----- | ---- | ---------------------- |
   | A     | @    | 185.199.108.153        |
   | A     | @    | 185.199.109.153        |
   | A     | @    | 185.199.110.153        |
   | A     | @    | 185.199.111.153        |
   | CNAME | www  | eutenia-site.github.io |

   Troque apenas registros de endereçamento conflitantes de `@`/`www`; mantenha MX e TXT usados por e-mail ou verificação. O provedor pode representar a raiz por `@`, campo vazio ou `eutenia.com.br`.

3. Publique as alterações na branch `main` para gerar o site com as URLs novas.
4. Depois que o DNS for validado e o certificado estiver disponível, marque **Enforce HTTPS** em Pages. O GitHub informa que a propagação do DNS e a disponibilidade de HTTPS podem levar até 24 horas. Com o DNS de ambos correto, `www.eutenia.com.br` redireciona para `eutenia.com.br`.

Para conferir o DNS no PowerShell:

```powershell
Resolve-DnsName eutenia.com.br -Type A
Resolve-DnsName www.eutenia.com.br -Type CNAME
```

## Publicação

O workflow `.github/workflows/deploy.yml` publica o site no GitHub Pages:

- a cada push na branch `main`;
- todo dia às 06:00 de Brasília (09:00 UTC), para os shows que já passaram irem para "Passados";
- quando alguém clica em "Run workflow" na aba Actions.

Ele instala as dependências, roda os testes rápidos, gera o site e publica a pasta `dist/`. Se um teste falhar, nada é publicado e o site antigo continua no ar.

Para ligar a publicação (uma vez): em Settings > Pages do repositório, em "Build and deployment", escolha a fonte **GitHub Actions**.

## Trocar os placeholders antes do lançamento

Várias imagens e arquivos ainda são provisórios. A lista completa, com o que colocar no lugar de cada um, está em [`PLACEHOLDERS.md`](PLACEHOLDERS.md).

**Atenção:** as imagens de placeholder vieram dos protótipos de design e foram geradas por IA. Elas não mostram a banda e algumas têm texto gerado por IA. Troque todas antes de divulgar o site publicamente. As fotos da Loja foram atualizadas com os produtos da banda; os nomes e preços são provisórios e os links de compra ainda precisam ser definidos.

## Links do Spotify

Em `releases.json`, `links.spotify` aponta para o álbum no Spotify em Pandora e Chymia II, que também têm `spotifyEmbed` com o embed do álbum. Carbonizar, Cego, Meu Fim, Espelho e Chymia I ainda não têm link do Spotify: o site mostra só as plataformas presentes (hoje, Deezer). Para adicionar, abra o lançamento no Spotify, use "Compartilhar > Copiar link" e coloque o link (`https://open.spotify.com/album/...`) em `links.spotify`; se quiser o player do álbum, coloque em `spotifyEmbed` o mesmo endereço com `/embed/` depois do domínio (`https://open.spotify.com/embed/album/...`). Nunca use o link da página da artista em um lançamento.
