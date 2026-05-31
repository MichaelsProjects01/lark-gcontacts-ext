import { startOAuth, exchangeCode } from './oauth';
import { storage } from './storage';

interface Props {
  onConnected: () => void;
}

export function AuthScreen({ onConnected }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      if (e.data?.type !== 'GOOGLE_AUTH_CALLBACK') return;

      if (e.data.error) {
        setError('Google sign-in was cancelled or failed. Try again.');
        setLoading(false);
        return;
      }

      try {
        const tokens = await exchangeCode(e.data.code);
        storage.setTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);
        onConnected();
      } catch {
        setError('Failed to complete sign-in. Please try again.');
        setLoading(false);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onConnected]);

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      await startOAuth();
    } catch {
      setError('Could not open the sign-in window. Check that popups are allowed.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>📇</div>
      <h2 style={styles.title}>Google Contacts</h2>
      <p style={styles.desc}>
        Connect your Google account to search your contacts and fill in details automatically.
      </p>
      {error && <p style={styles.error}>{error}</p>}
      <button style={styles.btn} onClick={handleConnect} disabled={loading}>
        {loading ? 'Opening sign-in...' : 'Connect Google Account'}
      </button>
      {loading && (
        <p style={styles.hint}>
          A sign-in window should have opened. Complete sign-in there.
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    textAlign: 'center',
    height: '100%',
    gap: '12px',
  },
  icon: { fontSize: '48px' },
  title: { margin: 0, fontSize: '18px', fontWeight: 600, color: '#1a1a1a' },
  desc: { margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.5, maxWidth: '260px' },
  btn: {
    marginTop: '8px',
    padding: '10px 20px',
    background: '#4285F4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    maxWidth: '260px',
  },
  hint: { fontSize: '12px', color: '#999', margin: 0 },
  error: {
    fontSize: '12px',
    color: '#d32f2f',
    background: '#fde8e8',
    padding: '8px 12px',
    borderRadius: '6px',
    margin: 0,
    maxWidth: '260px',
  },
};
