const API_BASE = "https://wykg-2.onrender.com";
const MAX_PLAYERS = 10;
const $ = (id) => document.getElementById(id);

const els = {
  cultureSelect: $("cultureSelect"),
  subcultureSelect: $("subcultureSelect"),
  refreshFiltersBtn: $("refreshFiltersBtn"),

  teamMode: $("teamMode"),
  strictMode: $("strictMode"),
  turnSeconds: $("turnSeconds"),
  maxRounds: $("maxRounds"),
  targetScore: $("targetScore"),
  saveOptionsBtn: $("saveOptionsBtn"),
  resetGameBtn: $("resetGameBtn"),

  playersBox: $("playersBox"),

  firstPart: $("firstPart"),
  guessInput: $("guessInput"),
  checkBtn: $("checkBtn"),
  revealBtn: $("revealBtn"),
  correctBtn: $("correctBtn"),
  wrongBtn: $("wrongBtn"),
  newRoundBtn: $("newRoundBtn"),
  nextTurnBtn: $("nextTurnBtn"),
  result: $("result"),

  metaFilters: $("metaFilters"),
  metaRound: $("metaRound"),
  metaTurn: $("metaTurn"),
  metaTimer: $("metaTimer"),

  scoreboard: $("scoreboard"),
  teamboard: $("teamboard"),

  addCulture: $("addCulture"),
  addSubculture: $("addSubculture"),
  addFirst: $("addFirst"),
  addSecond: $("addSecond"),
  postToApi: $("postToApi"),
  addSayingBtn: $("addSayingBtn"),
  addStatus: $("addStatus"),

  qrUrlText: $("qrUrlText"),
  qrUrlInput: $("qrUrlInput"),
  copyQrUrlBtn: $("copyQrUrlBtn"),
  howToRegenBtn: $("howToRegenBtn"),
  qrHelp: $("qrHelp")
};

