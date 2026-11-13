import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { UiProvider, useUi } from "../../state/ui";
import { WorkspaceProvider } from "../../state/workspace";
import { TerminalDialog } from "./terminal-dialog";

function Harness() {
  const { toggleTerminal } = useUi();
  return (
    <>
      <button onClick={() => toggleTerminal(true)}>Abrir teste</button>
      <TerminalDialog />
    </>
  );
}
const setup = () =>
  render(
    <MemoryRouter>
      <WorkspaceProvider>
        <UiProvider>
          <Harness />
        </UiProvider>
      </WorkspaceProvider>
    </MemoryRouter>,
  );

describe("terminal", () => {
  it("abre com F2, executa help e fecha com Escape", async () => {
    setup();
    fireEvent.keyDown(document, { key: "F2" });
    const dialog = screen.getByRole("dialog", { name: "Terminal local" });
    expect(dialog).toHaveAttribute("open");
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Comando" })).toHaveFocus());
    await userEvent.type(screen.getByRole("textbox", { name: "Comando" }), "help{Enter}");
    expect(screen.getByRole("log")).toHaveTextContent("Lista de comandos");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(dialog).not.toHaveAttribute("open");
  });
  it("Ctrl+K funciona mesmo com foco no input e não usa tecla morta", () => {
    setup();
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("open");
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "k", ctrlKey: true });
    expect(dialog).not.toHaveAttribute("open");
    fireEvent.keyDown(document, { key: "Dead" });
    expect(dialog).not.toHaveAttribute("open");
  });
  it("altera tema, mostra erro seguro e recupera histórico", async () => {
    setup();
    fireEvent.keyDown(document, { key: "F2" });
    const input = screen.getByRole("textbox", { name: "Comando" });
    await userEvent.type(input, "theme ciano{Enter}");
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("ciano"));
    await userEvent.type(input, "comando-inexistente{Enter}");
    expect(screen.getByRole("log")).toHaveTextContent("Comando não reconhecido");
    await userEvent.type(input, "{ArrowUp}");
    expect(input).toHaveValue("comando-inexistente");
    await userEvent.type(input, "{ArrowUp}");
    expect(input).toHaveValue("theme ciano");
  });
});
