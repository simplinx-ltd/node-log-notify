const {execSync} = require('child_process');
console.log('>>       Cleaning Build Folder           <<');
try {
  execSync('rm -r build/*', {
    stdio: ['pipe', 'pipe', process.stderr]
  });
} catch (e) {}
