// src/components/Die.js
import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const Die = ({ die, index, isSelected, onToggleSelection }) => {
  const { gamePhase, isDiceRolling, renderDieFace } = useGameContext();

  // Don't show content for blank dice
  const isBlank = die.face === 'blank';

  // Determine if the die is interactive
  const isInteractive =
    gamePhase === 'decision' && !die.locked && !isDiceRolling;

  // Style for the die
  const dieStyle = {
    width: '60px',
    height: '60px',
    background: isSelected
      ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
      : 'linear-gradient(135deg, #475569, #64748b)',
    border: die.locked
      ? '2px solid #ef4444'
      : isSelected
      ? '2px solid #60a5fa'
      : '2px solid #94a3b8',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '34px',
    cursor: isInteractive ? 'pointer' : 'default',
    boxShadow: isSelected
      ? '0 0 10px rgba(59, 130, 246, 0.7)'
      : die.locked
      ? '0 0 10px rgba(239, 68, 68, 0.5)'
      : '0 2px 5px rgba(0, 0, 0, 0.2)',
    position: 'relative',
  };

  // Hover animation for interactive dice
  const hoverAnimation = isInteractive
    ? {
        scale: 1.05,
        boxShadow: '0 0 15px rgba(59, 130, 246, 0.8)',
      }
    : {};

  // Rolling animation for non-locked dice
  const rollingAnimation =
    isDiceRolling && !die.locked
      ? {
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1],
          y: [0, -20, 0],
        }
      : {};

  return (
    <motion.div
      onClick={onToggleSelection}
      style={dieStyle}
      whileHover={hoverAnimation}
      animate={rollingAnimation}
      transition={{
        duration: 0.8,
        ease: 'easeInOut',
      }}
    >
      {!isBlank && renderDieFace(die.face)}
      {die.locked && <LockIcon />}
    </motion.div>
  );
};

// Separate component for the lock icon
const LockIcon = () => (
  <div
    style={{
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: '#ef4444',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: 'white',
      border: '1px solid #fee2e2',
    }}
  >
    🔒
  </div>
);

export default Die;
