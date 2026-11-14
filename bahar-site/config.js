// Address of the backend API (no trailing slash).
//
// Default: the backend lives in /backend on the SAME domain as this site
// (public_html/backend). No CORS setup and no mixed-content problems.
//   Same domain (recommended):  '/backend/api/v1'
//   Other domain / subdomain:   'https://api.example.com/api/v1'   (must be https, and listed in cors_origins)
//   Local test:                 'http://127.0.0.1:8080/api/index.php/v1'
window.BAHAR_API_BASE = '/backend/api/v1';

// React is served from this site (vendor/), not from unpkg.com, so the page never goes blank
// when an external CDN is slow or unreachable. support.js reads this map before using a CDN.
window.__resources = {
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js': './vendor/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js': './vendor/react-dom.production.min.js'
};
