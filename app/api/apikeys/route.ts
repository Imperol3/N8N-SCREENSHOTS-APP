import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function GET() {
    try {
        const keys = await db.apiKey.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return Response.json(keys);
    } catch (error) {
        return Response.json({ error: 'Failed to fetch keys' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name } = await request.json();

        if (!name) {
            return Response.json({ error: 'Name is required' }, { status: 400 });
        }

        // Generate a secure random key
        const key = 'sk_' + randomBytes(24).toString('hex');

        const newKey = await db.apiKey.create({
            data: {
                name,
                key,
            },
        });

        return Response.json(newKey);
    } catch (error) {
        return Response.json({ error: 'Failed to create key' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return Response.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.apiKey.delete({
            where: { id },
        });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: 'Failed to delete key' }, { status: 500 });
    }
}
