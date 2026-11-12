// Rondas jefe: modificadores cada 3 rondas.

export const BOSSES = {
  tax: {
    id: 'tax',
    name: 'El Recaudador',
    symbol: '%',
    color: '#b388ff',
    description: 'Al cobrar, la recompensa se reduce en $2 (mínimo $1).',
  },
  mines: {
    id: 'mines',
    name: 'La Mina Madre',
    symbol: '✸',
    color: '#e0483f',
    description: 'La ronda tiene un 30% más de minas de lo normal.',
  },
};

export const BOSS_TAX = 2;

export function getBoss(id) {
  return BOSSES[id] ?? null;
}

// Rondas 3, 9, 15... -> impuesto. Rondas 6, 12, 18... -> minas extra.
export function getBossForRound(round) {
  if (round < 3 || round % 3 !== 0) return null;
  return round % 6 === 0 ? BOSSES.mines : BOSSES.tax;
}

export function applyBossConfig(config, boss) {
  if (!boss || boss.id !== 'mines') return config;

  const maxMines = Math.max(1, config.rows * config.cols - 9);

  return {
    ...config,
    mines: Math.min(maxMines, Math.round(config.mines * 1.3)),
  };
}

// La recompensa siempre paga al menos $1 aunque el jefe la recorte.
export function applyBossReward(reward, boss) {
  if (boss?.id !== 'tax') return reward;
  return Math.max(1, reward - BOSS_TAX);
}
