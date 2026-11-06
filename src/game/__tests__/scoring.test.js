import { calculateClick, streakMultiplier } from '../scoring';

const cells = [
  { mine: false, adjacent: 0 },
  { mine: false, adjacent: 1 },
  { mine: false, adjacent: 3 },
  { mine: true, adjacent: 0 },
];

describe('scoring', () => {
  test('suma chips por casilla y por número', () => {
    const result = calculateClick({ cells, revealed: [0, 1, 2], streak: 0 });

    // 5 + (5 + 5) + (5 + 15) = 35
    expect(result.chips).toBe(35);
    expect(result.numbered).toBe(2);
    expect(result.mult).toBe(1);
    expect(result.points).toBe(35);
  });

  test('la racha añade mult con tope', () => {
    expect(streakMultiplier(0)).toBe(1);
    expect(streakMultiplier(2)).toBe(2);
    expect(streakMultiplier(5)).toBe(3.5);
    expect(streakMultiplier(10)).toBe(3.5);
  });

  test('aplica el multiplicador a los puntos', () => {
    const result = calculateClick({ cells, revealed: [0], streak: 2 });

    expect(result.chips).toBe(5);
    expect(result.mult).toBe(2);
    expect(result.points).toBe(10);
  });

  test('las minas no aportan puntos', () => {
    const result = calculateClick({ cells, revealed: [3], streak: 0 });

    expect(result.chips).toBe(0);
    expect(result.points).toBe(0);
  });
});
