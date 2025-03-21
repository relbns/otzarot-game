import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const Card = ({ card }) => {
  const { language } = useGameContext();

  return (
    <motion.div
      style={{
        width: 'clamp(140px, 30vw, 180px)',
        height: 'clamp(200px, 45vw, 250px)',
        background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
        border: '3px solid #eab308',
        borderRadius: '10px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
      }}
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: 180, opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3
        style={{
          textAlign: 'center',
          margin: '0 0 8px',
          color: '#fcd34d',
          fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
        }}
      >
        {language === 'he' ? card.hebrewName : card.name}
      </h3>
      <div
        style={{
          textAlign: 'center',
          fontSize: 'clamp(30px, 8vw, 40px)',
          marginBottom: '8px',
        }}
      >
        {card.icon}
      </div>
      <p
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.3)',
          borderRadius: '8px',
          padding: '8px',
          fontSize: 'clamp(10px, 2.5vw, 14px)',
        }}
      >
        {language === 'he' ? card.hebrewDescription : card.description}
      </p>
    </motion.div>
  );
};

export default Card;
