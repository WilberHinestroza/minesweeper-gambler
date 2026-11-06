export default function RunOverScreen({ state, onRestart }) {
  const reason =
    state.endReason === 'hearts'
      ? 'Te quedaste sin vidas.'
      : 'Se acabaron los clics antes de llegar al objetivo.';

  return (
    <main className="screen result-screen">
      <div className="panel result-panel">
        <p className="eyebrow">Run terminada</p>
        <h1 className="result-title">GAME OVER</h1>
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

        <button type="button" className="btn primary big" onClick={onRestart}>
          VOLVER A JUGAR
        </button>
      </div>
    </main>
  );
}
