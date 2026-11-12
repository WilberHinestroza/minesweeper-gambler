import { MAX_TALISMANS } from '../game/balance';
import { getTalisman } from '../game/talismans';

export default function TalismanBar({ talismans = [], board, onUse }) {
  if (talismans.length === 0) return null;

  return (
    <div className="talisman-bar" role="list" aria-label="Talismanes disponibles">
      <span className="talisman-bar-label" aria-hidden="true">
        Talismanes {talismans.length}/{MAX_TALISMANS}
      </span>

      {talismans.map((id) => {
        const talisman = getTalisman(id);
        if (!talisman) return null;

        // La brújula necesita un tablero ya colocado para poder marcar.
        const disabled = id === 'brujula' && !board?.minesPlaced;

        return (
          <button
            key={id}
            type="button"
            className="talisman-button"
            style={{ '--talisman-color': talisman.color }}
            disabled={disabled}
            title={`${talisman.name}: ${talisman.description}`}
            aria-label={`Usar: ${talisman.name}. ${talisman.description}`}
            onClick={() => onUse(id)}
          >
            <span className="talisman-symbol" aria-hidden="true">
              {talisman.symbol}
            </span>
            <span className="talisman-name">{talisman.name}</span>
          </button>
        );
      })}
    </div>
  );
}
