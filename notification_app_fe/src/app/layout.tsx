import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { BootstrapLogger } from '@/components/BootstrapLogger';
import Link from 'next/link';

import './globals.css';

export const metadata: Metadata = {
  title: 'Campus Notifications',
  description: 'Frontend scaffold for the campus notifications evaluation',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <BootstrapLogger />
        <header className="app-header">
          <div className="container">
            <div className="brand">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect width="24" height="24" rx="6" fill="#fff" opacity="0.06"/>
                <path d="M4 12h16" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2>Campus Notifications</h2>
            </div>

            <nav className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/notifications">All</Link>
              <Link href="/priority">Priority</Link>
            </nav>
          </div>
        </header>

        <div className="app-body">{children}</div>
      </body>
    </html>
  );
}
