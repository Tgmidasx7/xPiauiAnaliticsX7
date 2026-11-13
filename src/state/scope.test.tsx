import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ScopeProvider, useScope } from "./scope";

function Harness() {
  const { dataset, scope, setScope, path } = useScope();
  const location = useLocation();
  return (
    <div>
      <p data-testid="scope">{scope}</p>
      <p data-testid="label">{dataset.label}</p>
      <p data-testid="search">{location.search}</p>
      <a href={path("/cameras?region=capital")}>link</a>
      <button onClick={() => setScope("teresina")}>Trocar para Teresina</button>
      <button onClick={() => setScope("piaui")}>Trocar para Piauí</button>
    </div>
  );
}
const setup = (entry = "/cameras?region=capital&status=offline") =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <ScopeProvider>
        <Harness />
      </ScopeProvider>
    </MemoryRouter>,
  );

describe("ScopeProvider", () => {
  it("usa Piauí por padrão e preserva filtros no link da mesma versão", () => {
    setup();
    expect(screen.getByTestId("scope")).toHaveTextContent("piaui");
    expect(screen.getByRole("link")).toHaveAttribute("href", "/cameras?region=capital");
  });
  it("lê territorio da URL e troca versão limpando filtros específicos da área", async () => {
    setup("/educacao?territorio=teresina&area=leste");
    expect(screen.getByTestId("scope")).toHaveTextContent("teresina");
    expect(screen.getByTestId("label")).toHaveTextContent("Teresina Capital");
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/cameras?region=capital&territorio=teresina",
    );
    await userEvent.click(screen.getByRole("button", { name: "Trocar para Piauí" }));
    expect(screen.getByTestId("scope")).toHaveTextContent("piaui");
    expect(screen.getByTestId("search")).toHaveTextContent("");
  });
  it("mantém territorio ao navegar e descarta escopo desconhecido", async () => {
    setup("/?territorio=desconhecido");
    expect(screen.getByTestId("scope")).toHaveTextContent("piaui");
    await userEvent.click(screen.getByRole("button", { name: "Trocar para Teresina" }));
    expect(screen.getByTestId("search")).toHaveTextContent("?territorio=teresina");
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/cameras?region=capital&territorio=teresina",
    );
  });
});
