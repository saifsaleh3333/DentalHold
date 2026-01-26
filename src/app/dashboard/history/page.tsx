import Link from "next/link";

export default function VerificationHistory() {
  const verifications = [
    {
      id: 1,
      patientName: "Sarah Johnson",
      carrier: "Delta Dental",
      status: "completed",
      submittedAt: "Today, 9:15 AM",
      eligibility: "Active",
    },
    {
      id: 2,
      patientName: "Michael Chen",
      carrier: "Cigna",
      status: "in_progress",
      submittedAt: "Today, 9:02 AM",
      eligibility: null,
    },
    {
      id: 3,
      patientName: "Emily Rodriguez",
      carrier: "MetLife",
      status: "completed",
      submittedAt: "Today, 8:45 AM",
      eligibility: "Active",
    },
    {
      id: 4,
      patientName: "James Wilson",
      carrier: "Aetna",
      status: "completed",
      submittedAt: "Yesterday, 4:30 PM",
      eligibility: "Inactive",
    },
    {
      id: 5,
      patientName: "Lisa Thompson",
      carrier: "United Healthcare",
      status: "completed",
      submittedAt: "Yesterday, 2:15 PM",
      eligibility: "Active",
    },
  ];

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
              <p className="text-2xl font-bold text-slate-900">24</p>
              <p className="text-sm text-slate-500">Total Today</p>
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
              <p className="text-2xl font-bold text-slate-900">3</p>
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
              <p className="text-2xl font-bold text-slate-900">21</p>
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
              <p className="text-2xl font-bold text-slate-900">8.5h</p>
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
        <div className="divide-y divide-slate-200">
          {verifications.map((verification) => (
            <div
              key={verification.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {verification.patientName.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{verification.patientName}</p>
                  <p className="text-sm text-slate-500">{verification.carrier}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <p className="text-sm text-slate-500">{verification.submittedAt}</p>

                {verification.status === "in_progress" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                    In Progress
                  </span>
                ) : verification.eligibility === "Active" ? (
                  <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    Inactive
                  </span>
                )}

                <Link
                  href="/dashboard/results"
                  className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
