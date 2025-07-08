// components/GoogleSignInButton.tsx
'use client';

import Script from 'next/script';
import { CredentialResponse } from 'google-one-tap';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client'; // Adjust path as needed
import { NONCE_STORAGE_KEY, generateNonce } from '@/utils/googleAuth'; // Import from shared utility

const GoogleSignInButton = () => {
  const supabase = createClient();
  const router = useRouter();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // This callback handles the response from Google after a successful sign-in
  const handleCredentialResponse = useCallback(async (response: CredentialResponse) => {
    try {
      console.log('--- handleCredentialResponse START ---');
      console.log('Google Sign-In button credential response:', response);
      if (!response.credential) {
        console.error('No credential found in Google Sign-In button response.');
        return;
      }

      // 1. Retrieve the original nonce from sessionStorage
      const storedNonce = sessionStorage.getItem(NONCE_STORAGE_KEY);
      sessionStorage.removeItem(NONCE_STORAGE_KEY); // Remove it immediately after use for security

      console.log('Nonce retrieved from sessionStorage:', storedNonce);

      if (!storedNonce) {
        console.error('CRITICAL: Nonce not found in session storage for button sign-in. This will cause a mismatch.');
        throw new Error('Nonce not found for verification.');
      }

      // Sign in with Supabase using the ID token and the original nonce
      console.log('Attempting Supabase signInWithIdToken with:');
      console.log('  Provider: google');
      console.log('  Token (first 20 chars):', response.credential.substring(0, 20) + '...');
      console.log('  Nonce sent to Supabase:', storedNonce);

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce: storedNonce, // Use the stored, original nonce
      });

      if (error) {
        console.error('Error logging in with Google Sign-In button:', error);
        if (error.message.includes('nonce mismatch')) {
          console.error('SPECIFIC ERROR: Nonce mismatch. The nonce sent to Supabase did not match the one from Google.');
        }
        throw error;
      }

      console.log('Session data:', data);
      console.log('Successfully logged in with Google via button');
      router.push('/'); // Redirect to a protected page
      console.log('--- handleCredentialResponse END ---');
    } catch (error) {
      console.error('Failed to handle Google Sign-In button credential response:', error);
      console.log('--- handleCredentialResponse END (with error) ---');
    }
  }, [supabase, router]);

  // This function initializes and renders the Google Sign-In button
  const initializeGoogleButton = useCallback(async () => {
    console.log('--- initializeGoogleButton START ---');
    console.log('Google GSI script loaded. Initializing Google Sign-In button...');

    // Generate a new nonce for this button interaction
    const [nonce, hashedNonce] = await generateNonce();
    sessionStorage.setItem(NONCE_STORAGE_KEY, nonce); // Store the UNHASHED nonce

    console.log('Generated Nonce (UNHASHED):', nonce);
    console.log('Generated Nonce (HASHED, sent to Google):', hashedNonce);
    console.log('Nonce stored in sessionStorage:', sessionStorage.getItem(NONCE_STORAGE_KEY)); // Verify storage

    /* global google */
    if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.id) {
      if (!googleClientId) {
        console.error("CRITICAL: NEXT_PUBLIC_GOOGLE_CLIENT_ID is undefined or empty for Google Sign-In button!");
        return;
      }
      console.log('Client ID (from env):', googleClientId);

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        nonce: hashedNonce, // Pass the HASHED nonce to Google
      });

      // Render the Google Sign-In button into the 'googleSignInDiv'
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv')!, // Non-null assertion as we control the div
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          width: '250',
          logo_alignment: 'left',
        }
      );
      console.log('Google Sign-In button rendered.');
    } else {
      console.error('Google Identity Services library not fully loaded for button initialization.');
    }
    console.log('--- initializeGoogleButton END ---');
  }, [googleClientId, generateNonce, handleCredentialResponse]);

  return (
    <>
      {/* Load the Google GSI client script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initializeGoogleButton} // Initialize button once script is loaded
        onError={(e) => console.error('Error loading Google GSI client script for button:', e)}
        strategy="afterInteractive" // Load after hydration
      />
      {/* This div is where the Google Sign-In button will be rendered */}
      <div id="googleSignInDiv" className="mt-4 flex justify-center"></div>
    </>
  );
};

export default GoogleSignInButton;
