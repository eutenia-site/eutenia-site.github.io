# STATE

## Decisions

### AD-001 (active)
- **Decision**: O site é estático (Astro 7 + Tailwind CSS 4 + TypeScript), publicado no GitHub Pages por GitHub Actions, com base path configurável (`/eutenia-site/` hoje, raiz quando houver domínio).
- **Reason**: User: "vai ser um site que eh hospedado aqui no github pages, entao um site estatico, utilize a stack que achar melhor". Astro gera HTML puro com JS só nas ilhas interativas e tem content collections com schema.
- **Trade-off**: Sem backend: nada de carrinho, login ou envio de formulário próprio.
- **Scope**: todo o site
- **Date**: 2026-11-07
- **Status**: active

### AD-002 (active)
- **Decision**: Todo conteúdo editável vive em arquivos de dados (`src/content/**`) validados por schema; cada seção opcional some quando seus dados estão vazios.
- **Reason**: Q3 "Conteúdo real ou fictício" - user: "pode pegar dados do spotify atual se quiser"; Q11 "Seções com conteúdo inventado" - opção "construir todas e esconder quando o dado estiver vazio", user: "q11 recomendacao".
- **Trade-off**: Layout fixo por seção; a banda edita JSON/Markdown em vez de um CMS.
- **Scope**: todo o site
- **Date**: 2026-11-07
- **Status**: active

### AD-003 (active)
- **Decision**: Formulários enviam para um endpoint externo configurável (Formspree); sem endpoint, abrem `mailto:contato@eutenia.com.br`. A loja é vitrine: "Comprar" abre o link do produto ou mostra "Em breve".
- **Reason**: Q5 "Funcionalidades vivas" - user: "q5 recomendacao"; Q13 "Loja" - user: "q13 recomendacao"; Q14 - user: "pode colocar email pra contato@eutenia.com.br".
- **Trade-off**: Sem carrinho/checkout; sem anexo de arquivo no modo mailto.
- **Scope**: Loja, Shows, Contato, Início
- **Date**: 2026-11-07
- **Status**: active

### AD-004 (active)
- **Decision**: Menu = Início · Discografia · Shows · Loja · Fãs · Contato (o design tem "Sobre/Contato" e não lista Fãs); barra inferior mobile = Início · Música · Shows · Loja · Contato.
- **Reason**: Q8 "Navegação e URLs" - opção recomendada, user: "q8 e q9 recomendacao".
- **Trade-off**: Diverge do rótulo "Sobre/Contato" das capturas.
- **Scope**: cabeçalho, barra mobile, rodapé
- **Date**: 2026-11-07
- **Status**: active

### AD-005 (active)
- **Decision**: Na Loja, "Adicionar ao carrinho" vira "Comprar"/"Em breve"; tamanhos são informativos; saem ícone de carrinho, faixa de frete grátis, bloco "Pagamento criptografado" e formas de pagamento do rodapé.
- **Reason**: Q13 "Loja" - opção "Sim para todas as mudanças; URL configurável e vazia", user: "q13 recomendacao".
- **Trade-off**: A página promete menos que a captura.
- **Scope**: Loja, cabeçalho, rodapé
- **Date**: 2026-11-07
- **Status**: active

### AD-006 (active)
- **Decision**: O player customizado (barra fixa / dock mobile) vira um embed compacto do Spotify na mesma posição, não fixo; vídeos do YouTube carregam só no clique.
- **Reason**: Q17 "Player" e Q18 "Vídeos" - user: "q17 e q18 recomendacoes".
- **Trade-off**: Visual do player é o do Spotify, não o do design.
- **Scope**: Início, Discografia
- **Date**: 2026-11-07
- **Status**: active

### AD-007 (active)
- **Decision**: Um único e-mail de contato, contato@eutenia.com.br, em todos os cartões de departamento e no rodapé; o telefone do design sai.
- **Reason**: Q14 "Contatos e formulários" - user: "q14 pode colocar email pra contato@eutenia.com.br".
- **Trade-off**: Departamentos não têm caixa própria.
- **Scope**: Contato, Shows, Loja, rodapé
- **Date**: 2026-11-07
- **Status**: active

### AD-008 (active)
- **Decision**: O rodapé troca "Termos de Uso" por "Política de Privacidade" apontando para a nova página `/privacidade/`.
- **Reason**: Q15 "Privacidade" - user: "q15 sim".
- **Trade-off**: Texto-base genérico até revisão jurídica.
- **Scope**: rodapé, `/privacidade/`
- **Date**: 2026-11-07
- **Status**: active

### AD-009 (active)
- **Decision**: O destaque do Início é o álbum Pandora (2024) com o clipe de Indestrutível, no lugar do fictício "Carbono".
- **Reason**: Q16 "Destaque do Início" - user: "q16 sim".
- **Trade-off**: Nenhum.
- **Scope**: Início
- **Date**: 2026-11-07
- **Status**: active

### AD-010 (active)
- **Decision**: No mobile de Shows, a seção de booking é o formulário completo "Contratar a banda", não o bloco compacto "Leve o Eutenia para a sua cidade" com WhatsApp e rider da captura.
- **Reason**: Q30 "Booking no mobile de Shows" - opção "manter o formulário completo e registrar a diferença", user: "q30 recomendacao".
- **Trade-off**: Mobile mais longo que a captura.
- **Scope**: Shows (mobile)
- **Date**: 2026-11-07
- **Status**: active

## Handoff
