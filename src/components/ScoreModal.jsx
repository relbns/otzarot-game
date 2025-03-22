import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameContext } from '../context/GameContext';

const ScoreModal = () => {
  const {
    showScoreModal,
    turnScore,
    turnScoreDetails,
    turnPenalties,
    turnPenaltyDetails,
    players,
    activePlayer,
    endTurn,
    t,
  } = useGameContext();

  // Calculate final score
  const finalScore = Math.max(0, turnScore - turnPenalties);

  // Handle continue button click - call endTurn directly
  const handleContinue = () => {
    endTurn();
  };

  return (
    <AnimatePresence>
      {showScoreModal && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              border: '3px solid #f59e0b',
              width: '90%',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
          >
            <h2 style={{ margin: '0 0 15px', color: '#f59e0b' }}>
              {players[activePlayer].name} {t('turn_score')}
            </h2>

            {/* Display score details */}
            {turnScore > 0 && (
              <div>
                <h3 style={{ margin: '0 0 10px', color: '#a3e635' }}>
                  {t('points_earned')}: {turnScore}
                </h3>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.3)',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '15px',
                    textAlign: 'left',
                  }}
                >
                  {turnScoreDetails.map((detail, index) => (
                    <div key={index} style={{ margin: '5px 0' }}>
                      • {detail}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display penalty details */}
            {turnPenalties > 0 && (
              <div>
                <h3 style={{ margin: '0 0 10px', color: '#ef4444' }}>
                  {t('penalties')}: -{turnPenalties}
                </h3>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.3)',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '15px',
                    textAlign: 'left',
                  }}
                >
                  {turnPenaltyDetails.map((detail, index) => (
                    <div key={index} style={{ margin: '5px 0' }}>
                      • {detail}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display final score */}
            <h2 style={{ margin: '15px 0', color: '#f59e0b' }}>
              {t('final_score')}: {finalScore}
            </h2>

            {/* Continue button - now calls endTurn directly */}
            <button
              onClick={handleContinue}
              style={{
                background: 'linear-gradient(to right, #eab308, #f59e0b)',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                color: '#0f172a',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                marginTop: '10px',
              }}
            >
              {t('continue')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScoreModal;
