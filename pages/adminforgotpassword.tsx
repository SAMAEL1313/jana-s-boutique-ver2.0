import Link from "next/link";
import AuthCard from "@/components/AuthCard";

export default function AdminForgotPassword() {
  return (
    <AuthCard title="Admin Password">
      <p className="text-center leading-relaxed">
        The admin login is set by <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> in the
        site&apos;s <code>.env</code> file. To change it, edit those values and restart the server.
      </p>
      <p className="mt-6 text-center">
        <Link href="/adminlogin" className="text-accent underline-offset-4 hover:underline">
          Back to Admin Login
        </Link>
      </p>
    </AuthCard>
  );
}
