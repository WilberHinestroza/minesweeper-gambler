import { useReducer } from 'react';
import './App.css';
import MenuScreen from './components/MenuScreen';
import RoundScreen from './components/RoundScreen';
import RunOverScreen from './components/RunOverScreen';
import ShopScreen from './components/ShopScreen';
import StarterScreen from './components/StarterScreen';
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

      {state.phase === 'starter' && (
        <StarterScreen
          offers={state.starterOffers}
          onPick={(id) => dispatch({ type: 'PICK_STARTER', id })}
        />
      )}

      {state.phase === 'round' && (
        <RoundScreen state={state} dispatch={dispatch} />
      )}

      {state.phase === 'shop' && (
        <ShopScreen state={state} dispatch={dispatch} />
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
