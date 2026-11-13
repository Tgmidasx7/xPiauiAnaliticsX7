import { VideoOff, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Camera } from "../../data/types";
import { useMediaQuery } from "../../hooks/use-media-query";
import { subscribeAnimation } from "../../lib/animation-scheduler";
import { useWorkspace } from "../../state/workspace";
import { drawCameraScene } from "./camera-scene";
import type { ScenePalette } from "./camera-scene";

export function CameraPreview({ camera, large = false }: { camera: Camera; large?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const [visible, setVisible] = useState(false);
  const { preferences } = useWorkspace();
  const coarse = useMediaQuery("(pointer: coarse)");
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const animate =
    visible && camera.status === "online" && !coarse && !systemReduced && !preferences.reduceMotion;

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const styles = getComputedStyle(document.documentElement);
    const palette: ScenePalette = {
      background: styles.getPropertyValue("--color-background").trim(),
      surface: styles.getPropertyValue("--color-surface-raised").trim(),
      border: styles.getPropertyValue("--color-border").trim(),
      muted: styles.getPropertyValue("--color-text-subtle").trim(),
      info: styles.getPropertyValue("--color-info").trim(),
    };
    const draw = (seconds: number) => {
      timeRef.current = seconds;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width && height) drawCameraScene(context, width, height, camera.scene, seconds, palette);
    };
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(timeRef.current);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const unsubscribe = animate ? subscribeAnimation(draw) : () => {};
    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, [camera.scene, animate, preferences.theme]);

  const label = `Prévia sintética da ${camera.id}, ${camera.name}. Não é uma transmissão ao vivo.`;
  return (
    <div className="camera-preview" ref={wrapperRef}>
      {camera.status === "online" ? (
        <canvas ref={canvasRef} role="img" aria-label={label}>
          Prévia esquemática de uma via urbana. Nenhuma imagem real.
        </canvas>
      ) : (
        <div className="empty-state" role="img" aria-label={label}>
          {camera.status === "offline" ? <VideoOff size={26} /> : <Wrench size={26} />}
          <span>{camera.status === "offline" ? "Sinal indisponível" : "Câmera em manutenção"}</span>
        </div>
      )}
      <div className="camera-preview-overlay" aria-hidden="true">
        <div className="camera-preview-top">
          <span className="camera-preview-id">{camera.id}</span>
          {large && <span className="camera-preview-label">ESQUEMA LOCAL</span>}
        </div>
        <div className="camera-preview-bottom">
          <span className="camera-preview-label">Prévia sintética</span>
          <span className="camera-preview-label">
            {camera.status === "online" ? `${camera.fps} fps · cenário` : "Sem transmissão"}
          </span>
        </div>
      </div>
    </div>
  );
}
