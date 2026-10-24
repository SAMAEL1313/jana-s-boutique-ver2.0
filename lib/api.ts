import type { NextApiRequest, NextApiResponse } from "next";

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<unknown> | unknown;

/**
 * Wraps an API route: rejects unsupported methods and turns thrown errors
 * into a JSON 500 instead of an HTML error page.
 */
export function apiHandler(handlers: Partial<Record<string, Handler>>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const handler = handlers[req.method ?? ""];
    if (!handler) {
      res.setHeader("Allow", Object.keys(handlers));
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`API error ${req.method} ${req.url}:`, error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
      }
    }
  };
}

export function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function appUrl(req: NextApiRequest) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string) || "http";
  return `${proto}://${req.headers.host}`;
}
