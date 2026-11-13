import type {
  ActivityPeriod,
  ActivityPoint,
  Camera,
  CapitalZoneId,
  NetworkLink,
  OperationalEvent,
  Region,
  VehicleReading,
} from "./types";

export const TERESINA_SNAPSHOT_ISO = "2026-11-13T12:00:00.000Z";

export const capitalZones: Region[] = [
  {
    id: "centro",
    scope: "teresina",
    name: "Centro",
    reference: "Centro · Praça Pedro II",
    position: { x: 44, y: 44 },
  },
  {
    id: "norte",
    scope: "teresina",
    name: "Norte",
    reference: "Zona Norte · Av. Rui Barbosa",
    position: { x: 48, y: 20 },
  },
  {
    id: "sul",
    scope: "teresina",
    name: "Sul",
    reference: "Zona Sul · Parque Piauí",
    position: { x: 44, y: 74 },
  },
  {
    id: "leste",
    scope: "teresina",
    name: "Leste",
    reference: "Zona Leste · Av. João XXIII",
    position: { x: 72, y: 46 },
  },
  {
    id: "sudeste",
    scope: "teresina",
    name: "Sudeste",
    reference: "Sudeste · Dirceu",
    position: { x: 66, y: 70 },
  },
];

const zoneCameraNames: Record<CapitalZoneId, string[]> = {
  centro: [
    "Av. Frei Serafim",
    "Praça Pedro II",
    "Av. Marechal Castelo Branco",
    "Terminal Centro",
    "Av. Miguel Rosa",
    "Ponte Estaiada",
  ],
  norte: [
    "Av. Rui Barbosa",
    "Av. Nossa Senhora de Fátima",
    "Terminal Norte",
    "Av. Presidente Kennedy",
    "BR-343 · Saída norte",
  ],
  sul: [
    "Av. Henry Wall de Carvalho",
    "Parque Piauí",
    "Terminal Sul",
    "Av. Nações Unidas",
    "BR-316 · Acesso sul",
  ],
  leste: [
    "Av. João XXIII",
    "Av. Presidente Dutra",
    "Terminal Leste",
    "Av. Jockey Clube",
    "BR-316 · Entrada leste",
  ],
  sudeste: ["Av. Dirceu Arcoverde", "Terminal Sudeste", "Av. Joaquim Nelson", "BR-316 · Dirceu"],
};

const zoneCounts = [
  { id: "centro", count: 6 },
  { id: "norte", count: 5 },
  { id: "sul", count: 5 },
  { id: "leste", count: 5 },
  { id: "sudeste", count: 4 },
] as const;

export const teresinaCameras: Camera[] = zoneCounts.flatMap(({ id, count }, groupIndex) => {
  const offset = zoneCounts.slice(0, groupIndex).reduce((sum, zone) => sum + zone.count, 0);
  return Array.from({ length: count }, (_, localIndex): Camera => {
    const index = offset + localIndex;
    return {
      id: `TER-CAM-${String(index + 1).padStart(3, "0")}`,
      scope: "teresina",
      name: zoneCameraNames[id][localIndex] ?? `Corredor ${index + 1}`,
      region: id,
      status: index === 8 ? "maintenance" : index === 19 ? "offline" : "online",
      latency: 18 + ((index * 5) % 31),
      resolution: "1920 × 1080",
      fps: index % 2 === 0 ? 30 : 24,
      scene: localIndex % 4,
    };
  });
});

const eventTemplates = [
  {
    title: "Fluxo intenso em corredor central",
    category: "Trânsito",
    description:
      "Cenário sintético de fluxo em corredor de Teresina. Nenhuma leitura real de placa ou pessoa é utilizada.",
  },
  {
    title: "Sinal intermitente em terminal",
    category: "Infraestrutura",
    description:
      "Oscilação simulada em enlace de terminal urbano. Verifique latência, perda e redundância.",
  },
  {
    title: "Ocorrência integrada de segurança",
    category: "Segurança Pública",
    description:
      "Registro agregado sintético para triagem e despacho na capital. Não corresponde a ocorrência real.",
  },
  {
    title: "Conectividade escolar em zona urbana",
    category: "Educação",
    description:
      "Indicador agregado sintético de conectividade em escola municipal de referência. Sem dados de estudantes.",
  },
  {
    title: "Parada em corredor exclusivo",
    category: "Mobilidade",
    description:
      "Veículo fictício em corredor exclusivo de demonstração. Identificadores DEMO não são placas reais.",
  },
  {
    title: "Perímetro de equipamento público",
    category: "Perímetro",
    description:
      "Regra demonstrativa de perímetro em equipamento público sintético. Sem identificação de pessoas.",
  },
] as const;

