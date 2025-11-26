
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    console.log('Settings:', settings);

    if (settings?.systemApiKey) {
        const apiKey = await prisma.apiKey.findUnique({
            where: { key: settings.systemApiKey },
        });
        console.log('Corresponding ApiKey record:', apiKey);
    } else {
        console.log('No systemApiKey in Settings');
    }

    const allApiKeys = await prisma.apiKey.findMany();
    console.log('All ApiKeys:', allApiKeys);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
