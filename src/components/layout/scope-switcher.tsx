import { MapPin } from "lucide-react";
import { scopeOptions } from "../../data";
import { useScope } from "../../state/scope";
import { useUi } from "../../state/ui";
import { SegmentedControl } from "../ui/segmented-control";

export function ScopeSwitcher({ compact = false }: { compact?: boolean }) {
  const { scope, dataset, setScope } = useScope();
  const { closeDialogs, setMobileNavOpen } = useUi();
  return (
    <div className={`scope-switcher ${compact ? "scope-switcher--compact" : ""}`}>
      <div className="scope-switcher-label">
        <MapPin size={15} aria-hidden="true" />
        <span>{compact ? "Versão territorial" : "Recorte em análise"}</span>
      </div>
      <SegmentedControl
        value={scope}
        options={scopeOptions}
        label="Selecionar versão territorial"
        onChange={(next) => {
          closeDialogs();
          setMobileNavOpen(false);
          setScope(next);
        }}
      />
      {!compact && (
        <p className="scope-switcher-description">
          {dataset.areas.length} áreas de referência · inventário sintético independente
        </p>
      )}
    </div>
  );
}
