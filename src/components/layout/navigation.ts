import {
  Bell,
  CarFront,
  Cctv,
  ChartColumn,
  LayoutDashboard,
  Map,
  Network,
  Settings2,
} from "lucide-react";

export const navigation = [
  { path: "/", label: "Visão geral", icon: LayoutDashboard, group: "Operação" },
  { path: "/cameras", label: "Câmeras", icon: Cctv, group: "Operação" },
  { path: "/eventos", label: "Eventos", icon: Bell, group: "Operação" },
  { path: "/veiculos", label: "Veículos", icon: CarFront, group: "Operação" },
  { path: "/infraestrutura", label: "Infraestrutura", icon: Network, group: "Operação" },
  { path: "/territorios", label: "Territórios", icon: Map, group: "Inteligência" },
  { path: "/analises", label: "Análises", icon: ChartColumn, group: "Inteligência" },
  { path: "/preferencias", label: "Preferências", icon: Settings2, group: "Sistema" },
] as const;
