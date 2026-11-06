export default function MenuScreen({ onStart }) {
  return (
    <main className="screen menu-screen">
      <div className="logo">
        <span className="logo-suit" aria-hidden="true">♠</span>
        <h1>
          MINA
          <br />
          FORTUNA
        </h1>
        <span className="logo-suit" aria-hidden="true">♦</span>
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
            Cada clic gasta <strong>1 de tus 5 clics</strong> por ronda.
          </li>
          <li>
            Supera el <strong>objetivo</strong> y pulsa <strong>COBRAR</strong>{' '}
            para pasar de ronda y llevarte el dinero.
          </li>
          <li>
            Pisar una mina cuesta <strong>1 vida</strong>. Sin vidas, la run
            termina.
          </li>
          <li>
            Cobra con clics sobrantes y con banderas acertadas para ganar más
            dólares.
          </li>
        </ul>
      </div>

      <button type="button" className="btn primary big" onClick={onStart}>
        JUGAR
      </button>

      <p className="footnote">Dinero ficticio. Solo diversión.</p>
    </main>
  );
}
