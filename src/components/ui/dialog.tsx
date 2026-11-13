import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { useUi } from "../../state/ui";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  className?: string;
  bodyClassName?: string;
  hideHeader?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

/** Native dialog supplies focus trapping, background inertness and Escape semantics. */
export function Dialog({
  open,
  onClose,
  title,
  eyebrow,
  className = "",
  bodyClassName = "",
  hideHeader = false,
  children,
  footer,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { registerOverlay } = useUi();
  useEffect(() => {
    if (open) return registerOverlay();
  }, [open, registerOverlay]);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const outside =
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom;
        if (outside) onClose();
      }}
    >
      {hideHeader ? (
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
      ) : (
        <header className="dialog-header">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Fechar janela"
          >
            <X size={19} />
          </button>
        </header>
      )}
      <div className={`dialog-body ${bodyClassName}`}>{children}</div>
      {footer && <footer className="dialog-footer">{footer}</footer>}
    </dialog>
  );
}
