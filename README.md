# S.P.I.A. · Inteligência territorial do Piauí

Base **v5 de consolidação** para um painel operacional demonstrativo em **duas versões territoriais paralelas — Piauí e Teresina Capital**. Dez abas, camadas de operação, EdTech e segurança pública, identidade visual estável, leitura progressiva e acessibilidade antes de novas integrações.

> **Estado real do repositório:** o checkout inicial continha apenas um README. Esta entrega cria uma base nova e organizada; não é uma migração da v4, cujo código não estava disponível. Todos os dados e prévias são sintéticos. Não há backend, autenticação, câmeras reais ou integração operacional.

## Começar

Requisitos: **Node.js 22.12+** e **npm 10+**.

```bash
npm ci
npm run dev
```

O Vite escuta em `0.0.0.0:5173`, inclusive para previews remotos. A aplicação usa rotas de SPA; em produção, configure fallback para `index.html`.

```bash
npm run check      # formatação, tipos, lint, testes e build
npm run build      # gera dist/
npm run preview    # serve o build em 0.0.0.0:4173
npm audit --audit-level=moderate
```

Scripts individuais: `typecheck`, `lint`, `test`, `test:watch`, `format`, `format:check`.

## Publicação

Site no ar em:

**https://tgmidasx7.github.io/xPiauiAnaliticsX7/**

O site publicado é o `index.html` estático da raiz — o código do **APP PIAUI ANALITICS** (`app-piaui-analitcs2026`): dashboard "Piauí Teresina Analytics" em arquivo único (HTML/CSS/JS), com gráficos Chart.js via CDN e fontes do Google Fonts. Por ser um único arquivo, sem build e sem caminhos absolutos, ele funciona tanto na publicação por branch do GitHub Pages quanto no workflow **Publish site** (que apenas copia o arquivo para o artefato).

A implementação React em `src/` (S.P.I.A. v5, com testes) permanece no repositório como base de desenvolvimento; `npm run build` gera um `dist/index.html` equivalente para prévia local. Para desenvolvimento local, use `npm run dev` ou `npm run preview`.

> Correção de página em branco: o GitHub Pages deste repositório serve a raiz do branch (fonte _legacy_), não o artefato do Actions. Como o `index.html` anterior era a entrada do Vite (referenciando `/src/main.tsx`), o navegador recebia TypeScript e a página ficava em branco. Com o app em arquivo único na raiz, a página carrega em qualquer modo de publicação.

## O que está disponível

- **Versões paralelas:** seletor Piauí/Teresina Capital no menu e em barra compacta no mobile; a query `?territorio=teresina` preserva a aba e limpa filtros de área ao trocar. Cada versão tem inventário, métricas e briefing próprios.
- **Visão geral:** KPI primário, secundários, indicadores adicionais de rede/educação/segurança, gráfico com períodos e tabela acessível, mapa esquemático, pulso por área e leitura orientada do snapshot.
- **Câmeras:** 36 registros estaduais e 25 municipais, busca sem acentos, filtros, favoritos locais, grade/lista, paginação, detalhes, disponibilidade por área e fila de manutenção. Prévias são esquemas locais, não vídeo.
- **Eventos:** 30 registros estaduais e 28 municipais; filtros por status/severidade/categoria/área/câmera, análise e resolução persistidas apenas no navegador, distribuições e fluxo de tratamento.
- **Veículos:** leituras com identificadores `DEMO-*`, filtros por tipo/direção/área/revisão, exportação, composição da amostra e entradas/saídas por área; nenhuma placa real.
- **Infraestrutura:** enlaces, latência, perda, disponibilidade, filtros, leitura por área e enlaces degradados.
- **Territórios:** mapa esquemático explicitamente não cartográfico, tabela comparativa e perfis por área com vídeo, eventos, escolas, bases e ocorrências.
- **Educação · EdTech:** 40 unidades estaduais e 30 municipais; conectividade, banda, dispositivos, laboratórios, formação docente, uso de plataforma, prioridade, programas e salvaguardas de privacidade.
- **Segurança pública:** 42 ocorrências estaduais e 36 municipais; ciclo registrado/despachado/atendimento/encerrado, bases integradas, resposta por área, programas e protocolo de leitura responsável. Não é canal de emergência.
- **Análises:** matriz comparativa por área cruzando operação, EdTech e segurança, distribuições, perguntas de trabalho e notas de método.
- **Preferências:** três acentos, densidade, menu recolhido, movimento reduzido, Matrix opcional, restauração, estado local e governança da demonstração.
- **Terminal local:** `F2` ou `Ctrl+K` (`Cmd+K` também funciona), `Esc`, histórico com setas, comandos sem `eval`, incluindo `scope`, `open educacao`, `open seguranca` e exportações por camada. Digite `help`.
- **Exportação CSV:** UTF-8 com BOM, separador `;`, aspas escapadas, neutralização de fórmulas e nome de arquivo por território/camada.

