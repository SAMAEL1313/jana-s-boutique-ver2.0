import type { NextApiRequest, NextApiResponse } from "next";
import { supabase, unwrap } from "@/lib/supabase";

const MINUTE = 60;
const HOUR = 60 * MINUTE;

export interface Limit {
  key: string;
  limit: number;
  windowSeconds: number;
}

/** Limits per action. Each attempt counts against every key listed for it. */
export const limits = {
  // Per account: stops password guessing. Cleared on a successful login.
  loginEmail: (email: string): Limit => ({ key: `login:email:${email}`, limit: 5, windowSeconds: 15 * MINUTE }),
  // Per network: stops one source trying many accounts.
  loginIp: (ip: string): Limit => ({ key: `login:ip:${ip}`, limit: 30, windowSeconds: 15 * MINUTE }),
  registerIp: (ip: string): Limit => ({ key: `register:ip:${ip}`, limit: 10, windowSeconds: HOUR }),
  forgotEmail: (email: string): Limit => ({ key: `forgot:email:${email}`, limit: 3, windowSeconds: HOUR }),
  forgotIp: (ip: string): Limit => ({ key: `forgot:ip:${ip}`, limit: 10, windowSeconds: HOUR }),
  // Account changes that need the current password (email change, delete, new password).
  passwordCheck: (userId: number): Limit => ({ key: `password:user:${userId}`, limit: 5, windowSeconds: 15 * MINUTE }),
};

export function clientIp(req: NextApiRequest) {
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp) return realIp;
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  return first || req.socket.remoteAddress || "unknown";
}

/**
 * Records an attempt against each limit. If any is exceeded, sends a 429 and
 * returns false; the caller should stop handling the request.
 */
export async function checkRateLimits(res: NextApiResponse, ...checks: Limit[]) {
  const waits = await Promise.all(
    checks.map(async ({ key, limit, windowSeconds }) =>
      unwrap(await supabase.rpc("hit_rate_limit", { p_key: key, p_limit: limit, p_window_seconds: windowSeconds }))
    )
  );
  const wait = Math.max(0, ...waits);
  if (wait === 0) return true;

  const minutes = Math.ceil(wait / 60);
  res.setHeader("Retry-After", String(wait));
  res.status(429).json({
    success: false,
    message: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
  });
  return false;
}

/** Forgets past attempts for a limit, e.g. after a successful login. */
export async function resetRateLimit({ key }: Limit) {
  unwrap(await supabase.from("rate_limits").delete().eq("key", key));
}
