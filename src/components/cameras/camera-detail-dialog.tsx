import { Info, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCamera, getRegion } from "../../data/demo";
import { useUi } from "../../state/ui";
import { useWorkspace } from "../../state/workspace";
import { CameraStatusBadge } from "../ui/badge";
import { Dialog } from "../ui/dialog";
import { CameraPreview } from "./camera-preview";

export function CameraDetailDialog() {
  const { selectedCameraId, closeDialogs } = useUi();
  const { favoriteCameraIds, toggleFavorite, events } = useWorkspace();
  const navigate = useNavigate();
  const camera = selectedCameraId ? getCamera(selectedCameraId) : undefined;
  const favorite = camera ? favoriteCameraIds.includes(camera.id) : false;
  const related = camera
    ? events.filter((event) => event.cameraId === camera.id && event.status !== "resolved").length
    : 0;
  return (
    <Dialog
      open={Boolean(camera)}
      onClose={closeDialogs}
      title={camera?.name ?? "Detalhes da câmera"}
      eyebrow={camera?.id}
      footer={
        camera && (
          <>
            <button
              className="button"
              onClick={() => toggleFavorite(camera.id)}
              aria-pressed={favorite}
            >
              <Star size={15} fill={favorite ? "currentColor" : "none"} />
              {favorite ? "Favoritada" : "Favoritar"}
            </button>
            <button
              className="button button--primary"
              onClick={() => {
                navigate(`/eventos?camera=${camera.id}`);
                closeDialogs();
              }}
            >
              Ver eventos{related > 0 ? ` (${related})` : ""}
            </button>
          </>
        )
      }
    >
      {camera && (
        <>
          <div className="camera-detail-preview">
            <CameraPreview camera={camera} large />
          </div>
          <div className="row row--between u-mt-4">
            <CameraStatusBadge status={camera.status} />
            <span className="mono subtle">{camera.id}</span>
          </div>
          <dl className="detail-grid">
            <div>
              <dt>Região</dt>
              <dd>
                {getRegion(camera.region)?.name} · {getRegion(camera.region)?.reference}
              </dd>
            </div>
            <div>
              <dt>Resolução nominal</dt>
              <dd>
                {camera.resolution} · {camera.fps} fps
              </dd>
            </div>
            <div>
              <dt>Latência do cenário</dt>
              <dd className="mono">{camera.latency} ms</dd>
            </div>
            <div>
              <dt>Eventos pendentes</dt>
              <dd>{related}</dd>
            </div>
          </dl>
          <p className="detail-description">
            Os indicadores descrevem a configuração desta câmera no cenário de apresentação.
          </p>
          <div className="notice-inline u-mt-4">
            <Info size={16} />
            <span>
              A prévia é um esquema gerado localmente, não uma transmissão de câmera real.
            </span>
          </div>
        </>
      )}
    </Dialog>
  );
}
