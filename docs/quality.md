# Validação e limites

## Pipeline local

```bash
npm ci
npm run check
npm audit --audit-level=moderate
```

`npm run check` executa Prettier, TypeScript estrito, ESLint sem avisos, Vitest e build de produção. O CI repete esses passos em Node 22 e falha para vulnerabilidades de severidade alta ou superior; a entrega também foi verificada com limite moderado.

## Resultado desta entrega

- **63 testes automatizados** em 7 arquivos: CSV, persistência, formatação, parser de comandos, componentes acessíveis, terminal e contratos de contraste/tamanho dos tokens.
- **24 verificações de navegador** aprovadas em Chromium headless com Playwright: gráficos, mapa, exportação, atalhos, filtros, favoritos, resolução de evento, temas, Matrix, movimento reduzido, restauração, sidebar, gaveta, diálogos, alvos de toque e viewport do terminal.
- **16 execuções do axe-core** nas oito rotas, em desktop 1440 px e mobile 390 px: zero violações nas regras WCAG 2 A/AA e 2.1 A/AA avaliadas.
- Sem overflow horizontal em 320, 360, 390 e 768 px nas oito rotas; visão geral também verificada em 1366 px com sidebar recolhida.
- Zero erros de console capturados durante o roteiro.
- `npm audit`: zero vulnerabilidades reportadas no momento da validação.

As verificações de navegador foram executadas no sandbox com dependências temporárias de QA; elas não são adicionadas ao bundle nem ao lockfile de produção. O pipeline versionado cobre os testes unitários e de contrato visual. O roteiro abaixo permite repetir a inspeção manualmente ou em uma futura suíte E2E.

## Roteiro de inspeção

1. Abrir `/`, alternar 6h/24h/7d e abrir a tabela alternativa do gráfico.
2. Selecionar uma região no mapa e seguir o link para câmeras filtradas.
3. Em câmeras, filtrar offline, favoritar, recarregar, abrir detalhes e fechar pelo backdrop e por Escape.
4. Em eventos, iniciar análise, resolver, recarregar e conferir o status persistente.
5. Exportar CSV e abrir em planilha; conferir acentos, separador e campos que começam com `=`, `+`, `-` ou `@`.
6. Alternar os três temas e conferir que badges de estado mantêm a semântica.
7. No desktop, ativar Matrix, abrir terminal/diálogo e confirmar pausa; ativar movimento reduzido e confirmar desligamento.
8. Recolher/expandir sidebar em 1366 px; abrir gaveta em 390 px e navegar por teclado.
9. Abrir terminal com F2 e Ctrl+K em foco de input; usar histórico e fechar com Escape.
10. Em touch, conferir inputs de 16 px, alvos de 44 px, tabelas em cards e terminal acompanhando redução de viewport.
11. Executar axe-core nas oito rotas e revisar manualmente foco, ordem de leitura e nomes acessíveis.

## Limites

- Chromium emulado não substitui Safari/iOS físico, Android real, leitor de tela humano ou teste com teclado virtual do sistema. A lógica de `visualViewport` foi exercitada com redução de viewport emulada.
- Axe não certifica conformidade WCAG completa; contraste e tamanho também são cobertos por testes de contrato, mas interação humana continua necessária.
- Não há backend, autenticação, dados reais ou precisão cartográfica. Não usar esta base como sistema operacional de produção sem as camadas descritas em [arquitetura](architecture.md).
- A v4 não estava no checkout; não existe comparação de paridade com ela.
