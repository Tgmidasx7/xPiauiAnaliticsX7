import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { allCameras, allEvents } from "../data";
import { useScope } from "./scope";
import type { EventStatus, OperationalEvent, Preferences, Workspace } from "../data/types";
import { createWorkspace, loadWorkspace, saveWorkspace } from "../lib/workspace";

type Action =
  | { type: "preference"; key: keyof Preferences; value: Preferences[keyof Preferences] }
  | { type: "event"; id: string; status: EventStatus }
  | { type: "favorite"; id: string }
  | { type: "reset" };

const validCameraIds = new Set(allCameras.map((camera) => camera.id));
const validEventIds = new Set(allEvents.map((event) => event.id));

function reducer(state: Workspace, action: Action): Workspace {
  switch (action.type) {
    case "preference":
      return { ...state, preferences: { ...state.preferences, [action.key]: action.value } };
    case "event":
      if (!validEventIds.has(action.id)) return state;
      return { ...state, eventOverrides: { ...state.eventOverrides, [action.id]: action.status } };
    case "favorite":
      if (!validCameraIds.has(action.id)) return state;
      return {
        ...state,
        favoriteCameraIds: state.favoriteCameraIds.includes(action.id)
          ? state.favoriteCameraIds.filter((id) => id !== action.id)
          : [...state.favoriteCameraIds, action.id],
      };
    case "reset":
      return createWorkspace();
  }
}

interface WorkspaceContextValue {
  preferences: Preferences;
  events: OperationalEvent[];
  favoriteCameraIds: string[];
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  setEventStatus: (id: string, status: EventStatus) => void;
  toggleFavorite: (id: string) => void;
  resetWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { dataset } = useScope();
  const [workspace, dispatch] = useReducer(reducer, undefined, loadWorkspace);
  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);
  useEffect(() => {
    document.documentElement.dataset.theme = workspace.preferences.theme;
    document.documentElement.dataset.density = workspace.preferences.density;
  }, [workspace.preferences.theme, workspace.preferences.density]);

  const events = useMemo(
    () =>
      dataset.events.map((event) => ({
        ...event,
        status: workspace.eventOverrides[event.id] ?? event.status,
      })),
    [dataset.events, workspace.eventOverrides],
  );
  const setPreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      dispatch({ type: "preference", key, value });
    },
    [],
  );
  const setEventStatus = useCallback(
    (id: string, status: EventStatus) => dispatch({ type: "event", id, status }),
    [],
  );
  const toggleFavorite = useCallback((id: string) => dispatch({ type: "favorite", id }), []);
  const resetWorkspace = useCallback(() => dispatch({ type: "reset" }), []);
  const value = useMemo(
    () => ({
      preferences: workspace.preferences,
      events,
      favoriteCameraIds: workspace.favoriteCameraIds,
      setPreference,
      setEventStatus,
      toggleFavorite,
      resetWorkspace,
    }),
    [
      workspace.preferences,
      workspace.favoriteCameraIds,
      events,
      setPreference,
      setEventStatus,
      toggleFavorite,
      resetWorkspace,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace deve ser usado dentro de WorkspaceProvider.");
  return context;
}
