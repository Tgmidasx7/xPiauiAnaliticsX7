export interface ScenePalette {
  background: string;
  surface: string;
  border: string;
  muted: string;
  info: string;
}

/** A deliberately schematic traffic scene. No video, external image, person or real plate is used. */
export function drawCameraScene(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: number,
  seconds: number,
  palette: ScenePalette,
) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = palette.background;
  context.fillRect(0, 0, width, height);
  const roadTop = height * 0.34;
  const roadHeight = height * 0.4;
  context.fillStyle = palette.surface;
  for (let index = 0; index < 6; index++) {
    const x = (index * width) / 5 - 12;
    context.fillRect(x, 12, width / 7, roadTop - 28);
    context.fillRect(x + 14, roadTop + roadHeight + 18, width / 8, height * 0.2);
  }
  context.fillStyle = palette.border;
  context.fillRect(0, roadTop, width, roadHeight);
  context.fillStyle = palette.background;
  context.fillRect(0, roadTop - 5, width, 4);
  context.fillRect(0, roadTop + roadHeight + 1, width, 4);
  context.strokeStyle = palette.muted;
  context.globalAlpha = 0.45;
  context.lineWidth = 1;
  context.setLineDash([12, 12]);
  context.beginPath();
  context.moveTo(0, roadTop + roadHeight / 2);
  context.lineTo(width, roadTop + roadHeight / 2);
  context.stroke();
  context.setLineDash([]);
  for (let index = 0; index < 6; index++)
    context.fillRect(
      width * 0.8,
      roadTop + 7 + (index * roadHeight) / 6,
      width * 0.055,
      roadHeight / 11,
    );
  context.globalAlpha = 1;

  for (let index = 0; index < 4; index++) {
    const direction = index % 2 === 0 ? 1 : -1;
    const speed = 12 + ((scene * 3 + index * 5) % 12);
    const offset = (seconds * speed + (index * width) / 3 + scene * 37) % (width + 60);
    const x = direction === 1 ? offset - 30 : width + 30 - offset;
    const y = roadTop + roadHeight * (direction === 1 ? 0.7 : 0.23);
    const carWidth = index === 3 ? 27 : 18;
    const carHeight = 9;
    context.fillStyle = index % 2 === 0 ? palette.muted : palette.info;
    context.globalAlpha = 0.8;
    context.fillRect(x - carWidth / 2, y - carHeight / 2, carWidth, carHeight);
    context.fillStyle = palette.background;
    context.fillRect(x - 4, y - 3, 8, 6);
    context.globalAlpha = 0.65;
    context.strokeStyle = palette.info;
    context.strokeRect(x - carWidth / 2 - 4, y - carHeight / 2 - 4, carWidth + 8, carHeight + 8);
    context.globalAlpha = 1;
  }
  context.fillStyle = palette.muted;
  context.globalAlpha = 0.35;
  for (let index = 0; index < 5; index++) {
    context.beginPath();
    context.arc(22 + (index * width) / 4.5, roadTop - 15, 5, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
}
