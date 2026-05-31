import { useState } from 'react';
import { readCurrentRecord } from '../larkBase';
import { CONFIG } from '../config';

export function PushButton() {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  const handlePush = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const record = await readCurrentRecord();

      if (!record.name && !record.email) {
        setStatus({ msg: 'No contact data on this row. Fill in Name/Email first.', ok: false });
        setLoading(false);
        return;
      }

      const payload = {
        name: record.name || '',
        email: record.email || '',
        phone: record.phone || '',
        company: record.company || '',
        message: notes || `Referred by ${CONFIG.REFERRED_BY}`,
        source: 'Referral',
        referred_by: CONFIG.REFERRED_BY,
        utm_source: 'lark_base',
        utm_medium: 'referral',
        utm_campaign: 'george_referral',
        token: CONFIG.LEAD_CAPTURE_TOKEN,
      };

      const res = await fetch(CONFIG.SUPABASE_LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      setStatus({ msg: `✓ ${record.name || 'Contact'} sent to SolusLink CRM`, ok: true });
      setNotes('');
    } catch (err: any) {
      setStatus({ msg: err.message || 'Failed to send. Check your connection.', ok: false });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <div style={styles.wrapper}>
      <p style={styles.label}>Send current row to SolusLink CRM as a referral lead:</p>

      <textarea
        style={styles.textarea}
        placeholder="Add context (pain points, what they need, how you know them)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />

      <button style={styles.btn} onClick={handlePush} disabled={loading}>
        {loading ? 'Sending...' : '🚀 Push to SolusLink CRM'}
      </button>

      {status && (
        <div style={{
          ...styles.status,
          color: status.ok ? '#2e7d32' : '#c62828',
          background: status.ok ? '#e8f5e9' : '#fde8e8',
        }}>
          {status.msg}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    margin: 0,
    fontSize: '12px',
    color: '#555',
    lineHeight: 1.4,
  },
  textarea: {
    resize: 'vertical',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '12px',
    fontFamily: 'inherit',
    color: '#1a1a1a',
    outline: 'none',
    lineHeight: 1.4,
  },
  btn: {
    padding: '10px',
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
  },
  status: {
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
  },
};
