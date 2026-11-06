import { getRoundConfig } from '../game/balance';

export default function ClearedScreen({ state, onNext }) {
  const info = state.clearedInfo;
  const next = getRoundConfig(state.round + 1);

  return (
    <main className="screen result-screen">
      <div className="panel result-panel">
        <p className="eyebrow">Ronda {state.round} superada</p>
        <h1 className="result-title">+${state.reward}</h1>

        <ul className="breakdown">
          <li>
            <span>Base</span>
            <span>${info.base}</span>
          </li>
          <li>
            <span>Clics sobrantes ({info.clicks})</span>
            <span>+${info.clicks}</span>
          </li>
          <li>
            <span>Banderas acertadas ({info.correctFlags})</span>
            <span>+${info.flagBonus}</span>
          </li>
        </ul>

        <div className="stat-row">
          <div>
            <span className="stat-label">Dinero</span>
            <span className="stat-value">${state.money}</span>
          </div>
          <div>
            <span className="stat-label">Puntos de ronda</span>
            <span className="stat-value">
              {state.score.toLocaleString('es-ES')}
            </span>
          </div>
        </div>

        <div className="next-round">
          <span>Siguiente objetivo</span>
          <strong>{next.target.toLocaleString('es-ES')}</strong>
          <span className="next-meta">
            {next.rows}×{next.cols} · {next.mines} minas
          </span>
        </div>

        <button type="button" className="btn primary big" onClick={onNext}>
          SIGUIENTE RONDA
        </button>
      </div>
    </main>
  );
}
