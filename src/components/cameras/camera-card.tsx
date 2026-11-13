import { ArrowUpRight, Star } from "lucide-react";
import type { Camera } from "../../data/types";
import { getRegion } from "../../data/demo";
import { useUi } from "../../state/ui";
import { useWorkspace } from "../../state/workspace";
import { CameraStatusBadge } from "../ui/badge";
import { CameraPreview } from "./camera-preview";

export function CameraCard({ camera }: { camera: Camera }) {
  const { openCamera } = useUi();
  const { favoriteCameraIds, toggleFavorite } = useWorkspace();
  const favorite = favoriteCameraIds.includes(camera.id);
  return (
    <article className="camera-card">
      <CameraPreview camera={camera} />
      <div className="camera-card-body">
        <div className="camera-card-title">
          <div>
            <h3>{camera.name}</h3>
            <p className="camera-meta">
              {getRegion(camera.region)?.name} · {camera.latency} ms
            </p>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label={`${favorite ? "Remover" : "Adicionar"} ${camera.id} ${favorite ? "dos" : "aos"} favoritos`}
            aria-pressed={favorite}
            onClick={() => toggleFavorite(camera.id)}
          >
            <Star size={16} fill={favorite ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="camera-card-footer">
          <CameraStatusBadge status={camera.status} />
          <button type="button" className="text-link" onClick={() => openCamera(camera.id)}>
            Detalhes
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
