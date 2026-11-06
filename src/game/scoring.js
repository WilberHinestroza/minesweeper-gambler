// Puntuación de un clic: chips x mult, al estilo Balatro.

import {
  CHIP_PER_CELL,
  CHIP_PER_NUMBER,
  MAX_STREAK_MULT,
  STREAK_STEP,
} from './balance';

export function roundMult(value) {
  return Math.round(value * 100) / 100;
}

export function streakMultiplier(streak) {
  return roundMult(1 + Math.min(streak * STREAK_STEP, MAX_STREAK_MULT));
}

// Calcula los valores base de un clic. Los comodines se aplican después,
// en jokers.js, para mantener esta función simple y testeable.
export function calculateClick({
  cells,
  revealed,
  streak = 0,
  rows,
  cols,
}) {
  let chips = 0;
  let numbered = 0;
  let borderCells = 0;
  let zeroRevealed = false;

  for (const index of revealed) {
    const cell = cells[index];
    if (!cell || cell.mine) continue;

    chips += CHIP_PER_CELL;
    if (cell.adjacent > 0) {
      chips += CHIP_PER_NUMBER * cell.adjacent;
      numbered += 1;
    } else {
      zeroRevealed = true;
    }

    if (
      rows &&
      cols &&
      (cell.row === 0 ||
        cell.col === 0 ||
        cell.row === rows - 1 ||
        cell.col === cols - 1)
    ) {
      borderCells += 1;
    }
  }

  const mult = streakMultiplier(streak);

  return {
    chips,
    numbered,
    mult,
    points: Math.round(chips * mult),
    revealed: revealed.length,
    borderCells,
    zeroRevealed,
    streak,
  };
}
