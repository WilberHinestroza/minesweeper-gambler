import {
  countFlags,
  createEmptyBoard,
  placeMines,
  revealCell,
  toggleFlag,
} from '../board';
import { createRng } from '../rng';

describe('board', () => {
  test('el primer clic siempre es seguro y coloca todas las minas', () => {
    for (let seed = 1; seed <= 25; seed += 1) {
      const result = revealCell(
        createEmptyBoard(8, 8, 10),
        27,
        createRng(seed)
      );
      const { board } = result;

      expect(result.hitMine).toBe(false);
      expect(board.minesPlaced).toBe(true);
      expect(board.cells.filter((cell) => cell.mine)).toHaveLength(10);
      expect(board.cells[27].revealed).toBe(true);

      const safeZone = [18, 19, 20, 26, 27, 28, 34, 35, 36];
      for (const index of safeZone) {
        expect(board.cells[index].mine).toBe(false);
      }
    }
  });

  test('un tablero sin minas se despeja por completo', () => {
    const result = revealCell(createEmptyBoard(5, 5, 0), 12, createRng(1));

    expect(result.hitMine).toBe(false);
    expect(result.revealed).toHaveLength(25);
    expect(result.board.cells.every((cell) => cell.revealed)).toBe(true);
  });

  test('el despeje respeta las banderas', () => {
    const base = createEmptyBoard(5, 5, 1);
    const board = toggleFlag({ ...base, minesPlaced: true }, 12).board;

    expect(countFlags(board)).toBe(1);

    const result = revealCell(board, 0, createRng(1));

    expect(result.revealed).toHaveLength(24);
    expect(result.board.cells[12].revealed).toBe(false);
    expect(result.board.cells[12].flagged).toBe(true);
  });

  test('las banderas respetan el límite de minas', () => {
    let board = createEmptyBoard(8, 8, 2);

    board = toggleFlag(board, 0).board;
    board = toggleFlag(board, 1).board;

    expect(countFlags(board)).toBe(2);
    expect(toggleFlag(board, 2).changed).toBe(false);

    board = toggleFlag(board, 0).board;
    expect(countFlags(board)).toBe(1);
  });

  test('no se puede abanderar una casilla revelada', () => {
    const result = revealCell(createEmptyBoard(5, 5, 0), 12, createRng(1));
    const board = result.board;

    expect(toggleFlag(board, 12).changed).toBe(false);
  });

  test('detectar una mina marca la explosión', () => {
    const placed = placeMines(createEmptyBoard(8, 8, 10), 0, createRng(42));
    const mineIndex = placed.cells.findIndex((cell) => cell.mine);

    const result = revealCell(placed, mineIndex, createRng(1));

    expect(result.hitMine).toBe(true);
    expect(result.board.explodedIndex).toBe(mineIndex);
    expect(result.board.cells[mineIndex].revealed).toBe(true);
  });
});
