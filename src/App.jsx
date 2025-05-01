import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Footer from './components/Footer';
import './noselect.css';
import OtzarotGame from './components/OtzarotGame';
import { GameProvider } from './context/GameContext';
import DynamicHead from './components/DynamicHead';
import SettingsScreen from './components/SettingsScreen';
import soundManager from './utils/SoundManager';

function App() {
  // Initialize sound manager on app load
  useEffect(() => {
    soundManager.initialize();
  }, []);

  return (
    <GameProvider>
      <DynamicHead />
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route
          path="/game"
          element={
            <>
              <OtzarotGame />
              <Footer />
            </>
          }
        />
        <Route path="/settings" element={<SettingsScreen />} />
        {/* Add other routes as needed */}
      </Routes>
    </GameProvider>
  );
}

export default App;
