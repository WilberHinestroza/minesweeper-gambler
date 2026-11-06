import {
  JOKERS,
  applyDetector,
  applyMoneyJokers,
  applyScoreJokers,
  getJoker,
  getMineProtection,
} from '../jokers';

function click(overrides = {}) {
  return {
    chips: 50,
    mult: 2,
    points: 100,
    numbered: 0,
    streak: 0,
    correctFlags: 0,
    borderCells: 0,
    zeroRevealed: false,
    revealed: 3,
    ...overrides,
  };
}

describe('jokers', () => {
  test('hay 12 comodines con ids únicos', () => {
    expect(JOKERS).toHaveLength(12);
    expect(new Set(JOKERS.map((joker) => joker.id)).size).toBe(12);
  });

  test('sin comodines la puntuación no cambia', () => {
    const result = applyScoreJokers({
      state: { jokers: [], rayoUsed: false },
      click: click(),
    });

    expect(result.chips).toBe(50);
    expect(result.mult).toBe(2);
    expect(result.points).toBe(100);
    expect(result.triggers).toEqual([]);
    expect(result.rayoUsed).toBe(false);
  });

  test('racha y contador suman mult antes de multiplicar', () => {
    const result = applyScoreJokers({
      state: { jokers: ['streak', 'counter'], rayoUsed: false },
      click: click({ mult: 1, numbered: 3, streak: 2 }),
    });

    // base 1 + racha 0.5 + contador 1.5 = 3
    expect(result.mult).toBe(3);
    expect(result.points).toBe(150);
    expect(result.triggers.map((trigger) => trigger.id)).toEqual([
      'streak',
      'counter',
    ]);
  });

  test('bomba de humo suma como máximo +8 mult', () => {
    const result = applyScoreJokers({
      state: { jokers: ['smoke'], rayoUsed: false },
      click: click({ mult: 1, correctFlags: 6 }),
    });

    expect(result.mult).toBe(9);
  });

  test('borde añade chips por casilla de borde', () => {
    const result = applyScoreJokers({
      state: { jokers: ['borde'], rayoUsed: false },
      click: click({ mult: 1, borderCells: 2 }),
    });

    expect(result.chips).toBe(66);
    expect(result.points).toBe(66);
  });

  test('rayo duplica los chips una sola vez por ronda', () => {
    const first = applyScoreJokers({
      state: { jokers: ['rayo'], rayoUsed: false },
      click: click({ zeroRevealed: true }),
    });

    expect(first.chips).toBe(100);
    expect(first.rayoUsed).toBe(true);

    const second = applyScoreJokers({
      state: { jokers: ['rayo'], rayoUsed: true },
      click: click({ zeroRevealed: true }),
    });

    expect(second.chips).toBe(50);
    expect(second.rayoUsed).toBe(false);
  });

  test('duplicador aplica x1.5 con 5 o más casillas', () => {
    const result = applyScoreJokers({
      state: { jokers: ['duplicador'], rayoUsed: false },
      click: click({ mult: 1, revealed: 5 }),
    });

    expect(result.mult).toBe(1.5);
    expect(result.points).toBe(75);
  });

  test('los multiplicadores se combinan en orden', () => {
    const result = applyScoreJokers({
      state: { jokers: ['counter', 'duplicador'], rayoUsed: false },
      click: click({ chips: 100, mult: 1, numbered: 2, revealed: 6 }),
    });

    // (1 + 1) x 1.5 = 3
    expect(result.mult).toBe(3);
    expect(result.points).toBe(300);
  });

  test('codicia e interés respetan sus topes', () => {
    const state = { jokers: ['codicia', 'interes'], score: 9999, money: 100 };

    expect(applyMoneyJokers(state)).toEqual({
      codicia: 5,
      interes: 3,
      total: 8,
    });

    expect(
      applyMoneyJokers({ jokers: ['codicia', 'interes'], score: 250, money: 7 })
    ).toEqual({ codicia: 2, interes: 1, total: 3 });
  });

  test('las protecciones respetan su prioridad y sus usos', () => {
    const base = { jokers: ['suertudo'], seguroUsed: false, cascoUsed: false };

    expect(getMineProtection(base, { next: () => 0.05 })).toBe('suertudo');
    expect(getMineProtection(base, { next: () => 0.5 })).toBeNull();

    expect(
      getMineProtection(
        { ...base, jokers: ['seguro', 'casco'] },
        { next: () => 0.5 }
      )
    ).toBe('seguro');

    expect(
      getMineProtection(
        { ...base, jokers: ['seguro', 'casco'], seguroUsed: true },
        { next: () => 0.5 }
      )
    ).toBe('casco');

    expect(
      getMineProtection(
        { ...base, jokers: ['seguro', 'casco'], seguroUsed: true, cascoUsed: true },
        { next: () => 0.5 }
      )
    ).toBeNull();
  });

  test('el detector abandera una mina y no toca el resto', () => {
    const board = {
      rows: 1,
      cols: 3,
      mines: 2,
      minesPlaced: true,
      explodedIndex: null,
      cells: [
        { index: 0, mine: true, flagged: false, revealed: false },
        { index: 1, mine: true, flagged: false, revealed: false },
        { index: 2, mine: false, flagged: false, revealed: false },
      ],
    };

    const next = applyDetector(board, { jokers: ['detector'] }, { int: () => 1 });

    expect(next.cells[1].flagged).toBe(true);
    expect(next.cells[0].flagged).toBe(false);
    expect(next.cells[2].flagged).toBe(false);
    expect(applyDetector(board, { jokers: [] }, { int: () => 0 })).toBe(board);
  });

  test('getJoker devuelve la definición o undefined', () => {
    expect(getJoker('streak').name).toBe('Racha');
    expect(getJoker('inexistente')).toBeUndefined();
  });
});
