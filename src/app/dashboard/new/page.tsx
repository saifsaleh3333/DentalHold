"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormData {
  patientName: string;
  dob: string;
  patientAddress: string;
  memberId: string;
  groupNumber: string;
  patientSSN: string;
  insuranceCarrier: string;
  phoneNumber: string;
  subscriberName: string;
  subscriberDob: string;
  procedureCodes: string;
}

const emptyForm: FormData = {
  patientName: "",
  dob: "",
  patientAddress: "",
  memberId: "",
  groupNumber: "",
  patientSSN: "",
  insuranceCarrier: "",
  phoneNumber: "",
  subscriberName: "",
  subscriberDob: "",
  procedureCodes: "",
};

export default function NewVerification() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.patientName || !form.dob || !form.memberId || !form.insuranceCarrier || !form.phoneNumber) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/verifications/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: form.patientName,
          patientDOB: form.dob,
          patientAddress: form.patientAddress || undefined,
          memberId: form.memberId,
          groupNumber: form.groupNumber || undefined,
          insuranceCarrier: form.insuranceCarrier,
          phoneNumber: form.phoneNumber,
          patientSSN: form.patientSSN || undefined,
          subscriberName: form.subscriberName || undefined,
          subscriberDOB: form.subscriberDob || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start verification");
      }

      const { verificationId } = await res.json();
      router.push(`/dashboard/results/${verificationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/history"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New Verification Request</h1>
        <p className="text-slate-600 mt-1">Enter patient and insurance information to start a verification</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="patientName" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Patient Name *
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={form.patientName}
                  onChange={(e) => handleChange("patientName", e.target.value)}
                  placeholder="e.g., John Smith"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dob"
                  value={form.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="patientAddress" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Patient Address
                </label>
                <input
                  type="text"
                  id="patientAddress"
                  value={form.patientAddress}
                  onChange={(e) => handleChange("patientAddress", e.target.value)}
                  placeholder="e.g., 123 Main St, City, NC 27545"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
                <p className="mt-1.5 text-sm text-slate-500">
                  Some insurers require address to verify the member
                </p>
              </div>
              <div className="col-span-2">
                <label htmlFor="memberId" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Member ID / Insured Member Number *
                </label>
                <input
                  type="text"
                  id="memberId"
                  value={form.memberId}
                  onChange={(e) => handleChange("memberId", e.target.value)}
                  placeholder="e.g., CSZY0016149039"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
                <p className="mt-1.5 text-sm text-slate-500">
                  The individual member ID from the insurance card — not the Group ID/Number
                </p>
              </div>
              <div>
                <label htmlFor="groupNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Group Number
                </label>
                <input
                  type="text"
                  id="groupNumber"
                  value={form.groupNumber}
                  onChange={(e) => handleChange("groupNumber", e.target.value)}
                  placeholder="e.g., G000CSZY"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="patientSSN" className="block text-sm font-medium text-slate-700 mb-1.5">
                  SSN (optional)
                </label>
                <input
                  type="password"
                  id="patientSSN"
                  value={form.patientSSN}
                  onChange={(e) => handleChange("patientSSN", e.target.value)}
                  placeholder="###-##-####"
                  autoComplete="off"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
                <p className="mt-1.5 text-sm text-slate-500">
                  Backup if member ID lookup fails
                </p>
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="pt-6 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Insurance Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="carrier" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Insurance Carrier *
                </label>
                <input
                  type="text"
                  id="carrier"
                  value={form.insuranceCarrier}
                  onChange={(e) => handleChange("insuranceCarrier", e.target.value)}
                  placeholder="e.g., Delta Dental, Cigna, MetLife"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Insurance Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={form.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="e.g., (800) 555-1234"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
                <p className="mt-1.5 text-sm text-slate-500">
                  The phone number Dani will call to verify benefits
                </p>
              </div>
            </div>
          </div>

          {/* Subscriber Information (if different) */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Subscriber Information</h2>
              <span className="text-sm text-slate-500">If different from patient</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="subscriberName" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Subscriber Name
                </label>
                <input
                  type="text"
                  id="subscriberName"
                  value={form.subscriberName}
                  onChange={(e) => handleChange("subscriberName", e.target.value)}
                  placeholder="Leave blank if same as patient"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="subscriberDob" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Subscriber DOB
                </label>
                <input
                  type="date"
                  id="subscriberDob"
                  value={form.subscriberDob}
                  onChange={(e) => handleChange("subscriberDob", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-200">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {!submitting && (
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-4">
                <p className="text-sky-800 text-sm text-center">
                  Dani will call the insurance company and verify benefits automatically
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors ${
                submitting
                  ? "bg-slate-400 text-white cursor-not-allowed"
                  : "bg-sky-500 text-white hover:bg-sky-600"
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting Call...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Start Verification
                </>
              )}
            </button>
            {!submitting && (
              <p className="mt-3 text-sm text-slate-500 text-center">
                Our AI will call the insurance company and gather all verification details
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
