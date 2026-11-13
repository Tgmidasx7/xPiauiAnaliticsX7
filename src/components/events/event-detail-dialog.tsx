import { CheckCheck, Cctv, Info, Play, RotateCcw } from "lucide-react";
import { getArea, getScopedCamera } from "../../data";
import { useScope } from "../../state/scope";
import { formatDate, formatTime } from "../../lib/format";
import { useUi } from "../../state/ui";
import { useWorkspace } from "../../state/workspace";
import { EventStatusBadge, SeverityBadge } from "../ui/badge";
import { Dialog } from "../ui/dialog";

export function EventDetailDialog() {
  const { selectedEventId, closeDialogs, openCamera, notify } = useUi();
  const { dataset } = useScope();
  const { events, setEventStatus } = useWorkspace();
  const event = events.find((item) => item.id === selectedEventId);
  const camera = event ? getScopedCamera(dataset, event.cameraId) : undefined;
  const update = (status: "open" | "investigating" | "resolved") => {
    if (!event) return;
    setEventStatus(event.id, status);
    notify(
      status === "resolved"
        ? `${event.id} resolvido neste navegador.`
        : status === "investigating"
          ? `${event.id} marcado como em análise.`
          : `${event.id} reaberto neste navegador.`,
    );
  };
  return (
    <Dialog
      open={Boolean(event)}
      onClose={closeDialogs}
      title={event?.title ?? "Detalhes do evento"}
      eyebrow={event?.id}
      footer={
        event && (
          <>
            <button className="button" onClick={() => openCamera(event.cameraId)}>
              <Cctv size={15} />
              Ver câmera
            </button>
            {event.status === "open" ? (
              <button className="button button--primary" onClick={() => update("investigating")}>
                <Play size={15} />
                Iniciar análise
              </button>
            ) : event.status === "investigating" ? (
              <button className="button button--primary" onClick={() => update("resolved")}>
                <CheckCheck size={15} />
                Resolver evento
              </button>
            ) : (
              <button className="button" onClick={() => update("open")}>
                <RotateCcw size={15} />
                Reabrir evento
              </button>
            )}
          </>
        )
      }
    >
      {event && (
        <>
          <div className="row row--wrap">
            <SeverityBadge severity={event.severity} />
            <EventStatusBadge status={event.status} />
          </div>
          <p className="detail-description">{event.description}</p>
          <dl className="detail-grid">
            <div>
              <dt>Câmera de origem</dt>
              <dd>
                {event.cameraId} · {camera?.name}
              </dd>
            </div>
            <div>
              <dt>Região</dt>
              <dd>{getArea(dataset, event.region)?.name}</dd>
            </div>
            <div>
              <dt>Registro</dt>
              <dd>
                {formatDate(event.timestamp)} às {formatTime(event.timestamp)} (UTC−3)
              </dd>
            </div>
            <div>
              <dt>Categoria</dt>
              <dd>{event.category}</dd>
            </div>
          </dl>
          <div className="notice-inline u-mt-5">
            <Info size={16} />
            <span>
              As alterações de status ficam apenas neste navegador. Nenhum sistema externo é
              acionado.
            </span>
          </div>
        </>
      )}
    </Dialog>
  );
}
