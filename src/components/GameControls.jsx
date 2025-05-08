import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';

const GameControls = () => {
  const {
    gamePhase,
    rollsRemaining,
    islandOfSkulls,
    isDiceRolling,
    turnEndsWithSkulls,
    autoEndCountdown,
    selectedDice,
    drawCard,
    rollDice,
    endTurn,
    // calculateScore, // Not directly used in controls, endTurn handles it
    finalizeIslandOfSkullsTurn, // New action for IoS
    currentCard, // Added currentCard
    t,
  } = useGameContext();

  // Check if roll button should be disabled
  const isRollDisabled =
    isDiceRolling ||
    (gamePhase === 'decision' && selectedDice.length < 2 && !islandOfSkulls);

  // Handle end turn - always call endTurn from the hook,
  // as it now contains the logic to calculate score if needed.
  const handleEndTurn = () => {
    endTurn();
  };

  return (
    <div
      className="controls"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '10px',
      }}
    >
      {gamePhase === 'drawing' && (
        <motion.button
          onClick={drawCard}
          style={{
            ...styles.primaryButton,
            padding: '8px 16px',
            fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('draw_card')}
        </motion.button>
      )}

      {/* Show Roll/Reroll button logic:
          - If 'rolling': always show (initial roll).
          - If 'decision' and not IoS:
            - For Storm card: show only if rollsRemaining is 2 (this is the single re-roll chance).
            - For other cards: show if rollsRemaining > 0.
      */}
      {(
        (gamePhase === 'rolling') ||
        (
          gamePhase === 'decision' && !islandOfSkulls &&
          (
            (currentCard?.effect === 'storm' && rollsRemaining === 2) ||
            (currentCard?.effect !== 'storm' && rollsRemaining > 0)
          )
        )
      ) && (
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
              rollDice();
            } catch (error) {
              console.error('Error calling rollDice:', error);
            }
          }}
          disabled={isRollDisabled}
          style={{
            ...styles.primaryButton,
            padding: '8px 16px',
            fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
            ...(isRollDisabled ? styles.disabledButton : {}),
          }}
          whileHover={isRollDisabled ? {} : { scale: 1.05 }}
          whileTap={isRollDisabled ? {} : { scale: 0.95 }}
        >
          {gamePhase === 'rolling'
            ? t('roll_dice')
            : `${t('reroll_selected')} (${currentCard?.effect === 'storm' ? rollsRemaining -1 : rollsRemaining})`}
        </motion.button>
      )}

      {/* "Roll for Skulls" button during active Island of Skulls, decision phase */}
      {islandOfSkulls && gamePhase === 'decision' && (
        <motion.button
          onClick={rollDice} // This rollDice call is for IoS rolls
          disabled={isDiceRolling}
          style={{
            background: 'linear-gradient(to right, #dc2626, #ef4444)',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
            color: 'white',
            cursor: isDiceRolling ? 'default' : 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            opacity: isDiceRolling ? 0.7 : 1,
          }}
          whileHover={isDiceRolling ? {} : { scale: 1.05 }}
          whileTap={isDiceRolling ? {} : { scale: 0.95 }}
        >
          {t('roll_for_skulls')}
        </motion.button>
      )}

      {turnEndsWithSkulls && (
        <motion.button
          onClick={endTurn}
          style={{
            background: 'linear-gradient(to right, #dc2626, #ef4444)',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0.9 }}
          animate={{
            scale: [1, 1.05, 1],
            transition: {
              repeat: Infinity,
              duration: 1.5,
            },
          }}
        >
          {t('end_turn')} ({autoEndCountdown}s)
        </motion.button>
      )}

      {/* Show standard End Turn button only when not on Skull Island and not ending due to skulls */}
      {(gamePhase === 'decision' || gamePhase === 'resolution') && // Standard end turn
        !turnEndsWithSkulls && !islandOfSkulls && 
        gamePhase !== 'islandResolutionPending' && ( // Hide if waiting for IoS finalization
          <motion.button
            onClick={handleEndTurn}
            style={{
              ...styles.secondaryButton,
              padding: '8px 16px',
              fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('end_turn')}
          </motion.button>
        )}

      {/* Button to finalize Island of Skulls turn (styled as regular "End Turn") */}
      {gamePhase === 'islandResolutionPending' && (
        <motion.button
          onClick={finalizeIslandOfSkullsTurn}
          style={{
            ...styles.secondaryButton, // Use standard secondary button style
            padding: '8px 16px',
            fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('end_turn')} {/* Use standard "End Turn" text */}
        </motion.button>
      )}
    </div>
  );
};

export default GameControls;
