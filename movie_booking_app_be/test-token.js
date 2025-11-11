const jwt = require('jsonwebtoken');

// Test decoding a sample token
const sampleUserId = 'u001'; // Custom user ID from your DB

// Generate token
const token = jwt.sign(
  { id: sampleUserId }, 
  'your_super_secret_jwt_key_here',
  { expiresIn: '7d' }
);

console.log('Generated Token:', token);
console.log('\nDecoded:', jwt.verify(token, 'your_super_secret_jwt_key_here'));

// Now test with the real token from your app
// Copy token from console log and paste it here
const yourToken = 'PASTE_YOUR_TOKEN_HERE';

try {
  if (yourToken !== 'PASTE_YOUR_TOKEN_HERE') {
    const decoded = jwt.verify(yourToken, 'your_super_secret_jwt_key_here');
    console.log('\nYour token decoded:', decoded);
  }
} catch (error) {
  console.log('Error decoding your token:', error.message);
}
