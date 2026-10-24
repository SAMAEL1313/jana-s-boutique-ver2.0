import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthCard, { AuthButton, AuthInput, AuthMessage } from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/fetcher";
import type { SessionUser } from "@/types";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setMessage("Please enter both email and password.");

    setLoading(true);
    setMessage("");
    const data = await api<{ user: SessionUser }>("/api/auth/login", { body: { email, password, admin: true } });
    setLoading(false);

    if (data.success) {
      setMessage("Login successful! Redirecting to admin dashboard...");
      login(data.user);
    } else {
      setMessage(data.message || "Login failed");
    }
  };

  return (
    <AuthCard title="Admin Login">
      <form onSubmit={handleSubmit} className="flex flex-col gap-[15px]">
        <AuthInput type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthInput type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <AuthButton type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </AuthButton>
      </form>

      {message && <AuthMessage>{message}</AuthMessage>}

      <div className="mt-[15px] space-y-2.5 text-center">
        <p>
          <Link href="/adminforgotpassword" className="text-accent underline-offset-4 hover:underline">
            Forgot Password?
          </Link>
        </p>
        <p>
          <Link href="/auth?form=login" className="text-accent underline-offset-4 hover:underline">
            Back to User Login
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
