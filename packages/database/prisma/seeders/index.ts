import { prisma } from '../../src/client';
import { Seeder } from './SeederService';

async function main() {
  const seeder = new Seeder({ prisma });
  await seeder.run();
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
