const P = 'slk_gc_';

export const storage = {
  setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    localStorage.setItem(P + 'at', accessToken);
    localStorage.setItem(P + 'rt', refreshToken);
    localStorage.setItem(P + 'exp', String(Date.now() + expiresIn * 1000));
  },
  getTokens() {
    return {
      accessToken: localStorage.getItem(P + 'at'),
      refreshToken: localStorage.getItem(P + 'rt'),
      expiry: Number(localStorage.getItem(P + 'exp') || 0),
    };
  },
  clearTokens() {
    localStorage.removeItem(P + 'at');
    localStorage.removeItem(P + 'rt');
    localStorage.removeItem(P + 'exp');
  },
  isExpired() {
    const exp = Number(localStorage.getItem(P + 'exp') || 0);
    return Date.now() > exp - 60_000;
  },
};
