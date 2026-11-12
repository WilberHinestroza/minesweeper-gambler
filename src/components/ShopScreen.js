import { MAX_JOKERS, getClicksForRound, getRoundConfig } from '../game/balance';
import { applyBossConfig, getBossForRound } from '../game/bosses';
import { getJoker } from '../game/jokers';
import { sellValue } from '../game/shop';
import JokerCard from './JokerCard';

function money(value) {
  return value.toLocaleString('es-ES');
}

export default function ShopScreen({ state, dispatch }) {
  const { clearedInfo: info, shop, jokers, money: cash, reward } = state;
  const nextBoss = getBossForRound(state.round + 1);
  const next = applyBossConfig(getRoundConfig(state.round + 1), nextBoss);
  const full = jokers.length >= MAX_JOKERS;

  return (
    <main className="screen shop-screen">
      <header className="panel shop-header">
        <p className="eyebrow">Ronda {state.round} superada</p>
        <h1 className="shop-title">+${reward}</h1>

        <ul className="breakdown">
          <li>
            <span>Base</span>
            <span>${info.base}</span>
          </li>
          <li>
            <span>Movimientos sobrantes ({info.clicks})</span>
            <span>+${info.clicks}</span>
          </li>
          <li>
            <span>Banderas acertadas ({info.correctFlags})</span>
            <span>+${info.flagBonus}</span>
          </li>
          {info.codicia > 0 && (
            <li>
              <span>Codicia</span>
              <span>+${info.codicia}</span>
            </li>
          )}
          {info.interes > 0 && (
            <li>
              <span>Interés</span>
              <span>+${info.interes}</span>
            </li>
          )}
          {info.tax > 0 && (
            <li className="penalty">
              <span>Impuesto de El Recaudador</span>
              <span>−${info.tax}</span>
            </li>
          )}
        </ul>

        <div className="shop-money">
          <span>Dinero disponible</span>
          <strong>${money(cash)}</strong>
        </div>
      </header>

      <section className="panel shop-section">
        <div className="section-head">
          <h2>Tienda</h2>
          <button
            type="button"
            className="btn small"
            onClick={() => dispatch({ type: 'REROLL_SHOP' })}
            disabled={cash < shop.rerollCost}
          >
            Re-tirar · ${shop.rerollCost}
          </button>
        </div>

        {shop.offers.length > 0 ? (
          <div className="shop-offers">
            {shop.offers.map((id) => {
              const joker = getJoker(id);
              return (
                <JokerCard
                  key={id}
                  joker={joker}
                  actionLabel="Comprar"
                  footer={`$${joker.price}`}
                  disabled={full || cash < joker.price}
                  onClick={() => dispatch({ type: 'BUY_JOKER', id })}
                />
              );
            })}
          </div>
        ) : (
          <p className="hint">No quedan comodines por comprar.</p>
        )}

        {full && (
          <p className="hint hint-warn">
            Mazo lleno ({MAX_JOKERS}/{MAX_JOKERS}). Vende un comodín para
            hacer sitio.
          </p>
        )}
      </section>

      <section className="panel shop-section">
        <div className="section-head">
          <h2>
            Tu mazo ({jokers.length}/{MAX_JOKERS})
          </h2>
        </div>

        <div className="shop-owned">
          {jokers.map((id) => {
            const joker = getJoker(id);
            return (
              <JokerCard
                key={id}
                joker={joker}
                className="compact"
                actionLabel="Vender"
                footer={`Vender +$${sellValue(id)}`}
                onClick={() => dispatch({ type: 'SELL_JOKER', id })}
              />
            );
          })}

          {Array.from({ length: MAX_JOKERS - jokers.length }, (_, slot) => (
            <div
              key={`empty-${slot}`}
              className="joker-card empty-slot"
              aria-label="Espacio de comodín vacío"
            >
              <span className="joker-symbol" aria-hidden="true">
                +
              </span>
              <span className="joker-name">Vacío</span>
            </div>
          ))}
        </div>
      </section>

      <div className="next-round">
        <span>Siguiente ronda</span>
        <strong>Objetivo {money(next.target)}</strong>
        <span className="next-meta">
          {next.rows}×{next.cols} · {next.mines} minas ·{' '}
          {getClicksForRound(state.round + 1)} movimientos
        </span>
        {nextBoss && (
          <span
            className="next-boss"
            style={{ '--boss-color': nextBoss.color }}
            aria-label={`Próxima ronda jefe: ${nextBoss.name}. ${nextBoss.description}`}
          >
            <span aria-hidden="true">{nextBoss.symbol}</span> Ronda jefe:{' '}
            {nextBoss.name} — {nextBoss.description}
          </span>
        )}
      </div>

      <button
        type="button"
        className="btn primary big"
        onClick={() => dispatch({ type: 'NEXT_ROUND' })}
      >
        SIGUIENTE RONDA
      </button>
    </main>
  );
}
