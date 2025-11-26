import { db } from '@/lib/db';
import crypto from 'crypto';

export async function GET(request: Request) {
    // This route is protected by Basic Auth in middleware
    // If we reach here, the user is authenticated

    try {
        // Generate a new session key
        const sessionKey = `sess_${crypto.randomBytes(16).toString('hex')}`;

        // Store it in the DB
        await db.apiKey.create({
            data: {
                key: sessionKey,
                name: 'Web Session',
                lastUsedAt: new Date(),
            }
        });

        // Create response with API key
        const response = Response.json({ apiKey: sessionKey });

        // Set Auth Cookie (Remember Me)
        // We use the same hash logic as middleware
        const pwd = process.env.ADMIN_PASSWORD;
        if (pwd) {
            const hash = crypto.createHash('sha256').update(pwd).digest('hex');
            // Set cookie that expires in 30 days
            response.headers.append('Set-Cookie', `auth_token=${hash}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Strict`);
        }

        return response;
    } catch (error) {
        console.error('Session generation failed:', error);
        return Response.json({ error: 'Failed to generate session' }, { status: 500 });
    }
}
