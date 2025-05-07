import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import { CARDS, DICE_FACES } from '../constants';

const devStyles = {
  containerBase: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '15px',
    zIndex: 1000,
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    maxWidth: '350px',
    maxHeight: '70vh',
    overflowY: 'auto',
    color: '#333',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    cursor: 'default',
    position: 'fixed',
  },
  title: {
    marginTop: '0',
    marginBottom: '10px',
    cursor: 'move',
    fontSize: '16px',
    color: '#1e3a8a',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
  },
  section: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  select: {
    width: '100%',
    padding: '6px',
    marginBottom: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '13px',
  },
  diceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  diceInputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  buttonGroup: {
    marginTop: '15px',
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  setButton: {
    backgroundColor: '#28a745', // Green
    color: 'white',
  },
  clearButton: {
    backgroundColor: '#dc3545', // Red
    color: 'white',
  },
};

const DevControls = () => {
  const {
    devNextCardId,
    devNextDiceRoll,
    setDevNextCardId,
    setDevNextDiceRoll,
    isDevControlsOpen,
    setIsDevControlsOpen,
    t,
  } = useGameContext();

  // --- Dragging State ---
  const [position, setPosition] = useState({
    x: 10,
    y: window.innerHeight - 350,
  }); // Initial position (adjust y estimate)
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null); // Ref for the draggable element (panel itself)
  // --- End Dragging State ---

  // Local state to manage selections before setting them in context
  const [selectedCard, setSelectedCard] = useState(devNextCardId || '');
  const [selectedDice, setSelectedDice] = useState(
    devNextDiceRoll || Array(8).fill('')
  );

  // Update local state if context changes (e.g., after settings are used)
  useEffect(() => {
    setSelectedCard(devNextCardId || '');
    setSelectedDice(devNextDiceRoll || Array(8).fill(''));
  }, [devNextCardId, devNextDiceRoll]);

  // Effect to center panel vertically when opened
  useEffect(() => {
    if (isDevControlsOpen && dragRef.current) {
      // Calculate center position only when opening
      const panelHeight = dragRef.current.offsetHeight;
      const centeredY = (window.innerHeight - panelHeight) / 2;
      // Keep horizontal position as is, or default to 10px
      setPosition((prevPos) => ({
        x: prevPos.x || 10,
        y: Math.max(0, centeredY),
      })); // Ensure y is not negative
    }
    // We only want this effect to run when isDevControlsOpen changes to true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDevControlsOpen]);

  const handleCardChange = (e) => {
    setSelectedCard(e.target.value);
  };

  const handleDiceChange = (index, value) => {
    const newDice = [...selectedDice];
    newDice[index] = value;
    setSelectedDice(newDice);
  };

  const handleSetSettings = () => {
    console.log('[DevControls] Setting Next Card:', selectedCard || 'Random');
    console.log(
      '[DevControls] Setting Next Dice:',
      selectedDice.map((d) => d || 'Random')
    );
    setDevNextCardId(selectedCard || null); // Set null if '' selected
    // Ensure the dice array always has 8 elements, using null for random
    const diceToSet = selectedDice.map((d) => d || null);
    while (diceToSet.length < 8) {
      diceToSet.push(null);
    }
    setDevNextDiceRoll(diceToSet.slice(0, 8));
    setIsDevControlsOpen(false); // Close the popup
  };

  const handleClearSettings = () => {
    console.log('[DevControls] Clearing settings');
    setSelectedCard('');
    setSelectedDice(Array(8).fill(''));
    setDevNextCardId(null);
    setDevNextDiceRoll(null);
  };

  const handleClose = () => {
    setIsDevControlsOpen(false);
  };

  // --- Dragging Logic ---
  const handleMouseDown = useCallback((e) => {
    // Only start dragging if the click target is NOT a button, select, or option
    const targetTagName = e.target.tagName.toUpperCase();
    if (
      targetTagName === 'BUTTON' ||
      targetTagName === 'SELECT' ||
      targetTagName === 'OPTION'
    ) {
      return; // Don't start drag if clicking on interactive elements
    }

    // Proceed with drag initiation if clicking on the panel background or title
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      // Prevent text selection during drag
      e.preventDefault();
    }
  }, []); // No dependencies needed for this basic version

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      // Ensure position doesn't go off-screen (basic boundary check)
      const newX = Math.max(
        0,
        Math.min(
          window.innerWidth - (dragRef.current?.offsetWidth || 350),
          e.clientX - offset.x
        )
      );
      const newY = Math.max(
        0,
        Math.min(
          window.innerHeight - (dragRef.current?.offsetHeight || 300),
          e.clientY - offset.y
        )
      );
      setPosition({ x: newX, y: newY });
    },
    [isDragging, offset]
  ); // Depends on dragging state and offset

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []); // No dependencies needed

  // Effect to add/remove window listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Optional: Add touch event listeners for mobile
      // window.addEventListener('touchmove', handleMouseMove);
      // window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      // window.removeEventListener('touchmove', handleMouseMove);
      // window.removeEventListener('touchend', handleMouseUp);
    }

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      // window.removeEventListener('touchmove', handleMouseMove);
      // window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]); // Re-run when isDragging changes
  // --- End Dragging Logic ---

  // Only render in development environment AND if the panel is set to open
  if (process.env.NODE_ENV !== 'development' || !isDevControlsOpen) {
    return null;
  }

  const playableDiceFaces = DICE_FACES.filter((face) => face !== 'blank');

  // Combine base styles with dynamic position for the container
  const dynamicContainerStyle = {
    ...devStyles.containerBase, // Use the base styles
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return (
    // Attach ref and mouse down handler to the main container
    // Apply the combined dynamic style
    <div
      ref={dragRef}
      style={dynamicContainerStyle}
      onMouseDown={handleMouseDown}
    >
      {/* Make only the title bar draggable by stopping propagation on other elements if needed,
          or attach onMouseDown only to the title bar's container div below.
          For simplicity, attaching to the whole panel first. */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Apply title style which includes cursor: move */}
        <h3 style={devStyles.title}>🛠️ Dev Controls 🛠️</h3>
        <button
          onClick={handleClose}
          style={{
            ...devStyles.button,
            backgroundColor: '#aaa',
            padding: '3px 8px',
            fontSize: '12px',
          }}
        >
          ✕ Close
        </button>
      </div>

      <div style={devStyles.section}>
        <label htmlFor="dev-card-select" style={devStyles.label}>
          Next Card:
        </label>
        <select
          id="dev-card-select"
          value={selectedCard}
          onChange={handleCardChange}
          style={devStyles.select}
        >
          <option value="">Draw Random</option>
          {CARDS.map((card) => (
            // Display name (effect)
            <option key={card.id} value={card.id.toString()}>
              {card.name} ({card.effect})
            </option>
          ))}
        </select>
      </div>

      <div style={devStyles.section}>
        <label style={devStyles.label}>Next Dice Roll:</label>
        <div style={devStyles.diceGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} style={devStyles.diceInputGroup}>
              <label htmlFor={`dev-dice-${index}`} style={{ fontSize: '12px' }}>
                Die {index + 1}:
              </label>
              <select
                id={`dev-dice-${index}`}
                value={selectedDice[index] || ''}
                onChange={(e) => handleDiceChange(index, e.target.value)}
                style={devStyles.select}
              >
                <option value="">Roll Random</option>
                {playableDiceFaces.map((face) => (
                  <option key={face} value={face}>
                    {face.charAt(0).toUpperCase() + face.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div style={devStyles.buttonGroup}>
        <button
          onClick={handleSetSettings}
          style={{ ...devStyles.button, ...devStyles.setButton }}
        >
          Set Next Turn
        </button>
        <button
          onClick={handleClearSettings}
          style={{ ...devStyles.button, ...devStyles.clearButton }}
        >
          Clear Settings
        </button>
      </div>
    </div>
  );
};

export default DevControls;
