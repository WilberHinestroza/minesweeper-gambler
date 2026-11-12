// Constantes y curva de dificultad de la run.

export const HEARTS = 3;

export const MAX_JOKERS = 5;
export const MAX_TALISMANS = 3;
export const SHOP_OFFERS = 3;
export const SHOP_TALISMAN_OFFERS = 2;
export const REROLL_BASE_COST = 2;

export const STREAK_STEP = 0.5; // mult extra por clic seguro consecutivo
export const MAX_STREAK_MULT = 2.5; // tope de la racha base

export const CHIP_PER_CELL = 5;
export const CHIP_PER_NUMBER = 5;

export const BASE_REWARD = 3;
export const MAX_FLAG_REWARD = 3;

// Movimientos por ronda: 8 al empezar y +1 cada dos rondas (máx. 13).
// La intención es que las rondas avanzadas den margen para despejar sin
// sentir que cada clic es obligatorio.
export function getClicksForRound(round) {
  return Math.min(13, 7 + Math.ceil(round / 2));
}

const TABLE = [
  { round: 1, rows: 8, cols: 8, mines: 10, target: 500 },
  { round: 2, rows: 8, cols: 8, mines: 12, target: 750 },
  { round: 3, rows: 9, cols: 9, mines: 15, target: 1050 },
  { round: 4, rows: 9, cols: 9, mines: 18, target: 1450 },
  { round: 5, rows: 10, cols: 10, mines: 22, target: 2000 },
  { round: 6, rows: 10, cols: 10, mines: 26, target: 2700 },
  { round: 7, rows: 12, cols: 12, mines: 34, target: 3700 },
  { round: 8, rows: 12, cols: 12, mines: 40, target: 5000 },
];

export function getRoundConfig(round) {
  if (round <= TABLE.length) {
    return { ...TABLE[round - 1] };
  }

  const last = TABLE[TABLE.length - 1];
  const extra = round - TABLE.length;
  const size = Math.min(20, last.rows + Math.ceil(extra / 2) * 2);
  const mines = Math.min(
    size * size - 9,
    Math.round(last.mines * Math.pow(1.15, extra))
  );

  return {
    round,
    rows: size,
    cols: size,
    mines,
    target: Math.round(last.target * Math.pow(1.6, extra)),
  };
}
