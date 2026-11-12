function savedLabel(saved) {
  if (!saved) return '';

  if (saved.phase === 'starter') return 'Elección de comodín';
  if (saved.phase === 'shop') return `Tienda · Ronda ${saved.round}`;
  return `Ronda ${saved.round}`;
}

export default function MenuScreen({
  onStart,
  onContinue,
  savedRun,
  stats,
}) {
  const hasStats =
    stats &&
    (stats.bestRound > 0 || stats.bestScore > 0 || stats.bestMoney > 0);

  return (
    <main className="screen menu-screen">
      <div className="logo">
        <span className="logo-suit" aria-hidden="true">
          ♠
        </span>
        <h1>
          MINA
          <br />
          FORTUNA
        </h1>
        <span className="logo-suit" aria-hidden="true">
          ♦
        </span>
      </div>

      <p className="tagline">Buscaminas. Apuestas. Multiplicadores.</p>

      <div className="panel rules">
        <h2>Cómo jugar</h2>
        <ul>
          <li>
            <strong>Abre casillas</strong> para sumar puntos. Las casillas sin
            número despejan zonas enteras y disparan tu puntuación.
          </li>
          <li>
            Empiezas con <strong>8 movimientos</strong> por ronda y ganas más
            en las rondas avanzadas.
          </li>
          <li>
            Supera el <strong>objetivo</strong> y pulsa <strong>COBRAR</strong>{' '}
            para pasar a la tienda y llevarte el dinero.
          </li>
          <li>
            Entre rondas compra <strong>comodines</strong>: cambian la
            puntuación, protegen de minas o dan dinero extra.
          </li>
          <li>
            Cada 3 rondas aparece un <strong>jefe</strong> con una regla
            especial. Pisar una mina cuesta <strong>1 vida</strong>.
          </li>
        </ul>
      </div>

      {savedRun && (
        <button
          type="button"
          className="btn primary big continue"
          onClick={onContinue}
        >
          CONTINUAR · {savedLabel(savedRun)}
        </button>
      )}

      <button type="button" className="btn primary big" onClick={onStart}>
        JUGAR
      </button>

      {hasStats && (
        <div className="panel records">
          <h2>Récords</h2>
          <div className="stat-row">
            <div>
              <span className="stat-label">Mejor ronda</span>
              <span className="stat-value">{stats.bestRound}</span>
            </div>
            <div>
              <span className="stat-label">Mejor puntuación</span>
              <span className="stat-value">
                {stats.bestScore.toLocaleString('es-ES')}
              </span>
            </div>
            <div>
              <span className="stat-label">Más dinero</span>
              <span className="stat-value">${stats.bestMoney}</span>
            </div>
          </div>
        </div>
      )}

      <p className="footnote">Dinero ficticio. Solo diversión.</p>
    </main>
  );
}
