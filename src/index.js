import React from 'react';
// IMPORTANT: Use the /client import
import { createRoot } from 'react-dom/client'; 

import App from './App.tsx'; // Your main component

const container = document.getElementById('root');

// IMPORT reCAPTCHA JAVASCRIPT
const RECAPTCHA_SITE_KEY ="YOUR PBC SITE KEY";
const root = createRoot(container); 
const script = document.createElement("script");
script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
script.async = true;
script.defer = true;
document.head.appendChild(script);


// 2. Call the .render() method on the root object
root.render(<App />);