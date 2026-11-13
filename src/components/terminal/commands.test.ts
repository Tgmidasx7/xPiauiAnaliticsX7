import { describe, expect, it } from "vitest";
import { commandHelp, parseCommand, resolveRoute } from "./commands";

describe("comandos locais", () => {
  it("normaliza o nome, mas preserva os argumentos", () => {
    expect(parseCommand("  CAMERAS   Frei  Serafim ")).toEqual({
      name: "cameras",
      args: ["Frei", "Serafim"],
    });
    expect(parseCommand("   ")).toEqual({ name: "", args: [] });
  });
  it("resolve rotas conhecidas e rejeita comandos arbitrários", () => {
    expect(resolveRoute("rede")).toBe("/infraestrutura");
    expect(resolveRoute("educacao")).toBe("/educacao");
    expect(resolveRoute("seguranca")).toBe("/seguranca");
    expect(resolveRoute("PREFERENCIAS")).toBe("/preferencias");
    expect(resolveRoute("javascript:alert(1)")).toBeUndefined();
  });
  it("documenta os comandos disponíveis", () => {
    expect(commandHelp).toContain("export <events|cameras|education|security>");
    expect(commandHelp).toContain("scope [piaui|teresina]");
    expect(commandHelp).toContain("clear");
  });
});
