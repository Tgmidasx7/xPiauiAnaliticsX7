import type {
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
  { id: "capital", name: "Capital", reference: "Teresina", position: { x: 40, y: 31 } },
  { id: "norte", name: "Norte", reference: "Campo Maior", position: { x: 60, y: 23 } },
  { id: "litoral", name: "Litoral", reference: "Parnaíba", position: { x: 73, y: 10 } },
  { id: "centro", name: "Centro", reference: "Floriano · Picos", position: { x: 59, y: 53 } },
  { id: "sul", name: "Sul", reference: "Bom Jesus", position: { x: 51, y: 80 } },
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
] as const;

export const demoEvents: OperationalEvent[] = Array.from({ length: 24 }, (_, index) => {
  const template = eventTemplates[index % eventTemplates.length]!;
  const camera = cameras[(index * 5) % cameras.length]!;
  return {
    id: `EVT-${String(1048 - index)}`,
    ...template,
    severity: index < 3 ? "critical" : index < 10 ? "warning" : "info",
    status: index < 5 ? "open" : index < 8 ? "investigating" : "resolved",
    cameraId: camera.id,
    region: camera.region,
    timestamp: new Date(Date.parse(SNAPSHOT_ISO) - index * 7 * 60_000).toISOString(),
  };
});

export const vehicleReadings: VehicleReading[] = Array.from({ length: 12 }, (_, index) => {
  const camera = cameras[(index * 3) % cameras.length]!;
  return {
    id: `LEI-${String(2084 - index)}`,
    vehicle: `DEMO-${String(index + 1).padStart(4, "0")}`,
    type: (["Automóvel", "Motocicleta", "Ônibus", "Caminhão"] as const)[index % 4]!,
    cameraId: camera.id,
    region: camera.region,
    direction: index % 3 === 0 ? "Saída" : "Entrada",
    speed: 28 + ((index * 7) % 35),
    timestamp: new Date(Date.parse(SNAPSHOT_ISO) - index * 43_000).toISOString(),
    review: index === 2 || index === 7,
  };
});

const latencies = [28, 34, 41, 38, 52, 46, 39, 44, 31, 57, 48, 46];
export const networkLinks: NetworkLink[] = latencies.map((latency, index) => ({
  id: `ENL-${String(index + 1).padStart(3, "0")}`,
  name: `${regions[index % regions.length]!.reference.split(" · ")[0]} → Núcleo ${index < 6 ? "01" : "02"}`,
  region: regions[index % regions.length]!.id,
  latency,
  loss: index === 9 ? 1.8 : Number(((index % 4) * 0.03).toFixed(2)),
  uptime: index === 9 ? 97.4 : Number((99.9 - (index % 4) * 0.04).toFixed(2)),
  status: index === 9 ? "degraded" : "healthy",
}));

const hourlyEvents = [8, 6, 12, 9, 18, 14, 24, 20, 31, 23, 28, 18, 26];
const hourlyPrevious = [6, 8, 9, 7, 12, 11, 17, 15, 22, 18, 20, 15, 21];
export const activityByPeriod: Record<"6h" | "24h" | "7d", ActivityPoint[]> = {
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
