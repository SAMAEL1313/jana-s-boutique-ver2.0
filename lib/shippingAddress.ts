import { str } from "@/lib/api";
import type { ShippingAddress } from "@/types";
import type { Json } from "@/types/supabase";

const MAX_FIELD_LENGTH = 200;

/** Validates a shipping address from a request body. Returns an error message on failure. */
export function parseShippingAddress(body: unknown): ShippingAddress | string {
  const b = (body ?? {}) as Record<string, unknown>;
  const address: ShippingAddress = {
    firstName: str(b.firstName),
    lastName: str(b.lastName),
    address: str(b.address),
    city: str(b.city),
    province: str(b.province),
    zip: str(b.zip),
    phone: str(b.phone),
    country: str(b.country) || "Philippines",
  };
  if (Object.values(address).some((v) => !v)) return "Please fill in all required fields!";
  if (Object.values(address).some((v) => v.length > MAX_FIELD_LENGTH)) return "One of the address fields is too long.";
  return address;
}

/** Reads a stored `users.shipping_address` value; null if missing or malformed. */
export function toShippingAddress(value: Json | null): ShippingAddress | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const parsed = parseShippingAddress(value);
  return typeof parsed === "string" ? null : parsed;
}
