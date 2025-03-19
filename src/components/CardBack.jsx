// src/components/CardBack.js
import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const CardBack = ({ isFlipping, canDraw, onDraw }) => {
  const { t } = useGameContext();

  return (
    <motion.div
      onClick={canDraw ? onDraw : null}
      style={{
        width: '200px',
        height: '280px',
        background: isFlipping
          ? 'linear-gradient(135deg, #1e3a8a, #2563eb)'
          : 'linear-gradient(135deg, #1e293b, #334155)',
        border: isFlipping ? '4px solid #eab308' : '4px solid #475569',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: canDraw ? 'pointer' : 'default',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
        padding: '20px',
      }}
      whileHover={canDraw ? { scale: 1.05 } : {}}
      animate={{
        rotateY: isFlipping ? 90 : 0,
        background: isFlipping
          ? 'linear-gradient(135deg, #1e3a8a, #2563eb)'
          : 'linear-gradient(135deg, #1e293b, #334155)',
      }}
      transition={{ duration: 0.3 }}
    >
      {canDraw ? t('click_to_draw') : t('waiting_for_card')}
    </motion.div>
  );
};

export default CardBack;
