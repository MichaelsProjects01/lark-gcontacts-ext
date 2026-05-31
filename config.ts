export const CONFIG = {
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string,
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI as string,
  SUPABASE_LEAD_URL: import.meta.env.VITE_SUPABASE_LEAD_URL as string,
  LEAD_CAPTURE_TOKEN: import.meta.env.VITE_LEAD_CAPTURE_TOKEN as string,
  REFERRED_BY: (import.meta.env.VITE_REFERRED_BY as string) || 'George',
};
