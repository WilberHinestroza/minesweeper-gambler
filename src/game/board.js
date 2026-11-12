// Lógica pura del tablero. Ninguna función muta el tablero de entrada.

export function neighborsOf(index, rows, cols) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const result = [];

  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        result.push(r * cols + c);
      }
    }
  }

  return result;
}

export function createEmptyBoard(rows, cols, mines) {
  const cells = Array.from({ length: rows * cols }, (_, index) => ({
    index,
    row: Math.floor(index / cols),
    col: index % cols,
    mine: false,
    adjacent: 0,
    revealed: false,
    flagged: false,
  }));

  return {
    rows,
    cols,
    mines,
    cells,
    minesPlaced: false,
    explodedIndex: null,
  };
}

// Coloca las minas después del primer clic, dejando libre el área 3x3
// alrededor de la casilla pulsada.
export function placeMines(board, safeIndex, rng) {
  const { rows, cols, cells, mines } = board;
  const safe = new Set([safeIndex, ...neighborsOf(safeIndex, rows, cols)]);

  let pool = [];
  for (let i = 0; i < cells.length; i += 1) {
    if (!safe.has(i)) pool.push(i);
  }

  // Tableros absurdamente pequeños: permitir minas en el borde del área segura.
  if (pool.length < mines) {
    pool = [];
    for (let i = 0; i < cells.length; i += 1) {
      if (i !== safeIndex) pool.push(i);
    }
  }

  rng.shuffle(pool);
  const mineSet = new Set(pool.slice(0, mines));

  const nextCells = cells.map((cell, i) => ({
    ...cell,
    mine: mineSet.has(i),
    adjacent: 0,
  }));

  for (let i = 0; i < nextCells.length; i += 1) {
    if (nextCells[i].mine) continue;
    nextCells[i].adjacent = neighborsOf(i, rows, cols).filter(
      (n) => nextCells[n].mine
    ).length;
  }

  return {
    ...board,
    cells: nextCells,
    minesPlaced: true,
  };
}

// Devuelve { board, revealed, hitMine }. Si la casilla no se puede abrir
// (ya revelada, bandera o fuera de rango) devuelve revealed vacío.
export function revealCell(board, index, rng) {
  if (index < 0 || index >= board.cells.length) {
    return { board, revealed: [], hitMine: false };
  }

  const target = board.cells[index];
  if (target.revealed || target.flagged) {
    return { board, revealed: [], hitMine: false };
  }

  const placed = !board.minesPlaced;
  const working = placed ? placeMines(board, index, rng) : board;
  const current = working.cells[index];

  if (current.mine) {
    const cells = working.cells.map((cell, i) =>
      i === index ? { ...cell, revealed: true } : cell
    );
    return {
      board: { ...working, cells, explodedIndex: index },
      revealed: [index],
      hitMine: true,
      placed,
    };
  }

  // Despeje clásico: las casillas sin números vecinos abren en cascada.
  const cells = working.cells.map((cell) => ({ ...cell }));
  const revealed = [];
  const stack = [index];

  while (stack.length > 0) {
    const i = stack.pop();
    const cell = cells[i];
    if (!cell || cell.revealed || cell.flagged || cell.mine) continue;

    cell.revealed = true;
    revealed.push(i);

    if (cell.adjacent === 0) {
      for (const n of neighborsOf(i, working.rows, working.cols)) {
        const neighbor = cells[n];
        if (!neighbor.revealed && !neighbor.flagged && !neighbor.mine) {
          stack.push(n);
        }
      }
    }
  }

  return { board: { ...working, cells }, revealed, hitMine: false, placed };
}

// Chording: abrir las casillas ocultas alrededor de un número cuando ya hay
// tantas banderas como minas indica. Si alguna bandera es incorrecta, la
// casilla minada detona como en el buscaminas clásico.
export function chordCell(board, index, rng) {
  const origin = board.cells[index];

  if (
    !board.minesPlaced ||
    !origin ||
    !origin.revealed ||
    origin.adjacent <= 0
  ) {
    return { board, revealed: [], hitMine: false };
  }

  const neighbors = neighborsOf(index, board.rows, board.cols);
  const flags = neighbors.filter((n) => board.cells[n].flagged).length;

  if (flags !== origin.adjacent) {
    return { board, revealed: [], hitMine: false };
  }

  const targets = neighbors.filter((n) => {
    const cell = board.cells[n];
    return !cell.revealed && !cell.flagged;
  });

  if (targets.length === 0) {
    return { board, revealed: [], hitMine: false };
  }

  let working = board;
  const revealed = [];

  for (const target of targets) {
    const result = revealCell(working, target, rng);
    if (result.revealed.length === 0) continue;

    working = result.board;
    revealed.push(...result.revealed);

    if (result.hitMine) {
      return { board: working, revealed, hitMine: true };
    }
  }

  return { board: working, revealed, hitMine: false };
}

export function toggleFlag(board, index) {
  const cell = board.cells[index];
  if (!cell || cell.revealed) return { board, changed: false };

  const used = countFlags(board);
  if (!cell.flagged && used >= board.mines) {
    return { board, changed: false };
  }

  const cells = board.cells.map((c, i) =>
    i === index ? { ...c, flagged: !c.flagged } : c
  );

  return { board: { ...board, cells }, changed: true };
}

// Marca una mina oculta al azar. Devuelve null si ya no quedan minas que
// marcar (por ejemplo, antes de colocar el tablero).
export function flagRandomMine(board, rng) {
  const mines = board.cells.filter(
    (cell) => cell.mine && !cell.flagged && !cell.revealed
  );
  if (mines.length === 0) return null;

  const target = mines[rng.int(mines.length)];

  return {
    ...board,
    cells: board.cells.map((cell) =>
      cell.index === target.index ? { ...cell, flagged: true } : cell
    ),
  };
}

export function countFlags(board) {
  return board.cells.reduce((total, cell) => total + (cell.flagged ? 1 : 0), 0);
}

export function countCorrectFlags(board) {
  return board.cells.reduce(
    (total, cell) => total + (cell.flagged && cell.mine ? 1 : 0),
    0
  );
}
