// Where the site reads its content from (no trailing slash).
//
// STATIC MODE (current, for Netlify — no PHP, no database):
//   content is read from data/bootstrap.json and data/articles/<id>.json, images from images/,
//   and the contact form is sent to Netlify Forms.
window.BAHAR_STATIC = true;
window.BAHAR_API_BASE = './data';

// BACKEND MODE (only if a PHP host with the bahar-backend is ever used):
//   window.BAHAR_STATIC = false;
//   window.BAHAR_API_BASE = '/backend/api/v1';                 // backend on the same domain
//   window.BAHAR_API_BASE = 'https://api.example.com/api/v1'; // backend elsewhere (https + cors_origins)

// React is served from this site (vendor/), not from unpkg.com, so the page never goes blank
// when an external CDN is slow or unreachable. support.js reads this map before using a CDN.
window.__resources = {
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js': './vendor/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js': './vendor/react-dom.production.min.js'
};
