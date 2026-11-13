# Resposta à auditoria

## Premissa

A auditoria descreve uma v4 que não existe neste checkout. Os itens abaixo foram implementados **na base nova**, não aplicados como patch sobre código ausente. Funcionalidades não descritas da v4 não puderam ser preservadas nem comparadas.

## P0

| Item                                  | Tratamento nesta base                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 7.1 Atalho incompatível com ABNT2     | `F2`, `Ctrl+K` e `Cmd+K`; tecla morta não abre terminal; teste de regressão                                |
| 6.1 Zoom de input no iOS              | 16 px em `pointer: coarse`, incluindo terminal                                                             |
| 6.2 Terminal com teclado virtual      | Diálogo mobile em `visualViewport`/`100dvh`, saída flexível rolável, input e ações fora da área de rolagem |
| 3.1 Matrix contínuo                   | Desligado por padrão em todos os dispositivos; opt-in apenas desktop/mouse; pausa em overlays e aba oculta |
| 2.1 / 4.2 Contraste e texto minúsculo | Tokens recalculados; mínimo 11 px; testes de contraste e tamanho                                           |

## P1

| Item                             | Tratamento nesta base                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| 2.4 / 5.4 Tokens incompletos     | Tokens hex + RGB para marca, estados, superfícies e texto; temas não alteram semântica |
| 2.2 Marca confundida com sucesso | Acento de marca separado de sucesso; badges sempre com ícone e texto                   |
| 4.3 Fontes não garantidas        | Inter e JetBrains Mono variáveis auto-hospedadas, `font-display: swap`                 |
| 4.4 Glifos de interface          | Ícones SVG Lucide; decorativos ocultos de leitores de tela                             |
| 6.5 / 7.2 Navegação densa/fixa   | Sidebar 236/76 px, gaveta mobile, topbar com poucos controles e badge compacto         |
| 6.3 Alvos pequenos               | 44 px mínimos em touch para botões, segmentos, links de ação e comandos rápidos        |

## P2

| Item                    | Tratamento nesta base                                                        |
| ----------------------- | ---------------------------------------------------------------------------- |
| 4.5 KPIs sem hierarquia | Um primário, três secundários e quatro indicadores adicionais sob demanda    |
| 6.6 Tabelas largas      | Cards semânticos abaixo de 700 px de container; cabeçalhos sticky no desktop |
| 6.4 Canvas fora da tela | IntersectionObserver + agendador único + paginação; sem RAF por card         |
| 5.1 / 5.2 CSS ilegível  | Arquivos formatados, camadas e nomes descritivos; Prettier no CI             |
| 4.6 Avisos repetidos    | Um badge global; apenas rótulos de proveniência específicos permanecem       |

## Outros achados contemplados

- Superfícies opacas, sem blur de topbar e sem três camadas de glow.
- Alertas não pulsam; movimento reduzido cobre gráficos, prévias e transições.
- `h1` maior que títulos de seção; topbar não duplica o título da página.
- Diálogos com corpo rolável, fechamento por backdrop/Escape e foco contido nativo.
- Gráfico escala com `clamp()` e oferece tabela alternativa.
- Mapa esquemático assume a falta de precisão cartográfica; seleção não depende de outline.
- Tabelas têm caption e scope; canvases têm nome acessível e alternativa textual.
- CSV neutraliza fórmulas e escapa campos.

## Limites conscientes

- Não há vídeo real, API, autenticação, autorização, trilha de auditoria de servidor ou integração operacional.
- Não foi possível validar paridade com a v4 ausente.
- Safari/iOS físico e teclado virtual real ainda precisam de teste em dispositivo; a lógica e o viewport foram verificados em Chromium emulado.
- O mapa não é uma base cartográfica oficial.
