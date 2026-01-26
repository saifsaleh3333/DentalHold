import Link from "next/link";

export default function NewVerification() {
  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
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
        <form className="space-y-6">
          {/* Patient Information */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="patientName" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Patient Name
                </label>
                <input
                  type="text"
                  id="patientName"
                  placeholder="e.g., John Smith"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="memberId" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Member ID
                </label>
                <input
                  type="text"
                  id="memberId"
                  placeholder="e.g., ABC123456789"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="pt-6 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Insurance Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="carrier" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Insurance Carrier
                </label>
                <select
                  id="carrier"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>Select a carrier...</option>
                  <option value="delta">Delta Dental</option>
                  <option value="cigna">Cigna</option>
                  <option value="metlife">MetLife</option>
                  <option value="aetna">Aetna</option>
                  <option value="united">United Healthcare</option>
                  <option value="guardian">Guardian</option>
                  <option value="humana">Humana</option>
                  <option value="bcbs">Blue Cross Blue Shield</option>
                  <option value="other">Other</option>
                </select>
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Optional Information */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Additional Information</h2>
              <span className="text-sm text-slate-500">Optional</span>
            </div>
            <div>
              <label htmlFor="procedures" className="block text-sm font-medium text-slate-700 mb-1.5">
                Procedure Codes
              </label>
              <input
                type="text"
                id="procedures"
                placeholder="e.g., D0120, D1110, D0274"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
              <p className="mt-1.5 text-sm text-slate-500">
                Enter specific CDT codes to verify coverage for planned procedures
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-200">
            <Link
              href="/dashboard/results"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Start Verification
            </Link>
            <p className="mt-3 text-sm text-slate-500 text-center">
              Our AI will call the insurance company and gather all verification details
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
