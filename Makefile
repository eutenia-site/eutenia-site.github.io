.DEFAULT_GOAL := dev
.PHONY: help dev build preview fixtures test e2e check lint format captures lighthouse clean

node_modules: package.json package-lock.json
	npm install
	@touch node_modules

help: ## lista os comandos
	@grep -E '^[a-z0-9-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-11s %s\n", $$1, $$2}'

dev: node_modules ## site em http://localhost:4321/ com recarga ao salvar (padrao)
	npm run dev

build: node_modules ## gera o site final em dist/
	npm run build

preview: build ## gera e serve o dist/, como vai ser publicado
	npm run preview

fixtures: node_modules ## gera e serve o site com os dados de teste (shows, VIP, mural...)
	EUTENIA_CONTENT=fixtures npm run build
	EUTENIA_CONTENT=fixtures npx astro preview

test: node_modules ## testes Vitest (regras, dados, HTML gerado)
	npm test

e2e: node_modules ## testes de navegador (Playwright)
	npx playwright test

check: node_modules ## checagem de tipos do Astro
	npm run check

lint: node_modules ## formatacao (Prettier)
	npm run lint

format: node_modules ## corrige a formatacao
	npm run format

captures: node_modules ## refaz as fotos de tela *.running.png
	npm run captures

lighthouse: node_modules ## Lighthouse no Inicio
	npx lhci autorun

clean: ## apaga os builds e resultados de teste
	rm -rf dist dist-fixtures test-results .lighthouseci
