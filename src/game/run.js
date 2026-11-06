// Máquina de estados de la run. Todas las acciones son puras.

import {
  BASE_REWARD,
  CLICKS_PER_ROUND,
  HEARTS,
  MAX_FLAG_REWARD,
  getRoundConfig,
} from './balance';
import {
  countCorrectFlags,
  createEmptyBoard,
  revealCell,
  toggleFlag,
} from './board';
import { createRng } from './rng';
import { calculateClick } from './scoring';

export function createInitialState(seed = Date.now()) {
  return {
    phase: 'menu',
    seed: seed >>> 0,
    round: 1,
    money: 0,
    hearts: HEARTS,
    totalScore: 0,
    config: null,
    board: null,
    target: 0,
    score: 0,
    clicksLeft: 0,
    streak: 0,
    lastResult: null,
    clickId: 0,
    endReason: null,
    reward: 0,
    clearedInfo: null,
  };
}

export function startRound(state, round) {
  const config = getRoundConfig(round);

  return {
    ...state,
    phase: 'round',
    round,
    config,
    board: createEmptyBoard(config.rows, config.cols, config.mines),
    target: config.target,
    score: 0,
    clicksLeft: CLICKS_PER_ROUND,
    streak: 0,
    lastResult: null,
    endReason: null,
    reward: 0,
    clearedInfo: null,
  };
}

export function runReducer(state, action) {
  switch (action.type) {
    case 'START_RUN': {
      const seed = (action.seed ?? Date.now()) >>> 0;
      return startRound(createInitialState(seed), 1);
    }

    case 'REVEAL': {
      if (state.phase !== 'round' || state.clicksLeft <= 0) return state;

      const seed = (state.seed ^ Math.imul(state.round, 0x9e3779b9)) >>> 0;
      const rng = createRng(seed);
      const { board, revealed, hitMine } = revealCell(
        state.board,
        action.index,
        rng
      );

      if (revealed.length === 0) return state;

      const clicksLeft = state.clicksLeft - 1;
      const clickId = state.clickId + 1;

      if (hitMine) {
        const hearts = state.hearts - 1;
        const dead = hearts <= 0;
        const stuck = clicksLeft <= 0 && state.score < state.target;
        const over = dead || stuck;

        return {
          ...state,
          board,
          clicksLeft,
          hearts,
          streak: 0,
          clickId,
          lastResult: {
            type: 'mine',
            chips: 0,
            mult: 0,
            points: 0,
            id: clickId,
          },
          phase: over ? 'runOver' : 'round',
          endReason: dead ? 'hearts' : stuck ? 'clicks' : null,
          totalScore: over ? state.totalScore + state.score : state.totalScore,
        };
      }

      const result = calculateClick({
        cells: board.cells,
        revealed,
        streak: state.streak,
      });
      const score = state.score + result.points;
      const stuck = clicksLeft <= 0 && score < state.target;

      return {
        ...state,
        board,
        clicksLeft,
        score,
        streak: state.streak + 1,
        clickId,
        lastResult: { type: 'safe', ...result, id: clickId },
        phase: stuck ? 'runOver' : 'round',
        endReason: stuck ? 'clicks' : null,
        totalScore: stuck ? state.totalScore + score : state.totalScore,
      };
    }

    case 'FLAG': {
      if (state.phase !== 'round') return state;
      const { board, changed } = toggleFlag(state.board, action.index);
      return changed ? { ...state, board } : state;
    }

    case 'CASH_OUT': {
      if (state.phase !== 'round' || state.score < state.target) return state;

      const correctFlags = countCorrectFlags(state.board);
      const flagBonus = Math.min(correctFlags, MAX_FLAG_REWARD);
      const reward = BASE_REWARD + state.clicksLeft + flagBonus;

      return {
        ...state,
        phase: 'cleared',
        reward,
        money: state.money + reward,
        totalScore: state.totalScore + state.score,
        clearedInfo: {
          base: BASE_REWARD,
          clicks: state.clicksLeft,
          correctFlags,
          flagBonus,
        },
      };
    }

    case 'NEXT_ROUND':
      return startRound(state, state.round + 1);

    case 'RESTART': {
      const seed = (action.seed ?? Date.now()) >>> 0;
      return startRound(createInitialState(seed), 1);
    }

    default:
      return state;
  }
}
