// Máquina de estados de la run. Todas las acciones son puras.

import {
  BASE_REWARD,
  HEARTS,
  MAX_FLAG_REWARD,
  MAX_JOKERS,
  REROLL_BASE_COST,
  getClicksForRound,
  getRoundConfig,
} from './balance';
import {
  countCorrectFlags,
  countFlags,
  createEmptyBoard,
  revealCell,
  toggleFlag,
} from './board';
import {
  STARTER_JOKERS,
  applyDetector,
  applyMoneyJokers,
  applyScoreJokers,
  getJoker,
  getMineProtection,
  hasJoker,
} from './jokers';
import { createRng } from './rng';
import { calculateClick } from './scoring';
import { rollShop, sellValue } from './shop';

export function createInitialState(seed = Date.now()) {
  return {
    phase: 'menu',
    seed: seed >>> 0,
    round: 1,
    money: 0,
    hearts: HEARTS,
    totalScore: 0,
    jokers: [],
    starterOffers: [],
    shop: null,
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
    seguroUsed: false,
    cascoUsed: false,
    rayoUsed: false,
    detectorUsed: false,
  };
}

function beginRun(seed) {
  const state = createInitialState(seed);
  const rng = createRng((state.seed ^ 0x9e3779b9) >>> 0);
  const starterOffers = rng.shuffle([...STARTER_JOKERS]).slice(0, 3);

  return { ...state, phase: 'starter', starterOffers };
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
    clicksLeft: getClicksForRound(round),
    streak: 0,
    lastResult: null,
    endReason: null,
    reward: 0,
    clearedInfo: null,
    starterOffers: [],
    shop: null,
    rayoUsed: false,
    cascoUsed: false,
    detectorUsed: false,
  };
}

function finishRun(state, reason, extra = {}) {
  return {
    ...state,
    ...extra,
    phase: 'runOver',
    endReason: reason,
    totalScore: state.totalScore + state.score,
  };
}

export function runReducer(state, action) {
  switch (action.type) {
    case 'START_RUN': {
      return beginRun((action.seed ?? Date.now()) >>> 0);
    }

    case 'RESTART': {
      return beginRun((action.seed ?? Date.now()) >>> 0);
    }

    case 'PICK_STARTER': {
      if (state.phase !== 'starter') return state;
      if (!state.starterOffers.includes(action.id)) return state;

      return startRound(
        { ...state, jokers: [action.id], starterOffers: [] },
        1
      );
    }

    case 'REVEAL': {
      if (state.phase !== 'round' || state.clicksLeft <= 0) return state;

      const seed =
        (state.seed ^
          Math.imul(state.round, 0x9e3779b9) ^
          Math.imul(state.clickId + 1, 0x85ebca6b)) >>>
        0;
      const rng = createRng(seed);
      const {
        board: revealedBoard,
        revealed,
        hitMine,
        placed,
      } = revealCell(state.board, action.index, rng);

      if (revealed.length === 0) return state;

      let board = revealedBoard;
      let detectorUsed = state.detectorUsed;

      if (placed && hasJoker(state, 'detector') && !detectorUsed) {
        board = applyDetector(board, state, rng);
        detectorUsed = true;
      }

      const clicksLeft = state.clicksLeft - 1;
      const clickId = state.clickId + 1;

      if (hitMine) {
        const protection = getMineProtection(state, rng);
        const stuck = clicksLeft <= 0 && state.score < state.target;

        if (protection) {
          const next = {
            ...state,
            board: { ...board, explodedIndex: null },
            clicksLeft,
            streak: 0,
            clickId,
            detectorUsed,
            seguroUsed: state.seguroUsed || protection === 'seguro',
            cascoUsed: state.cascoUsed || protection === 'casco',
            lastResult: {
              type: 'dud',
              protection,
              chips: 0,
              mult: 0,
              points: 0,
              id: clickId,
            },
          };

          return stuck ? finishRun(next, 'clicks') : next;
        }

        const hearts = state.hearts - 1;

        const next = {
          ...state,
          board,
          clicksLeft,
          hearts,
          streak: 0,
          clickId,
          detectorUsed,
          lastResult: {
            type: 'mine',
            chips: 0,
            mult: 0,
            points: 0,
            id: clickId,
          },
        };

        if (hearts <= 0) return finishRun(next, 'hearts');
        if (stuck) return finishRun(next, 'clicks');
        return next;
      }

      const baseClick = calculateClick({
        cells: board.cells,
        revealed,
        streak: state.streak,
        rows: board.rows,
        cols: board.cols,
      });

      const result = applyScoreJokers({
        state,
        click: {
          ...baseClick,
          correctFlags: countCorrectFlags(board),
          flags: countFlags(board),
        },
      });

      const score = state.score + result.points;
      const stuck = clicksLeft <= 0 && score < state.target;

      const next = {
        ...state,
        board,
        clicksLeft,
        score,
        streak: state.streak + 1,
        clickId,
        detectorUsed,
        rayoUsed: state.rayoUsed || result.rayoUsed,
        lastResult: { type: 'safe', ...result, id: clickId },
      };

      return stuck ? finishRun(next, 'clicks') : next;
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
      const moneyJokers = applyMoneyJokers(state);
      const reward =
        BASE_REWARD + state.clicksLeft + flagBonus + moneyJokers.total;
      const rng = createRng(
        (state.seed ^ Math.imul(state.round, 0x27d4eb2d) ^ 0x5f3759df) >>> 0
      );

      return {
        ...state,
        phase: 'shop',
        reward,
        money: state.money + reward,
        totalScore: state.totalScore + state.score,
        clearedInfo: {
          base: BASE_REWARD,
          clicks: state.clicksLeft,
          correctFlags,
          flagBonus,
          codicia: moneyJokers.codicia,
          interes: moneyJokers.interes,
        },
        shop: {
          offers: rollShop(rng, state.jokers),
          rerollCost: REROLL_BASE_COST,
          rerolls: 0,
        },
      };
    }

    case 'BUY_JOKER': {
      if (state.phase !== 'shop' || !state.shop) return state;
      if (!state.shop.offers.includes(action.id)) return state;
      if (state.jokers.length >= MAX_JOKERS) return state;

      const joker = getJoker(action.id);
      if (!joker || state.money < joker.price) return state;

      return {
        ...state,
        money: state.money - joker.price,
        jokers: [...state.jokers, joker.id],
        shop: {
          ...state.shop,
          offers: state.shop.offers.filter((id) => id !== joker.id),
        },
      };
    }

    case 'SELL_JOKER': {
      if (state.phase !== 'shop') return state;
      if (!state.jokers.includes(action.id)) return state;

      return {
        ...state,
        money: state.money + sellValue(action.id),
        jokers: state.jokers.filter((id) => id !== action.id),
      };
    }

    case 'REROLL_SHOP': {
      if (state.phase !== 'shop' || !state.shop) return state;
      if (state.money < state.shop.rerollCost) return state;

      const rerolls = state.shop.rerolls + 1;
      const rng = createRng(
        (state.seed ^
          Math.imul(state.round, 0x27d4eb2d) ^
          Math.imul(rerolls, 0x9e3779b9) ^
          0x5f3759df) >>>
          0
      );

      return {
        ...state,
        money: state.money - state.shop.rerollCost,
        shop: {
          offers: rollShop(rng, state.jokers),
          rerolls,
          rerollCost: state.shop.rerollCost + 1,
        },
      };
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'shop') return state;
      return startRound(state, state.round + 1);
    }

    default:
      return state;
  }
}
