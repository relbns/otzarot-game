import React, { useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import Die from './Die';

const DiceSection = () => {
  const { currentDice, toggleDieSelection, selectedDice } = useGameContext();
  const diceContainerRef = useRef(null);

  return (
    <div
      className="dice-section"
      ref={diceContainerRef}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 'clamp(5px, 1.5vw, 10px)',
        marginBottom: '10px',
        width: '100%',
      }}
    >
      {currentDice.map((die, index) => (
        <Die
          key={die.id}
          die={die}
          index={index}
          isSelected={selectedDice.includes(index)}
          onToggleSelection={() => toggleDieSelection(index)}
        />
      ))}
    </div>
  );
};

export default DiceSection;
