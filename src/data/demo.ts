import type {
  ActivityPeriod,
  ActivityPoint,
  Camera,
  NetworkLink,
  OperationalEvent,
  Region,
  RegionId,
  VehicleReading,
} from "./types";

/** Deterministic, entirely synthetic fixtures. Never replace these with production data in the UI. */
export const SNAPSHOT_ISO = "2026-11-13T12:00:00.000Z";

export const regions: Region[] = [
  {
    id: "capital",
    scope: "piaui",
    name: "Capital",
    reference: "Teresina",
    position: { x: 40, y: 31 },
  },
  {
    id: "norte",
    scope: "piaui",
    name: "Norte",
    reference: "Campo Maior",
    position: { x: 60, y: 23 },
  },
  {
    id: "litoral",
    scope: "piaui",
    name: "Litoral",
    reference: "Parnaíba",
    position: { x: 73, y: 10 },
  },
  {
    id: "centro",
    scope: "piaui",
    name: "Centro",
    reference: "Floriano · Picos",
    position: { x: 59, y: 53 },
  },
  { id: "sul", scope: "piaui", name: "Sul", reference: "Bom Jesus", position: { x: 51, y: 80 } },
];

const cameraNames: Record<RegionId, string[]> = {
  capital: [
    "Av. Frei Serafim",
    "Ponte Estaiada",
    "Av. João XXIII",
    "Centro · Praça Pedro II",
    "Av. Kennedy",
    "BR-316 · Entrada leste",
    "Av. Miguel Rosa",
    "Av. Presidente Dutra",
    "BR-343 · Acesso norte",
    "Av. Jockey Clube",
    "Terminal Centro",
    "Av. Marechal Castelo Branco",
  ],
  norte: [
    "BR-343 · Campo Maior",
    "Av. São Sebastião · Campo Maior",
    "Centro · Mercado Público",
    "BR-222 · Piripiri",
    "BR-222 · Altos",
    "Centro · Esperantina",
  ],
  litoral: [
    "Av. São Sebastião · Parnaíba",
    "Porto das Barcas",
    "BR-343 · Luís Correia",
    "Av. Presidente Médici",
  ],
  centro: [
    "Av. Getúlio Vargas · Floriano",
    "BR-315 · Picos",
    "BR-230 · Oeiras",
    "Centro · Valença",
    "BR-235 · São João do Piauí",
    "Centro · Simplício Mendes",
    "BR-316 · Fronteira",
  ],
  sul: [
    "BR-122 · São Raimundo",
    "BR-020 · Bom Jesus",
    "BR-407 · Paulistana",
    "BR-020 · Corrente",
    "Centro · Uruçuí",
    "BR-324 · Canto do Buriti",
    "Centro · Currais",
  ],
};

const regionCounts = [
  { id: "capital", count: 12 },
  { id: "norte", count: 6 },
  { id: "litoral", count: 4 },
  { id: "centro", count: 7 },
  { id: "sul", count: 7 },
] as const;

export const cameras: Camera[] = regionCounts.flatMap(({ id, count }, groupIndex) => {
  const offset = regionCounts.slice(0, groupIndex).reduce((sum, region) => sum + region.count, 0);
  return Array.from({ length: count }, (_, localIndex): Camera => {
    const index = offset + localIndex;
    return {
      id: `CAM-${String(index + 1).padStart(3, "0")}`,
      scope: "piaui",
      name: cameraNames[id][localIndex] ?? `Corredor ${index + 1}`,
      region: id,
      status: index === 17 ? "maintenance" : index === 26 ? "offline" : "online",
      latency: 24 + ((index * 7) % 39),
      resolution: "1920 × 1080",
      fps: index % 3 === 0 ? 30 : 24,
      scene: localIndex % 4,
    };
  });
});

