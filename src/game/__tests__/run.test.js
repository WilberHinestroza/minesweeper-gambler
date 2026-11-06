import { getClicksForRound, getRoundConfig } from '../balance';
import { STARTER_JOKERS } from '../jokers';
import { createInitialState, runReducer } from '../run';

function begun(seed = 12345) {
  return runReducer(createInitialState(seed), { type: 'START_RUN', seed });
}

function started(seed = 12345, joker) {
  const state = begun(seed);
  const id = joker ?? state.starterOffers[0];
  return runReducer(state, { type: 'PICK_STARTER', id });
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

function noJokers(state) {
  return { ...state, jokers: [] };
}

describe('run', () => {
  test('START_RUN abre la elección de comodín inicial', () => {
    const state = begun();

    expect(state.phase).toBe('starter');
    expect(state.starterOffers).toHaveLength(3);
    expect(new Set(state.starterOffers).size).toBe(3);
    for (const id of state.starterOffers) {
      expect(STARTER_JOKERS).toContain(id);
    }
  });

  test('PICK_STARTER añade el comodín y empieza la ronda 1', () => {
    const state = begun();
    const id = state.starterOffers[1];

    const next = runReducer(state, { type: 'PICK_STARTER', id });

    expect(next.phase).toBe('round');
    expect(next.round).toBe(1);
    expect(next.jokers).toEqual([id]);
    expect(next.hearts).toBe(3);
    expect(next.clicksLeft).toBe(getClicksForRound(1));
    expect(next.target).toBe(getRoundConfig(1).target);
    expect(next.money).toBe(0);
    expect(next.board.cells).toHaveLength(64);
  });

  test('PICK_STARTER ignora comodines que no están en la oferta', () => {
    const state = begun();
    const next = runReducer(state, { type: 'PICK_STARTER', id: 'detector' });

    expect(next).toBe(state);
  });

  test('revelar consume un movimiento y suma puntos', () => {
    const state = runReducer(started(), { type: 'REVEAL', index: 27 });

    expect(state.clicksLeft).toBe(getClicksForRound(1) - 1);
    expect(state.score).toBeGreaterThan(0);
    expect(state.streak).toBe(1);
    expect(state.lastResult.type).toBe('safe');
    expect(state.lastResult.triggers).toEqual(expect.any(Array));
    expect(state.board.minesPlaced).toBe(true);
  });

  test('una mina resta una vida y no puntúa', () => {
    const state = runReducer(withMineOnFirstCell(noJokers(started())), {
      type: 'REVEAL',
      index: 0,
    });

    expect(state.hearts).toBe(2);
    expect(state.clicksLeft).toBe(getClicksForRound(1) - 1);
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.lastResult.type).toBe('mine');
  });

  test('sin vidas la run termina', () => {
    const state = runReducer(
      withMineOnFirstCell(noJokers(started()), { hearts: 1 }),
      { type: 'REVEAL', index: 0 }
    );

    expect(state.hearts).toBe(0);
    expect(state.phase).toBe('runOver');
    expect(state.endReason).toBe('hearts');
  });

  test('el casco ignora la primera mina de la ronda', () => {
    const base = { ...started(), jokers: ['casco'] };
    const state = runReducer(withMineOnFirstCell(base), {
      type: 'REVEAL',
      index: 0,
    });

    expect(state.hearts).toBe(3);
    expect(state.phase).toBe('round');
    expect(state.cascoUsed).toBe(true);
    expect(state.lastResult.type).toBe('dud');
    expect(state.lastResult.protection).toBe('casco');

    const second = runReducer(
      withMineOnFirstCell(base, { cascoUsed: true }),
      { type: 'REVEAL', index: 0 }
    );

    expect(second.hearts).toBe(2);
    expect(second.lastResult.type).toBe('mine');
  });

  test('el detector marca una mina al colocar el tablero', () => {
    const state = runReducer({ ...started(), jokers: ['detector'] }, {
      type: 'REVEAL',
      index: 27,
    });

    const flags = state.board.cells.filter((cell) => cell.flagged);
    expect(flags).toHaveLength(1);
    expect(flags[0].mine).toBe(true);
    expect(state.detectorUsed).toBe(true);
  });

  test('quedarse sin movimientos sin objetivo termina la run', () => {
    const state = runReducer(started(), { type: 'REVEAL', index: 27 });
    const base = {
      ...noJokers(state),
      clicksLeft: 1,
      target: 999999,
    };
    const hiddenIndex = base.board.cells.findIndex(
      (cell) => !cell.revealed && !cell.flagged
    );

    const next = runReducer(base, { type: 'REVEAL', index: hiddenIndex });

    expect(next.clicksLeft).toBe(0);
    expect(next.phase).toBe('runOver');
    expect(next.endReason).toBe('clicks');
  });

  test('cobrar paga base + movimientos sobrantes y abre la tienda', () => {
    const state = runReducer(
      { ...started(), jokers: [], score: 9999 },
      { type: 'CASH_OUT' }
    );

    expect(state.phase).toBe('shop');
    expect(state.reward).toBe(3 + getClicksForRound(1));
    expect(state.money).toBe(state.reward);
    expect(state.clearedInfo.clicks).toBe(getClicksForRound(1));
    expect(state.shop.offers).toHaveLength(3);
    expect(state.shop.rerollCost).toBe(2);
  });

  test('las banderas acertadas suman al cobrar', () => {
    const base = noJokers(started());
    const cells = base.board.cells.map((cell, index) =>
      index < 2 ? { ...cell, mine: true, flagged: true } : cell
    );
    const state = runReducer(
      {
        ...base,
        board: { ...base.board, cells, minesPlaced: true },
        score: 9999,
      },
      { type: 'CASH_OUT' }
    );

    expect(state.clearedInfo.correctFlags).toBe(2);
    expect(state.reward).toBe(3 + getClicksForRound(1) + 2);
  });

  test('codicia e interés añaden dinero al cobrar', () => {
    const codicia = runReducer(
      { ...started(), jokers: ['codicia'], score: 9999 },
      { type: 'CASH_OUT' }
    );
    expect(codicia.clearedInfo.codicia).toBe(5);
    expect(codicia.reward).toBe(3 + getClicksForRound(1) + 5);

    const interes = runReducer(
      { ...started(), jokers: ['interes'], money: 20, score: 9999 },
      { type: 'CASH_OUT' }
    );
    expect(interes.clearedInfo.interes).toBe(3);
    expect(interes.reward).toBe(3 + getClicksForRound(1) + 3);
    expect(interes.money).toBe(20 + interes.reward);
  });

  test('la siguiente ronda conserva dinero, vidas y comodines', () => {
    const cleared = runReducer(
      { ...started(), jokers: ['streak'], score: 9999 },
      { type: 'CASH_OUT' }
    );
    const state = runReducer(cleared, { type: 'NEXT_ROUND' });

    expect(state.phase).toBe('round');
    expect(state.round).toBe(2);
    expect(state.target).toBe(getRoundConfig(2).target);
    expect(state.clicksLeft).toBe(getClicksForRound(2));
    expect(state.money).toBe(cleared.money);
    expect(state.hearts).toBe(3);
    expect(state.jokers).toEqual(['streak']);
    expect(state.score).toBe(0);
    expect(state.shop).toBeNull();
    expect(state.cascoUsed).toBe(false);
    expect(state.rayoUsed).toBe(false);
  });

  test('no se puede cobrar sin alcanzar el objetivo', () => {
    const state = runReducer(started(), { type: 'CASH_OUT' });
    expect(state.phase).toBe('round');
  });

  test('comprar un comodín descuenta dinero y lo añade al mazo', () => {
    const base = {
      ...started(),
      phase: 'shop',
      money: 10,
      jokers: ['streak'],
      shop: { offers: ['rayo'], rerollCost: 2, rerolls: 0 },
    };

    const state = runReducer(base, { type: 'BUY_JOKER', id: 'rayo' });

    expect(state.money).toBe(4);
    expect(state.jokers).toEqual(['streak', 'rayo']);
    expect(state.shop.offers).toEqual([]);
  });

  test('no se puede comprar sin dinero o con el mazo lleno', () => {
    const poor = {
      ...started(),
      phase: 'shop',
      money: 1,
      jokers: [],
      shop: { offers: ['rayo'], rerollCost: 2, rerolls: 0 },
    };
    expect(runReducer(poor, { type: 'BUY_JOKER', id: 'rayo' })).toBe(poor);

    const full = {
      ...poor,
      money: 100,
      jokers: ['streak', 'counter', 'rayo', 'borde', 'seguro'],
    };
    expect(runReducer(full, { type: 'BUY_JOKER', id: 'rayo' })).toBe(full);
  });

  test('vender un comodín devuelve la mitad de su precio', () => {
    const base = {
      ...started(),
      phase: 'shop',
      money: 0,
      jokers: ['streak', 'rayo'],
      shop: { offers: [], rerollCost: 2, rerolls: 0 },
    };

    const state = runReducer(base, { type: 'SELL_JOKER', id: 'rayo' });

    expect(state.jokers).toEqual(['streak']);
    expect(state.money).toBe(3);
  });

  test('re-tirar cuesta dinero y sube el precio', () => {
    const base = {
      ...started(),
      phase: 'shop',
      money: 10,
      jokers: [],
      shop: { offers: ['rayo'], rerollCost: 2, rerolls: 0 },
    };

    const state = runReducer(base, { type: 'REROLL_SHOP' });

    expect(state.money).toBe(8);
    expect(state.shop.rerolls).toBe(1);
    expect(state.shop.rerollCost).toBe(3);
    expect(state.shop.offers).toHaveLength(3);
  });

  test('no se puede re-tirar sin dinero suficiente', () => {
    const base = {
      ...started(),
      phase: 'shop',
      money: 1,
      jokers: [],
      shop: { offers: ['rayo'], rerollCost: 2, rerolls: 0 },
    };

    expect(runReducer(base, { type: 'REROLL_SHOP' })).toBe(base);
  });
});
