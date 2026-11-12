import {
  chordCell,
  countFlags,
  createEmptyBoard,
  neighborsOf,
  placeMines,
  revealCell,
  toggleFlag,
} from '../board';
import { createRng } from '../rng';

function boardWithMines(rows, cols, mineIndexes) {
  const base = createEmptyBoard(rows, cols, mineIndexes.length);
  const mined = base.cells.map((cell) => ({
    ...cell,
    mine: mineIndexes.includes(cell.index),
  }));
  const cells = mined.map((cell) => ({
    ...cell,
    adjacent: neighborsOf(cell.index, rows, cols).filter((n) => mined[n].mine)
      .length,
  }));

  return { ...base, cells, minesPlaced: true };
}

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

  test('el chording abre las vecinas si las banderas coinciden', () => {
    const base = boardWithMines(3, 3, [0]);
    const board = {
      ...base,
      cells: base.cells.map((cell) => {
        if (cell.index === 4) return { ...cell, revealed: true };
        if (cell.index === 0) return { ...cell, flagged: true };
        return cell;
      }),
    };

    const result = chordCell(board, 4, createRng(1));

    expect(result.hitMine).toBe(false);
    expect(result.revealed).toHaveLength(7);
    expect(result.board.cells[0].revealed).toBe(false);
    expect(result.board.cells[0].flagged).toBe(true);
  });

  test('el chording con una bandera incorrecta detona la mina', () => {
    const base = boardWithMines(3, 3, [0]);
    const board = {
      ...base,
      cells: base.cells.map((cell) => {
        if (cell.index === 4) return { ...cell, revealed: true };
        if (cell.index === 8) return { ...cell, flagged: true };
        return cell;
      }),
    };

    const result = chordCell(board, 4, createRng(1));

    expect(result.hitMine).toBe(true);
    expect(result.board.explodedIndex).toBe(0);
    expect(result.revealed).toContain(0);
  });

  test('el chording no hace nada si faltan banderas', () => {
    const base = boardWithMines(3, 3, [0]);
    const board = {
      ...base,
      cells: base.cells.map((cell) =>
        cell.index === 4 ? { ...cell, revealed: true } : cell
      ),
    };

    const result = chordCell(board, 4, createRng(1));

    expect(result.revealed).toEqual([]);
    expect(result.hitMine).toBe(false);
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
