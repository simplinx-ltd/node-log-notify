const {execSync} = require('child_process');

console.log('>>       Debugging UI           <<');
execSync('cd src/ui; node_modules/.bin/ng build --watch', {stdio: 'inherit'});
