// Definiciones de comodines y sus efectos.
// Los hooks son funciones puras que reciben el estado y devuelven bonificaciones.

import { roundMult } from './scoring';

export const JOKERS = [
  {
    id: 'streak',
    name: 'Racha',
    price: 4,
    symbol: '✦',
    color: '#e9b949',
    description: '+0.25 mult extra por cada clic seguro consecutivo.',
  },
  {
    id: 'smoke',
    name: 'Bomba de humo',
    price: 4,
    symbol: '⚑',
    color: '#c9a227',
    description: '+2 mult por cada bandera acertada (máx. +8).',
  },
  {
    id: 'counter',
    name: 'Contador',
    price: 5,
    symbol: '№',
    color: '#6fb3ff',
    description: '+0.5 mult por cada casilla con número (máx. +4).',
  },
  {
    id: 'rayo',
    name: 'Rayo',
    price: 6,
    symbol: '⚡',
    color: '#ffe066',
    description: 'El primer despeje de cero de cada ronda duplica los chips.',
  },
  {
    id: 'seguro',
    name: 'Seguro',
    price: 7,
    symbol: '✚',
    color: '#4fae7c',
    description: 'Ignora la primera mina de la run.',
  },
  {
    id: 'casco',
    name: 'Casco',
    price: 6,
    symbol: '⛑',
    color: '#8aa694',
    description: 'Ignora la primera mina de cada ronda.',
  },
  {
    id: 'detector',
    name: 'Detector',
    price: 5,
    symbol: '◎',
    color: '#5ee0d0',
    description: 'Marca una mina aleatoria al colocar el tablero.',
  },
  {
    id: 'codicia',
    name: 'Codicia',
    price: 5,
    symbol: '$',
    color: '#e9b949',
    description: '+$1 por cada 100 puntos de la ronda (máx. +$5).',
  },
  {
    id: 'duplicador',
    name: 'Duplicador',
    price: 6,
    symbol: '×',
    color: '#ff7b72',
    description: '×1.5 mult si el clic revela 5 o más casillas.',
  },
  {
    id: 'suertudo',
    name: 'Suertudo',
    price: 7,
    symbol: '♣',
    color: '#4fae7c',
    description: '10% de probabilidad de que una mina sea de fogueo.',
  },
  {
    id: 'interes',
    name: 'Interés',
    price: 4,
    symbol: '%',
    color: '#b388ff',
    description: '+$1 por cada $5 que tengas al cobrar (máx. +$3).',
  },
  {
    id: 'borde',
    name: 'Borde',
    price: 3,
    symbol: '▦',
    color: '#8aa694',
    description: '+8 chips por cada casilla del borde revelada.',
  },
];

// Comodines con los que se puede empezar la run.
export const STARTER_JOKERS = ['streak', 'borde', 'duplicador', 'rayo'];

const BY_ID = JOKERS.reduce((map, joker) => {
  map[joker.id] = joker;
  return map;
}, {});

export function getJoker(id) {
  return BY_ID[id];
}

export function hasJoker(state, id) {
  return state.jokers.includes(id);
}

// Devuelve el tipo de protección si la mina no debe explotar.
export function getMineProtection(state, rng) {
  if (hasJoker(state, 'suertudo') && rng.next() < 0.1) return 'suertudo';
  if (hasJoker(state, 'seguro') && !state.seguroUsed) return 'seguro';
  if (hasJoker(state, 'casco') && !state.cascoUsed) return 'casco';
  return null;
}

// Detector: abandera una mina aleatoria después de colocar el tablero.
export function applyDetector(board, state, rng) {
  if (!hasJoker(state, 'detector')) return board;

  const mines = board.cells.filter(
    (cell) => cell.mine && !cell.flagged && !cell.revealed
  );
  if (mines.length === 0) return board;

  const target = mines[rng.int(mines.length)];

  return {
    ...board,
    cells: board.cells.map((cell) =>
      cell.index === target.index ? { ...cell, flagged: true } : cell
    ),
  };
}

// Aplica los comodines que modifican la puntuación de un clic.
export function applyScoreJokers({ state, click }) {
  let chips = click.chips;
  let addMult = 0;
  let xMult = 1;
  let rayoUsed = false;
  const triggers = [];

  const addTrigger = (id, label) => {
    const joker = getJoker(id);
    triggers.push({ id, name: joker.name, symbol: joker.symbol, label });
  };

  if (hasJoker(state, 'streak') && click.streak > 0) {
    const bonus = roundMult(click.streak * 0.25);
    addMult = roundMult(addMult + bonus);
    addTrigger('streak', `+${bonus} mult`);
  }

  if (hasJoker(state, 'smoke') && click.correctFlags > 0) {
    const bonus = Math.min(click.correctFlags, 4) * 2;
    addMult += bonus;
    addTrigger('smoke', `+${bonus} mult`);
  }

  if (hasJoker(state, 'counter') && click.numbered > 0) {
    const bonus = roundMult(Math.min(click.numbered * 0.5, 4));
    addMult = roundMult(addMult + bonus);
    addTrigger('counter', `+${bonus} mult`);
  }

  if (hasJoker(state, 'borde') && click.borderCells > 0) {
    const bonus = click.borderCells * 8;
    chips += bonus;
    addTrigger('borde', `+${bonus} chips`);
  }

  if (hasJoker(state, 'rayo') && !state.rayoUsed && click.zeroRevealed) {
    chips *= 2;
    rayoUsed = true;
    addTrigger('rayo', 'chips ×2');
  }

  if (hasJoker(state, 'duplicador') && click.revealed >= 5) {
    xMult *= 1.5;
    addTrigger('duplicador', 'mult ×1.5');
  }

  const mult = roundMult((click.mult + addMult) * xMult);

  return {
    chips,
    mult,
    points: Math.round(chips * mult),
    rayoUsed,
    triggers,
  };
}

// Bonificaciones de dinero que se aplican al cobrar.
export function applyMoneyJokers(state) {
  const codicia = hasJoker(state, 'codicia')
    ? Math.min(5, Math.floor(state.score / 100))
    : 0;
  const interes = hasJoker(state, 'interes')
    ? Math.min(3, Math.floor(state.money / 5))
    : 0;

  return { codicia, interes, total: codicia + interes };
}
