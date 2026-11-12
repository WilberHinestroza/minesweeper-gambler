export default function RunOverScreen({
  state,
  onRestart,
  onMenu,
  stats,
  isRecord,
}) {
  const reason =
    state.endReason === 'hearts'
      ? 'Te quedaste sin vidas.'
      : 'Se acabaron los movimientos antes de llegar al objetivo.';

  return (
    <main className="screen result-screen">
      <div className="panel result-panel">
        <p className="eyebrow">Run terminada</p>
        <h1 className="result-title">GAME OVER</h1>
        {isRecord && <p className="record-badge">¡Nuevo récord!</p>}
        <p className="result-reason">{reason}</p>

        <div className="stat-row">
          <div>
            <span className="stat-label">Ronda alcanzada</span>
            <span className="stat-value">{state.round}</span>
          </div>
          <div>
            <span className="stat-label">Puntos totales</span>
            <span className="stat-value">
              {state.totalScore.toLocaleString('es-ES')}
            </span>
          </div>
          <div>
            <span className="stat-label">Dinero</span>
            <span className="stat-value">${state.money}</span>
          </div>
        </div>

        {stats && (
          <div className="best-row">
            <span>
              Récord: ronda {stats.bestRound} ·{' '}
              {stats.bestScore.toLocaleString('es-ES')} pts · ${stats.bestMoney}
            </span>
          </div>
        )}

        <button type="button" className="btn primary big" onClick={onRestart}>
          VOLVER A JUGAR
        </button>

        {onMenu && (
          <button type="button" className="btn" onClick={onMenu}>
            MENÚ PRINCIPAL
          </button>
        )}
      </div>
    </main>
  );
}
