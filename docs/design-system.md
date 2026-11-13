# Design system · S.P.I.A. v5

## Direção

Fundo quase-preto fosco, uma cor de acento dessaturada, superfícies opacas, espaço negativo e densidade progressiva. A referência é a clareza de produtos analíticos profissionais, não efeitos de neon. Matrix é textura opcional de ambientação, nunca conteúdo nem fundo de tabela.

## Tokens

Fonte única: `src/styles/tokens.css`. Todas as cores funcionais têm valor hexadecimal e componente RGB para transparências (`rgb(var(--token-rgb) / alpha)`). Não usar `rgba(84,255,152,...)` ou equivalentes hardcoded.

| Papel            | Token                    | Valor     | Uso                                                   |
| ---------------- | ------------------------ | --------- | ----------------------------------------------------- |
| Fundo            | `--color-background`     | `#0b1110` | página e campos                                       |
| Superfície       | `--color-surface`        | `#121c18` | painéis opacos                                        |
| Elevação         | `--color-surface-raised` | `#19251f` | cabeçalhos, seleção, tooltip                          |
| Texto            | `--color-text`           | `#e4eee8` | conteúdo principal; não usar branco puro              |
| Texto secundário | `--color-text-muted`     | `#a4b7ab` | descrições e rótulos                                  |
| Texto auxiliar   | `--color-text-subtle`    | `#91a89a` | metadados; mínimo 11 px                               |
| Marca            | `--color-accent`         | `#79d4b0` | navegação, foco, ações e série principal              |
| Sucesso          | `--color-success`        | `#7bd49a` | disponível/resolvido/saudável, sempre com ícone/texto |
| Atenção          | `--color-warning`        | `#e6bf7c` | manutenção/degradado/revisar                          |
| Crítico          | `--color-danger`         | `#f2939c` | offline/crítico, sem pulsação                         |
| Informação       | `--color-info`           | `#83cbdc` | informação e contexto de veículo/rede                 |
| Análise          | `--color-analytics`      | `#baa7e0` | reservado a comparações analíticas                    |

Temas `verde`, `ciano` e `âmbar` alteram apenas marca/ação/foco. Estados semânticos não mudam. Cor nunca é o único sinal: badges combinam ícone e texto; seleção de mapa usa `aria-pressed`, foco usa `:focus-visible`.

Contraste calculado para texto auxiliar sobre a superfície mais clara (`--color-surface-hover`): **5,47:1**. Texto principal sobre fundo: **16,06:1**. Os testes verificam AA para textos, estados e os três acentos sobre as quatro superfícies; a validação de navegador também verifica componentes renderizados.

## Tipografia

- Interface: **Inter Variable**, auto-hospedada, pesos 100–900.
- Dados/comandos: **JetBrains Mono Variable**, auto-hospedada, números tabulares.
- `font-display: swap`; fallback system-ui/monospace sem depender de CDN.
- Escala: 11 px metadados, 13 px controles/descrições, 14 px corpo, 16 px painéis, 18 px diálogos, 22 px métricas secundárias, 24–32 px título de página.
- Um único `h1` por página. Topbar usa texto de navegação, não um segundo título.
- Inputs em touch: **16 px**, inclusive terminal, para evitar zoom automático do iOS.

## Espaçamento, grid e formas

Escala de 4 px: 4, 8, 12, 16, 20, 24, 32, 40, 48. Raios 6/10/14 px e pill apenas onde faz sentido. Sombras restritas a overlays; sem glow em logo, bordas ou indicadores.

- Sidebar desktop: 236 px, recolhida 76 px, altura `100dvh`, rolagem interna quando as dez abas não cabem. Seletor territorial no menu; barra compacta no mobile e fallback visível quando a sidebar está recolhida.
- Navegação mobile: gaveta nativa até 300 px; topbar compacta.
- Container `dashboard`: duas colunas quando há pelo menos 860 px úteis.
- Tabelas: cards abaixo de 700 px de container.
- Câmeras: grade fluida `minmax(250px, 1fr)`, lista explícita e seis itens por página.
- Gráfico: `clamp(230px, 25vw, 360px)`.
- Alvos interativos em touch: mínimo 44 × 44 px.

## Componentes e convenções

CSS legível em camadas: `tokens → base → layout → components → pages → utilities → responsive`. Nomes descritivos por bloco (`camera-card`, `panel-header`, `terminal-output`), modificadores `--` (`button--primary`, `badge--warning`) e utilitários explícitos (`u-mt-4`, `sr-only`). Estados usam atributos ARIA/nativos em vez de classes crípticas.

Componentes-base: `PageHeader`, `Panel`, `Badge`, `Button` por classe, `SegmentedControl`, `SearchField`, `DataTable`, `Pagination`, `Dialog`, `Switch`, `Toast`, `SummaryStrip`, `ProgressList`, `InsightPanel`, `DefinitionGrid`, `ContextNote`. Ícones são SVG Lucide; ícones decorativos têm `aria-hidden`. Posicionamento geométrico do mapa é a exceção explícita para estilos calculados em JS; não usar estilos inline estáticos.

## Movimento

`prefers-reduced-motion` tem prioridade sobre a preferência local. Sem animação infinita de alerta. Matrix e movimento de câmeras são desligados em touch; Matrix também exige opt-in no desktop. Qualquer diálogo aberto pausa o fundo. Aba oculta cancela os loops.

## Demonstração e proveniência

Um badge global persistente identifica o ambiente. As camadas EdTech e segurança repetem apenas salvaguardas específicas necessárias ao contexto, sem multiplicar banners genéricos. Rótulos específicos permanecem onde há risco de interpretação incorreta: “Prévia sintética” nas câmeras, “sem precisão cartográfica” no mapa e identificadores `DEMO-*` em veículos. Não multiplicar banners genéricos de demonstração pela interface.
