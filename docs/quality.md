# Validação e limites

## Pipeline local

```bash
npm ci
npm run check
npm audit --audit-level=moderate
```

`npm run check` executa Prettier, TypeScript estrito, ESLint sem avisos, Vitest e build de produção. O CI repete esses passos em Node 22 e falha para vulnerabilidades de severidade alta ou superior; a entrega também foi verificada com limite moderado.

## Resultado desta entrega

- **70 testes automatizados** em 9 arquivos: CSV, persistência, formatação, parser de comandos, componentes acessíveis, terminal, contratos de contraste/tamanho dos tokens, integridade dos datasets paralelos e provedor de escopo.
- **23 verificações de navegador** aprovadas em Chromium headless com Playwright sobre o build de produção: 20 combinações rota/versão, troca de território, inventário municipal próprio, navegação com `territorio`, filtros e CSV de Educação/Segurança, favoritos sem vazamento entre versões, resolução de evento, terminal `scope`/`status`, temas, Matrix, movimento reduzido, gaveta, terminal mobile e sidebar recolhida com seletor visível.
- **22 execuções do axe-core**: dez rotas em desktop 1440 px para Piauí e Teresina Capital, mais Educação mobile e gaveta mobile; zero violações nas regras WCAG 2 A/AA e 2.1 A/AA avaliadas.
- Sem overflow horizontal em 320, 360, 390 e 768 px nas 20 combinações rota/versão, nem em 1440 px e 1366 px com sidebar recolhida.
- Todas as abas das duas versões têm conteúdo rolável acima de 1.400 px de altura em desktop 1440 px; segurança pública chega a cerca de 4.500 px com tabelas, bases, programas e glossário.
- Zero erros de console capturados durante o roteiro.
- `npm audit`: zero vulnerabilidades reportadas no momento da validação.

As verificações de navegador foram executadas no sandbox com dependências temporárias de QA; elas não são adicionadas ao bundle nem ao lockfile de produção. O pipeline versionado cobre os testes unitários e de contrato visual. O roteiro abaixo permite repetir a inspeção manualmente ou em uma futura suíte E2E.

## Roteiro de inspeção

1. Abrir `/`, alternar 6h/24h/7d e abrir a tabela alternativa do gráfico.
2. Alternar Piauí/Teresina Capital no seletor; conferir que a aba permanece, os totais mudam e filtros de área são limpos.
3. Selecionar uma área no mapa e seguir o link para câmeras filtradas; repetir na versão municipal.
4. Em câmeras, filtrar offline, favoritar, recarregar, abrir detalhes e fechar pelo backdrop e por Escape; confirmar que favorito municipal não aparece na lista estadual.
5. Em eventos, iniciar análise, resolver, recarregar e conferir o status persistente.
6. Em Educação e Segurança, filtrar por área/conectividade/situação e exportar CSV; conferir nome de arquivo com território e camada.
7. Exportar CSV e abrir em planilha; conferir acentos, separador e campos que começam com `=`, `+`, `-` ou `@`.
8. Alternar os três temas e conferir que badges de estado mantêm a semântica.
9. No desktop, ativar Matrix, abrir terminal/diálogo e confirmar pausa; ativar movimento reduzido e confirmar desligamento.
10. Recolher/expandir sidebar em 1366 px; abrir gaveta em 390 px e navegar por teclado; com sidebar recolhida, usar a barra de território.
11. Abrir terminal com F2 e Ctrl+K em foco de input; usar `scope teresina`, `status`, `open educacao`, histórico e fechar com Escape.
12. Em touch, conferir inputs de 16 px, alvos de 44 px, tabelas em cards e terminal acompanhando redução de viewport.
13. Executar axe-core nas dez rotas em ambas as versões e revisar manualmente foco, ordem de leitura e nomes acessíveis.

## Limites

- Chromium emulado não substitui Safari/iOS físico, Android real, leitor de tela humano ou teste com teclado virtual do sistema. A lógica de `visualViewport` foi exercitada com redução de viewport emulada.
- Axe não certifica conformidade WCAG completa; contraste e tamanho também são cobertos por testes de contrato, mas interação humana continua necessária.
- Não há backend, autenticação, dados reais ou precisão cartográfica. Não usar esta base como sistema operacional de produção sem as camadas descritas em [arquitetura](architecture.md).
- Dados de educação e segurança são agregados sintéticos para design de produto. Não são censo escolar, estatística criminal, canal de denúncia, despacho ou indicador oficial de desempenho.
- A v4 não estava no checkout; não existe comparação de paridade com ela.
