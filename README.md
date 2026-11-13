# S.P.I.A. · Inteligência territorial do Piauí

Base **v5 de consolidação** para um painel operacional demonstrativo: identidade visual estável, leitura progressiva, acessibilidade e layout responsivo antes de novas integrações.

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

O site é publicado pelo workflow **Publish site** no GitHub Pages:

**https://tgmidasx7.github.io/xPiauiAnaliticsX7/**

O workflow gera o build com `VITE_BASE_PATH=/xPiauiAnaliticsX7/` e `VITE_STATIC_HOST=true`. Nesse modo a navegação usa hash (`/#/cameras`), para que links internos e recarregamentos funcionem sem regras de rewrite no servidor. O preview local continua usando rotas normais em `/`.

Para reproduzir o build público localmente:

```bash
VITE_BASE_PATH=/xPiauiAnaliticsX7/ VITE_STATIC_HOST=true npm run build
VITE_BASE_PATH=/xPiauiAnaliticsX7/ VITE_STATIC_HOST=true npm run preview
```

Em outra hospedagem estática com fallback para `index.html`, basta não definir `VITE_STATIC_HOST`; ajuste `VITE_BASE_PATH` apenas quando o site for servido em um subcaminho.

## O que está disponível

- **Visão geral:** um KPI primário, três secundários, indicadores adicionais sob demanda, gráfico com períodos e tabela acessível, cobertura regional e saúde da infraestrutura.
- **Câmeras:** 36 registros sintéticos, busca sem acentos, filtros, favoritos locais, grade/lista, paginação e detalhes. Prévias são esquemas locais, não vídeo.
- **Eventos:** filtros por status/severidade/região/câmera, análise e resolução persistidas apenas no navegador.
- **Veículos:** leituras com identificadores `DEMO-*`, filtros e exportação; nenhuma placa real.
- **Infraestrutura:** enlaces, latência, perda, disponibilidade e filtros.
- **Territórios e análises:** mapa esquemático explicitamente não cartográfico, comparação regional e distribuição de severidade.
- **Preferências:** três acentos, densidade, menu recolhido, movimento reduzido, textura Matrix opcional e restauração do padrão.
- **Terminal local:** `F2` ou `Ctrl+K` (`Cmd+K` também funciona), `Esc` para fechar, histórico com setas e comandos sem `eval`. Digite `help`.
- **Exportação CSV:** UTF-8 com BOM, separador `;`, aspas escapadas e neutralização de fórmulas de planilha.

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
  data/                   tipos e fixtures sintéticos determinísticos
  hooks/                  assinaturas de media queries
  lib/                    CSV, formatação, persistência e animação
  pages/                  uma página por área funcional
  state/                  preferências, dados locais e overlays
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

Não versionar dados reais, credenciais ou gravações. `src/data/demo.ts` é a fronteira atual de dados; uma integração futura exige contrato de API, autenticação/autorização no servidor, minimização de dados, auditoria e revisão de privacidade. O painel atual **não deve ser apresentado como sistema operacional em produção**.

Preferências, favoritos e alterações de eventos usam `localStorage` com chave versionada `spia:workspace:v1`. Payloads inválidos são descartados. Isso não é autenticação nem armazenamento seguro de dados sensíveis.

## Dependências

O lockfile é versionado e o CI usa `npm ci`. Há um override documentado de `minimatch` para manter a cadeia do ESLint em uma versão sem o aviso de amplificação de glob; a suíte de lint é executada após a atualização. Fontes e ícones são empacotados localmente, sem requisições a CDNs em execução.
