import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const screenshots = await db.screenshot.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(screenshots);
    } catch (error) {
        console.error('Error fetching screenshots:', error);
        return NextResponse.json({ error: 'Failed to fetch screenshots' }, { status: 500 });
    }
}
