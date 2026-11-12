// Talismanes: objetos de un solo uso que se compran en la tienda y se
// activan durante una ronda. Son la versión "consumible" de los comodines.

export const TALISMANS = [
  {
    id: 'pico',
    name: 'Pico de repuesto',
    symbol: '⛏',
    color: '#8aa694',
    price: 4,
    description: '+2 movimientos en esta ronda.',
  },
  {
    id: 'amuleto',
    name: 'Amuleto',
    symbol: '✚',
    color: '#4fae7c',
    price: 4,
    description: 'Ignora la próxima mina de esta ronda.',
  },
  {
    id: 'brujula',
    name: 'Brújula',
    symbol: '◎',
    color: '#5ee0d0',
    price: 3,
    description: 'Marca una mina aleatoria del tablero.',
  },
  {
    id: 'cofre',
    name: 'Cofre',
    symbol: '$',
    color: '#e9b949',
    price: 3,
    description: '+$4 extra al cobrar esta ronda.',
  },
];

const BY_ID = TALISMANS.reduce((map, talisman) => {
  map[talisman.id] = talisman;
  return map;
}, {});

export function getTalisman(id) {
  return BY_ID[id];
}

// Una run nunca debe poder tener dos copias del mismo talismán: el inventario
// es un conjunto de ids únicos y se vacía al usarlos.
export function hasTalisman(state, id) {
  return (state.talismans ?? []).includes(id);
}
