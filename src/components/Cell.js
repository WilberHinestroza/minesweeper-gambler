import { useEffect, useRef } from 'react';

const LONG_PRESS_MS = 450;

export default function Cell({
  cell,
  onReveal,
  onFlag,
  flagMode,
  disabled,
  explodedIndex,
}) {
  const timer = useRef(null);
  const suppressClick = useRef(false);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const handlePointerDown = (event) => {
    if (disabled || cell.revealed || event.pointerType === 'mouse') return;

    suppressClick.current = false;
    clearTimer();

    // Pulsación larga en pantallas táctiles = bandera.
    timer.current = setTimeout(() => {
      timer.current = null;
      suppressClick.current = true;
      onFlag(cell.index);
    }, LONG_PRESS_MS);
  };

  const handleClick = () => {
    if (disabled) return;

    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }

    if (flagMode) onFlag(cell.index);
    else onReveal(cell.index);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    if (!disabled) onFlag(cell.index);
  };

  const classes = ['cell'];
  let content = '';
  let label = `Casilla fila ${cell.row + 1} columna ${cell.col + 1}`;

  if (cell.revealed) {
    classes.push('revealed');

    if (cell.mine) {
      classes.push('mine');
      content = '✸';

      if (cell.index === explodedIndex) {
        classes.push('exploded');
        label = 'Mina detonada';
      } else {
        label = 'Mina';
      }
    } else if (cell.adjacent > 0) {
      classes.push(`n${cell.adjacent}`);
      content = cell.adjacent;
      label = `${label}, ${cell.adjacent} mina${cell.adjacent === 1 ? '' : 's'} alrededor`;
    } else {
      label = `${label}, casilla vacía`;
    }
  } else {
    classes.push('hidden');

    if (cell.flagged) {
      classes.push('flagged');
      content = '⚑';
      label = `${label}, bandera`;
    } else {
      label = `${label}, oculta`;
    }
  }

  if (flagMode) classes.push('flag-mode');

  return (
    <button
      type="button"
      className={classes.join(' ')}
      aria-label={label}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerUp={clearTimer}
      onPointerCancel={clearTimer}
      onPointerLeave={clearTimer}
    >
      {content}
    </button>
  );
}