const eventTemplates = [
  {
    title: "Fluxo acima do esperado",
    category: "Trânsito",
    description:
      "O cenário sintético registra um aumento de fluxo no corredor selecionado. Revise a prévia e o histórico antes de qualquer decisão.",
  },
  {
    title: "Sinal intermitente",
    category: "Infraestrutura",
    description:
      "Uma oscilação simulada foi registrada no enlace da câmera. Verifique os indicadores de latência e perda de pacotes.",
  },
  {
    title: "Movimento fora do padrão",
    category: "Perímetro",
    description:
      "Regra demonstrativa acionada por um movimento sintético. Este evento não corresponde a uma pessoa ou ocorrência real.",
  },
  {
    title: "Parada em corredor exclusivo",
    category: "Mobilidade",
    description:
      "Veículo fictício identificado em corredor exclusivo no conjunto de demonstração. Nenhuma placa real é utilizada.",
  },
  {
    title: "Conectividade escolar reduzida",
    category: "Educação",
    description:
      "Indicador agregado sintético de conectividade em unidade educacional de referência. Não há dados de estudantes.",
  },
  {
    title: "Ocorrência integrada de segurança",
    category: "Segurança Pública",
    description:
      "Registro agregado sintético para demonstrar triagem, despacho e acompanhamento. Não corresponde a ocorrência real.",
  },
] as const;

export const demoEvents: OperationalEvent[] = Array.from({ length: 30 }, (_, index) => {
  const template = eventTemplates[index % eventTemplates.length]!;
  const camera = cameras[(index * 5) % cameras.length]!;
  return {
    id: `EVT-${String(1048 - index)}`,
    scope: "piaui",
    ...template,
    severity: index < 3 ? "critical" : index < 11 ? "warning" : "info",
    status: index < 6 ? "open" : index < 10 ? "investigating" : "resolved",
    cameraId: camera.id,
    region: camera.region,
    timestamp: new Date(Date.parse(SNAPSHOT_ISO) - index * 7 * 60_000).toISOString(),
  };
});

export const vehicleReadings: VehicleReading[] = Array.from({ length: 18 }, (_, index) => {
  const camera = cameras[(index * 3) % cameras.length]!;
  return {
    id: `LEI-${String(2084 - index)}`,
    scope: "piaui",
    vehicle: `DEMO-${String(index + 1).padStart(4, "0")}`,
    type: (["Automóvel", "Motocicleta", "Ônibus", "Caminhão"] as const)[index % 4]!,
    cameraId: camera.id,
    region: camera.region,
    direction: index % 3 === 0 ? "Saída" : "Entrada",
    speed: 28 + ((index * 7) % 35),
    timestamp: new Date(Date.parse(SNAPSHOT_ISO) - index * 43_000).toISOString(),
    review: index === 2 || index === 7 || index === 13,
  };
});

const latencies = [28, 34, 41, 38, 52, 46, 39, 44, 31, 57, 48, 46, 36, 42, 50, 33];
export const networkLinks: NetworkLink[] = latencies.map((latency, index) => ({
  id: `ENL-${String(index + 1).padStart(3, "0")}`,
  scope: "piaui",
  name: `${regions[index % regions.length]!.reference.split(" · ")[0]} → Núcleo ${index < 8 ? "01" : "02"}`,
  region: regions[index % regions.length]!.id,
  latency,
  loss: index === 9 ? 1.8 : Number(((index % 4) * 0.03).toFixed(2)),
  uptime: index === 9 ? 97.4 : Number((99.9 - (index % 4) * 0.04).toFixed(2)),
  status: index === 9 ? "degraded" : "healthy",
}));

const hourlyEvents = [8, 6, 12, 9, 18, 14, 24, 20, 31, 23, 28, 18, 26];
const hourlyPrevious = [6, 8, 9, 7, 12, 11, 17, 15, 22, 18, 20, 15, 21];
export const activityByPeriod: Record<ActivityPeriod, ActivityPoint[]> = {
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
  "7d": [142, 168, 155, 192, 174, 209, 231].map((events, index) => ({
    label: ["Sáb", "Dom", "Seg", "Ter", "Qua", "Qui", "Sex"][index]!,
    events,
    previous: [128, 144, 136, 162, 158, 177, 195][index]!,
  })),
};

export const getRegion = (id: string) => regions.find((region) => region.id === id);
export const getCamera = (id: string) => cameras.find((camera) => camera.id === id);
export const averageLatency = Math.round(
  networkLinks.reduce((sum, link) => sum + link.latency, 0) / networkLinks.length,
);
export const onlineCameras = cameras.filter((camera) => camera.status === "online").length;
export const cameraAvailability = ((onlineCameras / cameras.length) * 100)
  .toFixed(1)
  .replace(".", ",");
