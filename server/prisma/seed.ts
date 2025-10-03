import { PrismaClient } from "@prisma/client";
import seedEmailTemplates from "./seed/email-template";


const prisma = new PrismaClient();
async function main() {
    console.log("🌱 Starting database seeding...");
    await seedEmailTemplates(prisma);
    console.log("✅ Seeding completed successfully.");
}

main()
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
