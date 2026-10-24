import { useState, type ChangeEvent, type FormEvent } from "react";
import AuthCard, { AuthButton, AuthInput, AuthLink, AuthMessage } from "@/components/AuthCard";
import { api } from "@/lib/fetcher";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  /** Called after a successful registration or when the user asks to log in. */
  onSwitchToLogin: () => void;
}

export default function RegistrationForm({ onSwitchToLogin }: Props) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!EMAIL_PATTERN.test(formData.email)) return setMessage("Please enter a valid email address!");
    if (formData.password.length < 8) return setMessage("Password must be at least 8 characters.");
    if (formData.password !== formData.confirmPassword) return setMessage("Passwords do not match!");

    setLoading(true);
    setMessage("");
    const { confirmPassword: _, ...body } = formData;
    const data = await api("/api/auth/register", { body });
    setLoading(false);

    if (data.success) {
      alert("Registration successful! Please sign in.");
      onSwitchToLogin();
    } else {
      setMessage(data.message || "Registration failed.");
    }
  };

  return (
    <AuthCard title="Create an Account">
      <form className="flex flex-col gap-[15px]" onSubmit={handleSubmit}>
        <AuthInput name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
        <AuthInput name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
        <AuthInput name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <AuthInput
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <AuthInput
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <AuthButton type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </AuthButton>
      </form>

      {message && <AuthMessage>{message}</AuthMessage>}

      <p className="mt-[15px] text-center text-sm text-muted">
        Already have an account? <AuthLink onClick={onSwitchToLogin}>Login here</AuthLink>
      </p>
    </AuthCard>
  );
}
