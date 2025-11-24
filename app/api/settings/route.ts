import { db } from '@/lib/db';

export async function GET() {
    try {
        const settings = await db.settings.findFirst();
        if (!settings) {
            // Return default empty settings including Browserless fields
            return Response.json({
                n8nUrl: '',
                n8nApiKey: '',
                browserlessUrl: '',
                browserlessApiKey: '',
                email: '',
                password: '',
                webhookUrl: '',
                scheduleCron: ''
            });
        }
        return Response.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { n8nUrl, n8nApiKey, browserlessUrl, browserlessApiKey, email, password, webhookUrl, scheduleCron } = body;

        const settings = await db.settings.upsert({
            where: { id: 1 },
            update: {
                n8nUrl,
                n8nApiKey,
                browserlessUrl,
                browserlessApiKey,
                email,
                password,
                webhookUrl,
                scheduleCron,
            },
            create: {
                id: 1,
                n8nUrl,
                n8nApiKey,
                browserlessUrl,
                browserlessApiKey,
                email,
                password,
                webhookUrl,
                scheduleCron,
            },
        });

        return Response.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return Response.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
