import { HEARTS } from '../game/balance';
import { countFlags } from '../game/board';
import { getBoss } from '../game/bosses';
import { streakMultiplier } from '../game/scoring';

function format(value) {
  return value.toLocaleString('es-ES');
}

export default function Hud({ state, muted, onToggleMute }) {
  const { board, config, score, target, hearts, clicksLeft, money, round } =
    state;
  const { streak } = state;
  const boss = getBoss(state.boss);

  const progress = target > 0 ? Math.min(100, (score / target) * 100) : 0;
  const flagsUsed = board ? countFlags(board) : 0;

  return (
    <header className="hud">
      <div className="hud-row">
        <span className="badge">Ronda {round}</span>
        <span className="badge money" aria-label={`${money} dólares`}>
          ${money}
        </span>
        <span
          className="badge hearts"
          aria-label={`${hearts} de ${HEARTS} vidas`}
        >
          {Array.from({ length: HEARTS }, (_, i) => (
            <span key={i} className={i < hearts ? 'heart' : 'heart lost'}>
              ♥
            </span>
          ))}
        </span>
        <span
          className={`badge clicks ${clicksLeft === 0 ? 'danger' : ''}`}
          aria-label={`${clicksLeft} movimientos restantes`}
        >
          {clicksLeft} mov.
        </span>
        {streak > 0 && (
          <span
            className="badge streak"
            title={`Racha de ${streak} clic${streak === 1 ? '' : 's'} seguro${
              streak === 1 ? '' : 's'
            }`}
          >
            ×{streakMultiplier(streak)}
          </span>
        )}
        {onToggleMute && (
          <button
            type="button"
            className="badge sound"
            aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
            title={muted ? 'Activar sonido' : 'Silenciar sonido'}
            onClick={onToggleMute}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </div>

      {boss && (
        <div
          className="boss-banner"
          style={{ '--boss-color': boss.color }}
          title={boss.description}
          aria-label={`Jefe: ${boss.name}. ${boss.description}`}
        >
          <span className="boss-symbol" aria-hidden="true">
            {boss.symbol}
          </span>
          <span className="boss-name">{boss.name}</span>
          <span className="boss-desc">{boss.description}</span>
        </div>
      )}

      <div className="score-row">
        <span className="score">{format(score)}</span>
        <span className="target">/ {format(target)}</span>
      </div>

      <div
        className="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(score, target)}
        aria-label="Progreso del objetivo"
      >
        <div style={{ width: `${progress}%` }} />
      </div>

      <div className="hud-meta">
        <span>
          {config.rows}×{config.cols}
        </span>
        <span>{config.mines} minas</span>
        <span>
          Banderas {flagsUsed}/{board.mines}
        </span>
      </div>
    </header>
  );
}
