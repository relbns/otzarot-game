import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';
import soundManager from '../utils/SoundManager'; // Import soundManager

const PlayerSetupScreen = () => {
  const navigate = useNavigate(); // Use navigate hook
  // Removed direction, added back isRTL for consistency if needed elsewhere, but not used here now
  const { t, playerCount, setPlayerCount, language, isRTL, initializeGame } =
    useGameContext();


  const handlePlayerFormSubmit = (e) => {
    e.preventDefault();
    soundManager.play('button'); // Play sound on start
    const formData = new FormData(e.target);
    const playerNames = [];

    for (let i = 0; i < playerCount; i++) {
      playerNames.push(formData.get(`player${i}`));
    }

    const selectedLanguage = formData.get('language');
    initializeGame(playerNames, selectedLanguage);
  };

  const handleBackClick = () => {
    soundManager.play('button');
    navigate('/'); // Navigate to splash screen (This remains the back action for this screen)
  };


  return (
    // Removed direction style, assuming parent handles it
    <motion.div
      className="start-screen"
      style={{ textAlign: 'center' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Removed Header Buttons Container */}

      {/* Original Content */}
      {/* Note: The h2 might need margin adjustment if the header above changes spacing */}
      <h2>{t('welcome')}</h2>
      <div
        style={{
          background: '#1e293b',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        <h3>{t('player_setup')}</h3>
        <form onSubmit={handlePlayerFormSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              {t('player_count')}:
              <select
                value={playerCount}
                onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                style={styles.formControl}
              >
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              {t('language')}:
              <select
                name="language"
                defaultValue={language}
                style={styles.formControl}
              >
                <option value="en">{t('english')}</option>
                <option value="he">{t('hebrew')}</option>
              </select>
            </label>
          </div>

          {Array.from({ length: playerCount }).map((_, index) => {
            const placeholder = `Player ${index + 1}`;
            return (
              <div key={index} style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  {t('player_name')} {index + 1}:
                  <input
                    type="text"
                    name={`player${index}`}
                    placeholder={placeholder}
                    style={{
                      ...styles.formControl,
                      flexGrow: 1,
                    }}
                  />
                </label>
              </div>
            );
          })}

          <motion.button
            type="submit"
            style={{
              ...styles.primaryButton, // Use primary button style
              padding: '12px 30px', // Keep custom padding if needed, or adjust
              fontSize: '16px', // Keep custom font size if needed, or adjust
              margin: '20px 0 10px', // Keep custom margin
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('start')}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default PlayerSetupScreen;