## Fundamentos da v5

- superfícies escuras **opacas e foscas**; Matrix desligado por padrão e restrito a desktop com mouse;
- tokens centralizados, cor de marca separada dos estados semânticos e contraste AA testado;
- Inter + JetBrains Mono auto-hospedadas com `font-display: swap`;
- ícones SVG, tabelas com caption/scope e fallback em cards, diálogos nativos com foco contido;
- inputs de **16 px em touch**, controles interativos de pelo menos **44 px** e texto mínimo de **11 px**;
- sidebar recolhível no desktop, gaveta no mobile e topbar compacta;
- terminal mobile em viewport dinâmico, com saída rolável e acompanhamento de `visualViewport`;
- câmeras desenhadas apenas quando visíveis, em um agendador compartilhado de 12,5 fps; aba oculta interrompe o trabalho;
- respeito a `prefers-reduced-motion`, sem brilho/neon competindo com os dados.

## Estrutura

```text
src/
  app.tsx                 composição de rotas
  main.tsx                inicialização e providers
  components/
    cameras/              prévias, cards e detalhe
    events/               tabela e detalhe
    layout/               shell, navegação e fundo opcional
    overview/             KPIs, gráfico, mapa e saúde
    terminal/             console local e parser
    ui/                   componentes reutilizáveis
  data/                   tipos, datasets Piauí/Teresina e geradores sintéticos determinísticos
  hooks/                  assinaturas de media queries
  lib/                    CSV, formatação, persistência e animação
  pages/                  uma página por área funcional
  state/                  escopo territorial, preferências, dados locais e overlays
  styles/                 tokens, base, layout, componentes, páginas e responsivo
  test/                   setup e testes de contrato visual
public/                   favicon
.github/workflows/        CI de qualidade
docs/                     arquitetura, design system, auditoria e validação
```

## Documentação

- [Arquitetura e contribuição](docs/architecture.md)
- [Design system](docs/design-system.md)
- [Resposta à auditoria](docs/audit-resolution.md)
- [Validação e limites](docs/quality.md)

## Dados e segurança

Não versionar dados reais, credenciais ou gravações. `src/data/` (`demo.ts`, `teresina.ts`, `generators.ts`, `index.ts`) é a fronteira atual de dados; uma integração futura exige contrato de API, autenticação/autorização no servidor, minimização de dados, auditoria e revisão de privacidade. O painel atual **não deve ser apresentado como sistema operacional em produção**.

Preferências, favoritos e alterações de eventos usam `localStorage` com chave versionada `spia:workspace:v1`. IDs estaduais e municipais são distintos; favoritos/overrides são validados contra o inventário conjunto, mas cada tela exibe apenas o território ativo. Payloads inválidos são descartados. Isso não é autenticação nem armazenamento seguro de dados sensíveis.

## Dependências

O lockfile é versionado e o CI usa `npm ci`. Há um override documentado de `minimatch` para manter a cadeia do ESLint em uma versão sem o aviso de amplificação de glob; a suíte de lint é executada após a atualização. Fontes e ícones são empacotados localmente, sem requisições a CDNs em execução.
