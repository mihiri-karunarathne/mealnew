"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  ShieldAlert,
  BadgeCheck,
} from "lucide-react";
import { Staff, StaffRole } from "@/types/user";

// ── helpers ──────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<StaffRole, string> = {
  doctor: "Doctor",
  nurse: "Nurse",
  office_clerk: "Office Clerk",
  kitchen_clerk: "Kitchen Clerk",
};

const ROLE_COLORS: Record<
  StaffRole,
  { bg: string; text: string; border: string }
> = {
  doctor: {
    bg: "bg-cyan-100",
    text: "text-cyan-800",
    border: "border-cyan-200",
  },
  nurse: {
    bg: "bg-violet-100",
    text: "text-violet-800",
    border: "border-violet-200",
  },
  office_clerk: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  kitchen_clerk: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── sub-components ────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span
        className={`text-base font-medium text-slate-800 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function DeleteModal({
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <ShieldAlert className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900">
          Delete Staff Member?
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          You are about to permanently remove{" "}
          <span className="font-semibold text-slate-700">{name}</span> and all
          associated records from the DigitalEase Health System. This action
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

 /* useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch(`/api/staff/${id}`);
        if (!res.ok) throw new Error("Staff member not found.");
        const data: Staff = await res.json();
        setStaff(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unexpected error.");
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, [id]);*/

useEffect(() => {
  async function fetchStaff() {
    if (!id) {
      setError("No staff ID provided");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching staff ID:', id);
      const res = await fetch(`/api/staff/${id}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${res.status}: Staff not found`);
      }
      
      const data: Staff = await res.json();
      console.log('✅ Staff loaded:', data.name);
      setStaff(data);
    } catch (err: unknown) {
      console.error('❌ Fetch error:', err);
      setError(err instanceof Error ? err.message : "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  }
  
  fetchStaff();
}, [id]);

  /*async function handleDelete() {
    if (!staff) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/staff/${staff.staff_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete staff member.");
      router.push("/admin/users");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  }*/

async function handleDelete() {
  if (!staff || !id) return;
  
  setDeleteLoading(true);
  try {
    console.log('🗑️ Deleting staff:', id);
    const res = await fetch(`/api/staff/${id}`, { 
      method: "DELETE" 
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to delete staff");
    }
    
    console.log('✅ Staff deleted successfully');
    router.push("/admin/users");
  } catch (err: unknown) {
    console.error('❌ Delete error:', err);
    alert(err instanceof Error ? err.message : "Delete failed");
  } finally {
    setDeleteLoading(false);
    setShowDeleteModal(false);
  }
}

  // ── states ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9FF]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">
            Loading staff details…
          </p>
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

  const roleStyle = ROLE_COLORS[staff.role];

  return (
    <>
      {/* ── top nav bar ── */}
      <header className="fixed left-60 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-8 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-base font-semibold leading-tight text-slate-900">
              Staff Details
            </p>
            <p className="text-xs font-medium text-slate-400">
              ID: {staff.staff_id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push(`/admin/users/${id}/edit`)}
            className="flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Details
          </button>

          <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">Admin User</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                Administrator
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-slate-800">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* ── main content ── */}
      <main className="min-h-screen bg-[#F9F9FF] pb-24 pl-60 pt-20">
        <div className="mx-auto max-w-2xl space-y-4 px-8 pt-8">

          {/* ── profile card ── */}
          <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              {/* avatar */}
              <div className="relative shrink-0">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-teal-700 to-teal-500 shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {initials(staff.name)}
                  </span>
                </div>
                {/* online dot */}
                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white bg-green-500" />
              </div>

              {/* name / role */}
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {staff.name}
                </h1>
                {staff.ward_name && (
                  <p className="text-sm font-medium text-slate-500">
                    {staff.ward_name}
                  </p>
                )}
                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                >
                  <BadgeCheck className="h-3 w-3" />
                  {ROLE_LABELS[staff.role]}
                </span>
              </div>
            </div>

            {/* contact row */}
            <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-6">
              {staff.admin_id && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4 text-teal-700" />
                  <span>{staff.admin_id}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone className="h-4 w-4 text-teal-700" />
                <span>—</span>
              </div>
            </div>
          </section>

          {/* ── professional profile ── */}
          <section className="rounded-3xl bg-[#F0F3FF] p-8">
            <p className="mb-6 text-[11px] font-bold uppercase tracking-[2px] text-teal-600">
              Professional Profile
            </p>
            <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2">
              <InfoRow label="Staff ID" value={staff.staff_id} mono />
              <InfoRow label="NIC Number" value={staff.nic} mono />
              <InfoRow
                label="Designation"
                value={ROLE_LABELS[staff.role]}
              />
              {staff.ward_name && (
                <InfoRow
                  label="Assigned Ward"
                  value={`${staff.ward_name}${staff.ward_number ? ` — Ward ${staff.ward_number}` : ""}`}
                />
              )}
            </div>

            {/* system metadata */}
            <div className="mt-8 border-t border-slate-200/40 pt-8">
              <p className="mb-6 text-[11px] font-bold uppercase tracking-[2px] text-teal-600">
                System Metadata
              </p>
              <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2">
                {staff.address && (
                  <div className="flex flex-col gap-0.5 sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Home Address
                    </span>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                      <span className="text-sm text-slate-700">
                        {staff.address}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Registered On
                  </span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-700" />
                    <span className="text-sm font-medium text-slate-800">
                      {formatDate(staff.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── danger zone ── */}
          <section className="flex items-center justify-between rounded-3xl bg-red-50/60 p-8 ring-1 ring-red-100">
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-base font-bold text-red-800">Danger Zone</p>
                <p className="max-w-xs text-sm text-red-700/70">
                  Permanently remove this staff member and all associated
                  records from DigitalEase Health System.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
              Delete Staff Member
            </button>
          </section>

          {/* ── footer watermark ── */}
          <p className="pt-4 text-center text-[10px] font-bold uppercase tracking-[3px] text-slate-300">
            Authorized Access Only • DigitalEase Healthcare Audit Log Active
          </p>
        </div>
      </main>

      {/* ── delete confirmation modal ── */}
      {showDeleteModal && (
        <DeleteModal
          name={staff.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleteLoading}
        />
      )}
    </>
  );
}
