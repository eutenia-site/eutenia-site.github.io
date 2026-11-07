# Site v0 - Context (gray-area decisions)

## Round 1 - 2026-11-07

| # | Decision | Answer (user) |
| - | -------- | ------------- |
| Q1 | Escopo | As 6 páginas do design (Início, Discografia & Mídia, Shows, Loja, Fãs & Wallpapers, Contato), responsivas; mobile derivado do padrão das 3 telas mobile. User: "q1 e q2 recomendacoes" |
| Q2 | Força do design | Vinculante para composição/visual/rótulos de UI (DESIGN.md); dados de exemplo não transcritos. |
| Q3 | Conteúdo | Misto: real onde conhecido (redes do site atual, dados do Spotify), placeholder no resto, tudo em arquivos de dados. User: "q3 pode pegar dados do spotify atual se quiser" |
| Q4 | Stack / hospedagem | Site estático hospedado no GitHub Pages; stack à escolha do agente. User: "q4 vai ser um site que eh hospedado aqui no github pages, entao um site estatico, utilize a stack que achar melhor" |
| Q5 | Funcionalidades vivas | Loja = vitrine + link externo/"em breve", sem carrinho; formulários via serviço externo configurável com fallback mailto; player = embed Spotify; downloads = arquivos estáticos placeholder. User: "q5 recomendacao" |
| Q6 | Imagens | Baixar imagens do design para o repo como placeholders, com lista de troca. User: "q6 recomendacao" |
| Q7 | Idioma / deploy | Somente pt-BR; sem DNS; push só com autorização explícita. User: "q7 sim, publico da banda hoje eh brasileiro somente no geral" |

## Facts gathered

Spotify artist `1b1VNVxpK917LlNACwCIKM` (embed + oEmbed, 2026-11-07). Top tracks:

| Faixa | Lançamento | Capa (release) |
| ----- | ---------- | -------------- |
| Últimas Palavras, They Wanna Watch Me Fall, Cólera, Vozes, Mil Pedaços (Apenas Um), In Memoriam | 2016-01-14 | ab67616d0000b273fd8d58915765ade2500ef947 |
| Meu Fim (feat. Caio MacBeserra) | 2018-12-19 | ab67616d0000b2731e7913bbcc21b13ed31ad67a |
| Cego | 2019-11-12 | ab67616d0000b2736a5d73fbe61a952f2ad5c792 |
| Carbonizar, Indestrutível | 2024-01-31 | ab67616d0000b27302703aeff361d4c624271c4a |

Artist photo: ab6761610000e5eb7b54c905e6dd069a65ed360f.

Full discography (Deezer public API, artist 7536988, 2026-11-07):

| Título | Tipo | Data | Faixas |
| ------ | ---- | ---- | ------ |
| Pandora | álbum | 2024-03-03 | Indestrutível, Carbonizar, Lúcifer, Adeus, Sombras, Fantasmas, Linhas Brancas, Medo, De Volta ao Salão, Minha Liberdade, Colecionador de Mentiras |
| Carbonizar | single | 2023-10-25 | Carbonizar |
| Cego | single | 2019-11-12 | Cego |
| Meu Fim (feat. Caio MacBeserra) | single | 2018-12-19 | Meu Fim |
| Espelho | single | 2017-01-09 | Espelho |
| Chymia II | EP | 2016-01-14 | Cólera, Últimas Palavras, They Wanna Watch Me Fall, Vozes, Mil Pedaços (Apenas Um), In Memoriam |
| Chymia I | EP | 2012-12-12 | Salão 7372, Psicopatia, Dríade, Voltar Atrás |

## Round 2 - 2026-11-07

