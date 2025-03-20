// // src/components/GameControls.js
// import React from 'react';
// import { motion } from 'framer-motion';
// import { useGameContext } from '../context/GameContext';
// import { styles } from '../constants';

// const GameControls = () => {
//   const {
//     gamePhase,
//     rollsRemaining,
//     islandOfSkulls,
//     isDiceRolling,
//     drawCard,
//     rollDice,
//     endTurn,
//     t
//   } = useGameContext();

//   return (
//     <div
//       className="controls"
//       style={{
//         display: 'flex',
//         flexWrap: 'wrap',
//         justifyContent: 'center',
//         gap: '10px',
//         marginBottom: '15px',
//       }}
//     >
//       {gamePhase === 'drawing' && (
//         <motion.button
//           onClick={drawCard}
//           style={{
//             ...styles.primaryButton,
//             padding: '10px 20px',
//             fontSize: '0.9rem',
//           }}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           {t('draw_card')}
//         </motion.button>
//       )}

//       {(gamePhase === 'rolling' ||
//         (gamePhase === 'decision' && rollsRemaining > 0)) && (
//         <motion.button
//           onClick={rollDice}
//           disabled={isDiceRolling}
//           style={{
//             ...styles.primaryButton,
//             padding: '10px 20px',
//             fontSize: '0.9rem',
//             opacity: isDiceRolling ? 0.7 : 1,
//           }}
//           whileHover={isDiceRolling ? {} : { scale: 1.05 }}
//           whileTap={isDiceRolling ? {} : { scale: 0.95 }}
//         >
//           {gamePhase === 'rolling'
//             ? t('roll_dice')
//             : `${t('reroll_selected')} (${rollsRemaining})`}
//         </motion.button>
//       )}

//       {islandOfSkulls && (
//         <motion.button
//           onClick={rollDice}
//           disabled={isDiceRolling}
//           style={{
//             background: 'linear-gradient(to right, #dc2626, #ef4444)',
//             border: 'none',
//             borderRadius: '6px',
//             padding: '10px 20px',
//             fontSize: '0.9rem',
//             color: 'white',
//             cursor: isDiceRolling ? 'default' : 'pointer',
//             fontWeight: 'bold',
//             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
//             opacity: isDiceRolling ? 0.7 : 1,
//           }}
//           whileHover={isDiceRolling ? {} : { scale: 1.05 }}
//           whileTap={isDiceRolling ? {} : { scale: 0.95 }}
//         >
//           {t('roll_for_skulls')}
//         </motion.button>
//       )}

//       {(gamePhase === 'decision' ||
//         gamePhase === 'resolution' ||
//         islandOfSkulls) && (
//         <motion.button
//           onClick={endTurn}
//           style={{
//             ...styles.secondaryButton,
//             padding: '10px 20px',
//             fontSize: '0.9rem',
//           }}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           {t('end_turn')}
//         </motion.button>
//       )}
//     </div>
//   );
// };

// export default GameControls;

// src/components/GameControls.js
import React from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../context/GameContext';
import { styles } from '../constants';

const GameControls = () => {
  const {
    gamePhase,
    rollsRemaining,
    islandOfSkulls,
    isDiceRolling,
    turnEndsWithSkulls,
    autoEndCountdown,
    drawCard,
    rollDice,
    endTurn,
    t,
  } = useGameContext();

  return (
    <div
      className="controls"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '15px',
      }}
    >
      {gamePhase === 'drawing' && (
        <motion.button
          onClick={drawCard}
          style={{
            ...styles.primaryButton,
            padding: '10px 20px',
            fontSize: '0.9rem',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('draw_card')}
        </motion.button>
      )}

      {(gamePhase === 'rolling' ||
        (gamePhase === 'decision' && rollsRemaining > 0)) && (
        <motion.button
          onClick={rollDice}
          disabled={isDiceRolling}
          style={{
            ...styles.primaryButton,
            padding: '10px 20px',
            fontSize: '0.9rem',
            opacity: isDiceRolling ? 0.7 : 1,
          }}
          whileHover={isDiceRolling ? {} : { scale: 1.05 }}
          whileTap={isDiceRolling ? {} : { scale: 0.95 }}
        >
          {gamePhase === 'rolling'
            ? t('roll_dice')
            : `${t('reroll_selected')} (${rollsRemaining})`}
        </motion.button>
      )}

      {islandOfSkulls && (
        <motion.button
          onClick={rollDice}
          disabled={isDiceRolling}
          style={{
            background: 'linear-gradient(to right, #dc2626, #ef4444)',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '0.9rem',
            color: 'white',
            cursor: isDiceRolling ? 'default' : 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            opacity: isDiceRolling ? 0.7 : 1,
          }}
          whileHover={isDiceRolling ? {} : { scale: 1.05 }}
          whileTap={isDiceRolling ? {} : { scale: 0.95 }}
        >
          {t('roll_for_skulls')}
        </motion.button>
      )}

      {turnEndsWithSkulls && (
        <motion.button
          onClick={endTurn}
          style={{
            background: 'linear-gradient(to right, #dc2626, #ef4444)',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '0.9rem',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0.9 }}
          animate={{
            scale: [1, 1.05, 1],
            transition: {
              repeat: Infinity,
              duration: 1.5,
            },
          }}
        >
          {t('end_turn')} ({autoEndCountdown}s)
        </motion.button>
      )}

      {(gamePhase === 'decision' || gamePhase === 'resolution') &&
        !turnEndsWithSkulls && (
          <motion.button
            onClick={endTurn}
            style={{
              ...styles.secondaryButton,
              padding: '10px 20px',
              fontSize: '0.9rem',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('end_turn')}
          </motion.button>
        )}
    </div>
  );
};

export default GameControls;
