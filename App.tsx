import { useState, useEffect } from 'react';
import { storage } from './storage';
import { AuthScreen } from './components/AuthScreen';
import { SearchPanel } from './components/SearchPanel';

type View = 'loading' | 'auth' | 'search';

export default function App() {
  const [view, setView] = useState<View>('loading');

  useEffect(() => {
    const { accessToken } = storage.getTokens();
    setView(accessToken ? 'search' : 'auth');
  }, []);

  if (view === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#999', fontSize: '13px' }}>
        Loading...
      </div>
    );
  }

  if (view === 'auth') {
    return <AuthScreen onConnected={() => setView('search')} />;
  }

  return <SearchPanel onDisconnect={() => setView('auth')} />;
}
