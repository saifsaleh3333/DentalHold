import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Practice 1
  const practice1 = await prisma.practice.upsert({
    where: { id: "practice-1" },
    update: {},
    create: {
      id: "practice-1",
      name: "Smile Dental",
      address: "123 Main St",
      city: "Austin",
      state: "TX",
      zip: "78701",
      phone: "(512) 555-0100",
    },
  });

  // Practice 2
  const practice2 = await prisma.practice.upsert({
    where: { id: "practice-2" },
    update: {},
    create: {
      id: "practice-2",
      name: "Bright Teeth Family Dentistry",
      address: "456 Oak Ave",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      phone: "(214) 555-0200",
    },
  });

  // Admin user for Practice 1 (your real email for testing)
  await prisma.user.upsert({
    where: { email: "saifsaleh1028@gmail.com" },
    update: { practiceId: practice1.id, role: "admin" },
    create: {
      email: "saifsaleh1028@gmail.com",
      name: "Saif Saleh",
      role: "admin",
      practiceId: practice1.id,
    },
  });

  // Admin user for Practice 2
  await prisma.user.upsert({
    where: { email: "admin@brightteeth.com" },
    update: { practiceId: practice2.id, role: "admin" },
    create: {
      email: "admin@brightteeth.com",
      name: "Bright Teeth Admin",
      role: "admin",
      practiceId: practice2.id,
    },
  });

  console.log("Seeded 2 practices and 2 admin users");

  // Backfill: assign any existing verifications without a practiceId to practice-1
  const updated = await prisma.verification.updateMany({
    where: { practiceId: null },
    data: { practiceId: practice1.id },
  });

  if (updated.count > 0) {
    console.log(`Backfilled ${updated.count} existing verifications to ${practice1.name}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
