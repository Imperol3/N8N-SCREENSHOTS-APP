import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    // Bypass Basic Auth for API routes and static assets
    if (
        req.nextUrl.pathname.startsWith('/api') ||
        req.nextUrl.pathname.startsWith('/_next') ||
        req.nextUrl.pathname.startsWith('/static') ||
        req.nextUrl.pathname.includes('.') // Files like favicon.ico
    ) {
        return NextResponse.next();
    }

    // Basic Auth Logic
    const basicAuth = req.headers.get('authorization');
    const user = process.env.ADMIN_USER;
    const pwd = process.env.ADMIN_PASSWORD;

    // If no credentials set in env, allow access (dev mode or open access)
    if (!user || !pwd) {
        return NextResponse.next();
    }

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [authUser, authPwd] = atob(authValue).split(':');

        if (authUser === user && authPwd === pwd) {
            return NextResponse.next();
        }
    }

    return new NextResponse('Authentication required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}

export const config = {
    matcher: '/:path*',
};
