const { execSync } = require('child_process');

console.log('>>       Building UI - START           <<');

// Webpack
execSync('cd src/ui; node_modules/.bin/ng build --prod', { stdio: 'inherit' });

console.log('>>       Building UI - END             <<');
