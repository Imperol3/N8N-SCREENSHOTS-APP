import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export async function middleware(req: NextRequest) {
    // Bypass for static assets and Next.js internals
    if (
        req.nextUrl.pathname.startsWith('/_next') ||
        req.nextUrl.pathname.startsWith('/static') ||
        req.nextUrl.pathname.includes('.') // Files like favicon.ico
    ) {
        return NextResponse.next();
    }
    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};
