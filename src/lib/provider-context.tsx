import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Provider, ProviderId } from "./types";
import { DEFAULT_PROVIDER, PROVIDERS, getProvider, isProviderId } from "./providers/registry";
import { ProviderDialog } from "../components/ProviderDialog";

const KEY = "evolvefilm:provider:v1";

interface ProviderValue {
  provider: Provider;
  providers: Provider[];
  setProvider: (id: ProviderId) => void;
  openDialog: () => void;
}

const ProviderContext = createContext<ProviderValue | null>(null);

function readInitial(): ProviderId {
  try {
    const saved = localStorage.getItem(KEY);
    if (isProviderId(saved)) return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_PROVIDER;
}

export function ProviderProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<ProviderId>(readInitial);
  const [open, setOpen] = useState(false);

  const setProvider = useCallback((next: ProviderId) => {
    setId(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const openDialog = useCallback(() => setOpen(true), []);

  const value = useMemo<ProviderValue>(
    () => ({ provider: getProvider(id), providers: PROVIDERS, setProvider, openDialog }),
    [id, setProvider, openDialog],
  );

  return (
    <ProviderContext.Provider value={value}>
      {children}
      {open && (
        <ProviderDialog
          current={id}
          onSelect={(next) => {
            setProvider(next);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </ProviderContext.Provider>
  );
}

export function useProvider(): ProviderValue {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error("useProvider must be used inside <ProviderProvider>");
  return ctx;
}
