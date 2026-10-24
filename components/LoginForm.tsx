import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/router";
import AuthCard, { AuthButton, AuthInput, AuthLink, AuthMessage } from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/fetcher";
import type { SessionUser } from "@/types";

export default function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const data = await api<{ user: SessionUser }>("/api/auth/login", { body: formData });
    setLoading(false);

    if (data.success) login(data.user);
    else setMessage(data.message || "Invalid email or password.");
  };

  return (
    <AuthCard title="Sign In">
      <form className="flex flex-col gap-[15px]" onSubmit={handleSubmit}>
        <AuthInput name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <AuthInput
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <AuthButton type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </AuthButton>
      </form>

      {message && <AuthMessage>{message}</AuthMessage>}

      <p className="mt-[15px] text-center text-sm text-muted">
        Don&apos;t have an account yet? <AuthLink onClick={onSwitchToRegister}>Sign up</AuthLink>
        <br />
        <span className="mt-1 inline-block text-xs">
          <AuthLink onClick={() => router.push("/forgotpassword")}>Forgot your password?</AuthLink>
        </span>
        <br />
        <span className="mt-1 inline-block text-xs">
          <AuthLink onClick={() => router.push("/adminlogin")}>Login as Admin</AuthLink>
        </span>
      </p>
    </AuthCard>
  );
}
