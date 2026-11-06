import { useReducer } from 'react';
import './App.css';
import ClearedScreen from './components/ClearedScreen';
import MenuScreen from './components/MenuScreen';
import RoundScreen from './components/RoundScreen';
import RunOverScreen from './components/RunOverScreen';
import { createInitialState, runReducer } from './game/run';

function init() {
  return createInitialState(Date.now());
}

function App() {
  const [state, dispatch] = useReducer(runReducer, undefined, init);

  return (
    <div className="app">
      {state.phase === 'menu' && (
        <MenuScreen onStart={() => dispatch({ type: 'START_RUN' })} />
      )}

      {state.phase === 'round' && (
        <RoundScreen state={state} dispatch={dispatch} />
      )}

      {state.phase === 'cleared' && (
        <ClearedScreen
          state={state}
          onNext={() => dispatch({ type: 'NEXT_ROUND' })}
        />
      )}

      {state.phase === 'runOver' && (
        <RunOverScreen
          state={state}
          onRestart={() => dispatch({ type: 'RESTART' })}
        />
      )}
    </div>
  );
}

export default App;
