import { ArrowLeft } from "lucide-react";
import { Link, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/app-layout";
import { AnalyticsPage } from "./pages/analytics";
import { CamerasPage } from "./pages/cameras";
import { EducationPage } from "./pages/education";
import { EventsPage } from "./pages/events";
import { NetworkPage } from "./pages/network";
import { OverviewPage } from "./pages/overview";
import { SecurityPage } from "./pages/security";
import { SettingsPage } from "./pages/settings";
import { TerritoriesPage } from "./pages/territories";
import { VehiclesPage } from "./pages/vehicles";

function NotFoundPage() {
  return (
    <div className="error-page">
      <p className="eyebrow">Erro 404</p>
      <h1>Esta rota não existe</h1>
      <p>Volte à visão geral para continuar explorando o território.</p>
      <Link className="button button--primary" to="/">
        <ArrowLeft size={16} />
        Voltar à visão geral
      </Link>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="cameras" element={<CamerasPage />} />
        <Route path="eventos" element={<EventsPage />} />
        <Route path="veiculos" element={<VehiclesPage />} />
        <Route path="infraestrutura" element={<NetworkPage />} />
        <Route path="territorios" element={<TerritoriesPage />} />
        <Route path="educacao" element={<EducationPage />} />
        <Route path="seguranca" element={<SecurityPage />} />
        <Route path="analises" element={<AnalyticsPage />} />
        <Route path="preferencias" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
