import { useState, useEffect } from 'preact/hooks';
import App from './App';
import AdminPage from './pages/AdminPage';

export default function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Route to admin page
  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    return <AdminPage onNavigate={navigate} />;
  }

  // Default to main app
  return <App onNavigate={navigate} />;
}
