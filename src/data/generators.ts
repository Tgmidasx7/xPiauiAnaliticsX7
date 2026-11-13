import type {
  AreaId,
  EducationProgram,
  EducationUnit,
  Region,
  ScopeId,
  SecurityOccurrence,
  SecurityProgram,
  SecurityUnit,
} from "./types";

const stages = ["Infantil", "Fundamental", "Médio", "EJA", "Técnico"] as const;
const connectivityKinds = ["fiber", "radio", "satellite", "offline"] as const;

export function buildEducationUnits(
  scope: ScopeId,
  areas: Region[],
  count: number,
): EducationUnit[] {
  const prefix = scope === "piaui" ? "EDU" : "TER-EDU";
  return Array.from({ length: count }, (_, index) => {
    const area = areas[index % areas.length]!;
    const connectivity =
      connectivityKinds[index % 11 === 0 ? 3 : index % 5 === 0 ? 1 : index % 7 === 0 ? 2 : 0]!;
    const devicesTotal = 36 + ((index * 9) % 64);
    const devicesAvailable = Math.max(
      8,
      Math.round(devicesTotal * (connectivity === "offline" ? 0.42 : 0.72 + (index % 5) * 0.05)),
    );
    return {
      id: `${prefix}-${String(index + 1).padStart(3, "0")}`,
      scope,
      name: `${scope === "piaui" ? "Unidade Escolar" : "Escola Municipal"} ${area.name} ${String((index % 9) + 1).padStart(2, "0")}`,
      areaId: area.id as AreaId,
      stage: stages[index % stages.length]!,
      connectivity,
      bandwidthMbps:
        connectivity === "fiber"
          ? 100 + ((index * 17) % 400)
          : connectivity === "radio"
            ? 20 + ((index * 7) % 60)
            : connectivity === "satellite"
              ? 10 + ((index * 5) % 30)
              : 0,
      devicesAvailable,
      devicesTotal,
      labs: connectivity === "offline" ? 0 : 1 + (index % 3),
      teachersTrained: 6 + ((index * 4) % 28),
      platformUsage: connectivity === "offline" ? 12 + (index % 18) : 48 + ((index * 11) % 50),
      status:
        connectivity === "offline" || devicesAvailable / devicesTotal < 0.55
          ? "critical"
          : connectivity !== "fiber" || devicesAvailable / devicesTotal < 0.75
            ? "attention"
            : "ok",
    };
  });
}

export function buildEducationPrograms(scope: ScopeId, unitCount: number): EducationProgram[] {
  const prefix = scope === "piaui" ? "EDU-PROG" : "TER-EDU-PROG";
  const templates = [
    {
      name: "Conectividade Escolar",
      focus: "Fibra, rádio e satélite com monitoramento agregado",
      status: "on-track",
    },
    {
      name: "Formação Docente Digital",
      focus: "Trilhas de competência digital para educadores",
      status: "on-track",
    },
    {
      name: "Laboratórios Maker",
      focus: "Espaços de prototipagem e aprendizagem ativa",
      status: "attention",
    },
    {
      name: "Plataforma de Aprendizagem",
      focus: "Uso de recursos digitais e acompanhamento pedagógico",
      status: "on-track",
    },
    {
      name: "Cidadania Digital",
      focus: "Segurança online, privacidade e uso responsável",
      status: "expanding",
    },
    {
      name: "Gestão de Dados Educacionais",
      focus: "Indicadores agregados sem dados pessoais de estudantes",
      status: "planned",
    },
  ] as const;
  return templates.map((template, index) => ({
    id: `${prefix}-${String(index + 1).padStart(2, "0")}`,
    scope,
    name: template.name,
    focus: template.focus,
    units: Math.max(4, Math.round(unitCount * (0.35 + index * 0.09))),
    educators: 24 + index * 18,
    completion: template.status === "planned" ? 12 : 46 + ((index * 13) % 48),
    status: template.status === "expanding" ? "attention" : template.status,
  }));
}