const store = {
  get(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

// Offline fallback so the first half always shows when you click New Round
const BUILTIN_SAYINGS = [
  { id:"b1", culture:"American", subculture:"Southern", first:"Don't count your chickens", second:"before they hatch." },
  { id:"b2", culture:"American", subculture:"Southern", first:"A hard head", second:"makes a soft behind." },
  { id:"b3", culture:"American", subculture:"Black American", first:"All skin folk", second:"ain't kinfolk." },
  { id:"b4", culture:"English-speaking", subculture:"General English", first:"A stitch in time", second:"saves nine." },
  { id:"b5", culture:"Latin", subculture:"Spanish", first:"Más vale tarde", second:"que nunca." },
  { id:"b6", culture:"Chinese", subculture:"Classic", first:"A journey of a thousand miles", second:"begins with a single step." }
];

let timerHandle = null;

let state = {
  filters: {
    cultures: [],
    subculturesByCulture: {},
    selectedCulture: store.get("wykg_culture", ""),
    selectedSubculture: store.get("wykg_subculture", "")
  },
  options: store.get("wykg_options", {
    teamMode: false,
    strictMode: false,
    turnSeconds: 30,
    maxRounds: 20,
    targetScore: 10
  }),
  localSayings: store.get("wykg_local_sayings_v2", []),
  players: store.get("wykg_players_v2", Array.from({ length: 4 }, (_, i) => ({
    name: `Player ${i + 1}`, score: 0, team: i % 2 === 0 ? "A" : "B"
  }))),
  turnIndex: store.get("wykg_turn_index", 0),
  round: store.get("wykg_round", 0),
  currentSaying: null,
  currentAnswer: null,
  secondsLeft: 0,
  gameOver: false
};

function clampPlayers() {
  if (!Array.isArray(state.players)) state.players = [];
  state.players = state.players.slice(0, MAX_PLAYERS);
  if (state.players.length === 0) state.players = [{ name: "Player 1", score: 0, team: "A" }];
  state.players = state.players.map((p, i) => ({
    name: String(p.name ?? `Player ${i + 1}`).slice(0, 20),
    score: Number.isFinite(p.score) ? p.score : 0,
    team: (p.team === "B" ? "B" : "A")
  }));
  if (state.turnIndex >= state.players.length) state.turnIndex = 0;
}

function persist() {
  store.set("wykg_culture", state.filters.selectedCulture);
  store.set("wykg_subculture", state.filters.selectedSubculture);
  store.set("wykg_options", state.options);
  store.set("wykg_local_sayings_v2", state.localSayings);
  store.set("wykg_players_v2", state.players);
  store.set("wykg_turn_index", state.turnIndex);
  store.set("wykg_round", state.round);
}

function flash(msg) { els.result.textContent = msg; }

function normalizeGuess(s) {
  return String(s).toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, "").replace(/\s+/g, " ").trim();
}

function renderOptions() {
  els.teamMode.checked = !!state.options.teamMode;
  els.strictMode.checked = !!state.options.strictMode;
  els.turnSeconds.value = state.options.turnSeconds;
  els.maxRounds.value = state.options.maxRounds;
  els.targetScore.value = state.options.targetScore;
}

function saveOptionsFromUI() {
  state.options.teamMode = !!els.teamMode.checked;
  state.options.strictMode = !!els.strictMode.checked;

  const ts = Number(els.turnSeconds.value);
  const mr = Number(els.maxRounds.value);
  const tg = Number(els.targetScore.value);

  state.options.turnSeconds = Number.isFinite(ts) ? Math.max(5, Math.min(180, ts)) : 30;
  state.options.maxRounds = Number.isFinite(mr) ? Math.max(1, Math.min(200, mr)) : 20;
  state.options.targetScore = Number.isFinite(tg) ? Math.max(1, Math.min(200, tg)) : 10;

  persist();
  renderOptions();
  renderAllMeta();
  renderPlayersInputs();
  renderScoreboards();
  flash("Options saved.");
}

function buildFiltersFromSayings(list) {
  const map = {};
  for (const s of list) {
    map[s.culture] ??= new Set();
    map[s.culture].add(s.subculture);
  }
  const out = {};
  for (const [k, set] of Object.entries(map)) out[k] = [...set].sort();
  return { cultures: Object.keys(out).sort(), subculturesByCulture: out };
}

function renderFilters() {
  els.cultureSelect.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = ""; optAll.textContent = "All Cultures";
  els.cultureSelect.appendChild(optAll);

  state.filters.cultures.forEach(c => {
    const o = document.createElement("option");
    o.value = c; o.textContent = c;
    els.cultureSelect.appendChild(o);
  });

  if (state.filters.selectedCulture && state.filters.cultures.includes(state.filters.selectedCulture)) {
    els.cultureSelect.value = state.filters.selectedCulture;
  } else {
    els.cultureSelect.value = "";
    state.filters.selectedCulture = "";
  }
  renderSubcultures();
}

function renderSubcultures() {
  els.subcultureSelect.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = ""; optAll.textContent = "All Subcultures";
  els.subcultureSelect.appendChild(optAll);

  const culture = els.cultureSelect.value || "";
  const subs = culture
    ? (state.filters.subculturesByCulture[culture] || [])
    : [...new Set(Object.values(state.filters.subculturesByCulture).flat())].sort();

  subs.forEach(sc => {
    const o = document.createElement("option");
    o.value = sc; o.textContent = sc;
    els.subcultureSelect.appendChild(o);
  });

  if (state.filters.selectedSubculture && subs.includes(state.filters.selectedSubculture)) {
    els.subcultureSelect.value = state.filters.selectedSubculture;
  } else {
    els.subcultureSelect.value = "";
    state.filters.selectedSubculture = "";
  }
}

function renderPlayersInputs() {
  els.playersBox.innerHTML = "";

  state.players.forEach((p, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "player";

    const num = document.createElement("div");
    num.className = "num";
    num.textContent = String(idx + 1);

    const input = document.createElement("input");
    input.value = p.name;
    input.placeholder = `Player ${idx + 1}`;
    input.addEventListener("input", () => {
      state.players[idx].name = input.value;
      persist();
      renderScoreboards();
      renderAllMeta();
    });

    wrap.appendChild(num);
    wrap.appendChild(input);

    const teamSel = document.createElement("select");
    teamSel.className = "teamPick";
    teamSel.innerHTML = `<option value="A">Team A</option><option value="B">Team B</option>`;
    teamSel.value = p.team;
    teamSel.disabled = !state.options.teamMode;
    teamSel.addEventListener("change", () => {
      state.players[idx].team = teamSel.value === "B" ? "B" : "A";
      persist();
      renderScoreboards();
      renderAllMeta();
    });

    wrap.appendChild(teamSel);
    els.playersBox.appendChild(wrap);
  });

  const controls = document.createElement("div");
  controls.className = "row";
  controls.style.marginTop = "10px";
  controls.innerHTML = `
    <button class="ghost" id="addPlayerBtn">+ Player</button>
    <button class="ghost" id="removePlayerBtn">- Player</button>
    <button class="ghost" id="resetScoresBtn">Reset Scores</button>
  `;
  els.playersBox.appendChild(controls);

  controls.querySelector("#addPlayerBtn").addEventListener("click", () => {
    if (state.players.length >= MAX_PLAYERS) return flash(`Max ${MAX_PLAYERS} players.`);
    state.players.push({ name: `Player ${state.players.length + 1}`, score: 0, team: "A" });
    clampPlayers(); persist(); renderPlayersInputs(); renderScoreboards(); renderAllMeta();
  });

  controls.querySelector("#removePlayerBtn").addEventListener("click", () => {
    if (state.players.length <= 1) return flash("Need at least 1 player.");
    state.players.pop();
    clampPlayers(); persist(); renderPlayersInputs(); renderScoreboards(); renderAllMeta();
  });

  controls.querySelector("#resetScoresBtn").addEventListener("click", () => {
    state.players.forEach(p => p.score = 0);
    persist();
    renderScoreboards();
    flash("Scores reset.");
  });
}

function renderScoreboards() {
  els.scoreboard.innerHTML = "";
  const sorted = state.players.map((p, idx) => ({ ...p, idx })).sort((a, b) => b.score - a.score);

  sorted.forEach(p => {
    const row = document.createElement("div");
    row.className = "scoreItem";

    const left = document.createElement("div");
    left.className = "scoreName";

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = p.idx === state.turnIndex ? "TURN" : `#${p.idx + 1}`;

    const name = document.createElement("strong");
    name.textContent = p.name || `Player ${p.idx + 1}`;

    left.appendChild(badge);
    left.appendChild(name);

    if (state.options.teamMode) {
      const team = document.createElement("span");
      team.className = "badge";
      team.textContent = `Team ${p.team}`;
      left.appendChild(team);
    }

    const score = document.createElement("div");
    score.innerHTML = `<span class="badge">${p.score} pt</span>`;

    row.appendChild(left);
    row.appendChild(score);
    els.scoreboard.appendChild(row);
  });

  els.teamboard.innerHTML = "";
  if (!state.options.teamMode) return;

  const totals = { A: 0, B: 0 };
  for (const p of state.players) totals[p.team] += p.score;

  const tA = document.createElement("div");
  tA.className = "scoreItem";
  tA.innerHTML = `<div class="scoreName"><strong>Team A</strong></div><div><span class="badge">${totals.A} pt</span></div>`;

  const tB = document.createElement("div");
  tB.className = "scoreItem";
  tB.innerHTML = `<div class="scoreName"><strong>Team B</strong></div><div><span class="badge">${totals.B} pt</span></div>`;

  els.teamboard.appendChild(tA);
  els.teamboard.appendChild(tB);
}

function currentTurnLabel() {
  const p = state.players[state.turnIndex];
  if (!p) return "—";
  return state.options.teamMode ? `${p.name} (Team ${p.team})` : p.name;
}

function renderAllMeta() {
  const c = state.filters.selectedCulture || "All";
  const sc = state.filters.selectedSubculture || "All";
  els.metaFilters.textContent = `Filters: ${c} • ${sc}`;
  els.metaRound.textContent = `Round: ${state.round}/${state.options.maxRounds}`;
  els.metaTurn.textContent = `Turn: ${currentTurnLabel()}`;
  els.metaTimer.textContent = state.gameOver ? "Timer: —" : `Timer: ${state.secondsLeft || state.options.turnSeconds}s`;
}

function stopTimer() { if (timerHandle) clearInterval(timerHandle); timerHandle = null; }

function startTimer() {
  stopTimer();
  state.secondsLeft = state.options.turnSeconds;
  renderAllMeta();

  timerHandle = setInterval(() => {
    if (state.gameOver) return stopTimer();
    state.secondsLeft -= 1;
    els.metaTimer.textContent = `Timer: ${state.secondsLeft}s`;
    if (state.secondsLeft <= 0) {
      stopTimer();
      flash("⏰ Time! Next turn.");
      nextTurn();
    }
  }, 1000);
}

async function fetchFilters() {
  const res = await fetch(`${API_BASE}/api/filters`);
  if (!res.ok) throw new Error("Could not load filters.");
  return await res.json();
}

function getSelectedFilters() {
  state.filters.selectedCulture = els.cultureSelect.value || "";
  state.filters.selectedSubculture = els.subcultureSelect.value || "";
  persist();
  renderAllMeta();
  return { culture: state.filters.selectedCulture, subculture: state.filters.selectedSubculture };
}

function filteredPool(allSayings, culture, subculture) {
  return allSayings.filter(s =>
    (!culture || s.culture === culture) &&
    (!subculture || s.subculture === subculture)
  );
}

async function getRandomSaying({ culture, subculture }) {
  const mergedLocal = [...state.localSayings, ...BUILTIN_SAYINGS];

  try {
    const params = new URLSearchParams();
    if (culture) params.set("culture", culture);
    if (subculture) params.set("subculture", subculture);
    const url = `${API_BASE}/api/saying${params.toString() ? `?${params}` : ""}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("API no saying");
    return await res.json();
  } catch {
    const pool = filteredPool(mergedLocal, culture, subculture);
    if (!pool.length) throw new Error("No sayings found.");
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

async function fetchAnswerById(id) {
  const local = [...state.localSayings, ...BUILTIN_SAYINGS].find(s => s.id === id);
  if (local?.second) return local;

  const res = await fetch(`${API_BASE}/api/saying/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Could not load answer.");
  return await res.json();
}

function checkGameOver() {
  if (state.gameOver) return true;

  if (!state.options.teamMode) {
    const top = Math.max(...state.players.map(p => p.score));
    if (top >= state.options.targetScore) {
      state.gameOver = true;
      const winners = state.players.filter(p => p.score === top).map(p => p.name).join(", ");
      flash(`🏆 Game Over! Winner: ${winners} (${top} pts)`);
      stopTimer(); renderAllMeta(); return true;
    }
  } else {
    const totals = { A: 0, B: 0 };
    for (const p of state.players) totals[p.team] += p.score;
    const best = Math.max(totals.A, totals.B);
    if (best >= state.options.targetScore) {
      state.gameOver = true;
      const winnerTeam = totals.A === totals.B ? "Tie" : (totals.A > totals.B ? "Team A" : "Team B");
      flash(`🏆 Game Over! ${winnerTeam} reached ${best} pts.`);
      stopTimer(); renderAllMeta(); return true;
    }
  }

  if (state.round >= state.options.maxRounds) {
    state.gameOver = true;
    stopTimer();

    if (!state.options.teamMode) {
      const top = Math.max(...state.players.map(p => p.score));
      const winners = state.players.filter(p => p.score === top).map(p => p.name).join(", ");
      flash(`🏁 Max rounds reached. Winner: ${winners} (${top} pts)`);
    } else {
      const totals = { A: 0, B: 0 };
      for (const p of state.players) totals[p.team] += p.score;
      const msg = totals.A === totals.B
        ? `🏁 Max rounds reached. It's a tie! (A ${totals.A} – B ${totals.B})`
        : `🏁 Max rounds reached. Winner: ${totals.A > totals.B ? "Team A" : "Team B"} (A ${totals.A} – B ${totals.B})`;
      flash(msg);
    }

    renderAllMeta();
    return true;
  }
  return false;
}

async function newRound() {
  if (checkGameOver()) return;

  state.round += 1;
  persist();

  els.result.textContent = "";
  els.guessInput.value = "";
  els.guessInput.focus();

  const filters = getSelectedFilters();
  const s = await getRandomSaying(filters);

  state.currentSaying = s;
  state.currentAnswer = null;

  // ✅ first half display
  els.firstPart.textContent = s.first;

  state.secondsLeft = state.options.turnSeconds;
  renderScoreboards();
  renderAllMeta();
  startTimer();
}

async function reveal() {
  if (!state.currentSaying) return;
  if (!state.currentAnswer) state.currentAnswer = await fetchAnswerById(state.currentSaying.id);
  flash(`Answer: ${state.currentAnswer.second}`);
}

async function checkGuess() {
  if (!state.currentSaying) return;
  if (!state.currentAnswer) state.currentAnswer = await fetchAnswerById(state.currentSaying.id);

  const guess = normalizeGuess(els.guessInput.value);
  const answer = normalizeGuess(state.currentAnswer.second);

  if (!guess) return flash("Type a guess first.");

  const strict = !!state.options.strictMode;
  const ok = strict ? (guess === answer) : (guess === answer || answer.includes(guess) || guess.includes(answer));
  flash(ok ? "✅ Looks right. Hit Correct to award the point." : "❌ Not quite. Try again or Reveal.");
}

function awardPoint() {
  if (checkGameOver()) return;
  const p = state.players[state.turnIndex];
  if (!p) return;
  p.score += 1;
  persist();
  renderScoreboards();
  flash(`+1 for ${currentTurnLabel()}!`);
  checkGameOver();
}

function nextTurn() {
  state.turnIndex = (state.turnIndex + 1) % state.players.length;
  persist();
  renderScoreboards();
  renderAllMeta();
  els.guessInput.value = "";
  els.guessInput.focus();
  startTimer();
}

function resetGame() {
  stopTimer();
  state.round = 0;
  state.turnIndex = 0;
  state.currentSaying = null;
  state.currentAnswer = null;
  state.secondsLeft = state.options.turnSeconds;
  state.gameOver = false;
  state.players.forEach(p => p.score = 0);
  persist();
  renderScoreboards();
  renderAllMeta();
  els.firstPart.textContent = "Click “New Round” to start.";
  flash("Game reset.");
}

async function addSaying() {
  const culture = els.addCulture.value.trim();
  const subculture = els.addSubculture.value.trim();
  const first = els.addFirst.value.trim();
  const second = els.addSecond.value.trim();
  const alsoApi = els.postToApi.checked;

  if (!culture || !subculture || !first || !second) {
    els.addStatus.textContent = "Fill Culture, Subculture, First part, Second part.";
    return;
  }

  const localItem = { id: `local_${Date.now()}_${Math.random().toString(16).slice(2)}`, culture, subculture, first, second };
  state.localSayings.push(localItem);
  persist();

  await refreshFiltersQuiet();

  if (alsoApi) {
    try {
      const res = await fetch(`${API_BASE}/api/sayings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ culture, subculture, first, second })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        els.addStatus.textContent = `Saved locally. API save failed: ${err.error || res.statusText}`;
        return;
      }
    } catch {
      els.addStatus.textContent = "Saved locally. API save failed (server not running?).";
      return;
    }
  }

  els.addStatus.textContent = "Added! ✅";
  els.addCulture.value = "";
  els.addSubculture.value = "";
  els.addFirst.value = "";
  els.addSecond.value = "";
}

async function refreshFiltersQuiet() {
  try {
    const data = await fetchFilters();
    const map = structuredClone(data.subculturesByCulture || {});

    for (const s of [...state.localSayings, ...BUILTIN_SAYINGS]) {
      map[s.culture] ??= [];
      if (!map[s.culture].includes(s.subculture)) map[s.culture].push(s.subculture);
    }
    for (const k of Object.keys(map)) map[k] = [...new Set(map[k])].sort();

    state.filters.cultures = [...new Set([...(data.cultures || []), ...Object.keys(map)])].sort();
    state.filters.subculturesByCulture = map;
  } catch {
    const f = buildFiltersFromSayings([...state.localSayings, ...BUILTIN_SAYINGS]);
    state.filters.cultures = f.cultures;
    state.filters.subculturesByCulture = f.subculturesByCulture;
  }

  renderFilters();
  renderAllMeta();
}

function initQrHelpers() {
  els.copyQrUrlBtn.addEventListener("click", async () => {
    const v = (els.qrUrlInput.value.trim() || els.qrUrlText.textContent.trim());
    try {
      await navigator.clipboard.writeText(v);
      els.qrHelp.textContent = "Copied!";
    } catch {
      els.qrHelp.textContent = "Copy failed. Select the URL and copy manually.";
    }
  });

  els.howToRegenBtn.addEventListener("click", () => {
    els.qrHelp.textContent = "To regenerate the QR for your live site: run `npm run gen:qr -- <YOUR_URL>` in the project folder (it overwrites public/download-qr.png).";
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

els.refreshFiltersBtn.addEventListener("click", async () => {
  await refreshFiltersQuiet();
  flash("Filters refreshed.");
});

els.cultureSelect.addEventListener("change", () => {
  state.filters.selectedCulture = els.cultureSelect.value || "";
  state.filters.selectedSubculture = "";
  renderSubcultures();
  getSelectedFilters();
});

els.subcultureSelect.addEventListener("change", () => { getSelectedFilters(); });

els.saveOptionsBtn.addEventListener("click", () => saveOptionsFromUI());
els.resetGameBtn.addEventListener("click", () => resetGame());

els.newRoundBtn.addEventListener("click", async () => {
  try { await newRound(); } catch (e) { flash(e.message || "Could not start round."); }
});

els.revealBtn.addEventListener("click", async () => { try { await reveal(); } catch { flash("Could not reveal."); } });
els.checkBtn.addEventListener("click", async () => { try { await checkGuess(); } catch { flash("Could not check."); } });

els.guessInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") { e.preventDefault(); await checkGuess(); }
});

els.correctBtn.addEventListener("click", () => awardPoint());
els.wrongBtn.addEventListener("click", () => { flash("Marked wrong."); nextTurn(); });
els.nextTurnBtn.addEventListener("click", () => nextTurn());
els.addSayingBtn.addEventListener("click", async () => { await addSaying(); });

(async function init() {
  clampPlayers();
  renderOptions();
  renderPlayersInputs();
  renderScoreboards();
  renderAllMeta();
  initQrHelpers();
  await refreshFiltersQuiet();
})();
app.get("/api/sayings", (req, res) => {
  const db = readSayings();
  const culture = String(req.query.culture || "").trim();
  const subculture = String(req.query.subculture || "").trim();

  let pool = db.sayings;
  if (culture) pool = pool.filter(s => s.culture || "") === culture);
  if (subculture) pool = pool.filter(s => (s.subculture || "") === subculture);

  res.json({ sayings: pool });
});
