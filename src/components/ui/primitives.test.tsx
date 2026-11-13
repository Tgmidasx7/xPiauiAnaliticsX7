import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "./data-table";
import { Pagination } from "./pagination";
import { Switch } from "./switch";

describe("componentes acessíveis", () => {
  it("tabela tem caption, scope e rótulos para o fallback em cards", () => {
    render(
      <DataTable
        caption="Câmeras de teste"
        columns={[{ key: "name", label: "Nome", render: (row) => row.name }]}
        rows={[{ id: "1", name: "Teresina" }]}
      />,
    );
    expect(screen.getByRole("table", { name: "Câmeras de teste" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Nome" })).toHaveAttribute("scope", "col");
    expect(screen.getByRole("cell", { name: "Teresina" })).toHaveAttribute("data-label", "Nome");
  });
  it("paginação desabilita avanço na última página", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Pagination page={1} pageSize={8} total={12} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    rerender(<Pagination page={2} pageSize={8} total={12} onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
  });
  it("switch expõe estado e responde ao teclado", async () => {
    const onChange = vi.fn();
    render(<Switch label="Reduzir movimento" checked={false} onChange={onChange} />);
    const control = screen.getByRole("switch", { name: "Reduzir movimento" });
    expect(control).toHaveAttribute("aria-checked", "false");
    control.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
