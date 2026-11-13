import { describe, expect, it } from "vitest";
import { formatNumber, formatTime, matchesSearch } from "./format";

describe("formatação brasileira", () => {
  it("formata números e horários em UTC−3", () => {
    expect(formatNumber(1284)).toBe("1.284");
    expect(formatTime("2026-11-13T12:00:00.000Z")).toBe("09:00");
  });
  it("busca sem diferenciar acentos ou maiúsculas", () => {
    expect(matchesSearch("Piauí · Teresina", "PIAUI")).toBe(true);
    expect(matchesSearch("João XXIII", "joao")).toBe(true);
    expect(matchesSearch("Picos", "parnaíba")).toBe(false);
  });
});
