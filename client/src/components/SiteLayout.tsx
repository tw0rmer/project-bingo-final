import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

interface SiteLayoutProps {
  children: React.ReactNode;
  hideAuthButtons?: boolean;
  className?: string;
}

export function SiteLayout({ children, hideAuthButtons = false, className = '' }: SiteLayoutProps) {
  return (
    <div className={`min-h-screen bg-cream flex flex-col ${className}`}>
      <Header hideAuthButtons={hideAuthButtons} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}


