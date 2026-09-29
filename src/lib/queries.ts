import { fetchList, fetchPages, type Category, type ListResult, type Movie, type ProviderId } from "./api";
import { getProvider } from "./providers/registry";

export const YEAR = new Date().getFullYear();

const byPopularity = (a: Movie, b: Movie) =>
  (b.kpVotes ?? 0) - (a.kpVotes ?? 0) || (b.kp ?? b.imdb ?? 0) - (a.kp ?? a.imdb ?? 0);

/** Hero + "watching now": the API's own popularity order when it has one, recent releases ranked by votes otherwise. */
export async function loadTrending(pid: ProviderId): Promise<ListResult> {
  if (!getProvider(pid).features.trendingByYear) {
    return fetchPages(pid, { type: "films", sort: "-views", size: 30 }, [1]);
  }
  let res = await fetchPages(pid, { type: "films", year: YEAR, size: 60 }, [1]);
  if (res.items.length < 12) res = await fetchPages(pid, { type: "films", year: YEAR - 1, size: 60 }, [1]);
  return { ...res, items: [...res.items].sort(byPopularity) };
}

export async function loadFresh(pid: ProviderId): Promise<ListResult> {
  const sort = getProvider(pid).features.popularSort ? ("-views" as const) : undefined;
  let res = await fetchPages(pid, { type: "films", year: YEAR, sort, size: 30 }, [1]);
  if (res.items.length < 8) res = await fetchPages(pid, { type: "films", year: YEAR - 1, sort, size: 30 }, [1]);
  return res;
}

export async function loadShelf(pid: ProviderId, type: Category, size = 30): Promise<ListResult> {
  if (getProvider(pid).features.popularSort) {
    return fetchPages(pid, { type, sort: "-views", size }, [1]);
  }
  const res = await fetchPages(pid, { type, size: Math.round(size * 1.4) }, [1]);
  return { ...res, items: [...res.items].sort(byPopularity) };
}

export async function loadTotals(pid: ProviderId): Promise<number[]> {
  const kinds: Category[] = ["films", "serials", "cartoon", "anime-serials"];
  const settled = await Promise.allSettled(kinds.map((type) => fetchList(pid, { type, size: 1, sort: "id" })));
  return settled.map((s) => (s.status === "fulfilled" ? s.value.total : 0));
}
