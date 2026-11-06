import { createInitialState, runReducer } from '../run';

function started(seed = 12345) {
  return runReducer(createInitialState(seed), { type: 'START_RUN', seed });
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

describe('run', () => {
  test('empieza una run con los valores iniciales', () => {
    const state = started();

    expect(state.phase).toBe('round');
    expect(state.round).toBe(1);
    expect(state.hearts).toBe(3);
    expect(state.clicksLeft).toBe(5);
    expect(state.target).toBe(500);
    expect(state.money).toBe(0);
    expect(state.board.cells).toHaveLength(64);
  });

  test('revelar consume un clic y suma puntos', () => {
    const state = runReducer(started(), { type: 'REVEAL', index: 27 });

    expect(state.clicksLeft).toBe(4);
    expect(state.score).toBeGreaterThan(0);
    expect(state.streak).toBe(1);
    expect(state.lastResult.type).toBe('safe');
    expect(state.board.minesPlaced).toBe(true);
  });

  test('una mina resta una vida y no puntúa', () => {
    const state = runReducer(withMineOnFirstCell(started()), {
      type: 'REVEAL',
      index: 0,
    });

    expect(state.hearts).toBe(2);
    expect(state.clicksLeft).toBe(4);
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.lastResult.type).toBe('mine');
  });

  test('sin vidas la run termina', () => {
    const state = runReducer(withMineOnFirstCell(started(), { hearts: 1 }), {
      type: 'REVEAL',
      index: 0,
    });

    expect(state.hearts).toBe(0);
    expect(state.phase).toBe('runOver');
    expect(state.endReason).toBe('hearts');
  });

  test('quedarse sin clics sin objetivo termina la run', () => {
    const state = runReducer(started(), { type: 'REVEAL', index: 27 });
    const base = {
      ...state,
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

  test('cobrar paga base + clics sobrantes', () => {
    const state = runReducer({ ...started(), score: 9999 }, {
      type: 'CASH_OUT',
    });

    expect(state.phase).toBe('cleared');
    expect(state.reward).toBe(8);
    expect(state.money).toBe(8);
    expect(state.clearedInfo.clicks).toBe(5);
  });

  test('las banderas acertadas suman al cobrar', () => {
    const base = started();
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
    expect(state.reward).toBe(3 + 5 + 2);
  });

  test('la siguiente ronda conserva dinero y vidas', () => {
    const cleared = runReducer({ ...started(), score: 9999 }, {
      type: 'CASH_OUT',
    });
    const state = runReducer(cleared, { type: 'NEXT_ROUND' });

    expect(state.phase).toBe('round');
    expect(state.round).toBe(2);
    expect(state.target).toBe(800);
    expect(state.money).toBe(cleared.money);
    expect(state.hearts).toBe(3);
    expect(state.score).toBe(0);
    expect(state.clicksLeft).toBe(5);
  });

  test('no se puede cobrar sin alcanzar el objetivo', () => {
    const state = runReducer(started(), { type: 'CASH_OUT' });
    expect(state.phase).toBe('round');
  });
});
