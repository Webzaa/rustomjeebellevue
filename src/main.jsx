import React from 'react';
import { createRoot } from 'react-dom/client';
import 'intl-tel-input/build/css/intlTelInput.css';
import './styles/style.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
