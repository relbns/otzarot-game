import React, { useState } from 'react';
import OtzarotGameContainer from './components/OtzarotGame';
import SplashScreen from './components/SplashScreen';
import Footer from './components/Footer';
import './noselect.css';
import OtzarotGame from './components/OtzarotGame';
import { GameProvider } from './context/GameContext';

function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  return (
    <GameProvider>
      {showSplashScreen ? (
        <SplashScreen onStartGame={() => setShowSplashScreen(false)} />
      ) : (
          // <OtzarotGameContainer />
          <OtzarotGame/>
      )}
      <Footer />
    </GameProvider>
  );
}

export default App;
