const {execSync} = require('child_process');
console.log('>>       Debugging Server          <<');

// Compile babel
execSync('node_modules/.bin/tsc  -p src/server/tsconfig.json --watch', {stdio: 'inherit'});
