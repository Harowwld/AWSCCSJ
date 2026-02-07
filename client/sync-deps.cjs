const { execSync } = require('child_process');

try {
  console.log('Running npm install to sync package.json with node_modules...');
  execSync('npm install', { stdio: 'inherit', cwd: process.cwd() });
  console.log('Sync complete.');
} catch (err) {
  console.error('npm install failed:', err.message);
  process.exit(1);
}