export const teresinaEvents: OperationalEvent[] = Array.from({ length: 28 }, (_, index) => {
  const template = eventTemplates[index % eventTemplates.length]!;
  const camera = teresinaCameras[(index * 3) % teresinaCameras.length]!;
  return {
    id: `TER-EVT-${String(2048 - index)}`,
    scope: "teresina",
    ...template,
    severity: index < 3 ? "critical" : index < 10 ? "warning" : "info",
    status: index < 5 ? "open" : index < 9 ? "investigating" : "resolved",
    cameraId: camera.id,
    region: camera.region,
    timestamp: new Date(Date.parse(TERESINA_SNAPSHOT_ISO) - index * 6 * 60_000).toISOString(),
  };
});

export const teresinaVehicleReadings: VehicleReading[] = Array.from({ length: 16 }, (_, index) => {
  const camera = teresinaCameras[(index * 2) % teresinaCameras.length]!;
  return {
    id: `TER-LEI-${String(4084 - index)}`,
    scope: "teresina",
    vehicle: `DEMO-T${String(index + 1).padStart(4, "0")}`,
    type: (["Automóvel", "Motocicleta", "Ônibus", "Caminhão"] as const)[index % 4]!,
    cameraId: camera.id,
    region: camera.region,
    direction: index % 4 === 0 ? "Saída" : "Entrada",
    speed: 22 + ((index * 6) % 33),
    timestamp: new Date(Date.parse(TERESINA_SNAPSHOT_ISO) - index * 39_000).toISOString(),
    review: index === 1 || index === 6 || index === 11,
  };
});

const latencies = [22, 26, 31, 28, 35, 24, 41, 29, 33, 47, 27, 30];
export const teresinaNetworkLinks: NetworkLink[] = latencies.map((latency, index) => ({
  id: `TER-ENL-${String(index + 1).padStart(3, "0")}`,
  scope: "teresina",
  name: `${capitalZones[index % capitalZones.length]!.name} → Núcleo Capital ${index < 6 ? "01" : "02"}`,
  region: capitalZones[index % capitalZones.length]!.id,
  latency,
  loss: index === 9 ? 1.4 : Number(((index % 3) * 0.04).toFixed(2)),
  uptime: index === 9 ? 98.1 : Number((99.95 - (index % 4) * 0.03).toFixed(2)),
  status: index === 9 ? "degraded" : "healthy",
}));

const hourlyEvents = [6, 5, 9, 11, 16, 14, 21, 18, 26, 22, 24, 17, 20];
const hourlyPrevious = [5, 6, 7, 9, 12, 10, 16, 14, 19, 17, 18, 13, 16];
export const teresinaActivityByPeriod: Record<ActivityPeriod, ActivityPoint[]> = {
  "6h": hourlyEvents.slice(-7).map((events, index) => ({
    label: `${String(6 + index).padStart(2, "0")}:00`,
    events,
    previous: hourlyPrevious.slice(-7)[index]!,
  })),
  "24h": hourlyEvents.map((events, index) => ({
    label: `${String(index * 2).padStart(2, "0")}:00`,
    events,
    previous: hourlyPrevious[index]!,
  })),
  "7d": [118, 132, 127, 151, 143, 168, 181].map((events, index) => ({
    label: ["Sáb", "Dom", "Seg", "Ter", "Qua", "Qui", "Sex"][index]!,
    events,
    previous: [102, 116, 109, 128, 121, 140, 154][index]!,
  })),
};
