import { useCallback, useEffect, useRef, useState } from "react";
import { pingProvider } from "../../lib/api";
import { PROVIDERS } from "../../lib/providers/registry";
import type { ProviderId } from "../../lib/types";

export interface Health {
  state: "checking" | "ok" | "fail";
  ms: number | null;
  history: number[];
  checkedAt: number | null;
}
export type HealthMap = Record<ProviderId, Health>;

const blank = (): Health => ({ state: "checking", ms: null, history: [], checkedAt: null });
const initial = (): HealthMap => ({ tetrix: blank(), evloev: blank(), kodik: blank() });

/** Live status of every API: pings on mount and then on an interval, keeping a short latency history. */
export function useHealth(intervalMs = 25000) {
  const [health, setHealth] = useState<HealthMap>(initial);
  const alive = useRef(true);

  const check = useCallback((id: ProviderId, force: boolean) => {
    pingProvider(id, force)
      .then((ms) => {
        if (!alive.current) return;
        setHealth((h) => ({
          ...h,
          [id]: { state: "ok", ms, history: [...h[id].history, ms].slice(-16), checkedAt: Date.now() },
        }));
      })
      .catch(() => {
        if (!alive.current) return;
        setHealth((h) => ({ ...h, [id]: { ...h[id], state: "fail", checkedAt: Date.now() } }));
      });
  }, []);

  const refresh = useCallback(() => PROVIDERS.forEach((p) => check(p.id, true)), [check]);

  useEffect(() => {
    alive.current = true;
    PROVIDERS.forEach((p) => check(p.id, false));
    const timer = setInterval(refresh, intervalMs);
    return () => {
      alive.current = false;
      clearInterval(timer);
    };
  }, [check, refresh, intervalMs]);

  return { health, refresh };
}
