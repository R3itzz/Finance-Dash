import bcrypt from 'bcryptjs';
import { writeFileSync } from 'fs';

const password = process.argv[2] || 'nicolas16739';

bcrypt.hash(password, 10).then(hash => {
  console.log(`Password hash generated for: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log(`\nAdicione ao seu .env:`);
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
});
