import { createRng } from '../rng';
import { rollShop, sellValue } from '../shop';

describe('shop', () => {
  test('rollShop devuelve comodines no poseídos', () => {
    const offers = rollShop(createRng(7), ['streak', 'borde']);

    expect(offers).toHaveLength(3);
    expect(new Set(offers).size).toBe(3);
    expect(offers).not.toContain('streak');
    expect(offers).not.toContain('borde');
  });

  test('rollShop es determinista para la misma semilla', () => {
    const first = rollShop(createRng(99), ['rayo']);
    const second = rollShop(createRng(99), ['rayo']);

    expect(first).toEqual(second);
  });

  test('si no quedan comodines devuelve una lista vacía', () => {
    const owned = [
      'streak',
      'smoke',
      'counter',
      'rayo',
      'seguro',
      'casco',
      'detector',
      'codicia',
      'duplicador',
      'suertudo',
      'interes',
      'borde',
    ];

    expect(rollShop(createRng(1), owned)).toEqual([]);
  });

  test('vender devuelve la mitad del precio redondeada hacia abajo', () => {
    expect(sellValue('streak')).toBe(2); // precio 4
    expect(sellValue('rayo')).toBe(3); // precio 6
    expect(sellValue('borde')).toBe(1); // precio 3
  });
});
