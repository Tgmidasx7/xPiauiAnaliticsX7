import { CornerDownLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { averageLatency, cameras, getRegion, onlineCameras } from "../../data/demo";
import type { ThemeName } from "../../data/types";
import { useMediaQuery } from "../../hooks/use-media-query";
import { downloadCsv } from "../../lib/csv";
import { formatTime, matchesSearch } from "../../lib/format";
import { useUi } from "../../state/ui";
import { useWorkspace } from "../../state/workspace";
import { Dialog } from "../ui/dialog";
import { commandHelp, parseCommand, resolveRoute } from "./commands";

interface Line {
  id: number;
  kind: "input" | "output" | "error" | "success" | "muted";
  text: string;
}
const initialLine: Line = {
  id: 0,
  kind: "muted",
  text: "S.P.I.A. console local · sem acesso a sistemas reais.\nDigite help para começar. ↑ ↓ recuperam comandos anteriores.",
};

export function TerminalDialog() {
  const { terminalOpen, toggleTerminal } = useUi();
  const { events, preferences, setPreference, favoriteCameraIds } = useWorkspace();
  const navigate = useNavigate();
  const coarse = useMediaQuery("(pointer: coarse)");
  const desktop = useMediaQuery("(min-width: 1024px)");
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<Line[]>([initialLine]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey) return;
      const commandShortcut =
        (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "k";
      if (event.key === "F2" || commandShortcut) {
        event.preventDefault();
        toggleTerminal();
      }
      if (event.key === "Escape" && terminalOpen) {
        event.preventDefault();
        toggleTerminal(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [terminalOpen, toggleTerminal]);

  useEffect(() => {
    if (!terminalOpen) return;
    const viewport = window.visualViewport;
    const updateViewport = () => {
      document.documentElement.style.setProperty(
        "--visual-viewport-height",
        `${viewport?.height ?? window.innerHeight}px`,
      );
      document.documentElement.style.setProperty(
        "--visual-viewport-top",
        `${viewport?.offsetTop ?? 0}px`,
      );
      if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
    };
    updateViewport();
    inputRef.current?.focus();
    viewport?.addEventListener("resize", updateViewport);
    viewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);
    return () => {
      viewport?.removeEventListener("resize", updateViewport);
      viewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
      document.documentElement.style.removeProperty("--visual-viewport-height");
      document.documentElement.style.removeProperty("--visual-viewport-top");
    };
  }, [terminalOpen]);
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines]);

  const append = useCallback((items: Omit<Line, "id">[]) => {
    const numbered = items.map((item) => ({ ...item, id: nextId.current++ }));
    setLines((previous) => [...previous, ...numbered].slice(-200));
  }, []);

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    history.current = [...history.current, trimmed].slice(-50);
    historyIndex.current = history.current.length;
    setInput("");
    if (trimmed.toLowerCase() === "clear") {
      setLines([]);
      return;
    }
    const { name, args } = parseCommand(trimmed);
    const output: Omit<Line, "id">[] = [{ kind: "input", text: `› ${trimmed}` }];
    const error = (text: string) => output.push({ kind: "error", text });
    const success = (text: string) => output.push({ kind: "success", text });
    switch (name) {
      case "help":
        output.push({ kind: "output", text: commandHelp });
        break;
      case "status":
        output.push({
          kind: "output",
          text: `Câmeras disponíveis: ${onlineCameras}/${cameras.length}\nEventos pendentes: ${events.filter((event) => event.status !== "resolved").length}\nLatência média: ${averageLatency} ms\nTema: ${preferences.theme} · dados sintéticos`,
        });
        break;
      case "cameras": {
        const query = args.join(" ");
        const found = cameras
          .filter((camera) =>
            matchesSearch(
              `${camera.id} ${camera.name} ${getRegion(camera.region)?.name ?? ""}`,
              query,
            ),
          )
          .slice(0, 6);
        output.push({
          kind: found.length ? "output" : "error",
          text: found.length
            ? found.map((camera) => `${camera.id}  ${camera.name}  [${camera.status}]`).join("\n")
            : "Nenhuma câmera corresponde à busca.",
        });
        break;
      }
      case "events": {
        const pending = events.filter((event) => event.status !== "resolved").slice(0, 6);
        output.push({
          kind: "output",
          text: pending.length
            ? pending.map((event) => `${event.id}  ${event.title}  [${event.status}]`).join("\n")
            : "Nenhum evento pendente.",
        });
        break;
      }
      case "favorites":
        output.push({
          kind: "output",
          text: favoriteCameraIds.length
            ? favoriteCameraIds
                .map((id) => `${id}  ${cameras.find((camera) => camera.id === id)?.name}`)
                .join("\n")
            : "Nenhuma câmera favoritada. Use a estrela nos cards.",
        });
        break;
      case "open": {
        const route = resolveRoute(args[0] ?? "");
        if (route) {
          append(output);
          navigate(route);
          toggleTerminal(false);
          return;
        }
        error("Rota inválida. Use open cameras, open eventos ou consulte help.");
        break;
      }
      case "theme": {
        const theme = args[0]?.toLowerCase();
        if (theme === "verde" || theme === "ciano" || theme === "ambar") {
          setPreference("theme", theme as ThemeName);
          success(`Tema alterado para ${theme}.`);
        } else error("Temas disponíveis: verde, ciano, ambar.");
        break;
      }
      case "matrix": {
        if (args[0] === "on" && (!desktop || coarse || systemReduced || preferences.reduceMotion))
          error("Matrix indisponível: requer desktop com mouse e movimento habilitado.");
        else if (args[0] === "on" || args[0] === "off") {
          setPreference("matrix", args[0] === "on");
          success(
            args[0] === "on"
              ? "Textura ativada. Será pausada enquanto o terminal estiver aberto."
              : "Textura ambiente desativada.",
          );
        } else error("Use matrix on ou matrix off.");
        break;
      }
      case "export": {
        if (args[0] === "events") {
          downloadCsv(
            "spia-demo-eventos",
            ["ID", "Evento", "Status", "Região", "Horário UTC-3"],
            events.map((event) => [
              event.id,
              event.title,
              event.status,
              getRegion(event.region)?.name,
              formatTime(event.timestamp),
            ]),
          );
          success(`${events.length} eventos sintéticos exportados.`);
        } else if (args[0] === "cameras") {
          downloadCsv(
            "spia-demo-cameras",
            ["ID", "Nome", "Região", "Status"],
            cameras.map((camera) => [
              camera.id,
              camera.name,
              getRegion(camera.region)?.name,
              camera.status,
            ]),
          );
          success(`${cameras.length} câmeras sintéticas exportadas.`);
        } else error("Use export events ou export cameras.");
        break;
      }
      default:
        error(`Comando não reconhecido: ${name}. Digite help para ver as opções.`);
    }
    append(output);
  };

  return (
    <Dialog
      open={terminalOpen}
      onClose={() => toggleTerminal(false)}
      title="Terminal local"
      className="terminal-dialog"
      bodyClassName="terminal-body"
    >
      <div
        className="terminal-output"
        ref={outputRef}
        role="log"
        aria-label="Saída do terminal"
        aria-live="polite"
        aria-relevant="additions"
        tabIndex={0}
      >
        {lines.map((line) => (
          <p key={line.id} className={`terminal-line terminal-line--${line.kind}`}>
            {line.text}
          </p>
        ))}
      </div>
      <form
        className="terminal-form"
        onSubmit={(event) => {
          event.preventDefault();
          runCommand(input);
        }}
      >
        <span className="terminal-prompt" aria-hidden="true">
          ›
        </span>
        <label className="sr-only" htmlFor="terminal-command">
          Comando
        </label>
        <input
          ref={inputRef}
          id="terminal-command"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Digite um comando…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={200}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp") {
              event.preventDefault();
              historyIndex.current = Math.max(0, historyIndex.current - 1);
              setInput(history.current[historyIndex.current] ?? "");
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              historyIndex.current = Math.min(history.current.length, historyIndex.current + 1);
              setInput(history.current[historyIndex.current] ?? "");
            }
          }}
        />
        <button className="icon-button" type="submit" aria-label="Executar comando">
          <CornerDownLeft size={17} />
        </button>
      </form>
      <div className="terminal-hints" role="group" aria-label="Comandos rápidos">
        {["help", "status", "cameras", "events"].map((command) => (
          <button key={command} type="button" onClick={() => runCommand(command)}>
            {command}
          </button>
        ))}
      </div>
    </Dialog>
  );
}
