import { db } from './db';

export async function validateApiKey(request: Request): Promise<boolean> {
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
        return false;
    }

    try {
        const keyRecord = await db.apiKey.findUnique({
            where: { key: apiKey },
        });

        if (keyRecord) {
            // Update last used timestamp (fire and forget)
            db.apiKey.update({
                where: { id: keyRecord.id },
                data: { lastUsedAt: new Date() },
            }).catch(console.error);

            return true;
        }
    } catch (error) {
        console.error('Error validating API key:', error);
    }

    return false;
}
