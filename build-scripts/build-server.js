const { execSync } = require('child_process');
console.log('>>       Building Server - START           <<');

// Copy node_modules
execSync('rm -rf build/node_modules && cp -Lr src/server/node_modules build/', {
  stdio: ['pipe', 'pipe', process.stderr]
});

// Copy build-resources
execSync('rsync -rv build-resources/ build --exclude .gitkeep', {
  stdio: ['pipe', 'pipe', process.stderr]
});

// Compile ts
try {
  execSync('node_modules/.bin/tsc -p src/server/tsconfig.json', { stdio: 'inherit' });
} catch (e) { console.log(e.message); }

// Copy other files
execSync('cd src/server; cp package*.json ../../build ', { stdio: 'inherit' });
execSync('cp README.md LICENSE ./build ', { stdio: 'inherit' });

console.log('>>       Building Server - END             <<');
