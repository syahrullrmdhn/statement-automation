import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = "syahrul";
  const password = "syahrul2026";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { username },
    create: {
      name: "Administrator",
      username,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    update: {
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Default admin created");
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });