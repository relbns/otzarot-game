// src/components/GameBoard.js
import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import GameInfo from './GameInfo';
import CardSection from './CardSection';
import DiceSection from './DiceSection';
import GameControls from './GameControls';

const GameBoard = () => {
  const { gameStarted } = useGameContext();

  return (
    <motion.div
      className="game-board-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {gameStarted && (
        <>
          <div 
            className="game-info-and-scores"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <GameInfo />
          </div>
          
          <div
            className="game-board"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <CardSection />
            <DiceSection />
            <GameControls />
          </div>
        </>
      )}
    </motion.div>
  );
};

export default GameBoard;