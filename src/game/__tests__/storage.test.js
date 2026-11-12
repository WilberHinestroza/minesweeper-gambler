import {
  clearSavedRun,
  emptyStats,
  loadSavedRun,
  loadSettings,
  loadStats,
  recordRun,
  saveRun,
  saveSettings,
} from '../storage';

function sampleRun(extra = {}) {
  return {
    phase: 'round',
    seed: 123,
    round: 2,
    money: 5,
    totalScore: 500,
    jokers: ['streak'],
    board: { rows: 8, cols: 8, cells: [] },
    config: { rows: 8, cols: 8, mines: 10, target: 500 },
    ...extra,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('persistencia local', () => {
  test('guarda y recupera la run en curso', () => {
    saveRun(sampleRun({ round: 4 }));

    const saved = loadSavedRun();

    expect(saved.round).toBe(4);
    expect(saved.jokers).toEqual(['streak']);
    expect(saved.savedAt).toEqual(expect.any(Number));
  });

  test('también recupera la elección inicial sin tablero', () => {
    saveRun(
      sampleRun({
        phase: 'starter',
        board: null,
        starterOffers: ['rayo', 'borde', 'streak'],
      })
    );

    const saved = loadSavedRun();

    expect(saved.phase).toBe('starter');
    expect(saved.starterOffers).toEqual(['rayo', 'borde', 'streak']);
  });

  test('no guarda estados que no se pueden continuar', () => {
    saveRun(sampleRun({ phase: 'menu' }));
    saveRun(sampleRun({ phase: 'runOver' }));

    expect(loadSavedRun()).toBeNull();
  });

  test('descarta saves corruptos o incompletos', () => {
    window.localStorage.setItem('mina-fortuna:run:v1', '{no-json');
    expect(loadSavedRun()).toBeNull();

    window.localStorage.setItem(
      'mina-fortuna:run:v1',
      JSON.stringify({ phase: 'round', round: 1 })
    );
    expect(loadSavedRun()).toBeNull();
  });

  test('recordRun actualiza récords y borra la run en curso', () => {
    saveRun(sampleRun());

    const result = recordRun(
      sampleRun({ round: 5, totalScore: 9000, money: 30 })
    );

    expect(result.isRecord).toBe(true);
    expect(result.stats).toEqual({
      bestRound: 5,
      bestScore: 9000,
      bestMoney: 30,
    });
    expect(loadStats()).toEqual(result.stats);
    expect(loadSavedRun()).toBeNull();
  });

  test('una run peor no rebaja los récords', () => {
    recordRun(sampleRun({ round: 5, totalScore: 9000, money: 30 }));

    const result = recordRun(
      sampleRun({ round: 2, totalScore: 100, money: 1 })
    );

    expect(result.isRecord).toBe(false);
    expect(result.stats).toEqual({
      bestRound: 5,
      bestScore: 9000,
      bestMoney: 30,
    });
  });

  test('loadStats devuelve ceros si no hay datos', () => {
    expect(loadStats()).toEqual(emptyStats());
    clearSavedRun();
  });

  test('guarda la preferencia de sonido', () => {
    expect(loadSettings()).toEqual({ muted: false });

    saveSettings({ muted: true });
    expect(loadSettings()).toEqual({ muted: true });

    saveSettings({ muted: false });
    expect(loadSettings()).toEqual({ muted: false });
  });
});
