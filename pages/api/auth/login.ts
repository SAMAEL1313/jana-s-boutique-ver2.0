import { apiHandler, str } from "@/lib/api";
import { setSessionCookie, toSessionUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default apiHandler({
  async POST(req, res) {
    const email = str(req.body?.email).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const adminOnly = req.body?.admin === true;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter both email and password." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    if (adminOnly && !user.isAdmin) {
      return res.status(403).json({ success: false, message: "This account is not an admin." });
    }

    setSessionCookie(res, user.id);
    return res.status(200).json({ success: true, user: toSessionUser(user) });
  },
});
