/**
 * Smart Campus Management System Runner
 * Pure MERN Stack (MongoDB, Express, React, Node.js)
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('===========================================================');
console.log('   🏫 SMART CAMPUS MANAGEMENT SYSTEM (MERN STACK)');
console.log('   Pure JavaScript • Zero External Languages • High Resilience');
console.log('===========================================================');
console.log('');
console.log('Starting Smart Campus Express Server & React UI...');

const serverPath = path.join(__dirname, 'server', 'server.js');
const serverProc = spawn('node', [serverPath], { stdio: 'inherit' });

serverProc.on('error', (err) => {
  console.error('Failed to start server:', err);
});

serverProc.on('close', (code) => {
  console.log(`Server stopped with exit code: ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  serverProc.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProc.kill('SIGTERM');
  process.exit(0);
});
