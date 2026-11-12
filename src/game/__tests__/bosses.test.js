import {
  applyBossConfig,
  applyBossReward,
  getBoss,
  getBossForRound,
} from '../bosses';
import { getRoundConfig } from '../balance';

describe('jefes', () => {
  test('alternan impuesto y minas cada 3 rondas', () => {
    expect(getBossForRound(1)).toBeNull();
    expect(getBossForRound(2)).toBeNull();
    expect(getBossForRound(3).id).toBe('tax');
    expect(getBossForRound(6).id).toBe('mines');
    expect(getBossForRound(9).id).toBe('tax');
    expect(getBossForRound(12).id).toBe('mines');
    expect(getBossForRound(18).id).toBe('mines');
  });

  test('La Mina Madre añade un 30% de minas al tablero', () => {
    const config = getRoundConfig(6);
    const bossConfig = applyBossConfig(config, getBoss('mines'));

    expect(config.mines).toBe(26);
    expect(bossConfig.mines).toBe(34);
    expect(bossConfig.rows).toBe(config.rows);
    expect(bossConfig.target).toBe(config.target);
  });

  test('El Recaudador recorta la recompensa sin dejarla en cero', () => {
    const tax = getBoss('tax');

    expect(applyBossReward(10, tax)).toBe(8);
    expect(applyBossReward(2, tax)).toBe(1);
    expect(applyBossReward(1, tax)).toBe(1);
    expect(applyBossReward(10, getBoss('mines'))).toBe(10);
    expect(applyBossReward(10, null)).toBe(10);
  });
});
