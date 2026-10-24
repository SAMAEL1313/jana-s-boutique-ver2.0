import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoginForm from "@/components/LoginForm";
import RegistrationForm from "@/components/RegistrationForm";

export default function AuthPage() {
  const router = useRouter();
  const [currentForm, setCurrentForm] = useState<"login" | "register">("register");

  useEffect(() => {
    if (router.query.form === "login") setCurrentForm("login");
  }, [router.query.form]);

  return currentForm === "login" ? (
    <LoginForm onSwitchToRegister={() => setCurrentForm("register")} />
  ) : (
    <RegistrationForm onSwitchToLogin={() => setCurrentForm("login")} />
  );
}
