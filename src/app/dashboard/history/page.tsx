"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Verification {
  id: string;
  createdAt: string;
  status: string;
  patientName: string;
  patientDOB: string;
  memberId: string;
  insuranceCarrier: string;
  benefits: {
    eligible?: boolean;
  } | null;
}

export default function VerificationHistory() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVerifications() {
      try {
        const res = await fetch("/api/verifications");
        if (res.ok) {
          const data = await res.json();
          setVerifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch verifications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVerifications();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const stats = {
    total: verifications.length,
    inProgress: verifications.filter((v) => v.status === "in_progress").length,
    completed: verifications.filter((v) => v.status === "completed").length,
    timeSaved: `${Math.round(verifications.filter((v) => v.status === "completed").length * 0.5)}h`,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification History</h1>
          <p className="text-slate-600 mt-1">View and manage your insurance verifications</p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Verification
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-500">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.inProgress}</p>
              <p className="text-sm text-slate-500">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
              <p className="text-sm text-slate-500">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.timeSaved}</p>
              <p className="text-sm text-slate-500">Time Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verifications Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Verifications</h2>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-4">Loading verifications...</p>
          </div>
        ) : verifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500">No verifications yet. Start your first one!</p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 mt-4 text-sky-600 hover:text-sky-700 font-medium"
            >
              New Verification
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {verifications.map((verification) => (
              <div
                key={verification.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-slate-600">
                      {verification.patientName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{verification.patientName}</p>
                    <p className="text-sm text-slate-500">{verification.insuranceCarrier || "Unknown Carrier"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <p className="text-sm text-slate-500">{formatDate(verification.createdAt)}</p>

                  {verification.status === "in_progress" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                      In Progress
                    </span>
                  ) : verification.status === "failed" ? (
                    <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                      Failed
                    </span>
                  ) : verification.benefits?.eligible === true ? (
                    <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      Active
                    </span>
                  ) : verification.benefits?.eligible === false ? (
                    <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                      Inactive
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                      Complete
                    </span>
                  )}

                  <Link
                    href={`/dashboard/results/${verification.id}`}
                    className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
