// src/components/Die.js
import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const Die = ({ die, index, isSelected, onToggleSelection }) => {
  const { gamePhase, isDiceRolling, renderDieFace } = useGameContext();

  // Determine if the die is interactive
  const isInteractive =
    gamePhase === 'decision' && !die.locked && !isDiceRolling;

  // Style for the die
  const dieStyle = {
    width: '70px',
    height: '70px',
    background: isSelected
      ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
      : 'linear-gradient(135deg, #475569, #64748b)',
    border: die.locked
      ? '3px solid #ef4444'
      : isSelected
      ? '3px solid #60a5fa'
      : '3px solid #94a3b8',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '38px',
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
      {renderDieFace(die.face)}
      {die.locked && <LockIcon />}
    </motion.div>
  );
};

// Separate component for the lock icon
const LockIcon = () => (
  <div
    style={{
      position: 'absolute',
      top: '-10px',
      right: '-10px',
      background: '#ef4444',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      color: 'white',
      border: '2px solid #fee2e2',
    }}
  >
    🔒
  </div>
);

export default Die;
