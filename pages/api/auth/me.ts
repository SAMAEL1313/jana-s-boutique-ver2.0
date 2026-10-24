import { apiHandler } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export default apiHandler({
  async GET(req, res) {
    const user = await getSessionUser(req);
    return res.status(200).json({ success: true, user });
  },
});
