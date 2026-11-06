import Cell from './Cell';

export default function Board({
  board,
  onReveal,
  onFlag,
  flagMode,
  disabled,
  explodedIndex,
}) {
  return (
    <div
      className={`board ${flagMode ? 'is-flagging' : ''}`}
      style={{ '--cols': board.cols }}
      role="group"
      aria-label={`Tablero de ${board.rows} por ${board.cols}`}
      onContextMenu={(event) => event.preventDefault()}
    >
      {board.cells.map((cell) => (
        <Cell
          key={cell.index}
          cell={cell}
          onReveal={onReveal}
          onFlag={onFlag}
          flagMode={flagMode}
          disabled={disabled}
          explodedIndex={explodedIndex}
        />
      ))}
    </div>
  );
}
