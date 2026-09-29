import type { Provider, ProviderId } from "../types";
import { evloev } from "./evloev";
import { kodik } from "./kodik";
import { tetrix } from "./tetrix";

export const PROVIDERS: Provider[] = [tetrix, evloev, kodik];
export const DEFAULT_PROVIDER: ProviderId = "tetrix";

export function isProviderId(value: unknown): value is ProviderId {
  return PROVIDERS.some((p) => p.id === value);
}

export function getProvider(id: ProviderId): Provider {
  return PROVIDERS.find((p) => p.id === id) ?? tetrix;
}
