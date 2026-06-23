import { PrismaClient } from '../apps/api/generated/prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const pinHash = await bcrypt.hash('1234', 10);

  const supervisor = await prisma.agent.upsert({
    where: { employeeId: 'SUP001' },
    update: {},
    create: {
      employeeId: 'SUP001',
      name: 'Demo Supervisor',
      phone: '254700000001',
      pinHash,
      role: 'SUPERVISOR',
    },
  });

  console.log(`✅ Seed agent ready:`);
  console.log(`   Employee ID : ${supervisor.employeeId}`);
  console.log(`   Name        : ${supervisor.name}`);
  console.log(`   Role        : ${supervisor.role}`);
  console.log(`   PIN         : 1234`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
