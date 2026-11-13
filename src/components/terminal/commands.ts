export interface ParsedCommand {
  name: string;
  args: string[];
}
export function parseCommand(input: string): ParsedCommand {
  const [name = "", ...args] = input.trim().split(/\s+/);
  return { name: name.toLowerCase(), args };
}

export const commandHelp = [
  "help                  Lista de comandos",
  "status                Indicadores do território ativo",
  "scope [piaui|teresina]  Consulta ou troca a versão territorial",
  "cameras [busca]        Até 6 câmeras correspondentes",
  "events                Até 6 eventos pendentes",
  "favorites             Câmeras favoritas",
  "open <rota>           overview | cameras | eventos | veiculos | rede | territorios | educacao | seguranca | analises | preferencias",
  "theme <nome>          verde | ciano | ambar",
  "matrix <on|off>        Textura ambiente (somente desktop)",
  "export <events|cameras|education|security>  Exporta CSV sintético do território",
  "clear                 Limpa a saída",
].join("\n");

const routes: Record<string, string> = {
  overview: "/",
  inicio: "/",
  "visao-geral": "/",
  cameras: "/cameras",
  eventos: "/eventos",
  veiculos: "/veiculos",
  rede: "/infraestrutura",
  infraestrutura: "/infraestrutura",
  territorios: "/territorios",
  educacao: "/educacao",
  education: "/educacao",
  seguranca: "/seguranca",
  security: "/seguranca",
  analises: "/analises",
  preferencias: "/preferencias",
  settings: "/preferencias",
};
export const resolveRoute = (name: string) => routes[name.toLowerCase()];
