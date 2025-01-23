import crypto from 'crypto';

function generateSecureSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('hex');
}

function generateSecrets() {
  const jwtSecret = generateSecureSecret();
  const refreshSecret = generateSecureSecret();

  console.log('\nGenerated Secrets:\n');
  console.log('JWT_SECRET=' + jwtSecret);
  console.log('JWT_REFRESH_SECRET=' + refreshSecret);
  console.log('\nAdd these to your .env file\n');
}

generateSecrets();