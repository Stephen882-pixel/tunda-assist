import { createRequire } from 'module';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

// Use bcrypt via a quick node subprocess to avoid ESM/CJS issues
const hash = execSync(
  `node -e "const b=require('bcrypt');b.hash('1234',10).then(h=>process.stdout.write(h))"`,
  { cwd: process.cwd() }
).toString();

const require = createRequire(import.meta.url);
const { PrismaClient } = require('./generated/prisma/client/index.js');
const prisma = new PrismaClient();

const agent = await prisma.agent.upsert({
  where: { employeeId: 'SUP001' },
  update: {},
  create: {
    employeeId: 'SUP001',
    name: 'Demo Supervisor',
    phone: '254700000001',
    pinHash: hash,
    role: 'SUPERVISOR',
  },
});

console.log('✅ Seed agent ready:');
console.log(`   Employee ID : ${agent.employeeId}`);
console.log(`   Name        : ${agent.name}`);
console.log(`   Role        : ${agent.role}`);
console.log(`   PIN         : 1234`);

await prisma.$disconnect();
