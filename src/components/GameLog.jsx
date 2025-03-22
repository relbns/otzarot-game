import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const GameLog = () => {
  const { gameLog, t } = useGameContext();

  return (
    <div
      className="game-log"
      style={{
        background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
        borderRadius: '8px',
        padding: '15px',
        maxHeight: '200px',
        overflowY: 'auto',
        width: '100%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      }}
    >
      <h3 style={{ margin: '0 0 10px' }}>{t('game_log')}</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        {gameLog.map((log, index) => (
          <motion.div
            key={index}
            style={{
              padding: '8px',
              borderRadius: '4px',
              borderLeft: '3px solid #3b82f6',
              background: 'rgba(30, 41, 59, 0.5)',
              marginBottom: '5px',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            {log}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GameLog;
