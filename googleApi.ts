import { storage } from './storage';
import { refreshToken } from './oauth';

export interface Contact {
  name: string;
  email: string;
  phone: string;
  company: string;
}

const getToken = async (): Promise<string> => {
  const { accessToken, refreshToken: rt } = storage.getTokens();
  if (!accessToken) throw new Error('NOT_AUTHED');

  if (storage.isExpired()) {
    if (!rt) throw new Error('NOT_AUTHED');
    const tokens = await refreshToken(rt);
    storage.setTokens(tokens.access_token, rt, tokens.expires_in);
    return tokens.access_token;
  }

  return accessToken;
};

export const searchContacts = async (query: string): Promise<Contact[]> => {
  if (!query || query.length < 2) return [];

  const token = await getToken();

  const params = new URLSearchParams({
    query,
    readMask: 'names,emailAddresses,phoneNumbers,organizations',
    pageSize: '8',
  });

  const res = await fetch(
    `https://people.googleapis.com/v1/people:searchContacts?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (res.status === 401) {
    storage.clearTokens();
    throw new Error('NOT_AUTHED');
  }

  if (!res.ok) throw new Error('Search failed');

  const data = await res.json();

  return (data.results || [])
    .map((r: any) => {
      const p = r.person;
      return {
        name: p.names?.[0]?.displayName || '',
        email: p.emailAddresses?.[0]?.value || '',
        phone: p.phoneNumbers?.[0]?.value || '',
        company: p.organizations?.[0]?.name || '',
      };
    })
    .filter((c: Contact) => c.name);
};
