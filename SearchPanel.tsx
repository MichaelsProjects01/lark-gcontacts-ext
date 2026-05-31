import { searchContacts, Contact } from './googleApi';
import { writeContact } from './larkBase';
import { PushButton } from './PushButton';
import { storage } from './storage';

interface Props {
  onDisconnect: () => void;
}

export function SearchPanel({ onDisconnect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Contact[]>([]);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const contacts = await searchContacts(value);
        setResults(contacts);
        setShowResults(true);
      } catch (err: any) {
        if (err.message === 'NOT_AUTHED') {
          storage.clearTokens();
          onDisconnect();
        }
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [onDisconnect]);

  const handleSelect = async (contact: Contact) => {
    setShowResults(false);
    setQuery('');
    setStatus(null);
    try {
      await writeContact(contact);
      setStatus({ msg: `✓ ${contact.name} filled in`, ok: true });
    } catch (err: any) {
      setStatus({ msg: err.message || 'Failed to fill in fields', ok: false });
    }
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>📇 Google Contacts</span>
        <button style={styles.disconnectBtn} onClick={() => {
          storage.clearTokens();
          onDisconnect();
        }}>
          Disconnect
        </button>
      </div>

      {/* Instructions */}
      <p style={styles.instruction}>
        Click a row in the table, then search below to fill in contact details.
      </p>

      {/* Search */}
      <div style={styles.searchWrap} ref={panelRef}>
        <div style={styles.inputWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.input}
            type="text"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
          />
          {searching && <span style={styles.spinner}>⟳</span>}
        </div>

        {/* Results dropdown */}
        {showResults && results.length > 0 && (
          <div style={styles.dropdown}>
            {results.map((c, i) => (
              <button
                key={i}
                style={styles.result}
                onClick={() => handleSelect(c)}
              >
                <span style={styles.resultName}>{c.name}</span>
                <span style={styles.resultSub}>
                  {[c.email, c.company].filter(Boolean).join(' · ')}
                </span>
              </button>
            ))}
          </div>
        )}

        {showResults && results.length === 0 && !searching && query.length >= 2 && (
          <div style={styles.dropdown}>
            <p style={styles.noResults}>No contacts found for "{query}"</p>
          </div>
        )}
      </div>

      {/* Status message */}
      {status && (
        <div style={{ ...styles.statusMsg, color: status.ok ? '#2e7d32' : '#c62828', background: status.ok ? '#e8f5e9' : '#fde8e8' }}>
          {status.msg}
        </div>
      )}

      {/* Divider */}
      <hr style={styles.divider} />

      {/* Push to SolusLink */}
      <PushButton />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    gap: '12px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: '13px',
    height: '100%',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontWeight: 600, fontSize: '14px', color: '#1a1a1a' },
  disconnectBtn: {
    background: 'none',
    border: 'none',
    color: '#999',
    fontSize: '11px',
    cursor: 'pointer',
    padding: '2px 4px',
  },
  instruction: {
    margin: 0,
    fontSize: '12px',
    color: '#888',
    lineHeight: 1.4,
  },
  searchWrap: { position: 'relative' },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    padding: '0 10px',
    gap: '8px',
    background: '#fff',
  },
  searchIcon: { fontSize: '14px', userSelect: 'none' },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    padding: '9px 0',
    background: 'transparent',
    color: '#1a1a1a',
  },
  spinner: {
    fontSize: '14px',
    animation: 'spin 1s linear infinite',
    color: '#999',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 100,
    overflow: 'hidden',
    maxHeight: '240px',
    overflowY: 'auto',
  },
  result: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    borderBottom: '1px solid #f0f0f0',
    gap: '2px',
  },
  resultName: { fontWeight: 500, color: '#1a1a1a', fontSize: '13px' },
  resultSub: { fontSize: '11px', color: '#888' },
  noResults: {
    margin: 0,
    padding: '14px',
    color: '#999',
    fontSize: '12px',
    textAlign: 'center',
  },
  statusMsg: {
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #f0f0f0',
    margin: '4px 0',
  },
};
