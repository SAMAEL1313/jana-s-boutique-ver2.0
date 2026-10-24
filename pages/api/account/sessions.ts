import { requireCustomerRow } from "@/lib/account";
import { apiHandler } from "@/lib/api";
import { revokeOtherSessions } from "@/lib/auth";

export default apiHandler({
  /** Signs the user out on every other device. */
  async DELETE(req, res) {
    const user = await requireCustomerRow(req, res);
    if (!user) return;
    await revokeOtherSessions(res, user);
    return res.status(200).json({ success: true });
  },
});
