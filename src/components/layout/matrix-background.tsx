import { useEffect, useRef } from "react";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useUi } from "../../state/ui";
import { useWorkspace } from "../../state/workspace";

/** Optional, decorative only. One throttled loop; no work while hidden, overlaid or off-screen. */
export function MatrixBackground({ desktop }: { desktop: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { preferences } = useWorkspace();
  const { overlayCount } = useUi();
  const coarse = useMediaQuery("(pointer: coarse)");
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled =
    preferences.matrix &&
    desktop &&
    !coarse &&
    !systemReduced &&
    !preferences.reduceMotion &&
    overlayCount === 0;

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) return;
    const styles = getComputedStyle(document.documentElement);
    const background = styles.getPropertyValue("--color-background").trim();
    const accent = styles.getPropertyValue("--color-accent").trim();
    const fontSize = 14;
    let width = 0;
    let height = 0;
    let columns: number[] = [];
    let frame = 0;
    let lastFrame = 0;
    let running = false;
    const glyphs = "01PIAUISPIA";

    const resize = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      const widthChanged = nextWidth !== width;
      width = nextWidth;
      height = nextHeight;
      canvas.width = width;
      canvas.height = height;
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
      context.font = `${fontSize}px monospace`;
      if (widthChanged)
        columns = Array.from(
          { length: Math.ceil(width / fontSize) },
          () => (Math.random() * height) / fontSize,
        );
    };
    const tick = (timestamp: number) => {
      if (!running) return;
      if (timestamp - lastFrame >= 80) {
        lastFrame = timestamp;
        context.fillStyle = background;
        context.globalAlpha = 0.16;
        context.fillRect(0, 0, width, height);
        context.globalAlpha = 1;
        context.fillStyle = accent;
        columns = columns.map((row, index) => {
          context.fillText(
            glyphs[Math.floor(Math.random() * glyphs.length)]!,
            index * fontSize,
            row * fontSize,
          );
          return row * fontSize > height && Math.random() > 0.975 ? 0 : row + 1;
        });
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!running && !document.hidden) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    resize();
    start();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, preferences.theme]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} className="ambient-canvas" aria-hidden="true" />;
}
