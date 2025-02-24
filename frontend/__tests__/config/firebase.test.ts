import { firebaseConfig } from '@/firebase';

describe('Firebase Configuration', () => {
  it('has all required environment variables', () => {
    expect(process.env.NEXT_PUBLIC_FIREBASE_API_KEY).toBeDefined();
    expect(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN).toBeDefined();
    // ... test other env vars
  });

  it('initializes Firebase with correct config', () => {
    expect(firebaseConfig.apiKey).toBe(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    expect(firebaseConfig.authDomain).toBe(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
    // ... test other config values
  });
}); 