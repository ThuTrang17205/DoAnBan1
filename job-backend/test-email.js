// test-email.js
const emailService = require('./services/emailService');

console.log('Type:', typeof emailService);
console.log('Keys:', Object.keys(emailService));
console.log('testConnection:', emailService.testConnection);