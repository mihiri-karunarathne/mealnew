"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  UserPen,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Staff, StaffRole, CreateStaffInput } from "@/types/user";

// ── constants ─────────────────────────────────────────────────────────────────

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "office_clerk", label: "Office Clerk" },
  { value: "kitchen_clerk", label: "Kitchen Clerk" },
];

// ── types ─────────────────────────────────────────────────────────────────────

interface Ward {
  ward_number: string;
  ward_name: string;
}

// ── field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  hint,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-[#3E4948]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg bg-[#F0F3FF] px-4 py-3.5 text-base text-slate-800 outline outline-1 outline-[rgba(189,201,200,0.30)] placeholder:text-[rgba(110,121,120,0.50)] focus:outline-teal-400 focus:bg-white transition-colors";

const readonlyCls =
  "w-full rounded-lg bg-[#E7EEFF] px-4 py-3 text-sm font-mono text-[#001B3C] outline outline-1 outline-[rgba(189,201,200,0.20)] cursor-not-allowed select-none";

// ── page ─────────────────────────────────────────────────────────────────────

export default function EditStaffPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // form state
  const [form, setForm] = useState<Partial<CreateStaffInput>>({});

  // ── fetch staff + wards ──────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const [staffRes, wardsRes] = await Promise.all([
          fetch(`/api/staff/${id}`),
          fetch("/api/wards"),
        ]);
        if (!staffRes.ok) throw new Error("Staff member not found.");
        const staffData: Staff = await staffRes.json();
        const wardsData: Ward[] = wardsRes.ok ? await wardsRes.json() : [];

        setStaff(staffData);
        setWards(wardsData);
        setForm({
          name: staffData.name,
          nic: staffData.nic,
          role: staffData.role,
          ward: staffData.ward_number ?? "",
          address: staffData.address ?? "",
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unexpected error.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setSaved(false);
    setSaveError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!staff) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/staff/${staff.staff_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? "Failed to save changes.");
      }
      setSaved(true);
      // brief flash then navigate back
      setTimeout(() => router.push(`/admin/users/${staff.staff_id}`), 1200);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  // ── states ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9FF]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9FF]">
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold text-slate-700">
            {error ?? "Staff member not found."}
          </p>
          <button
            onClick={() => router.back()}
            className="rounded-xl bg-teal-700 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── top nav bar ── */}
      <header className="fixed left-60 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-8 backdrop-blur-md">
        <div className="text-lg font-semibold text-slate-900">
          DigitalEase Health
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-[#001B3C]">Admin User</p>
            <p className="text-[10px] font-medium text-slate-500">
              Administrator
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-[#F3FFFE]">
            AD
          </div>
        </div>
      </header>

      {/* ── main ── */}
      <main className="min-h-screen bg-[#F9F9FF] pb-24 pl-60 pt-20">
        {/* decorative blob */}
        <div
          className="pointer-events-none absolute right-12 top-[45%] h-64 w-64 rounded-sm bg-[#006766] opacity-[0.07]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-2xl px-10 pt-12">
          {/* ── page heading ── */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F3FF] text-teal-700 transition hover:bg-teal-50"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#001B3C]">
                Edit Staff Member
              </h1>
              <p className="text-sm text-[#3E4948]">
                Update the profile details for{" "}
                <span className="font-medium">{staff.name}</span>.
              </p>
            </div>
          </div>

          {/* ── form card ── */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl bg-white px-10 py-10 shadow-[0_10px_30px_-10px_rgba(26,54,93,0.08)]"
          >
            <div className="flex flex-col gap-5">
              {/* Full Name */}
              <Field label="Full Name" htmlFor="name">
                <input
                  id="name"
                  name="name"
                  value={form.name ?? ""}
                  onChange={handleChange}
                  placeholder="Dr. Jane Smith"
                  required
                  className={inputCls}
                />
              </Field>

              {/* NIC */}
              <Field label="NIC Number" htmlFor="nic">
                <input
                  id="nic"
                  name="nic"
                  value={form.nic ?? ""}
                  onChange={handleChange}
                  placeholder="199012345678"
                  required
                  className={inputCls}
                />
              </Field>

              {/* Role */}
              <Field label="Role" htmlFor="role">
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={form.role ?? ""}
                    onChange={handleChange}
                    aria-label="Role"
                    title="Role"
                    required
                    className={`${inputCls} appearance-none pr-10`}
                  >
                    <option value="" disabled>
                      Select staff role
                    </option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              {/* Ward */}
              <Field label="Ward / Unit" htmlFor="ward">
                <div className="relative">
                  <select
                    id="ward"
                    name="ward"
                    value={form.ward ?? ""}
                    onChange={handleChange}
                    aria-label="Ward / Unit"
                    title="Ward / Unit"
                    required
                    className={`${inputCls} appearance-none pr-10`}
                  >
                    <option value="" disabled>
                      Assign a ward
                    </option>
                    {wards.length > 0 ? (
                      wards.map((w) => (
                        <option key={w.ward_number} value={w.ward_number}>
                          {w.ward_name} — Ward {w.ward_number}
                        </option>
                      ))
                    ) : (
                      /* fallback if /api/wards not yet available */
                      <>
                        <option value="01">General — Ward 01</option>
                        <option value="02">Surgical — Ward 02</option>
                        <option value="03">Paediatrics — Ward 03</option>
                        <option value="04">Cardiology — Ward 04</option>
                        <option value="05">ICU — Ward 05</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              {/* Address */}
              <Field label="Address" htmlFor="address">
                <textarea
                  id="address"
                  name="address"
                  value={form.address ?? ""}
                  onChange={handleChange}
                  placeholder="Residential address"
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {/* Read-only meta row */}
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Staff ID"
                  hint="Auto-assigned, not editable"
                >
                  <div className={readonlyCls}>{staff.staff_id}</div>
                </Field>
                <Field
                  label="Password"
                  hint="Managed separately"
                >
                  <div className={`${readonlyCls} font-sans italic text-[rgba(62,73,72,0.60)]`}>
                    Generated on submit
                  </div>
                </Field>
              </div>

              {/* divider */}
              <div className="my-1 h-px bg-[rgba(189,201,200,0.15)]" />

              {/* error */}
              {saveError && (
                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 ring-1 ring-red-100">
                  {saveError}
                </p>
              )}

              {/* actions */}
              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-teal-700 outline-1 outline-[rgba(189,201,200,0.30)] transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || saved}
                  className={`flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-70 ${
                    saved
                      ? "bg-emerald-500"
                      : "bg-[#006766] hover:bg-teal-800"
                  }`}
                >
                  {saved ? (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Changes Saved
                    </>
                  ) : saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* ── footer ── */}
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A2EDED]">
                <UserPen className="h-4 w-4 text-[#13696A]" />
              </div>
              <span className="text-xs text-[#3E4948]">
                System security protocols enabled
              </span>
            </div>
            <span className="text-xs text-[#6E7978]">
              v2.4.1 Healthcare Enterprise Edition
            </span>
          </div>
        </div>
      </main>
    </>
  );
}
