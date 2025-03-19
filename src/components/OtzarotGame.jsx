// src/components/OtzarotGame.js
import React from 'react';
import { GameProvider } from '../context/GameContext';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';
import GameHeader from './GameHeader';
import PlayerSetupScreen from './PlayerSetupScreen';
import GameBoard from './GameBoard';

// Main container component that provides GameContext to the application
const OtzarotGameContainer = () => {
  return (
    <GameProvider>
      <OtzarotGame />
    </GameProvider>
  );
};

// Inner component that uses GameContext
const OtzarotGame = () => {
  const { showStartForm, direction } = useGameContext();

  // Apply direction for RTL support
  const containerStyle = {
    ...styles.container,
    direction: direction,
  };

  return (
    <div className="game-container" style={containerStyle}>
      <GameHeader />

      {showStartForm ? <PlayerSetupScreen /> : <GameBoard />}
    </div>
  );
};

export default OtzarotGameContainer;
