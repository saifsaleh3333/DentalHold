"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Benefits {
  // Eligibility
  eligible?: boolean;
  effectiveDate?: string;
  inNetwork?: boolean;

  // Plan Info
  planType?: string;
  feeSchedule?: string;
  planGroupName?: string;
  groupNumber?: string;
  payorId?: string;
  claimsMailingAddress?: string;

  // Subscriber Info
  subscriberName?: string;
  subscriberDOB?: string;
  relationshipToSubscriber?: string;

  // Maximums
  annualMaximum?: number;
  maximumUsed?: number;
  remainingMaximum?: number;
  maximumAppliesTo?: string;

  // Deductible
  deductible?: number;
  deductibleMet?: boolean | number;
  deductibleAmountMet?: number;
  deductibleAppliesTo?: string;

  // Ortho
  orthoMaximum?: number;
  orthoMaximumUsed?: number;

  // Coverage
  coverage?: {
    diagnostic?: number;
    preventive?: number;
    basic?: number;
    major?: number;
    extractions?: number;
    endodontics?: number;
    periodontics?: number;
  };

  // Frequencies
  frequencies?: {
    prophy?: string;
    bwx?: string;
    pano?: string;
    fmx?: string;
    exams?: string;
    examsShareFrequency?: boolean;
    srp?: string;
    d4910?: string;
    d4346?: string;
    crowns?: string;
  };

  // History
  history?: {
    prophy?: string;
    bwx?: string;
    pano?: string;
    fmx?: string;
    exams?: string;
  };

  // Specific Codes
  specificCodes?: {
    d4346Coverage?: number;
    d4346SharesWithD1110?: boolean;
    d7210Coverage?: number;
    d7140Coverage?: number;
    d4910Coverage?: number;
  };

  // Waiting Periods
  waitingPeriods?: {
    preventive?: string;
    basic?: string;
    major?: string;
  } | string;

  // Clauses
  missingToothClause?: boolean;
  downgradeCrowns?: boolean;
  downgradeFillings?: boolean;

  // Additional Coverage
  fluoride?: {
    covered?: boolean;
    ageLimit?: string;
  };
  implants?: {
    covered?: boolean;
    coverage?: number;
  };
  crowns?: {
    covered?: boolean;
    coverage?: number;
  };
  occlusialGuard?: {
    covered?: boolean;
    coverage?: number;
  };

  // Notes
  notes?: string;
}

interface Verification {
  id: string;
  createdAt: string;
  status: string;
  patientName: string;
  patientDOB: string;
  memberId: string;
  insuranceCarrier: string;
  callDuration?: string;
  recordingUrl?: string;
  transcript?: string;
  benefits: Benefits | null;
  referenceNumber?: string;
  repName?: string;
}

// Helper component for table cells
function Cell({ label, value, className = "" }: { label: string; value?: string | number | boolean | null; className?: string }) {
  const displayValue = value === undefined || value === null ? "—" :
    typeof value === "boolean" ? (value ? "Yes" : "No") :
    String(value);

  return (
    <div className={`p-3 ${className}`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="font-medium text-slate-900">{displayValue}</p>
    </div>
  );
}

// Section header component
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-slate-800 text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">
      {title}
    </div>
  );
}

