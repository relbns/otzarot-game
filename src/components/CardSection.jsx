// src/components/CardSection.js
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import Card from './Card';
import CardBack from './CardBack';

const CardSection = () => {
  const { currentCard, isCardFlipping, gamePhase, drawCard } = useGameContext();

  return (
    <div className="card-section" style={{ marginBottom: '20px' }}>
      <AnimatePresence>
        {currentCard ? (
          <Card card={currentCard} />
        ) : (
          <CardBack
            isFlipping={isCardFlipping}
            canDraw={gamePhase === 'drawing'}
            onDraw={drawCard}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardSection;
