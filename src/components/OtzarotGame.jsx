import React from 'react';
import { GameProvider } from '../context/GameContext';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';
import GameHeader from './GameHeader';
import PlayerSetupScreen from './PlayerSetupScreen';
import GameBoard from './GameBoard';
import GameLog from './GameLog';

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
  const { showStartForm, direction, gameStarted } = useGameContext();

  // Apply direction for RTL support
  const containerStyle = {
    ...styles.container,
    direction: direction,
  };

  return (
    <div className="game-container" style={containerStyle}>
      <GameHeader />

      {showStartForm ? (
        <PlayerSetupScreen />
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 80px)',
            overflow: 'hidden',
          }}
        >
          <GameBoard />

          {/* Only show game log if game has started
          {gameStarted && (
            <div style={{ flexShrink: 0, maxHeight: '25vh', overflow: 'auto' }}>
              <GameLog />
            </div>
          )} */}
        </div>
      )}
    </div>
  );
};

export default OtzarotGameContainer;
