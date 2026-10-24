import { apiHandler } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

export default apiHandler({
  POST(_req, res) {
    clearSessionCookie(res);
    return res.status(200).json({ success: true });
  },
});
