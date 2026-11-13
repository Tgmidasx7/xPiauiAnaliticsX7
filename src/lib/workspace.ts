import { cameras, demoEvents } from "../data/demo";
import type { EventStatus, Preferences, Workspace } from "../data/types";

export const STORAGE_KEY = "spia:workspace:v1";
export const defaultPreferences: Preferences = {
  theme: "verde",
  sidebarCollapsed: false,
  density: "comfortable",
  matrix: false,
  reduceMotion: false,
  cameraLayout: "grid",
};

export function createWorkspace(): Workspace {
  return {
    version: 1,
    preferences: { ...defaultPreferences },
    eventOverrides: {},
    favoriteCameraIds: [],
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const eventIds = new Set(demoEvents.map((event) => event.id));
const cameraIds = new Set(cameras.map((camera) => camera.id));
const statuses = new Set<EventStatus>(["open", "investigating", "resolved"]);

/** Treat browser storage as untrusted input; a malformed or old payload must not break the app. */
export function parseWorkspace(raw: string | null): Workspace {
  const fallback = createWorkspace();
  if (!raw) return fallback;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== 1) return fallback;
    if (isRecord(value.preferences)) {
      const p = value.preferences;
      if (p.theme === "verde" || p.theme === "ciano" || p.theme === "ambar")
        fallback.preferences.theme = p.theme;
      if (typeof p.sidebarCollapsed === "boolean")
        fallback.preferences.sidebarCollapsed = p.sidebarCollapsed;
      if (p.density === "comfortable" || p.density === "compact")
        fallback.preferences.density = p.density;
      if (typeof p.matrix === "boolean") fallback.preferences.matrix = p.matrix;
      if (typeof p.reduceMotion === "boolean") fallback.preferences.reduceMotion = p.reduceMotion;
      if (p.cameraLayout === "grid" || p.cameraLayout === "list")
        fallback.preferences.cameraLayout = p.cameraLayout;
    }
    if (isRecord(value.eventOverrides)) {
      for (const [id, status] of Object.entries(value.eventOverrides)) {
        if (eventIds.has(id) && statuses.has(status as EventStatus))
          fallback.eventOverrides[id] = status as EventStatus;
      }
    }
    if (Array.isArray(value.favoriteCameraIds)) {
      fallback.favoriteCameraIds = [
        ...new Set(
          value.favoriteCameraIds.filter(
            (id): id is string => typeof id === "string" && cameraIds.has(id),
          ),
        ),
      ];
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function loadWorkspace(): Workspace {
  try {
    return parseWorkspace(localStorage.getItem(STORAGE_KEY));
  } catch {
    return createWorkspace();
  }
}

export function saveWorkspace(workspace: Workspace): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    return true;
  } catch {
    return false;
  }
}
