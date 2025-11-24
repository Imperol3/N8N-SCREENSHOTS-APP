'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="navbar bg-base-100 shadow-sm mb-8 rounded-box">
            <div className="flex-1">
                <Link href="/" className="btn btn-ghost text-xl">n8n Scraper</Link>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1 space-x-2">
                    <li>
                        <Link href="/" className={isActive('/') ? 'active' : ''}>
                            Workflows
                        </Link>
                    </li>
                    <li>
                        <Link href="/screenshots" className={isActive('/screenshots') ? 'active' : ''}>
                            Screenshots
                        </Link>
                    </li>
                    <li>
                        <Link href="/settings" className={isActive('/settings') ? 'active' : ''}>
                            Settings
                        </Link>
                    </li>
                    <li>
                        <Link href="/docs" className={isActive('/docs') ? 'active' : ''}>
                            Docs
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}
