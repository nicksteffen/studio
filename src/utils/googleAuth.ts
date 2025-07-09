// utils/googleAuth.ts

// Key for storing the nonce in session storage
export const NONCE_STORAGE_KEY = 'google_one_tap_nonce';

/**
 * Generates a cryptographically strong nonce and its SHA-256 hash.
 * The unhashed nonce is used for Supabase verification, and the hashed nonce
 * is sent to Google for the initial One Tap/Sign-In button setup.
 * @returns A tuple containing [unhashedNonce, hashedNonce]
 */
export const generateNonce = async (): Promise<[string, string]> => {
  // Generate a random string for the nonce
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));

  // Hash the nonce using SHA-256 (required by Google for security)
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return [nonce, hashedNonce];
};
