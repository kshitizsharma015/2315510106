import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { BootstrapLogger } from '@/components/BootstrapLogger';

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
        {children}
      </body>
    </html>
  );
}
