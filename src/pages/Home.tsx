import React, { useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Hero } from '../components/sections/Hero';

export const Home: React.FC = () => {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
    if (previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      previewRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light flex flex-col selection:bg-brand-accent/20 selection:text-brand-accent">
      <Navbar onExploreClick={handleExploreClick} />
      <main className="flex-1">
        <Hero previewRef={previewRef} />
      </main>
    </div>
  );
};
