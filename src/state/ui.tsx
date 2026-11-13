import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface ToastMessage {
  id: number;
  message: string;
}
interface UiContextValue {
  terminalOpen: boolean;
  mobileNavOpen: boolean;
  selectedCameraId: string | null;
  selectedEventId: string | null;
  toast: ToastMessage | null;
  overlayCount: number;
  registerOverlay: () => () => void;
  toggleTerminal: (open?: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  openCamera: (id: string) => void;
  openEvent: (id: string) => void;
  closeDialogs: () => void;
  notify: (message: string) => void;
  dismissToast: () => void;
}
const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpenState] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [overlayCount, setOverlayCount] = useState(0);
  const registerOverlay = useCallback(() => {
    setOverlayCount((count) => count + 1);
    return () => setOverlayCount((count) => Math.max(0, count - 1));
  }, []);

  const closeDialogs = useCallback(() => {
    setSelectedCameraId(null);
    setSelectedEventId(null);
  }, []);
  const toggleTerminal = useCallback((open?: boolean) => {
    setTerminalOpen((previous) => open ?? !previous);
    setSelectedCameraId(null);
    setSelectedEventId(null);
    setMobileNavOpenState(false);
  }, []);
  const setMobileNavOpen = useCallback((open: boolean) => {
    setMobileNavOpenState(open);
    if (open) {
      setTerminalOpen(false);
      setSelectedCameraId(null);
      setSelectedEventId(null);
    }
  }, []);
  const openCamera = useCallback((id: string) => {
    setSelectedCameraId(id);
    setSelectedEventId(null);
    setTerminalOpen(false);
    setMobileNavOpenState(false);
  }, []);
  const openEvent = useCallback((id: string) => {
    setSelectedEventId(id);
    setSelectedCameraId(null);
    setTerminalOpen(false);
    setMobileNavOpenState(false);
  }, []);
  const notify = useCallback((message: string) => setToast({ id: Date.now(), message }), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const value = useMemo(
    () => ({
      terminalOpen,
      mobileNavOpen,
      selectedCameraId,
      selectedEventId,
      toast,
      overlayCount,
      registerOverlay,
      toggleTerminal,
      setMobileNavOpen,
      openCamera,
      openEvent,
      closeDialogs,
      notify,
      dismissToast,
    }),
    [
      terminalOpen,
      mobileNavOpen,
      selectedCameraId,
      selectedEventId,
      toast,
      overlayCount,
      registerOverlay,
      toggleTerminal,
      setMobileNavOpen,
      openCamera,
      openEvent,
      closeDialogs,
      notify,
      dismissToast,
    ],
  );
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const context = useContext(UiContext);
  if (!context) throw new Error("useUi deve ser usado dentro de UiProvider.");
  return context;
}
