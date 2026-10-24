import { useEffect, useState, type ChangeEvent, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/fetcher";
import type { SessionUser, ShippingAddress } from "@/types";

type Status = { ok: boolean; text: string } | null;

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="card p-6 md:p-8">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-1 mb-6 text-sm text-muted">{description}</p>
      {children}
    </section>
  );
}

function Field({ label, ...props }: { label: string } & ComponentProps<"input">) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-muted">{label}</span>
      <input {...props} className="input-field" />
    </label>
  );
}

function StatusText({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <p role="status" className={`text-sm ${status.ok ? "text-forest" : "text-accent"}`}>
      {status.text}
    </p>
  );
}

function ProfileForm({ user }: { user: SessionUser }) {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, email: user.email });
  const [currentPassword, setCurrentPassword] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);

  const emailChanged = form.email.trim().toLowerCase() !== user.email;
  const unchanged =
    form.firstName.trim() === user.firstName && form.lastName.trim() === user.lastName && !emailChanged;

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setStatus(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (emailChanged && !currentPassword) {
      return setStatus({ ok: false, text: "Enter your current password to change your email." });
    }
    setSaving(true);
    const data = await api<{ user: SessionUser }>("/api/account", {
      method: "PATCH",
      body: { ...form, currentPassword },
    });
    setSaving(false);
    if (!data.success) return setStatus({ ok: false, text: data.message });

    updateUser(data.user);
    setForm({ firstName: data.user.firstName, lastName: data.user.lastName, email: data.user.email });
    setCurrentPassword("");
    setStatus({ ok: true, text: "Your details have been saved." });
  };

  return (
    <Section title="Personal details" description="Your name and the email you sign in with. Receipts are sent here.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" required />
          <Field label="Last name" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" required />
        </div>
        <Field label="Email" type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
        {emailChanged && (
          <Field
            label="Current password (required to change your email)"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        )}
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="btn" disabled={saving || unchanged}>
            {saving ? "Saving..." : "Save changes"}
          </button>
          <StatusText status={status} />
        </div>
      </form>
    </Section>
  );
}

function PasswordForm() {
  const empty = { currentPassword: "", newPassword: "", confirmPassword: "" };
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setStatus(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.newPassword.length < 8) return setStatus({ ok: false, text: "New password must be at least 8 characters." });
    if (form.newPassword !== form.confirmPassword) return setStatus({ ok: false, text: "New passwords do not match." });

    setSaving(true);
    const data = await api("/api/account/password", {
      body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
    });
    setSaving(false);
    if (!data.success) return setStatus({ ok: false, text: data.message });

    setForm(empty);
    setStatus({ ok: true, text: "Your password has been changed and other devices were signed out." });
  };

  return (
    <Section title="Password" description="Use at least 8 characters. A longer passphrase is safer.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Current password"
          type="password"
          value={form.currentPassword}
          onChange={set("currentPassword")}
          autoComplete="current-password"
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="New password"
            type="password"
            value={form.newPassword}
            onChange={set("newPassword")}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Field
            label="Confirm new password"
            type="password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Updating..." : "Update password"}
          </button>
          <StatusText status={status} />
        </div>
      </form>
    </Section>
  );
}

const emptyAddress: ShippingAddress = {
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  province: "",
  zip: "",
  phone: "",
  country: "Philippines",
};

function AddressForm() {
  const [form, setForm] = useState<ShippingAddress>(emptyAddress);
  const [hasSaved, setHasSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ shippingAddress: ShippingAddress | null }>("/api/account").then((data) => {
      if (data.success && data.shippingAddress) {
        setForm(data.shippingAddress);
        setHasSaved(true);
      }
      setLoading(false);
    });
  }, []);

  const set = (key: keyof ShippingAddress) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setStatus(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = await api<{ shippingAddress: ShippingAddress }>("/api/account/address", { method: "PUT", body: form });
    setSaving(false);
    if (!data.success) return setStatus({ ok: false, text: data.message });
    setForm(data.shippingAddress);
    setHasSaved(true);
    setStatus({ ok: true, text: "Address saved. It will be filled in at checkout." });
  };

  const handleRemove = async () => {
    setSaving(true);
    const data = await api("/api/account/address", { method: "DELETE" });
    setSaving(false);
    if (!data.success) return setStatus({ ok: false, text: data.message });
    setForm(emptyAddress);
    setHasSaved(false);
    setStatus({ ok: true, text: "Saved address removed." });
  };

  return (
    <Section title="Shipping address" description="Saved to your account and filled in for you at checkout, on any device.">
      {loading ? (
        <p className="text-sm text-muted italic">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" value={form.firstName} onChange={set("firstName")} autoComplete="shipping given-name" required />
            <Field label="Last name" value={form.lastName} onChange={set("lastName")} autoComplete="shipping family-name" required />
          </div>
          <Field label="Address" value={form.address} onChange={set("address")} autoComplete="shipping street-address" required />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City" value={form.city} onChange={set("city")} autoComplete="shipping address-level2" required />
            <Field label="Province" value={form.province} onChange={set("province")} autoComplete="shipping address-level1" required />
            <Field label="ZIP / Postal" value={form.zip} onChange={set("zip")} autoComplete="shipping postal-code" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="shipping tel" required />
            <Field label="Country" value={form.country} readOnly />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving..." : hasSaved ? "Update address" : "Save address"}
            </button>
            {hasSaved && (
              <button type="button" className="btn-outline" onClick={handleRemove} disabled={saving}>
                Remove
              </button>
            )}
            <StatusText status={status} />
          </div>
        </form>
      )}
    </Section>
  );
}

function SignOutEverywhere() {
  const [status, setStatus] = useState<Status>(null);
  const [working, setWorking] = useState(false);

  const handleClick = async () => {
    setWorking(true);
    const data = await api("/api/account/sessions", { method: "DELETE" });
    setWorking(false);
    setStatus(data.success ? { ok: true, text: "All other devices have been signed out." } : { ok: false, text: data.message });
  };

  return (
    <Section
      title="Signed-in devices"
      description="Lost a phone or used a shared computer? Sign out everywhere except this browser."
    >
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="btn-outline" onClick={handleClick} disabled={working}>
          {working ? "Signing out..." : "Sign out other devices"}
        </button>
        <StatusText status={status} />
      </div>
    </Section>
  );
}

function DeleteAccount() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    const data = await api("/api/account", { method: "DELETE", body: { currentPassword } });
    if (!data.success) {
      setDeleting(false);
      return setStatus({ ok: false, text: data.message });
    }
    await logout("/");
  };

  return (
    <Section
      title="Delete account"
      description="Permanently removes your account. Your past orders stay on record with the shop, but you won't be able to see them anymore."
    >
      {!open ? (
        <button type="button" className="btn-outline hover:border-accent hover:text-accent" onClick={() => setOpen(true)}>
          Delete my account
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Enter your password to confirm"
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setStatus(null);
            }}
            autoComplete="current-password"
            required
          />
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn" disabled={deleting || !currentPassword}>
              {deleting ? "Deleting..." : "Permanently delete"}
            </button>
            <button type="button" className="btn-outline" onClick={() => setOpen(false)} disabled={deleting}>
              Cancel
            </button>
            <StatusText status={status} />
          </div>
        </form>
      )}
    </Section>
  );
}

/** Account settings tab on the profile page. */
export default function AccountSettings({ user }: { user: SessionUser }) {
  return (
    <div className="space-y-6">
      <ProfileForm user={user} />
      <AddressForm />
      <PasswordForm />
      <SignOutEverywhere />
      <DeleteAccount />
    </div>
  );
}
