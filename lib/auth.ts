import crypto from "node:crypto";
import { promisify } from "node:util";
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase, unwrap } from "@/lib/supabase";
import type { SessionUser } from "@/types";
import type { Row } from "@/types/supabase";

const scrypt = promisify(crypto.scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const SESSION_COOKIE = "jb_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ---------- passwords ----------

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// ---------- the admin account (defined in .env) ----------

function adminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  return email && password ? { email, password } : null;
}

/** True for the ADMIN_EMAIL login, which only ever signs in through `signInAdmin`. */
export function isAdminEmail(email: string) {
  return email.trim().toLowerCase() === adminCredentials()?.email;
}

function safeEqual(a: string, b: string) {
  const digest = (s: string) => crypto.createHash("sha256").update(s).digest();
  return crypto.timingSafeEqual(digest(a), digest(b));
}

/**
 * Signs in the admin defined by ADMIN_EMAIL / ADMIN_PASSWORD. Its database row
 * is created or synced on the fly, so the .env values are always the ones that
 * work. Returns null if the credentials don't match.
 */
export async function signInAdmin(email: string, password: string): Promise<Row<"users"> | null> {
  const admin = adminCredentials();
  if (!admin || !isAdminEmail(email) || !safeEqual(password, admin.password)) return null;

  const existing = unwrap(await supabase.from("users").select("*").eq("email", admin.email).maybeSingle());
  if (existing?.is_admin && (await verifyPassword(admin.password, existing.password_hash))) {
    return existing;
  }
  return unwrap(
    await supabase
      .from("users")
      .upsert(
        {
          email: admin.email,
          first_name: existing?.first_name ?? "Store",
          last_name: existing?.last_name ?? "Admin",
          is_admin: true,
          password_hash: await hashPassword(admin.password),
          // ADMIN_PASSWORD changed: sign out every existing admin session.
          session_version: existing ? existing.session_version + 1 : 0,
        },
        { onConflict: "email" }
      )
      .select()
      .single()
  );
}

// ---------- reset tokens ----------

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

// ---------- sessions (HMAC-signed cookie) ----------

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters");
  }
  return secret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function serializeCookie(value: string, maxAge: number) {
  const parts = [
    `${SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function toSessionUser(user: Row<"users">): SessionUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    // Only the ADMIN_EMAIL account is an admin, whatever the database says.
    isAdmin: user.is_admin && isAdminEmail(user.email),
  };
}

interface SessionPayload {
  uid: number;
  exp: number;
  /** users.session_version when the cookie was issued; bumping it signs out every device. */
  v?: number;
  /** Admin sessions only: fingerprint of ADMIN_PASSWORD, so changing it in .env signs the admin out. */
  ak?: string;
}

const adminKey = () => sign(`admin:${adminCredentials()?.password ?? ""}`).slice(0, 16);

export function setSessionCookie(res: NextApiResponse, user: Pick<Row<"users">, "id" | "email" | "session_version">) {
  const session: SessionPayload = {
    uid: user.id,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
    v: user.session_version,
    ...(isAdminEmail(user.email) && { ak: adminKey() }),
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  res.setHeader("Set-Cookie", serializeCookie(`${payload}.${sign(payload)}`, SESSION_MAX_AGE));
}

export function clearSessionCookie(res: NextApiResponse) {
  res.setHeader("Set-Cookie", serializeCookie("", 0));
}

/**
 * Signs the user out on every device by bumping their session version, then
 * re-issues this device's cookie so the current session keeps working.
 */
export async function revokeOtherSessions(res: NextApiResponse, user: Pick<Row<"users">, "id" | "email" | "session_version">) {
  const updated = unwrap(
    await supabase
      .from("users")
      .update({ session_version: user.session_version + 1 })
      .eq("id", user.id)
      .select("id, email, session_version")
      .single()
  );
  setSessionCookie(res, updated);
}

function readSession(req: NextApiRequest): SessionPayload | null {
  const raw = req.cookies[SESSION_COOKIE];
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionPayload;
    if (typeof session.uid !== "number" || typeof session.exp !== "number" || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

/** The signed-in user's database row, or null if the session is missing, expired or revoked. */
export async function getSessionRow(req: NextApiRequest): Promise<Row<"users"> | null> {
  const session = readSession(req);
  if (!session) return null;
  const user = unwrap(await supabase.from("users").select("*").eq("id", session.uid).maybeSingle());
  if (!user || (session.v ?? 0) !== user.session_version) return null;
  if (isAdminEmail(user.email) && session.ak !== adminKey()) return null;
  return user;
}

export async function getSessionUser(req: NextApiRequest): Promise<SessionUser | null> {
  const user = await getSessionRow(req);
  return user ? toSessionUser(user) : null;
}

/** Returns the signed-in user, or sends 401 and returns null. */
export async function requireUser(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ success: false, message: "Please sign in." });
    return null;
  }
  return user;
}

/** Returns the signed-in admin, or sends 401/403 and returns null. */
export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (!user.isAdmin) {
    res.status(403).json({ success: false, message: "Admin access required." });
    return null;
  }
  return user;
}
