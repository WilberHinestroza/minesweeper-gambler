// Generador pseudoaleatorio con semilla.
// Permite runs reproducibles y tests deterministas. No usar Math.random()
// dentro de la lógica del juego.

export function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed) {
  const random = mulberry32(seed);

  return {
    next: random,
    int(max) {
      return Math.floor(random() * max);
    },
    pick(array) {
      return array[Math.floor(random() * array.length)];
    },
    // Fisher-Yates in-place. Devuelve el mismo array.
    shuffle(array) {
      for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        const tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
      }
      return array;
    },
  };
}
