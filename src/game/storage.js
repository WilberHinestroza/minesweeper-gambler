// Persistencia local: run en curso, récords y preferencias.

const SAVE_KEY = 'mina-fortuna:run:v1';
const STATS_KEY = 'mina-fortuna:stats:v1';
const SETTINGS_KEY = 'mina-fortuna:settings:v1';

const RESUMABLE = ['starter', 'round', 'shop'];

function read(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // localStorage puede estar bloqueado o lleno: el juego sigue sin persistir.
  }
}

export function loadSavedRun() {
  const saved = read(SAVE_KEY);

  if (!saved || typeof saved !== 'object') return null;
  if (!RESUMABLE.includes(saved.phase)) return null;
  if (!Array.isArray(saved.jokers)) return null;
  // La elección inicial todavía no tiene tablero, pero sí ofertas.
  if (saved.phase === 'starter') {
    if (!Array.isArray(saved.starterOffers) || saved.starterOffers.length === 0) {
      return null;
    }
  } else if (!saved.board) {
    return null;
  }

  return saved;
}

export function saveRun(state) {
  if (!state || !RESUMABLE.includes(state.phase)) return;
  write(SAVE_KEY, { ...state, savedAt: Date.now() });
}

export function clearSavedRun() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    // Sin persistencia disponible.
  }
}

export function emptyStats() {
  return { bestRound: 0, bestScore: 0, bestMoney: 0 };
}

export function loadStats() {
  const stats = read(STATS_KEY);
  if (!stats || typeof stats !== 'object') return emptyStats();

  return {
    bestRound: Number(stats.bestRound) || 0,
    bestScore: Number(stats.bestScore) || 0,
    bestMoney: Number(stats.bestMoney) || 0,
  };
}

// Guarda los récords al terminar la run y borra la run en curso.
export function recordRun(state) {
  const previous = loadStats();
  const next = {
    bestRound: Math.max(previous.bestRound, state.round),
    bestScore: Math.max(previous.bestScore, state.totalScore),
    bestMoney: Math.max(previous.bestMoney, state.money),
  };

  write(STATS_KEY, next);
  clearSavedRun();

  return {
    stats: next,
    isRecord:
      next.bestScore > previous.bestScore ||
      next.bestRound > previous.bestRound ||
      next.bestMoney > previous.bestMoney,
  };
}

export function loadSettings() {
  const settings = read(SETTINGS_KEY);
  return { muted: Boolean(settings?.muted) };
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, { ...loadSettings(), ...settings });
}
