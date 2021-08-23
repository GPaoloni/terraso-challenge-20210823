const express = require('express');
const fetch = require('node-fetch');
var cors = require('cors')

const app = express();
app.use(cors());
const port = 8080;

const cardValues = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  "JACK": 11,
  "QUEEN": 12,
  "KING": 13,
  "ACE": 14,
  "JOKER": 15
};

const compareCards = (cardA, cardB) => {
  if (cardValues[cardA] > cardValues[cardB]) return 'A';
  if (cardValues[cardA] < cardValues[cardB]) return 'B';
  return null;
}

// Object that represents the current program context. A DB engine would be a better suit for this.
const newState = {
  deckA: null,
  deckB: null,
  score: { A: 0, B: 0 },
  winner: null,
};

let state = newState;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const shuffleNewDeck = async () => {
  const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1', {
    headers: { Accept: 'application/json' }
  });
  const resJson = await response.json();
  return resJson;
}

const drawOneCard = async (deckId) => {
  const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`, {
    headers: { Accept: 'application/json' }
  });
  const resJson = await response.json();
  return resJson;
}

/* App routes */
app.get('/startGame', async (req, res) => {
  try {
    const deckA = await shuffleNewDeck();
    const deckB = await shuffleNewDeck();
  
    state = { ...newState, deckA, deckB };
    console.log(state);
    res.status(200).send(state);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: 'Error trying to start new game.',
      error,
    });
  }
});

app.get('/makePlay', async (req, res) => {
  try {
    const drawA = await drawOneCard(state.deckA.deck_id);
    const drawB = await drawOneCard(state.deckB.deck_id);
  
    const cardA = drawA.cards[0];
    const cardB = drawB.cards[0];
    const playWinner = compareCards(cardA.value, cardB.value);
    if (playWinner) 
      state = {
        ...state,
        score: {...state.score, [playWinner]: state.score[playWinner] + 1 },
      }
  
    if (drawA.remaining !== drawB.remaining) throw new Error('Decks have different remaining.')

    state = {
      ...state,
      deckA: { ...state.deckA, remaining: drawA.remaining },
      deckB: { ...state.deckB, remaining: drawB.remaining },
    }

    if (state.deckA.remaining === 0 && state.deckB.remaining === 0) {
      if (state.score.A > state.score.B) {
        state.winner = 'A';
      } else if (state.score.A < state.score.B) {
        state.winner = 'B';
      } else {
        state.winner = 'TIE';
      }
    }

    console.log(state);
    res.status(200).send({ ...state, cardA: cardA, cardB: cardB });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: 'Error making a play, start another game to restore sync.',
      error,
    });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});