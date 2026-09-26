import http from "node:http";
import { URL } from "node:url";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const PORT = Number(process.env.PORT || 3001);
const VEOVEO_BASE = "https://webmaster-api.rstprgapipt.com";
const TOKEN = process.env.VEOVEO_TOKEN;
const DATA_DIR = process.env.WATCH_DATA_DIR || "/opt/tetrixfilm/data";
const DATA_FILE = `${DATA_DIR}/watch-rooms.json`;
if (!TOKEN) throw new Error("VEOVEO_TOKEN is required");

const cache = new Map();
const clients = new Map();
let rooms = {};

async function loadRooms() {
  try { rooms = JSON.parse(await readFile(DATA_FILE, "utf8")); } catch { rooms = {}; }
}
async function saveRooms() {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(rooms, null, 2), "utf8");
}
await loadRooms();

async function veoveo(path, init = {}) {
  const response = await fetch(`${VEOVEO_BASE}${path}`, { ...init, headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json", "Content-Type": "application/json", ...(init.headers || {}) } });
  const body = await response.text();
  if (!response.ok) throw new Error(`VeoVeo ${response.status}: ${body.slice(0, 300)}`);
  return body ? JSON.parse(body) : null;
}
async function cached(key, loader) {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  const value = await loader(); cache.set(key, { value, expiresAt: Date.now() + 60_000 }); return value;
}
function int(value, fallback, max = 100) { const n = Number.parseInt(value || "", 10); return Number.isFinite(n) ? Math.max(1, Math.min(n, max)) : fallback; }
function ids(value) { return String(value || "").split(",").map((v) => Number.parseInt(v, 10)).filter(Number.isFinite); }
function contentTypeIds(type) { if (type === "films") return [4]; if (type === "serials") return [2, 5]; if (type === "cartoon") return [10, 12]; return []; }
async function filters() { return cached("filters", async () => { const names = ["years", "languages", "genres", "countries", "content-types"]; const values = await Promise.all(names.map((name) => veoveo(`/v1/filters/${name}`))); return { years: values[0], languages: values[1], genres: values[2], countries: values[3], contentTypes: values[4] }; }); }
async function catalog(url) {
  const body = { pagination: { page: int(url.searchParams.get("page"), 1, 39881), pageSize: int(url.searchParams.get("pageSize"), 20, 100), type: "page" } };
  const typeIds = contentTypeIds(url.searchParams.get("type") || ""); if (typeIds.length) body.contentTypeId = typeIds;
  const q = url.searchParams.get("q")?.trim();
  if (q) { const f = await filters(); const n = q.toLocaleLowerCase("ru"); const genre = f.genres.find((item) => { const name = String(item.name || "").toLocaleLowerCase("ru"); return name === n || name.startsWith(n) || n.startsWith(name); }); if (genre) body.genreId = [genre.id]; else body.textFilter = q; }
  const years = ids(url.searchParams.get("year")); if (years.length) body.year = years;
  const genres = ids(url.searchParams.get("genreId")); if (genres.length) body.genreId = genres;
  const countries = ids(url.searchParams.get("countryId")); if (countries.length) body.countryId = countries;
  const languages = ids(url.searchParams.get("languageId")); if (languages.length) body.languageId = languages;
  const key = `catalog:${JSON.stringify(body)}`; return cached(key, () => veoveo("/v1/contents", { method: "POST", body: JSON.stringify(body) }));
}
function publicRoom(room) { const { hostToken, ...safe } = room; return safe; }
function emit(code, event, payload) { for (const res of clients.get(code) || []) { res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`); } }
function authHost(req, room) { return req.headers["x-room-host-token"] === room.hostToken; }
async function body(req) { let raw = ""; for await (const chunk of req) raw += chunk; return raw ? JSON.parse(raw) : {}; }
function json(res, status, value) { res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" }); res.end(JSON.stringify(value)); }
function code() { return randomBytes(4).toString("hex").toUpperCase(); }

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, X-Room-Host-Token" }); return res.end(); }
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === "/health") return json(res, 200, { ok: true });
    if (url.pathname === "/api/catalog" && req.method === "GET") return json(res, 200, await catalog(url));
    if (url.pathname === "/api/filters" && req.method === "GET") return json(res, 200, await filters());
    if (url.pathname === "/api/rooms" && req.method === "POST") {
      const input = await body(req); const roomCode = code(); const hostToken = randomBytes(24).toString("hex");
      const room = { id: randomUUID(), room_code: roomCode, name: String(input.name || `Комната: ${input.movie_name || "Фильм"}`), host_name: String(input.host_name || "Ведущий"), movie_id: Number(input.movie_id || 0), movie_name: String(input.movie_name || "Фильм"), movie_iframe_url: String(input.movie_iframe_url || ""), movie_poster: input.movie_poster || null, movie_type: input.movie_type || "movie", movie_year: input.movie_year || null, creator_id: String(input.creator_id || ""), hostToken, is_active: true, state: { is_playing: false, playback_time: 0, updated_at: new Date().toISOString() }, messages: [], created_at: new Date().toISOString() };
      rooms[roomCode] = room; await saveRooms(); return json(res, 201, { room: publicRoom(room), hostToken });
    }
    const roomMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)$/);
    const stateMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/state$/);
    const messagesMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/messages$/);
    const eventsMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/events$/);
    const room = rooms[(roomMatch || stateMatch || messagesMatch || eventsMatch)?.[1]];
    if (roomMatch && req.method === "GET") return room?.is_active ? json(res, 200, publicRoom(room)) : json(res, 404, { error: "Room not found" });
    if (stateMatch && req.method === "GET") return room ? json(res, 200, room.state) : json(res, 404, { error: "Room not found" });
    if (stateMatch && (req.method === "PUT" || req.method === "POST")) {
      if (!room) return json(res, 404, { error: "Room not found" }); if (!authHost(req, room)) return json(res, 403, { error: "Only the room creator can control playback" });
      const input = await body(req); room.state = { is_playing: Boolean(input.is_playing), playback_time: Number(input.playback_time || 0), updated_at: new Date().toISOString() }; await saveRooms(); emit(room.room_code, "playback", room.state); return json(res, 200, room.state);
    }
    if (messagesMatch && req.method === "GET") return room ? json(res, 200, room.messages.slice(-100)) : json(res, 404, { error: "Room not found" });
    if (messagesMatch && req.method === "POST") {
      if (!room) return json(res, 404, { error: "Room not found" }); const input = await body(req); const message = String(input.message || "").trim(); if (!message || message.length > 500) return json(res, 400, { error: "Message must be 1-500 characters" });
      const item = { id: randomUUID(), room_code: room.room_code, sender_nickname: String(input.sender_nickname || "Гость"), message, is_system_message: false, created_at: new Date().toISOString() }; room.messages.push(item); room.messages = room.messages.slice(-100); await saveRooms(); emit(room.room_code, "message", item); return json(res, 201, item);
    }
    if (eventsMatch && req.method === "GET") {
      if (!room) return json(res, 404, { error: "Room not found" });
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive", "Access-Control-Allow-Origin": "*" }); res.write(`event: ready\ndata: ${JSON.stringify({ room_code: room.room_code })}\n\n`);
      const set = clients.get(room.room_code) || new Set(); set.add(res); clients.set(room.room_code, set); req.on("close", () => { set.delete(res); if (!set.size) clients.delete(room.room_code); }); return;
    }
    return json(res, 404, { error: "Not found" });
  } catch (error) { console.error(error); return json(res, 502, { error: "Server error" }); }
});
server.listen(PORT, "127.0.0.1", () => console.log(`VeoVeo proxy listening on 127.0.0.1:${PORT}`));
