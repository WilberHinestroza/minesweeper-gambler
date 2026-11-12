import { useEffect, useReducer, useRef, useState } from 'react';
import './App.css';
import MenuScreen from './components/MenuScreen';
import RoundScreen from './components/RoundScreen';
import RunOverScreen from './components/RunOverScreen';
import ShopScreen from './components/ShopScreen';
import StarterScreen from './components/StarterScreen';
import { createInitialState, runReducer } from './game/run';
import {
  isMuted,
  playSound,
  toggleMuted,
  unlockAudio,
} from './game/sound';
import {
  clearSavedRun,
  loadSavedRun,
  loadStats,
  recordRun,
  saveRun,
} from './game/storage';

const RESUMABLE = ['starter', 'round', 'shop'];

function init() {
  return createInitialState(Date.now());
}

function App() {
  const [state, dispatch] = useReducer(runReducer, undefined, init);
  const [savedRun, setSavedRun] = useState(() => loadSavedRun());
  const [stats, setStats] = useState(() => loadStats());
  const [isRecord, setIsRecord] = useState(false);
  const [muted, setMuted] = useState(() => isMuted());

  const recordedRun = useRef(null);
  const previous = useRef({
    phase: state.phase,
    resultId: state.lastResult?.id ?? null,
    jokers: state.jokers.length,
    money: state.money,
  });

  // Guarda la run en curso para poder continuarla al recargar la página.
  useEffect(() => {
    if (RESUMABLE.includes(state.phase)) saveRun(state);
  }, [state]);

  // Al terminar, guarda los récords y elimina la run en curso.
  useEffect(() => {
    if (state.phase !== 'runOver') return;

    const key = `${state.seed}:${state.round}:${state.totalScore}`;
    if (recordedRun.current === key) return;
    recordedRun.current = key;

    const result = recordRun(state);
    setStats(result.stats);
    setIsRecord(result.isRecord);
    setSavedRun(null);
  }, [state]);

  // Efectos de sonido basados en transiciones de estado.
  useEffect(() => {
    const prev = previous.current;

    if (
      state.phase === 'round' &&
      state.lastResult &&
      state.lastResult.id !== prev.resultId
    ) {
      playSound(
        state.lastResult.type === 'safe' ? 'reveal' : state.lastResult.type
      );
    }

    if (state.phase === 'shop' && prev.phase === 'round') {
      playSound('cashout');
    }

    if (state.phase === 'shop') {
      if (state.jokers.length > prev.jokers) playSound('buy');
      else if (state.jokers.length < prev.jokers) playSound('click');
      else if (state.money < prev.money) playSound('click');
    }

    previous.current = {
      phase: state.phase,
      resultId: state.lastResult?.id ?? null,
      jokers: state.jokers.length,
      money: state.money,
    };
  }, [state]);

  const handleStart = () => {
    unlockAudio();
    clearSavedRun();
    setSavedRun(null);
    setIsRecord(false);
    recordedRun.current = null;
    dispatch({ type: 'START_RUN' });
  };

  const handleContinue = () => {
    if (!savedRun) return;
    unlockAudio();
    recordedRun.current = null;
    dispatch({ type: 'RESUME_RUN', state: savedRun });
  };

  const handleRestart = () => {
    unlockAudio();
    clearSavedRun();
    setSavedRun(null);
    setIsRecord(false);
    recordedRun.current = null;
    dispatch({ type: 'RESTART' });
  };

  const handleMenu = () => {
    setIsRecord(false);
    dispatch({ type: 'MENU' });
  };

  const handleToggleMute = () => {
    setMuted(toggleMuted());
  };

  return (
    <div className="app">
      {state.phase === 'menu' && (
        <MenuScreen
          onStart={handleStart}
          onContinue={handleContinue}
          savedRun={savedRun}
          stats={stats}
        />
      )}

      {state.phase === 'starter' && (
        <StarterScreen
          offers={state.starterOffers}
          onPick={(id) => dispatch({ type: 'PICK_STARTER', id })}
        />
      )}

      {state.phase === 'round' && (
        <RoundScreen
          state={state}
          dispatch={dispatch}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )}

      {state.phase === 'shop' && (
        <ShopScreen state={state} dispatch={dispatch} />
      )}

      {state.phase === 'runOver' && (
        <RunOverScreen
          state={state}
          stats={stats}
          isRecord={isRecord}
          onRestart={handleRestart}
          onMenu={handleMenu}
        />
      )}
    </div>
  );
}

export default App;
