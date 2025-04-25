import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';

const PlayerSetupScreen = () => {
  const { t, playerCount, setPlayerCount, language, initializeGame } =
    useGameContext();

  const handlePlayerFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const playerNames = [];

    for (let i = 0; i < playerCount; i++) {
      playerNames.push(formData.get(`player${i}`));
    }

    const selectedLanguage = formData.get('language');
    initializeGame(playerNames, selectedLanguage);
  };

  return (
    <motion.div
      className="start-screen"
      style={{ textAlign: 'center' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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

          <button
            type="submit"
            style={{
              background: 'linear-gradient(to right, #eab308, #f59e0b)',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#0f172a',
              cursor: 'pointer',
              margin: '20px 0 10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            }}
          >
            {t('start')}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default PlayerSetupScreen;
