import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import { AuthCallback } from './pages/AuthCallback';

function getInitialPath(): string {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname;
  if (pathname === '/auth/callback') return '/auth/callback';
  if (pathname === '/signin') return '/signin';
  if (pathname === '/signup' || pathname === '/get-started') return '/signup';
  if (pathname === '/privacy' || pathname.startsWith('/privacy/')) {
    return '/privacy';
  }
  if (pathname === '/terms' || pathname.startsWith('/terms/')) {
    return '/terms';
  }
  const hash = window.location.hash;
  if (hash === '#/privacy' || hash === '#privacy') {
    return '/privacy';
  }
  if (hash === '#/terms' || hash === '#terms') {
    return '/terms';
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

    const handleDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      if (href === '/privacy' || href === '#/privacy' || href === '#privacy') {
        e.preventDefault();
        window.history.pushState({}, '', '/privacy');
        setCurrentPath('/privacy');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (href === '/terms' || href === '#/terms' || href === '#terms') {
        e.preventDefault();
        window.history.pushState({}, '', '/terms');
        setCurrentPath('/terms');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (href === '/' || href === '/#product' || href === '#product') {
        if (currentPath === '/privacy' || currentPath === '/terms') {
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

  if (currentPath === '/terms') {
    return <Terms onNavigateHome={() => navigateTo('/')} />;
  }

  if (currentPath === '/signin') return <SignIn />;
  if (currentPath === '/signup') return <SignUp />;
  if (currentPath === '/auth/callback') return <AuthCallback />;

  return <Home onPrivacyClick={() => navigateTo('/privacy')} />;
};

export default App;
