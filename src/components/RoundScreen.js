import { useState } from 'react';
import {
  BASE_REWARD,
  MAX_FLAG_REWARD,
  getClicksForRound,
} from '../game/balance';
import { countCorrectFlags } from '../game/board';
import { applyBossReward, getBoss } from '../game/bosses';
import { applyMoneyJokers } from '../game/jokers';
import { unlockAudio } from '../game/sound';
import Board from './Board';
import Hud from './Hud';
import JokerBar from './JokerBar';

const DUD_LABELS = {
  suertudo: '♣ Mina de fogueo: no pierdes vida',
  seguro: '✚ Seguro activado: mina ignorada',
  casco: '⛑ Casco activado: mina ignorada',
};

function Feedback({ result }) {
  if (!result) {
    return <span className="feedback-idle">Elige una casilla para empezar</span>;
  }

  if (result.type === 'mine') {
    return <span className="feedback-mine">✸ ¡Mina! −1 vida</span>;
  }

  if (result.type === 'dud') {
    return (
      <span className="feedback-dud">
        {DUD_LABELS[result.protection] ?? 'Mina desactivada'}
      </span>
    );
  }

  return (
    <>
      <span className="feedback-safe">
        +{result.chips} × {result.mult} = <strong>+{result.points}</strong>
      </span>
      {result.triggers.length > 0 && (
        <span className="triggers">
          {result.triggers.map((trigger) => (
            <span key={trigger.id} className="trigger">
              <span aria-hidden="true">{trigger.symbol}</span> {trigger.label}
            </span>
          ))}
        </span>
      )}
    </>
  );
}

export default function RoundScreen({
  state,
  dispatch,
  muted,
  onToggleMute,
}) {
  const [flagMode, setFlagMode] = useState(false);

  const act = (action) => {
    unlockAudio();
    dispatch(action);
  };

  const canCashOut = state.score >= state.target;
  const correctFlags = countCorrectFlags(state.board);
  const moneyBonus = applyMoneyJokers(state);
  const rawReward =
    BASE_REWARD +
    state.clicksLeft +
    Math.min(correctFlags, MAX_FLAG_REWARD) +
    moneyBonus.total;
  const boss = getBoss(state.boss);
  const reward = applyBossReward(rawReward, boss);

  return (
    <main className="screen round-screen">
      <Hud state={state} muted={muted} onToggleMute={onToggleMute} />

      <JokerBar jokers={state.jokers} />

      <div className="feedback" key={state.lastResult?.id ?? 'idle'}>
        <Feedback result={state.lastResult} />
      </div>

      <Board
        board={state.board}
        onReveal={(index) => act({ type: 'REVEAL', index })}
        onFlag={(index) => act({ type: 'FLAG', index })}
        onChord={(index) => act({ type: 'CHORD', index })}
        flagMode={flagMode}
        disabled={state.clicksLeft <= 0}
        explodedIndex={state.board.explodedIndex}
      />

      <div className="controls">
        <button
          type="button"
          className={`btn toggle ${flagMode ? 'active' : ''}`}
          aria-pressed={flagMode}
          onClick={() => setFlagMode((value) => !value)}
        >
          {flagMode ? '⚑ Modo bandera' : '⛏ Modo cavar'}
        </button>

        {canCashOut ? (
          <button
            type="button"
            className="btn primary cashout"
            onClick={() => act({ type: 'CASH_OUT' })}
          >
            COBRAR ${reward}
          </button>
        ) : (
          <span className="hint">
            Faltan {(state.target - state.score).toLocaleString('es-ES')}{' '}
            puntos
          </span>
        )}
      </div>

      <p className="hint hint-touch">
        Toca para cavar. Mantén pulsada una casilla para poner bandera. En PC
        también puedes usar clic derecho.
      </p>

      <p className="hint hint-chord">
        Toca un número con sus banderas puestas para abrir las casillas de
        alrededor (cuesta 1 movimiento).
      </p>

      <p className="hint hint-flags">
        {getClicksForRound(state.round)} movimientos esta ronda · banderas
        acertadas hasta +${MAX_FLAG_REWARD} al cobrar
      </p>
    </main>
  );
}
