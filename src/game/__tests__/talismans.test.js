import { getClicksForRound, getRoundConfig } from '../balance';
import { createInitialState, runReducer, startRound } from '../run';
import { rollTalismans } from '../shop';
import { TALISMANS, getTalisman } from '../talismans';
import { createRng } from '../rng';

function begun(seed = 12345) {
  return runReducer(createInitialState(seed), { type: 'START_RUN', seed });
}

function started(seed = 12345) {
  const state = begun(seed);
  return runReducer(state, { type: 'PICK_STARTER', id: state.starterOffers[0] });
}

function withMineOnFirstCell(state, extra = {}) {
  const cells = state.board.cells.map((cell, index) =>
    index === 0 ? { ...cell, mine: true } : cell
  );
  return {
    ...state,
    ...extra,
    board: { ...state.board, cells, minesPlaced: true },
  };
}

describe('talismanes', () => {
  test('las definiciones son únicas y tienen precio', () => {
    const ids = TALISMANS.map((talisman) => talisman.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const talisman of TALISMANS) {
      expect(talisman.price).toBeGreaterThan(0);
      expect(talisman.name).toBeTruthy();
      expect(talisman.description).toBeTruthy();
      expect(getTalisman(talisman.id)).toBe(talisman);
    }
    expect(getTalisman('nope')).toBeUndefined();
  });

  test('rollTalismans no repite los que ya tienes', () => {
    const offers = rollTalismans(createRng(7), ['pico', 'cofre']);

    expect(offers).toHaveLength(2);
    expect(new Set(offers).size).toBe(2);
    expect(offers).not.toContain('pico');
    expect(offers).not.toContain('cofre');
  });

  test('el pico da dos movimientos y se consume', () => {
    const base = { ...started(), talismans: ['pico'] };
    const state = runReducer(base, { type: 'USE_TALISMAN', id: 'pico' });

    expect(state.clicksLeft).toBe(getClicksForRound(1) + 2);
    expect(state.talismans).toEqual([]);
    expect(state.lastResult.type).toBe('item');
    expect(state.lastResult.label).toBe('+2 movimientos');
  });

  test('el amuleto ignora la siguiente mina de la ronda', () => {
    const armed = runReducer(
      { ...started(), talismans: ['amuleto'] },
      { type: 'USE_TALISMAN', id: 'amuleto' }
    );

    expect(armed.amuletoReady).toBe(true);
    expect(armed.talismans).toEqual([]);

    const state = runReducer(withMineOnFirstCell(armed), {
      type: 'REVEAL',
      index: 0,
    });

    expect(state.hearts).toBe(3);
    expect(state.phase).toBe('round');
    expect(state.amuletoReady).toBe(false);
    expect(state.lastResult.type).toBe('dud');
    expect(state.lastResult.protection).toBe('amuleto');
  });

  test('la brújula marca una mina solo si el tablero está colocado', () => {
    const unplaced = { ...started(), talismans: ['brujula'] };
    expect(
      runReducer(unplaced, { type: 'USE_TALISMAN', id: 'brujula' })
    ).toBe(unplaced);

    const placed = withMineOnFirstCell(unplaced);
    const state = runReducer(placed, { type: 'USE_TALISMAN', id: 'brujula' });

    expect(state.talismans).toEqual([]);
    expect(state.board.cells[0].flagged).toBe(true);
    expect(state.board.cells[0].mine).toBe(true);
  });

  test('el cofre suma $4 extra al cobrar', () => {
    const used = runReducer(
      { ...started(), talismans: ['cofre'] },
      { type: 'USE_TALISMAN', id: 'cofre' }
    );

    expect(used.cofreBonus).toBe(4);

    const state = runReducer(
      { ...used, jokers: [], score: 9999 },
      { type: 'CASH_OUT' }
    );

    expect(state.clearedInfo.cofre).toBe(4);
    expect(state.reward).toBe(
      3 + getClicksForRound(1) + 4
    );
  });

  test('comprar un talismán descuenta dinero y lo guarda', () => {
    const base = {
      ...started(),
      phase: 'shop',
      money: 10,
      talismans: [],
      shop: { offers: [], talismans: ['pico'], rerollCost: 2, rerolls: 0 },
    };

    const state = runReducer(base, { type: 'BUY_TALISMAN', id: 'pico' });

    expect(state.money).toBe(6);
    expect(state.talismans).toEqual(['pico']);
    expect(state.shop.talismans).toEqual([]);
  });

  test('no se compran talismanes repetidos, sin dinero o con el inventario lleno', () => {
    const base = {
      ...started(),
      phase: 'shop',
      money: 10,
      talismans: [],
      shop: { offers: [], talismans: ['pico'], rerollCost: 2, rerolls: 0 },
    };

    const owned = { ...base, talismans: ['pico'] };
    expect(runReducer(owned, { type: 'BUY_TALISMAN', id: 'pico' })).toBe(
      owned
    );

    const poor = { ...base, money: 3 };
    expect(runReducer(poor, { type: 'BUY_TALISMAN', id: 'pico' })).toBe(poor);

    const full = { ...base, talismans: ['amuleto', 'brujula', 'cofre'] };
    expect(runReducer(full, { type: 'BUY_TALISMAN', id: 'pico' })).toBe(full);
  });

  test('la siguiente ronda conserva los talismanes y reinicia sus efectos', () => {
    const cleared = runReducer(
      {
        ...started(),
        talismans: ['pico'],
        amuletoReady: true,
        cofreBonus: 4,
        score: 9999,
      },
      { type: 'CASH_OUT' }
    );
    const next = runReducer(cleared, { type: 'NEXT_ROUND' });

    expect(next.talismans).toEqual(['pico']);
    expect(next.amuletoReady).toBe(false);
    expect(next.cofreBonus).toBe(0);
    expect(next.round).toBe(2);
    expect(next.target).toBe(getRoundConfig(2).target);
  });

  test('startRound también limpia los efectos de talismanes', () => {
    const state = startRound(
      { ...started(), amuletoReady: true, cofreBonus: 8 },
      3
    );

    expect(state.amuletoReady).toBe(false);
    expect(state.cofreBonus).toBe(0);
  });
});
