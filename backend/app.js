const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

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

const shufflenewDeck = async () => {
  const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1', {
    headers: { Accept: 'application/json' }
  });
  const resJson = await response.json();
  return resJson;
}

app.get('/startGame', async (req, res) => {
  try {
    const deckA = await shufflenewDeck();
    const deckB = await shufflenewDeck();
  
    state = { ...state, deckA, deckB };
    console.log(state);
  
    res.status(200).send(state);
  } catch (error) {
    res.status(500).send({
      message: 'Error trying to start new game.',
      error,
    });
  }
});

const drawOneCard = async (deckId) => {
  const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`, {
    headers: { Accept: 'application/json' }
  });
  const resJson = await response.json();
  return resJson;
}

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

app.get('/makePlay', async (req, res) => {
  try {
    const drawA = await drawOneCard(state.deckA.deck_id);
    const drawB = await drawOneCard(state.deckB.deck_id);
  
    const cardA = drawA.cards[0];
    const cardB = drawB.cards[0];
    const playWinner = compareCards(cardA.value, cardB.value);
    if (playWinner) state.score[playWinner] = state.score[playWinner] + 1;
  
    if (drawA.remaining !== drawB.remaining) throw new Error('Decks have different remaining.')

    state.deckA.remaining = drawA.remaining;
    state.deckB.remaining = drawB.remaining;

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
    res.status(200).send({ ...state, cardAImage: cardA.image, cardBImage: cardB.image });
  } catch (error) {
    res.status(500).send({
      message: 'Error making a play, start another game to restore sync.',
      error,
    });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});