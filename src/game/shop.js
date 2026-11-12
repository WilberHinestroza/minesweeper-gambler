import { SHOP_OFFERS, SHOP_TALISMAN_OFFERS } from './balance';
import { JOKERS, getJoker } from './jokers';
import { TALISMANS } from './talismans';

// Devuelve ids de comodines no poseídos, barajados con el rng dado.
export function rollShop(rng, ownedIds, count = SHOP_OFFERS) {
  const pool = JOKERS.map((joker) => joker.id).filter(
    (id) => !ownedIds.includes(id)
  );

  rng.shuffle(pool);
  return pool.slice(0, count);
}

// Los talismanes son consumibles: se pueden volver a comprar cuando ya se
// usó el anterior, pero no tener dos copias a la vez.
export function rollTalismans(
  rng,
  ownedIds,
  count = SHOP_TALISMAN_OFFERS
) {
  const pool = TALISMANS.map((talisman) => talisman.id).filter(
    (id) => !ownedIds.includes(id)
  );

  rng.shuffle(pool);
  return pool.slice(0, count);
}

export function sellValue(jokerOrId) {
  const joker = typeof jokerOrId === 'string' ? getJoker(jokerOrId) : jokerOrId;
  return joker ? Math.floor(joker.price / 2) : 0;
}
