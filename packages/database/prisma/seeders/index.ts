import { faker } from "@faker-js/faker";

import { prisma } from "../../src/client";

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: faker.internet.email() },
    update: {},
    create: {
      email: faker.internet.email(),
      name: faker.person.fullName(),
    },
  });
  const bob = await prisma.user.upsert({
    where: { email: faker.internet.email() },
    update: {},
    create: {
      email: faker.internet.email(),
      name: faker.person.fullName(),
    },
  });
  console.log({ alice, bob });
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
