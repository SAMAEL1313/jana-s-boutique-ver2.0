import type { ApiResult } from "@/types";

/** Client-side JSON helper for this app's API routes. Never throws. */
export async function api<T = object>(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Promise<ApiResult<T>> {
  const hasBody = options.body !== undefined;
  try {
    const res = await fetch(url, {
      method: options.method ?? (hasBody ? "POST" : "GET"),
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      credentials: "same-origin",
    });
    return (await res.json()) as ApiResult<T>;
  } catch (err) {
    return {
      success: false,
      message: "Error connecting to server: " + (err instanceof Error ? err.message : String(err)),
    };
  }
}