const natures = ["Patrimonial", "Trânsito", "Violência", "Apoio", "Prevenção"] as const;
const securityStatuses = ["registered", "dispatched", "on-scene", "closed"] as const;
const unitTypes = [
  "Policiamento",
  "Trânsito",
  "Defesa Civil",
  "Guarda Municipal",
  "Bombeiros",
] as const;

export function buildSecurityOccurrences(
  scope: ScopeId,
  areas: Region[],
  count: number,
  snapshotIso: string,
): SecurityOccurrence[] {
  const prefix = scope === "piaui" ? "SEG" : "TER-SEG";
  return Array.from({ length: count }, (_, index) => {
    const area = areas[(index * 2) % areas.length]!;
    const status =
      securityStatuses[index % 7 === 0 ? 0 : index % 5 === 0 ? 1 : index % 3 === 0 ? 2 : 3]!;
    return {
      id: `${prefix}-${String(3000 - index)}`,
      scope,
      nature: natures[index % natures.length]!,
      areaId: area.id as AreaId,
      severity: index < 3 ? "critical" : index < 10 ? "warning" : "info",
      status,
      timestamp: new Date(Date.parse(snapshotIso) - index * 11 * 60_000).toISOString(),
      responseMinutes: status === "registered" ? 0 : 6 + ((index * 5) % 23),
      unitsAssigned: status === "registered" ? 0 : 1 + (index % 3),
      description: `Registro sintético de ${natures[index % natures.length]!.toLowerCase()} em área de referência. Nenhum dado pessoal ou ocorrência real é representado.`,
    };
  });
}

export function buildSecurityUnits(scope: ScopeId, areas: Region[], count: number): SecurityUnit[] {
  const prefix = scope === "piaui" ? "SEG-UN" : "TER-SEG-UN";
  return Array.from({ length: count }, (_, index) => {
    const area = areas[index % areas.length]!;
    return {
      id: `${prefix}-${String(index + 1).padStart(3, "0")}`,
      scope,
      name: `${scope === "piaui" ? "Unidade Integrada" : "Base Operacional"} ${area.name} ${String((index % 4) + 1).padStart(2, "0")}`,
      type: unitTypes[index % unitTypes.length]!,
      areaId: area.id as AreaId,
      status: index % 9 === 0 ? "maintenance" : index % 4 === 0 ? "busy" : "available",
      personnel: 8 + ((index * 3) % 18),
      vehicles: 2 + (index % 5),
    };
  });
}

export function buildSecurityPrograms(scope: ScopeId): SecurityProgram[] {
  const prefix = scope === "piaui" ? "SEG-PROG" : "TER-SEG-PROG";
  const templates = [
    {
      name: "Prevenção Territorial",
      focus: "Ações presenciais e leitura de contexto por área",
      status: "active",
    },
    {
      name: "Integração de Câmeras",
      focus: "Corredores, eventos e disponibilidade de vídeo sintético",
      status: "active",
    },
    {
      name: "Resposta Rápida",
      focus: "Triagem, despacho e tempo de resposta agregado",
      status: "expanding",
    },
    {
      name: "Segurança Escolar",
      focus: "Entorno de unidades educacionais e rotas seguras",
      status: "active",
    },
    {
      name: "Defesa Civil",
      focus: "Alertas, apoio e monitoramento de riscos sintéticos",
      status: "expanding",
    },
    {
      name: "Dados para Prevenção",
      focus: "Indicadores agregados sem identificação de pessoas",
      status: "planned",
    },
  ] as const;
  return templates.map((template, index) => ({
    id: `${prefix}-${String(index + 1).padStart(2, "0")}`,
    scope,
    name: template.name,
    focus: template.focus,
    actions: 12 + index * 9,
    coverage: template.status === "planned" ? 18 : 42 + ((index * 12) % 52),
    status: template.status,
  }));
}
