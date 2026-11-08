# Experiência mobile v1 Context

**Gathered:** 2026-11-08
**Spec:** `.specs/features/mobile-v1/spec.md`
**Status:** Ready for tasks

---

## Feature Boundary

Corrigir no celular (< 768px) os 6 pontos da auditoria a 390px: zoom do iOS nos campos, alvos de toque pequenos, texto de 10px, listas de 1 coluna (Loja, Discografia, Fãs), heroes que ocupam a primeira tela (Contato, Fãs, Loja) e o Fãs sem destaque na barra. Desktop intacto.

---

## Implementation Decisions

The user answered every question in one round with "Recomendacoes".

### Escopo (Q1)

- Itens 1-6 da auditoria, só abaixo de 768px, desktop intacto.

### Loja (Q2)

- 2 produtos por linha; os tamanhos saem do card no mobile (AD-013).

### Listas longas (Q3)

- Catálogo de lançamentos, videoclipes e wallpapers em 2 colunas (AD-012).

### Heroes (Q4)

- Heroes de Contato, Fãs e Loja compactos; o Contato ganha "ENVIAR MENSAGEM", que leva ao formulário (AD-014).

### Barra inferior (Q5)

- Continua com 5 itens; nenhum item marcado no Fãs (AD-014).

### Tamanhos mínimos (Q6)

- Texto >= 12px, toque >= 44×44, campos 16px (AD-011).

### Agent's Discretion

- Conteúdo de cada card em 2 colunas, corte de nomes longos em 2 linhas, larguras de teste 390 e 360, exceções de área de toque para links em texto corrido (Assumptions da spec).

### Declined / Undiscussed Gray Areas → Assumptions

- None.

---

## Specific References

- Auditoria e prints em `/tmp/claude-1000/-home-deivid-Projects-Eutenia-site/0381d13d-4fa5-491c-bb1c-40875ce81901/scratchpad/` (`r-real-a.png`, `r-real-b.png`, `tops.png`).

---

## Deferred Ideas

- Fãs na barra inferior (6 itens), se a banda quiser destacar a página no futuro.
