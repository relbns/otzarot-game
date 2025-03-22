// src/components/ShuffleNotification.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const ShuffleNotification = () => {
  const { showShuffleNotification, t } = useGameContext();

  return (
    <AnimatePresence>
      {showShuffleNotification && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              borderRadius: '12px',
              padding: '20px 40px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              border: '3px solid #f59e0b',
            }}
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔄</div>
            <h2 style={{ margin: '0 0 10px', color: '#f59e0b' }}>
              {t('deck_shuffled_title')}
            </h2>
            <p style={{ margin: '0', fontSize: '1.1rem' }}>
              {t('deck_shuffled_message')}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShuffleNotification;
