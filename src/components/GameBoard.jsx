// src/components/GameBoard.js
import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import GameInfo from './GameInfo';
import ScoreBoard from './ScoreBoard';
import CardSection from './CardSection';
import DiceSection from './DiceSection';
import GameControls from './GameControls';
import GameLog from './GameLog';

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
          <GameInfo />
          <ScoreBoard />

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

          <GameLog />
        </>
      )}
    </motion.div>
  );
};

export default GameBoard;
