import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data", "sayings.json");
const PUBLIC_DIR = path.join(__dirname, "public");

app.use(express.static(PUBLIC_DIR));

function readSayings() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}
function writeSayings(payload) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
}
const safe = (v) => String(v ?? "").trim();

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/filters", (req, res) => {
  const db = readSayings();
  const map = {};
  for (const s of db.sayings) {
    const culture = s.culture || "Unknown";
    const sub = s.subculture || "General";
    map[culture] ??= new Set();
    map[culture].add(sub);
  }
  const out = {};
  for (const [k, set] of Object.entries(map)) out[k] = [...set].sort();
  res.json({ cultures: Object.keys(out).sort(), subculturesByCulture: out });
});

app.get("/api/saying", (req, res) => {
  const db = readSayings();
  const culture = safe(req.query.culture);
  const subculture = safe(req.query.subculture);

  let pool = db.sayings;
  if (culture) pool = pool.filter(s => (s.culture || "") === culture);
  if (subculture) pool = pool.filter(s => (s.subculture || "") === subculture);

  if (!pool.length) return res.status(404).json({ error: "No sayings found for those filters." });

  const pick = pool[Math.floor(Math.random() * pool.length)];
  res.json({ id: pick.id, culture: pick.culture, subculture: pick.subculture, first: pick.first });
});

app.get("/api/saying/:id", (req, res) => {
  const db = readSayings();
  const found = db.sayings.find(s => s.id === req.params.id);
  if (!found) return res.status(404).json({ error: "Not found" });
  res.json(found);
});

app.post("/api/sayings", (req, res) => {
  const culture = safe(req.body?.culture);
  const subculture = safe(req.body?.subculture);
  const first = safe(req.body?.first);
  const second = safe(req.body?.second);

  if (!culture || !subculture || !first || !second) {
    return res.status(400).json({ error: "Required: culture, subculture, first, second." });
  }

  const db = readSayings();
  const id = `s_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const item = { id, culture, subculture, first, second };
  db.sayings.push(item);
  writeSayings(db);
  res.status(201).json(item);
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
