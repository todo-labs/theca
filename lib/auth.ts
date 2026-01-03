import { authenticator } from "otplib";
import { SignJWT, jwtVerify } from "jose";

const TOTP_SECRET = process.env.TOTP_SECRET;

if (!TOTP_SECRET) {
  throw new Error("TOTP_SECRET environment variable is required");
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required (generate with: openssl rand -base64 32)",
  );
}

const jwtSecretKey = new TextEncoder().encode(JWT_SECRET);

export function verifyTOTP(token: string): boolean {
  return authenticator.verify({ token, secret: TOTP_SECRET! });
}

export function generateTOTP(): { secret: string; qrCode: string } {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri("Theca Admin", "Theca", secret);
  return { secret, qrCode: otpauthUrl };
}

export async function createJWT(): Promise<string> {
  const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT_HOURS || "24");

  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionTimeout}h`)
    .sign(jwtSecretKey);

  return token;
}

export async function verifyJWT(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, jwtSecretKey);
    return !!payload.authenticated;
  } catch {
    return false;
  }
}
