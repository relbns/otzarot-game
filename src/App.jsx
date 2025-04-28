import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import Footer from './components/Footer';
import './noselect.css';
import OtzarotGame from './components/OtzarotGame';
import { GameProvider } from './context/GameContext';
import DynamicHead from './components/DynamicHead';
import SettingsScreen from './components/SettingsScreen';
import soundManager from './utils/SoundManager';


function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize sound manager on app load
  useEffect(() => {
    soundManager.initialize();
  }, []);

  // Handle navigation
  const handleStartGame = () => {
    setShowSplashScreen(false);
    soundManager.play('button');
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
    soundManager.play('button');
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    soundManager.play('button');
  };

  return (
    <GameProvider>
      <DynamicHead />
      {showSplashScreen ? (
        <SplashScreen
          onStartGame={handleStartGame}
          onSettings={handleOpenSettings}
        />
      ) : showSettings ? (
        <SettingsScreen onBack={handleCloseSettings} />
      ) : (
        <>
          <OtzarotGame onSettings={handleOpenSettings} />
          <Footer />
        </>
      )}
    </GameProvider>
  );
}

export default App;
