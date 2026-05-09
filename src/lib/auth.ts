import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "student_mgmt_token";

export interface JWTPayload {
  userId: number;
  username: string;
  role: "student" | "admin";
  studentId: number | null;
}

/** Sign a JWT and return the Set-Cookie header string */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

/** Verify and decode a JWT. Returns null if invalid/expired. */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/** Build a secure, HttpOnly cookie string */
export function buildCookieHeader(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${8 * 60 * 60}; SameSite=Strict`;
}

/** Build a cookie string that immediately expires (for logout) */
export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
}

export { COOKIE_NAME };