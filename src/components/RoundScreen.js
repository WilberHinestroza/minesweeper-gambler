import { useState } from 'react';
import { BASE_REWARD, MAX_FLAG_REWARD } from '../game/balance';
import Board from './Board';
import Hud from './Hud';

export default function RoundScreen({ state, dispatch }) {
  const [flagMode, setFlagMode] = useState(false);

  const canCashOut = state.score >= state.target;
  const minReward = BASE_REWARD + state.clicksLeft;

  return (
    <main className="screen round-screen">
      <Hud state={state} />

      <div className="feedback" key={state.lastResult?.id ?? 'idle'}>
        {state.lastResult ? (
          state.lastResult.type === 'mine' ? (
            <span className="feedback-mine">✸ ¡Mina! −1 vida</span>
          ) : (
            <span className="feedback-safe">
              +{state.lastResult.chips} × {state.lastResult.mult} ={' '}
              <strong>+{state.lastResult.points}</strong>
            </span>
          )
        ) : (
          <span className="feedback-idle">Elige una casilla para empezar</span>
        )}
      </div>

      <Board
        board={state.board}
        onReveal={(index) => dispatch({ type: 'REVEAL', index })}
        onFlag={(index) => dispatch({ type: 'FLAG', index })}
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
            onClick={() => dispatch({ type: 'CASH_OUT' })}
          >
            COBRAR (mín. ${minReward})
          </button>
        ) : (
          <span className="hint">
            Faltan {(state.target - state.score).toLocaleString('es-ES')} puntos
          </span>
        )}
      </div>

      <p className="hint hint-touch">
        Toca para cavar. Mantén pulsada una casilla para poner bandera. En PC
        también puedes usar clic derecho.
      </p>

      {canCashOut && (
        <p className="hint hint-flags">
          Las banderas acertadas suman hasta +${MAX_FLAG_REWARD} al cobrar.
        </p>
      )}
    </main>
  );
}
