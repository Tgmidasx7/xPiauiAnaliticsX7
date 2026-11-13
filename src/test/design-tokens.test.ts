import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/styles/tokens.css"), "utf8");
const root = css.match(/:root \{([\s\S]*?)\n\s*\}/)?.[1] ?? "";
const token = (name: string, block = root) =>
  block.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim() ?? "";
const rgb = (hex: string) =>
  [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
const luminance = (channels: number[]) => {
  const [r, g, b] = channels.map((value) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const contrast = (a: string, b: string) => {
  const x = luminance(rgb(a));
  const y = luminance(rgb(b));
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

describe("design tokens", () => {
  const surfaces = [
    "--color-background",
    "--color-surface",
    "--color-surface-raised",
    "--color-surface-hover",
  ];
  const textColors = [
    "--color-text",
    "--color-text-muted",
    "--color-text-subtle",
    "--color-success",
    "--color-warning",
    "--color-danger",
    "--color-info",
    "--color-analytics",
  ];
  for (const surface of surfaces) {
    for (const color of textColors) {
      it(`${color} tem contraste AA sobre ${surface}`, () => {
        expect(contrast(token(color), token(surface))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
  for (const theme of ["verde", "ciano", "ambar"]) {
    it(`acento ${theme} mantém contraste AA nas superfícies`, () => {
      const block =
        theme === "verde"
          ? root
          : (css.match(
              new RegExp(`:root\\[data-theme="${theme}"\\] \\{([\\s\\S]*?)\\n  \\}`),
            )?.[1] ?? "");
      for (const surface of surfaces)
        expect(contrast(token("--color-accent", block), token(surface))).toBeGreaterThanOrEqual(
          4.5,
        );
    });
  }
  it("não usa texto abaixo de 11px nem rgba hardcoded nos estilos", () => {
    for (const file of readdirSync(join(process.cwd(), "src/styles")).filter((name) =>
      name.endsWith(".css"),
    )) {
      const source = readFileSync(join(process.cwd(), "src/styles", file), "utf8");
      expect(source).not.toMatch(/rgba\(/);
      for (const match of source.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g))
        expect(Number(match[1])).toBeGreaterThanOrEqual(11);
      for (const match of source.matchAll(/font-size:\s*(\d+(?:\.\d+)?)rem/g))
        expect(Number(match[1])).toBeGreaterThanOrEqual(0.6875);
    }
  });
});
