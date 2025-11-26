'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const { showBrowser, setShowBrowser } = useApp();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false); // Hide on scroll down
            } else {
                setIsVisible(true); // Show on scroll up
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <div className={`navbar bg-base-100 shadow-sm mb-8 rounded-box sticky top-4 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-24'}`}>
            <div className="flex-1">
                <Link href="/" className="btn btn-ghost text-xl">n8n Scraper</Link>
            </div>
            <div className="flex-none gap-4">
                <div className="form-control">
                    <label className="label cursor-pointer gap-2">
                        <span className="label-text text-xs font-medium">Show Browser</span>
                        <input
                            type="checkbox"
                            className="toggle toggle-sm toggle-primary"
                            checked={showBrowser}
                            onChange={(e) => setShowBrowser(e.target.checked)}
                        />
                    </label>
                </div>
                <div className="divider divider-horizontal mx-0"></div>
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
