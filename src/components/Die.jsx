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
    skullRerollUsed,
  } = useGameContext();

  // Don't show content for blank dice
  const isBlank = die.face === 'blank';

  // Check if we have the treasure chest card
  const hasTreasureChest = currentCard && currentCard.effect === 'store_dice';
  
  // Check if we have the sorceress card and it hasn't been used yet
  const hasSorceress = currentCard && currentCard.effect === 'reroll_skull' && !skullRerollUsed;
  
  // Determine if the die is a skull that can be rerolled with sorceress
  const isRerollableSkull = die.face === 'skull' && hasSorceress && !die.inTreasureChest;

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
    } else if (isInteractiveForSelection || isRerollableSkull) {
      // Handle normal dice selection or sorceress skull reroll
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
      isInteractiveForSelection || isInteractiveForTreasureChest || isRerollableSkull
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
    isInteractiveForSelection || isInteractiveForTreasureChest || isRerollableSkull
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

  // Always show lock icon on skull dice unless they can be rerolled with sorceress
  const shouldShowLockIcon = (die.locked && !die.inTreasureChest) || 
                            (die.face === 'skull' && !isRerollableSkull && !die.inTreasureChest);

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
      {shouldShowLockIcon && <LockIcon isSkull={die.face === 'skull'} canReroll={isRerollableSkull} />}
      {die.inTreasureChest && <TreasureChestIcon />}
    </motion.div>
  );
};

// Separate component for the lock icon
const LockIcon = ({ isSkull, canReroll }) => (
  <div
    style={{
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: canReroll ? '#8b5cf6' : '#ef4444', // Purple for rerollable skulls, red for locked
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      color: 'white',
      border: canReroll ? '1px solid #ddd6fe' : '1px solid #fee2e2',
      textAlign: 'center',
      padding: '0',
      overflow: 'hidden',
    }}
  >
    <span style={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {canReroll ? '🔮' : '🔒'}
    </span>
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
