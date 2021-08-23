import React from 'react';

const Cards = ({ cardA, cardB }) => {
  return (
    <div style={{ flexDirection: 'flex', flex: 'row', alignItems: 'center', width: 'auto', height: 'auto', minHeight: 200, backgroundColor: 'black' }}>
      <img src={cardA.image} className="Card" alt={`${cardA.value} ${cardA.suit}`} />
      <img src={cardB.image} className="Card" alt={`${cardB.value} ${cardB.suit}`} />
    </div>
  )
}

export default Cards;