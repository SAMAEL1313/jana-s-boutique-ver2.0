import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function ThankYou() {
  const router = useRouter();

  // Redirect to home after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => router.push("/"), 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-ink">
      <div className="card max-w-xl px-10 py-14 text-center">
        <p className="eyebrow">Order Confirmed</p>
        <h1 className="mt-4 font-display text-5xl font-medium italic">Thank you</h1>
        <div className="mx-auto my-6 h-px w-16 bg-gold" />
        <p className="text-lg">Your payment was successful and your order is confirmed.</p>
        <p className="mt-2 text-lg text-muted">
          Please check your email for the detailed receipt with your order ID, items, and total amount.
        </p>
        <Link href="/" className="btn-outline mt-8">
          Back to the shop
        </Link>
        <p className="mt-4 text-sm text-muted italic">Redirecting to home...</p>
      </div>
    </div>
  );
}