| # | Decision | Answer (user) |
| - | -------- | ------------- |
| Q8 | Navegação | Início · Discografia · Shows · Loja · Fãs · Contato; URLs `/`, `/discografia/`, `/shows/`, `/loja/`, `/fas/`, `/contato/`; barra inferior mobile Início · Música · Shows · Loja · Contato, Fãs no hambúrguer. User: "q8 e q9 recomendacao" |
| Q9 | Endereço | `eutenia-site.github.io/eutenia-site/`, base path configurável para domínio futuro. |
| Q10 | Lançamentos | Usar dados reais do Spotify/streaming (tabela acima). User: "q10 pegue os dados do spotify" |
| Q11 | Seções inventadas | Construir todas; cada seção some quando seu arquivo de dados está vazio. User: "q11 recomendacao" |
| Q12 | Shows | Separação próximos/passados pela data no navegador (regra testada) + rebuild diário via Action; estado vazio com links para redes. User: "q12 recomendacao" |

Social links (current eutenia.net): Spotify, instagram.com/euteniaoficial, youtube.com/Eutenia, facebook.com/eutenia, twitter.com/EuteniaOficial.

Remote `origin` = https://github.com/eutenia-site/eutenia-site.git (empty).

YouTube channel `UCbQwsKt8apfT9Nuq8GE35Nw` (RSS, 2026-11-07), official clips and Pandora videos:

| videoId | Data | Título |
| ------- | ---- | ------ |
| Atv4aKAXEmg | 2024-01-31 | EUTENIA - INDESTRUTÍVEL [Clipe Oficial] |
| IuKuadsqVl4 | 2023-10-31 | EUTENIA - CARBONIZAR [Clipe Oficial] |
| pqaak_gHumk | 2024-01-31 | EUTENIA - MINHA LIBERDADE |
| jYMWWzbNLRs | 2024-01-31 | EUTENIA - LINHAS BRANCAS |
| ukQxgdbenx8 | 2024-01-31 | EUTENIA - FANTASMAS |
| QW87u9jowtE | 2024-01-31 | EUTENIA - ADEUS |
| gqo8AmwO7bk | 2024-01-31 | EUTENIA - LÚCIFER |
| emrdmdC3UHY | 2024-01-31 | EUTENIA - COLECIONADOR DE MENTIRAS |
| QDo5wpmsl7s | 2024-01-31 | EUTENIA - DE VOLTA AO SALÃO (Feat. Anny Cee) |
| 1OHVPXP7CkU | 2024-01-31 | EUTENIA - SOMBRAS |
| -l8lxPm-BNE | 2024-01-31 | EUTENIA - MEDO |

Capture sizes (px): loja 1280x2523 (full-res); the other captures are downscaled previews (desktop ~437-753 wide, mobile ~214-278 wide, all 1600 tall) - target widths 1280 desktop and 390 mobile.

## Round 3 - 2026-11-07

| # | Decision | Answer (user) |
| - | -------- | ------------- |
| Q13 | Loja | "Comprar" abre link do produto ou selo "Em breve"; tamanhos informativos; sem ícone de carrinho, faixa de frete, bloco de pagamento e formas de pagamento no rodapé; URL da loja configurável e vazia. User: "q13 recomendacao" |
| Q14 | Contatos | Um único e-mail real: contato@eutenia.com.br; telefone removido; formulários via mailto até haver ID do Formspree. User: "q14 pode colocar email pra contato@eutenia.com.br" |
| Q15 | Privacidade | Página `/privacidade/` com texto-base para revisão; "Termos de Uso" removido. User: "q15 sim" |
| Q16 | Destaque do Início | Hero = álbum Pandora (2024); clipe em destaque = Indestrutível. User: "q16 sim" |
| Q17 | Player | Embed compacto do Spotify na posição do player, não fixo; prévia de letra só com dado. User: "q17 e q18 recomendacoes" |
| Q18 | Vídeos | 2 clipes oficiais + 9 vídeos do Pandora; player do YouTube só carrega no clique. |
| Q19 | Larguras | Desktop 1280px, mobile 390px. User: "q19 recomendacao" |
| Q20 | Qualidade | Zero violações axe serious/critical; teclado; Lighthouse >= 90 perf/a11y no Início; funciona sem JS exceto filtros/abas/vídeos. User: "q 20 recomendacao" |
