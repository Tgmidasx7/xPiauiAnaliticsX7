import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("produz UTF-8 BOM, ponto e vírgula e CRLF para planilhas em pt-BR", () => {
    expect(toCsv(["Nome", "Valor"], [["Piauí", 42]])).toBe('\uFEFF"Nome";"Valor"\r\n"Piauí";"42"');
  });
  it("escapa aspas e quebras de linha", () => {
    expect(toCsv(["Texto"], [['Ele disse "olá"\nhoje']])).toBe(
      '\uFEFF"Texto"\r\n"Ele disse ""olá""\nhoje"',
    );
  });
  it.each(["=HYPERLINK(1)", "+1", "-1", "@SUM(1)", "  =1", "\t=1"])(
    "neutraliza fórmula de planilha: %s",
    (value) => {
      expect(toCsv(["Texto"], [[value]])).toContain(`"'${value}"`);
    },
  );
  it("trata valores ausentes sem texto undefined", () => {
    expect(toCsv(["A", "B"], [[null, undefined]])).toBe('\uFEFF"A";"B"\r\n"";""');
  });
});
