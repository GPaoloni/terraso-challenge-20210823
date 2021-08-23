import React from 'react';
import Game from './Game';
import * as services from './services';
import './App.css';

const initialState = {
  cardA: {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREZ3qIa0nSP_Fyhih_dN6n_AcL2gQrQ55Dlw&usqp=CAU',
    value: 'no card',
    suit: '',
  },
  cardB: {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREZ3qIa0nSP_Fyhih_dN6n_AcL2gQrQ55Dlw&usqp=CAU',
    value: 'no card',
    suit: '',
  },
  error: null,
  loading: false,
};

function App() {
  const [state, setstate] = React.useState(initialState)

  React.useEffect(() => {
    if (state.winner) window.alert(`Match finished! The winner is: ${state.winner}`);
  }, [state.winner]);

  const setError = (error) => {
    window.alert('Backend error ocurred :(');

    setstate(prev => ({ ...prev, error }));
  }

  const onStartNewGame = async () => {
    setstate(prev => ({ ...prev, loading: true, error: null }));

    try {
      const newGame = await services.startGame();
      const firstPlay = await services.makePlay();
  
      setstate(prev => ({ ...prev, ...firstPlay }));
    } catch (error) {
      setError(error)
    } finally {
      setstate(prev => ({ ...prev, loading: false }));
    }
  }

  const onMakePlay = async () => {
    setstate(prev => ({ ...prev, loading: true }));

    try {
      const play = await services.makePlay();
  
      setstate(prev => ({ ...prev, ...play }));
    } catch (error) {
      setError(error)
    } finally {
      setstate(prev => ({ ...prev, loading: false }));
    }
  }

  return (
      <div className="App">
        <Game cardA={state.cardA} cardB={state.cardB} />
        <button disabled={state.loading} onClick={onStartNewGame}>
          Start new game
        </button>
        <button disabled={state.loading || state.error || state.winner} onClick={onMakePlay}>
          Make a play
        </button>
        {state.score && <p className="score">{state.score.A} - {state.score.B}</p>}
      </div>
  );
}

export default App;
