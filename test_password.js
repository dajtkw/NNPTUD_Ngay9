const { generateRandomPassword, validatePassword } = require('./utils/passwordHandler.js');

console.log('=== Testing Password Handler ===');
console.log('1. Generating 5 sample passwords:');
for (let i = 1; i <= 5; i++) {
  const pass = generateRandomPassword();
  console.log(`  Password ${i}: ${pass} (length: ${pass.length}, valid: ${validatePassword(pass)})`);
}

console.log('\n2. Testing validation with invalid passwords:');
const invalidTests = [
  ['short', 'Short1!', false],
  ['no uppercase', 'lowercase1!', false],
  ['no lowercase', 'UPPERCASE1!', false],
  ['no number', 'NoNumber!!', false],
  ['no special', 'NoSpecial123', false],
  ['valid example', 'Valid1!password', true]
];

invalidTests.forEach(([desc, pass, expected]) => {
  const result = validatePassword(pass);
  const check = result === expected ? '✓' : '✗';
  console.log(`  ${desc}: "${pass}" -> ${result} (expected: ${expected}) ${check}`);
});

console.log('\n=== Password Handler Test Complete ===');