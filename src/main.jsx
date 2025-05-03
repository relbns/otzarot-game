
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // Import HashRouter
import App from './App.jsx';

// basename is typically not needed with HashRouter
// const basename = import.meta.env.PROD ? '/otzarot-game/' : '/';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter> {/* Use HashRouter */}
      <App />
    </HashRouter>
  </StrictMode>,
);
