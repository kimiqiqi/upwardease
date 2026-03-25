// authService.ts

// A tiny frontend-only auth service for demonstration purposes.
// Uses WebCrypto to hash passwords.

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const authService = {
  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  },
  
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const computedHash = await hashPassword(password);
    return computedHash === hash;
  }
};
