import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Landing from './pages/Landing'; // Make sure you're importing the Landing component
import "./index.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Landing /> {/* Render the Landing component */}
  </StrictMode>,
);