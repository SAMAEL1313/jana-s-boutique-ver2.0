import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionRow, toSessionUser, verifyPassword } from "@/lib/auth";
import { checkRateLimits, limits } from "@/lib/rateLimit";
import type { Row } from "@/types/supabase";

/** The signed-in customer's full row, or null after sending an error. */
export async function requireCustomerRow(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionRow(req);
  if (!user) {
    res.status(401).json({ success: false, message: "Please sign in." });
    return null;
  }
  if (toSessionUser(user).isAdmin) {
    res.status(403).json({ success: false, message: "The admin account is managed in .env." });
    return null;
  }
  return user;
}

/** Checks the user's current password, rate-limited. Sends an error and returns false if it fails. */
export async function confirmPassword(res: NextApiResponse, user: Row<"users">, password: unknown) {
  if (!(await checkRateLimits(res, limits.passwordCheck(user.id)))) return false;
  if (!(await verifyPassword(typeof password === "string" ? password : "", user.password_hash))) {
    res.status(401).json({ success: false, message: "Your current password is incorrect." });
    return false;
  }
  return true;
}
