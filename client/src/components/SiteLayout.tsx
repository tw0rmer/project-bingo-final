import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SubNav } from '@/components/SubNav';

interface SiteLayoutProps {
  children: React.ReactNode;
  hideAuthButtons?: boolean;
  hideSubNav?: boolean;
  className?: string;
}

export function SiteLayout({ children, hideAuthButtons = false, hideSubNav = false, className = '' }: SiteLayoutProps) {
  return (
    <div className={`min-h-screen bg-cream flex flex-col ${className}`}>
      <Header hideAuthButtons={hideAuthButtons} />
      {!hideSubNav && <SubNav />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}


