import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Privacy } from './pages/Privacy';

function getInitialPath(): string {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname;
  if (pathname === '/privacy' || pathname.startsWith('/privacy')) {
    return '/privacy';
  }
  const hash = window.location.hash;
  if (hash === '#/privacy' || hash === '#privacy') {
    return '/privacy';
  }
  return '/';
}

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getInitialPath());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Global interceptor for internal links like <a href="/privacy"> and <a href="/">
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      if (href === '/privacy' || href === '#/privacy') {
        e.preventDefault();
        window.history.pushState({}, '', '/privacy');
        setCurrentPath('/privacy');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (href === '/' || href === '/#product' || href === '#product') {
        if (currentPath === '/privacy') {
          e.preventDefault();
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [currentPath]);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPath === '/privacy') {
    return <Privacy onNavigateHome={() => navigateTo('/')} />;
  }

  return <Home onPrivacyClick={() => navigateTo('/privacy')} />;
};

export default App;
