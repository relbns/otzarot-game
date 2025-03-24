import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const Die = ({ die, index, isSelected, onToggleSelection }) => {
  const {
    gamePhase,
    isDiceRolling,
    renderDieFace,
    selectedDice,
    currentCard,
    toggleTreasureChest,
  } = useGameContext();

  // Don't show content for blank dice
  const isBlank = die.face === 'blank';

  // Check if we have the treasure chest card
  const hasTreasureChest = currentCard && currentCard.effect === 'store_dice';

  // Determine if the die is interactive (selectable or can be moved to treasure chest)
  const isInteractiveForSelection =
    gamePhase === 'decision' && !die.locked && !isDiceRolling;

  const isInteractiveForTreasureChest =
    hasTreasureChest && die.face !== 'skull' && !isDiceRolling;

  // Determine click handler based on context
  const handleClick = () => {
    if (hasTreasureChest && !isDiceRolling && die.face !== 'skull') {
      // For treasure chest card, always use the toggleTreasureChest function
      // which now handles the three-state cycling
      toggleTreasureChest(index);
    } else if (isInteractiveForSelection) {
      // Otherwise, handle normal dice selection
      onToggleSelection();
    }
  };

  // Style for the die
  const dieStyle = {
    width: 'clamp(40px, 12vw, 60px)',
    height: 'clamp(40px, 12vw, 60px)',
    background: die.inTreasureChest
      ? 'linear-gradient(135deg, #b45309, #d97706)' // Gold/orange for treasure chest
      : isSelected
      ? 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
      : 'linear-gradient(135deg, #475569, #64748b)',
    border:
      die.locked && !die.inTreasureChest
        ? '2px solid #ef4444'
        : die.inTreasureChest
        ? '2px solid #fcd34d' // Gold border for treasure chest
        : isSelected
        ? '2px solid #60a5fa'
        : '2px solid #94a3b8',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(22px, 6vw, 34px)',
    cursor:
      isInteractiveForSelection || isInteractiveForTreasureChest
        ? 'pointer'
        : 'default',
    boxShadow: die.inTreasureChest
      ? '0 0 10px rgba(251, 191, 36, 0.7)' // Gold glow for treasure chest
      : isSelected
      ? '0 0 10px rgba(59, 130, 246, 0.7)'
      : die.locked && !die.inTreasureChest
      ? '0 0 10px rgba(239, 68, 68, 0.5)'
      : '0 2px 5px rgba(0, 0, 0, 0.2)',
    position: 'relative',
  };

  // Hover animation for interactive dice
  const hoverAnimation =
    isInteractiveForSelection || isInteractiveForTreasureChest
      ? {
          scale: 1.05,
          boxShadow: die.inTreasureChest
            ? '0 0 15px rgba(251, 191, 36, 0.8)' // Gold glow for treasure chest hover
            : '0 0 15px rgba(59, 130, 246, 0.8)',
        }
      : {};

  // Fixed animation logic: Only animate if first roll (gamePhase === 'rolling') or if selected
  const shouldAnimate =
    isDiceRolling &&
    !die.locked &&
    (gamePhase === 'rolling' || selectedDice.includes(index));

  // Rolling animation for dice that should be animated
  const rollingAnimation = shouldAnimate
    ? {
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1],
        y: [0, -20, 0],
      }
    : {};

  return (
    <motion.div
      onClick={handleClick}
      style={dieStyle}
      whileHover={hoverAnimation}
      animate={rollingAnimation}
      transition={{
        duration: 0.8,
        ease: 'easeInOut',
      }}
    >
      {!isBlank && renderDieFace(die.face)}
      {die.locked && !die.inTreasureChest && <LockIcon />}
      {die.inTreasureChest && <TreasureChestIcon />}
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

// New component for treasure chest icon
const TreasureChestIcon = () => (
  <div
    style={{
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: '#fbbf24',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#7c2d12',
      border: '1px solid #fef3c7',
    }}
  >
    🧰
  </div>
);

export default Die;
