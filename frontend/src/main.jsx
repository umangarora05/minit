// ========================================================================
// MODULE 2: React — React DOM (Rendering the App)
// ========================================================================
// Topics: React DOM, JSX, Environment Setup
// ========================================================================

import { StrictMode } from 'react'          // StrictMode = helps find bugs during development
import { createRoot } from 'react-dom/client' // React DOM — renders React to the browser
import './index.css'                          // Linking External Style Sheet (Module 1)
import App from './App.jsx'                   // Our main App component

// --- React DOM Rendering ---
// createRoot() creates a React root at the DOM element with id="root"
// .render() tells React WHAT to display inside that root
// This is where React takes over the HTML page (Single Page Application)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />          {/* JSX — looks like HTML but it's JavaScript! */}
  </StrictMode>,
)
