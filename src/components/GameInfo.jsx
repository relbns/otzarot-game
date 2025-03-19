// src/components/GameInfo.js
import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';

const GameInfo = () => {
  const {
    players,
    activePlayer,
    isGameOver,
    winner,
    islandOfSkulls,
    skullCount,
    gamePhase,
    rollsRemaining,
    resetGame,
    t,
  } = useGameContext();

  return (
    <motion.div
      className="game-info"
      style={styles.gameInfo}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h2 style={{ margin: '0 0 10px' }}>
          {t('current_player')}: {players[activePlayer].name}
        </h2>
        <p style={{ margin: '0' }}>
          {isGameOver ? (
            <strong>
              {t('game_over')} {winner.name} {t('wins')}!
            </strong>
          ) : islandOfSkulls ? (
            `${t('in_skull_island')} ${skullCount} ${t('skull_count')}`
          ) : (
            `${t('phase')}: ${gamePhase} | ${t(
              'rolls_remaining'
            )}: ${rollsRemaining}`
          )}
        </p>
      </div>

      <button onClick={resetGame} style={styles.dangerButton}>
        {t('reset_game')}
      </button>
    </motion.div>
  );
};

export default GameInfo;
