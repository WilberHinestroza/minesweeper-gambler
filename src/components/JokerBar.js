import { MAX_JOKERS } from '../game/balance';
import { getJoker } from '../game/jokers';

export default function JokerBar({ jokers }) {
  return (
    <div className="joker-bar" role="list" aria-label="Comodines activos">
      {Array.from({ length: MAX_JOKERS }, (_, slot) => {
        const joker = jokers[slot] ? getJoker(jokers[slot]) : null;

        if (!joker) {
          return (
            <div
              key={`empty-${slot}`}
              className="joker-chip empty"
              role="listitem"
              aria-label="Espacio de comodín vacío"
            >
              <span aria-hidden="true">·</span>
            </div>
          );
        }

        return (
          <div
            key={joker.id}
            className="joker-chip"
            role="listitem"
            style={{ '--joker-color': joker.color }}
            title={`${joker.name}: ${joker.description}`}
            aria-label={`${joker.name}: ${joker.description}`}
          >
            <span aria-hidden="true">{joker.symbol}</span>
          </div>
        );
      })}
    </div>
  );
}
