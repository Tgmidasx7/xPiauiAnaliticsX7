import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";
import { useUi } from "../../state/ui";

export function Toast() {
  const { toast, dismissToast } = useUi();
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismissToast, 4_500);
    return () => window.clearTimeout(timer);
  }, [toast, dismissToast]);
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {toast && (
        <div className="toast" key={toast.id}>
          <CheckCircle2 size={17} />
          <span>{toast.message}</span>
          <button
            className="icon-button"
            type="button"
            onClick={dismissToast}
            aria-label="Dispensar notificação"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