export default function VerificationResultsDetail() {
  const params = useParams();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    async function fetchVerification() {
      try {
        const res = await fetch(`/api/verifications/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Verification not found");
          } else {
            setError("Failed to load verification");
          }
          return;
        }
        const data = await res.json();
        setVerification(data);
      } catch (err) {
        console.error("Error fetching verification:", err);
        setError("Failed to load verification");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      fetchVerification();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl py-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-500 mt-4">Loading verification...</p>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="max-w-5xl py-12 text-center">
        <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-slate-500 mb-4">{error || "Verification not found"}</p>
        <Link href="/dashboard/history" className="text-sky-600 hover:text-sky-700 font-medium">
          Back to History
        </Link>
      </div>
    );
  }

  const benefits = verification.benefits;

  // Get waiting period values
  const getWaitingPeriod = (type: 'preventive' | 'basic' | 'major') => {
    if (!benefits?.waitingPeriods) return "—";
    if (typeof benefits.waitingPeriods === 'string') return benefits.waitingPeriods;
    return benefits.waitingPeriods[type] || "None";
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/history"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to History
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Insurance Breakdown Sheet</h1>
            <p className="text-slate-600 mt-1">Verified on {formatDate(verification.createdAt)}</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export PDF
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {verification.status === "failed" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">Verification incomplete - some data may be missing</p>
          </div>
        </div>
      )}

      {/* Main Form Layout */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

        {/* Header Info Section */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          <Cell label="Company and #" value={verification.insuranceCarrier} className="border-r border-slate-200" />
          <Cell label="Rep Name / Date" value={verification.repName ? `${verification.repName} / ${formatDate(verification.createdAt)}` : formatDate(verification.createdAt)} className="border-r border-slate-200" />
          <Cell label="Subscriber ID" value={verification.memberId} />
        </div>
        <div className="grid grid-cols-3 border-b border-slate-200">
          <Cell label="Patient Name" value={verification.patientName} className="border-r border-slate-200" />
          <Cell label="Subscriber Name" value={benefits?.subscriberName} className="border-r border-slate-200" />
          <Cell label="Effective Date" value={benefits?.effectiveDate} />
        </div>
        <div className="grid grid-cols-3 border-b border-slate-200">
          <Cell label="Patient DOB" value={verification.patientDOB} className="border-r border-slate-200" />
          <Cell label="Subscriber DOB" value={benefits?.subscriberDOB} className="border-r border-slate-200" />
          <Cell label="Relationship to Subscriber" value={benefits?.relationshipToSubscriber} />
        </div>

        {/* Insurance Payer Information */}
        <SectionHeader title="Insurance Payer Information" />
        <div className="grid grid-cols-3 border-b border-slate-200">
          <Cell
            label="IN or OUT of Network"
            value={benefits?.inNetwork === undefined ? undefined : (benefits.inNetwork ? "In Network" : "Out of Network")}
            className="border-r border-slate-200"
          />
          <Cell label="Plan Type" value={benefits?.planType} className="border-r border-slate-200" />
          <Cell label="Fee Schedule" value={benefits?.feeSchedule} />
        </div>
        <div className="grid grid-cols-3 border-b border-slate-200">
          <Cell label="Plan/Group Name" value={benefits?.planGroupName} className="border-r border-slate-200" />
          <Cell label="Group Number" value={benefits?.groupNumber} className="border-r border-slate-200" />
          <div className="p-3">
            <p className="text-xs text-slate-500 mb-1">Claims Mailing Address / Payor ID</p>
            <p className="font-medium text-slate-900 text-sm">
              {benefits?.claimsMailingAddress || benefits?.payorId || "—"}
              {benefits?.claimsMailingAddress && benefits?.payorId && (
                <span className="text-slate-500"> | Payor ID: {benefits.payorId}</span>
              )}
            </p>
          </div>
        </div>

        {/* Waiting Periods */}
        <SectionHeader title="Waiting Periods" />
        <div className="grid grid-cols-3 border-b border-slate-200">
          <Cell label="Preventive" value={getWaitingPeriod('preventive')} className="border-r border-slate-200" />
          <Cell label="Basic" value={getWaitingPeriod('basic')} className="border-r border-slate-200" />
          <Cell label="Major" value={getWaitingPeriod('major')} />
        </div>

        {/* Missing Tooth Clause */}
        <div className="grid grid-cols-1 border-b border-slate-200 bg-slate-50">
          <div className="p-3 flex items-center justify-between">
            <span className="font-semibold text-slate-700">IS THERE A MISSING TOOTH CLAUSE?</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              benefits?.missingToothClause === true ? 'bg-amber-100 text-amber-700' :
              benefits?.missingToothClause === false ? 'bg-green-100 text-green-700' :
              'bg-slate-200 text-slate-600'
            }`}>
              {benefits?.missingToothClause === true ? 'YES' : benefits?.missingToothClause === false ? 'NO' : '—'}
            </span>
          </div>
        </div>

        {/* Benefit Details */}
        <SectionHeader title="Benefit Details" />
        <div className="grid grid-cols-3 border-b border-slate-200">
          <div className="border-r border-slate-200">
            <Cell label="General Maximum" value={benefits?.annualMaximum ? `$${benefits.annualMaximum.toLocaleString()}` : undefined} />
            <Cell label="Maximum Used" value={benefits?.maximumUsed !== undefined ? `$${benefits.maximumUsed.toLocaleString()}` : undefined} className="border-t border-slate-200" />
            <div className="p-3 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Maximum Applies to:</p>
              <p className="font-medium text-slate-900">{benefits?.maximumAppliesTo || "Prev / Basic / Major"}</p>
            </div>
          </div>
          <div className="border-r border-slate-200">
            <Cell label="Deductible" value={benefits?.deductible !== undefined ? `$${benefits.deductible}` : undefined} />
            <Cell
              label="Deductible Met"
              value={
                benefits?.deductibleMet === true ? "Yes" :
                benefits?.deductibleMet === false ? "No" :
                benefits?.deductibleAmountMet !== undefined ? `$${benefits.deductibleAmountMet} met` :
                undefined
              }
              className="border-t border-slate-200"
            />
            <div className="p-3 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Deductible Applies to:</p>
              <p className="font-medium text-slate-900">{benefits?.deductibleAppliesTo || "Prev / Basic / Major"}</p>
            </div>
          </div>
          <div>
            <Cell label="Ortho Maximum" value={benefits?.orthoMaximum ? `$${benefits.orthoMaximum.toLocaleString()}` : undefined} />
            <Cell label="Ortho Max. Used" value={benefits?.orthoMaximumUsed !== undefined ? `$${benefits.orthoMaximumUsed.toLocaleString()}` : undefined} className="border-t border-slate-200" />
          </div>
        </div>

        {/* Coverage Percentages */}
        <SectionHeader title="Coverage Percentages" />

        {/* Row 1: Diagnostic, Preventive, Basic */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          {/* Diagnostic Column */}
          <div className="border-r border-slate-200 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Diagnostic</p>
              <p className="text-2xl font-bold text-slate-900">{benefits?.coverage?.diagnostic !== undefined ? `${benefits.coverage.diagnostic}%` : "—"}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Frequency of BWXs</span>
                <span className="font-medium">{benefits?.frequencies?.bwx || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">BWX History</span>
                <span className="font-medium">{benefits?.history?.bwx || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pano Frequency</span>
                <span className="font-medium">{benefits?.frequencies?.pano || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pano History</span>
                <span className="font-medium">{benefits?.history?.pano || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">FMX Frequency</span>
                <span className="font-medium">{benefits?.frequencies?.fmx || "—"}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500 block">Exams Frequency</span>
                <span className="font-medium text-slate-900 break-words">{benefits?.frequencies?.exams || "—"}</span>
              </div>
              {benefits?.frequencies?.examsShareFrequency !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Exams Share Freq?</span>
                  <span className="font-medium">{benefits.frequencies.examsShareFrequency ? "Yes" : "No"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Preventive Column */}
          <div className="border-r border-slate-200 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Preventive</p>
              <p className="text-2xl font-bold text-slate-900">{benefits?.coverage?.preventive !== undefined ? `${benefits.coverage.preventive}%` : "—"}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">D1110 Frequency</span>
                <span className="font-medium">{benefits?.frequencies?.prophy || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">D1110 History</span>
                <span className="font-medium">{benefits?.history?.prophy || "—"}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">D4346 Coverage</span>
                  <span className="font-medium">{benefits?.specificCodes?.d4346Coverage !== undefined ? `${benefits.specificCodes.d4346Coverage}%` : "—"}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-500">D4346 shares w/ D1110?</span>
                  <span className="font-medium">{benefits?.specificCodes?.d4346SharesWithD1110 !== undefined ? (benefits.specificCodes.d4346SharesWithD1110 ? "Yes" : "No") : "—"}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Fluoride D1208</span>
                  <span className="font-medium">{benefits?.fluoride?.covered !== undefined ? (benefits.fluoride.covered ? "Yes" : "No") : "—"}</span>
                </div>
                {benefits?.fluoride?.ageLimit && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-500">Age Limit</span>
                    <span className="font-medium">{benefits.fluoride.ageLimit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Column */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Basic</p>
              <p className="text-2xl font-bold text-slate-900">{benefits?.coverage?.basic !== undefined ? `${benefits.coverage.basic}%` : "—"}</p>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Downgrade fillings?</span>
                <span className="font-medium">{benefits?.downgradeFillings !== undefined ? (benefits.downgradeFillings ? "Yes" : "No") : "—"}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-700">Endodontics</p>
              <p className="text-2xl font-bold text-slate-900">{benefits?.coverage?.endodontics !== undefined ? `${benefits.coverage.endodontics}%` : "—"}</p>
            </div>
          </div>
        </div>

        {/* Row 2: Major, Extractions, Periodontics */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          {/* Major Column */}
          <div className="border-r border-slate-200 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Major</p>
              <p className="text-2xl font-bold text-slate-900">{benefits?.coverage?.major !== undefined ? `${benefits.coverage.major}%` : "—"}</p>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Downgrade crowns?</span>
                <span className="font-medium">{benefits?.downgradeCrowns !== undefined ? (benefits.downgradeCrowns ? "Yes" : "No") : "—"}</span>
              </div>
              {benefits?.frequencies?.crowns && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-500">Crown Frequency</span>
                  <span className="font-medium">{benefits.frequencies.crowns}</span>
                </div>
              )}
            </div>
          </div>

          {/* Extractions Column */}
          <div className="border-r border-slate-200 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Extractions</p>
              <p className="text-2xl font-bold text-slate-900">{benefits?.coverage?.extractions !== undefined ? `${benefits.coverage.extractions}%` : "—"}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">D7210 (Surgical)</span>
                <span className="font-medium">{benefits?.specificCodes?.d7210Coverage !== undefined ? `${benefits.specificCodes.d7210Coverage}%` : "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">D7140 (Simple)</span>
                <span className="font-medium">{benefits?.specificCodes?.d7140Coverage !== undefined ? `${benefits.specificCodes.d7140Coverage}%` : "—"}</span>
              </div>
            </div>
          </div>

          {/* Periodontics Column */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Periodontics</p>
              <p className="text-2xl font-bold text-slate-900">{benefits?.coverage?.periodontics !== undefined ? `${benefits.coverage.periodontics}%` : "—"}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">D4910 Coverage</span>
                <span className="font-medium">{benefits?.specificCodes?.d4910Coverage !== undefined ? `${benefits.specificCodes.d4910Coverage}%` : "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">D4910 Frequency</span>
                <span className="font-medium">{benefits?.frequencies?.d4910 || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">SRP (D4341/D4342)</span>
                <span className="font-medium">{benefits?.frequencies?.srp || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Implants, Occlusal Guard */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          {/* Implants Column */}
          <div className="border-r border-slate-200 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-slate-700">Implants Covered?</p>
              <span className={`px-2 py-0.5 rounded text-sm font-semibold ${
                benefits?.implants?.covered ? 'bg-green-100 text-green-700' :
                benefits?.implants?.covered === false ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {benefits?.implants?.covered !== undefined ? (benefits.implants.covered ? "Yes" : "No") : "—"}
              </span>
            </div>
            {benefits?.implants?.coverage !== undefined && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Coverage</span>
                  <span className="font-medium">{benefits.implants.coverage}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Occlusal Guard Column */}
          <div className="border-r border-slate-200 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-slate-700">Occlusal Guard (D9944)</p>
              <span className={`px-2 py-0.5 rounded text-sm font-semibold ${
                benefits?.occlusialGuard?.covered ? 'bg-green-100 text-green-700' :
                benefits?.occlusialGuard?.covered === false ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {benefits?.occlusialGuard?.covered !== undefined ? (benefits.occlusialGuard.covered ? "Yes" : "No") : "—"}
              </span>
            </div>
            {benefits?.occlusialGuard?.coverage !== undefined && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Coverage</span>
                  <span className="font-medium">{benefits.occlusialGuard.coverage}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Call Reference */}
          <div className="p-4 space-y-2">
            <p className="text-sm font-semibold text-slate-700">Call Reference</p>
            {verification.referenceNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ref #</span>
                <span className="font-mono font-medium">{verification.referenceNumber}</span>
              </div>
            )}
            {verification.callDuration && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium">{verification.callDuration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes Section */}
        {benefits?.notes && (
          <>
            <SectionHeader title="Notes" />
            <div className="p-4">
              <p className="text-slate-700 whitespace-pre-wrap">{benefits.notes}</p>
            </div>
          </>
        )}
      </div>

      {/* Call Recording Section */}
      {(verification.recordingUrl || verification.transcript) && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide flex items-center justify-between">
            <span>Call Recording</span>
            {verification.recordingUrl && (
              <a
                href={verification.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-300 hover:text-sky-200 text-xs font-normal"
              >
                Download
              </a>
            )}
          </div>

          {verification.recordingUrl && (
            <div className="p-4 border-b border-slate-200">
              <audio controls className="w-full" src={verification.recordingUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {verification.transcript && (
            <div>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="w-full px-4 py-3 flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium">{showTranscript ? "Hide Transcript" : "View Transcript"}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${showTranscript ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showTranscript && (
                <div className="px-4 pb-4">
                  <div className="max-h-96 overflow-y-auto bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{verification.transcript}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Verification
        </Link>
      </div>
    </div>
  );
}
