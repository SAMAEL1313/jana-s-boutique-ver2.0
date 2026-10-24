import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import AuthCard, { AuthButton, AuthInput, AuthMessage } from "@/components/AuthCard";
import { api } from "@/lib/fetcher";

interface Props {
  title?: string;
  placeholder?: string;
  backHref?: string;
}

export default function ForgotPasswordForm({
  title = "Forgot Password",
  placeholder = "Enter your registered email",
  backHref = "/auth",
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return setMessage("Please enter your registered email.");

    setLoading(true);
    setMessage("");
    const data = await api<{ message: string }>("/api/auth/forgot-password", { body: { email } });
    setLoading(false);
    setMessage(data.message);
  };

  return (
    <AuthCard title={title}>
      <form className="flex flex-col gap-[15px]" onSubmit={handleSubmit}>
        <AuthInput type="email" placeholder={placeholder} value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthButton type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </AuthButton>
      </form>

      {message && <AuthMessage>{message}</AuthMessage>}

      <p
        className="mt-[15px] cursor-pointer text-center text-sm text-muted underline"
        onClick={() => router.push(backHref)}
      >
        Back to login
      </p>
    </AuthCard>
  );
}
