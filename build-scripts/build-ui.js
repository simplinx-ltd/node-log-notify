const { execSync } = require('child_process');

console.log('>>       Building UI - START           <<');

// Webpack
execSync('cd src/ui; node_modules/.bin/ng build --prod', { stdio: 'inherit' });

// Copy Required files/folders
//execSync('(rm -r ./build/public/static; mkdir ./build/public/static; cp -r ./src/ui/modules/static/* ./build/public/static ; cp -r ./node_modules/bootstrap/dist ./build/public/static/bootstrap ; cp -r ./node_modules/amcharts3 ./build/public/static/)', { stdio: 'inherit' });

console.log('>>       Building UI - END             <<');
