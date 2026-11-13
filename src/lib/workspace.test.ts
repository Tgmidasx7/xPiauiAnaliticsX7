import { describe, expect, it } from "vitest";
import { createWorkspace, parseWorkspace } from "./workspace";

describe("parseWorkspace", () => {
  it("usa padrões seguros e Matrix desligado por padrão", () => {
    const workspace = createWorkspace();
    expect(workspace.preferences.matrix).toBe(false);
    expect(workspace.preferences.theme).toBe("verde");
    expect(parseWorkspace(null)).toEqual(workspace);
  });
  it.each(["{", "null", "[]", '{"version":99}', '{"version":1,"preferences":"inválido"}'])(
    "não quebra com payload inválido: %s",
    (raw) => {
      expect(parseWorkspace(raw)).toEqual(createWorkspace());
    },
  );
  it("preserva apenas campos e identificadores conhecidos", () => {
    const result = parseWorkspace(
      JSON.stringify({
        version: 1,
        preferences: {
          theme: "ciano",
          matrix: true,
          density: "compact",
          sidebarCollapsed: "sim",
          reduceMotion: true,
        },
        eventOverrides: { "EVT-1048": "resolved", "EVT-9999": "resolved", "EVT-1047": "apagado" },
        favoriteCameraIds: ["CAM-001", "CAM-001", "CAM-999", 7],
      }),
    );
    expect(result.preferences.theme).toBe("ciano");
    expect(result.preferences.matrix).toBe(true);
    expect(result.preferences.reduceMotion).toBe(true);
    expect(result.preferences.sidebarCollapsed).toBe(false);
    expect(result.eventOverrides).toEqual({ "EVT-1048": "resolved" });
    expect(result.favoriteCameraIds).toEqual(["CAM-001"]);
  });
});
