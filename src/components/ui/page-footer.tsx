import { ShieldCheck } from "lucide-react";

export function PageFooter() {
  return (
    <footer className="page-footer">
      <span>S.P.I.A. · Base v5</span>
      <span>
        <ShieldCheck size={12} />
        Inteligência com contexto. Decisão com responsabilidade.
      </span>
    </footer>
  );
}
