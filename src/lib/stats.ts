export interface StatDay {
  date: string;
  visits: number;
  clicks: number;
}

export interface SiteStats {
  visits: number;
  users: number;
  clicks: number;
  activeUsers: number;
  togetherViewers: number;
  togetherRooms: number;
  history: StatDay[];
  updatedAt: string;
}

const CLIENT_KEY = "tetrix_anon_client";

function clientId() {
  const saved = localStorage.getItem(CLIENT_KEY);
  if (saved) return saved;
  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(CLIENT_KEY, id);
  return id;
}

function sendEvent(type: "visit" | "click") {
  const body = JSON.stringify({ type, clientId: clientId() });
  fetch("/api/stats/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function startStatsTracking() {
  sendEvent("visit");
  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, [role=button]")) sendEvent("click");
  };
  document.addEventListener("click", onClick, { passive: true });
  return () => document.removeEventListener("click", onClick);
}

export async function loadSiteStats(): Promise<SiteStats> {
  const [site, together] = await Promise.all([
    fetch("/api/stats", { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("stats")))),
    fetch("/api/together-stats", { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("together")))),
  ]);
  return {
    visits: Number(site.visits || 0),
    users: Number(site.users || 0),
    clicks: Number(site.clicks || 0),
    activeUsers: Number(site.activeUsers || 0),
    togetherViewers: Number(together.viewers || 0),
    togetherRooms: Number(together.rooms || 0),
    history: Array.isArray(site.history) ? site.history : [],
    updatedAt: new Date().toISOString(),
  };
}
