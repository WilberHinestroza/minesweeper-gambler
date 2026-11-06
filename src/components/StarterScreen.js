import { getJoker } from '../game/jokers';
import JokerCard from './JokerCard';

export default function StarterScreen({ offers, onPick }) {
  return (
    <main className="screen starter-screen">
      <p className="eyebrow">Comienza tu run</p>
      <h1 className="starter-title">Elige tu comodín inicial</h1>
      <p className="tagline">
        Cada comodín cambia las reglas de la mesa. Es gratis.
      </p>

      <div className="shop-offers starter-offers">
        {offers.map((id) => {
          const joker = getJoker(id);
          return (
            <JokerCard
              key={id}
              joker={joker}
              actionLabel="Elegir"
              footer="Gratis"
              onClick={() => onPick(id)}
            />
          );
        })}
      </div>

      <p className="hint">
        Después de cada ronda podrás comprar más comodines en la tienda. Solo
        caben 5 en tu mazo.
      </p>
    </main>
  );
}
