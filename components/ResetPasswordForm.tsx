import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import AuthCard, { AuthButton, AuthInput, AuthMessage } from "@/components/AuthCard";
import { api } from "@/lib/fetcher";

export default function ResetPasswordForm() {
  const router = useRouter();
  const token = typeof router.query.token === "string" ? router.query.token : "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return setMessage("Invalid or missing token.");
    if (!password || !confirmPassword) return setMessage("Please fill in all fields.");
    if (password.length < 8) return setMessage("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setMessage("Passwords do not match.");

    setLoading(true);
    setMessage("");
    const data = await api("/api/auth/reset-password", { body: { token, password } });
    setLoading(false);

    if (data.success) {
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/auth?form=login"), 3000);
    } else {
      setMessage(data.message || "Failed to reset password.");
    }
  };

  return (
    <AuthCard title="Reset Password">
      <form className="flex flex-col gap-[15px]" onSubmit={handleSubmit}>
        <AuthInput type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <AuthInput
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <AuthButton type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </AuthButton>
      </form>

      {(message || (router.isReady && !token)) && <AuthMessage>{message || "Invalid or missing token."}</AuthMessage>}

      <p className="mt-[15px] cursor-pointer text-center text-sm text-muted underline" onClick={() => router.push("/auth")}>
        Back to login
      </p>
    </AuthCard>
  );
}
