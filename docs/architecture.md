# Arquitetura

## Objetivo e escopo

Esta é uma base front-end de demonstração, criada porque o checkout recebido continha somente o README. A v4 não estava presente; portanto, não há alegação de paridade com funcionalidades desconhecidas. A organização favorece evolução incremental sem trocar a linguagem visual a cada entrega.

Stack: React + TypeScript estrito, Vite, React Router, Recharts, Lucide e CSS em camadas. Sem backend, telemetria, fontes remotas ou execução de comandos arbitrários.

## Responsabilidades

| Camada                  | Responsabilidade                            | Regra                                                                        |
| ----------------------- | ------------------------------------------- | ---------------------------------------------------------------------------- |
| `data/`                 | Tipos de domínio e fixtures determinísticos | Dados sintéticos explícitos; nenhuma chamada de rede escondida em componente |
| `lib/`                  | Funções puras e adaptadores de navegador    | CSV, busca, datas, validação de storage e agendamento de animação            |
| `state/`                | Preferências, alterações locais e overlays  | Persistência versionada e validada; ações tipadas                            |
| `components/ui/`        | Componentes reutilizáveis                   | Sem conhecimento de regras de negócio                                        |
| `components/<domínio>/` | Componentes de domínio                      | Recebem dados e usam ações dos providers                                     |
| `pages/`                | Composição, filtros e paginação             | Uma página por rota; sem CSS inline estático                                 |
| `styles/`               | Tokens e estilos por responsabilidade       | Variáveis semânticas; nenhuma cor funcional hardcoded fora dos tokens        |

## Estado

`WorkspaceProvider` mantém preferências, overrides de status e favoritos. O reducer aceita apenas identificadores conhecidos. `parseWorkspace` trata o storage como entrada não confiável e descarta versões/campos inválidos. Falhas de acesso ao storage não impedem o uso em memória.

`UiProvider` controla terminal, gaveta, detalhes e toast. Cada `Dialog` registra sua presença enquanto aberto; o fundo Matrix consulta essa contagem e pausa com qualquer diálogo nativo aberto. Ações de navegação fecham overlays concorrentes do shell.

## Navegação

Rotas: `/`, `/cameras`, `/eventos`, `/veiculos`, `/infraestrutura`, `/territorios`, `/analises`, `/preferencias`. Filtros de origem usam query string (`region`, `camera`, `status`) para serem compartilháveis. A hospedagem estática precisa devolver `index.html` para rotas desconhecidas; a aplicação então exibe seu 404 interno.

## Desktop e mobile

O breakpoint de navegação é 1024 px. O miolo usa container query `dashboard`, não apenas a largura da janela: uma sidebar recolhida altera o espaço real disponível. Tabelas viram cards quando o container fica abaixo de 700 px. O mapa é esquemático e nunca deve ser usado para decisão geográfica.

O terminal é um diálogo nativo. No mobile ocupa a altura de `visualViewport` (fallback `100dvh`), com saída `flex: 1`, `min-height: 0` e rolagem própria. Não há padding reservado no conteúdo quando ele está fechado.

## Desempenho

- Matrix: opt-in, apenas desktop com mouse, sem movimento reduzido; um loop limitado a 12,5 fps; pausa em aba oculta e overlays; colunas só são recriadas quando a largura muda.
- Câmeras: `IntersectionObserver` controla visibilidade; `ResizeObserver` dimensiona o canvas; DPR limitado a 1,5; um agendador compartilhado evita um RAF por card. Paginação limita o DOM a seis cards.
- Gráficos: animação desativada por preferência do usuário/sistema; dados também disponíveis em tabela.
- Fontes: apenas subconjunto Latin variável, auto-hospedado, com swap.

## Terminal

O parser separa nome e argumentos; o executor usa um switch fechado. Não existe `eval`, shell do sistema ou acesso à rede. Comandos: `help`, `status`, `cameras`, `events`, `favorites`, `open`, `theme`, `matrix`, `export`, `clear`. Histórico limitado a 50 entradas e saída a 200 linhas.

## Contribuição

1. Mantenha alterações pequenas e revise `git diff --check`.
2. Use tokens e componentes existentes antes de criar variantes.
3. Adicione testes para regras puras, contratos de acessibilidade e regressões.
4. Execute `npm run check` e `npm audit --audit-level=moderate`.
5. Verifique teclado, 320/390/1366 px, movimento reduzido e overlays antes de entregar.
6. Não adicione dados reais ao repositório. Integrações precisam de uma camada de API explícita e revisão de segurança/privacidade.
