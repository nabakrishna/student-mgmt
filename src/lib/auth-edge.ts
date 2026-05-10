/**
 * Edge-compatible JWT verification using the Web Crypto API.
 * Next.js Middleware runs on the Edge Runtime which does NOT support
 * Node.js built-ins (like the `crypto` module used by `jsonwebtoken`).
 * This file is safe to import from middleware.ts.
 */

export const COOKIE_NAME = "student_mgmt_token";

export interface JWTPayload {
  userId: number;
  username: string;
  role: "student" | "admin";
  studentId: number | null;
  exp?: number;
}

/** Base64url decode (no padding required) */
function base64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded  = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

/**
 * Verify a HS256 JWT using the Web Crypto API.
 * Returns the decoded payload, or null if the signature is invalid / token expired.
 */
export async function verifyTokenEdge(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Import the secret as a HMAC-SHA256 key
    const enc     = new TextEncoder();
    const keyData = enc.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Reconstruct the signing input and decode the signature
    const signingInput = `${headerB64}.${payloadB64}`;
    const signatureBytes = Uint8Array.from(
      base64urlDecode(signatureB64),
      (c) => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      signatureBytes,
      enc.encode(signingInput)
    );

    if (!valid) return null;

    // Decode and parse payload
    const payload = JSON.parse(base64urlDecode(payloadB64)) as JWTPayload;

    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}