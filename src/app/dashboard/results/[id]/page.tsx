"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CodeDetail {
  frequency?: string;
  history?: string;
  coverage?: number;
  sharesWithD1110?: boolean;
  covered?: boolean;
  ageLimit?: string;
}

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

  // Coverage Percentages
  coverage?: {
    diagnostic?: number;
    preventive?: number;
    basic?: number;
    major?: number;
    extractions?: number;
    endodontics?: number;
    periodontics?: number;
  };

  // Diagnostic codes
  diagnostic?: {
    bwx?: CodeDetail;
    pano?: CodeDetail;
    fmx?: CodeDetail;
    d0150?: CodeDetail;
    d0120?: CodeDetail;
    d0140?: CodeDetail;
    examsShareFrequency?: boolean;
  };

  // Preventive codes
  preventive?: {
    d1110?: CodeDetail;
    d4346?: CodeDetail;
    fluoride?: { covered?: boolean; ageLimit?: string };
  };

  // Extractions codes
  extractions?: {
    d7210?: CodeDetail;
    d7140?: CodeDetail;
  };

  // Periodontics codes
  periodontics?: {
    d4910?: CodeDetail;
    d4341?: CodeDetail;
    d4342?: CodeDetail;
  };

  // Major codes
  major?: {
    crowns?: { frequency?: string; covered?: boolean; coverage?: number };
  };

  // Implants
  implants?: {
    covered?: boolean;
    d6010?: CodeDetail;
    d6057?: CodeDetail;
    d6058?: CodeDetail;
  };

  // Occlusal Guard
  occlusialGuard?: {
    covered?: boolean;
    coverage?: number;
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

  // Notes
  notes?: string;

  // Legacy flat fields (backwards compat with old records)
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
  history?: {
    prophy?: string;
    bwx?: string;
    pano?: string;
    fmx?: string;
    exams?: string;
  };
  specificCodes?: {
    d4346Coverage?: number;
    d4346SharesWithD1110?: boolean;
    d7210Coverage?: number;
    d7140Coverage?: number;
    d4910Coverage?: number;
  };
  fluoride?: { covered?: boolean; ageLimit?: string };
  crowns?: { covered?: boolean; coverage?: number };
}

interface Verification {
  id: string;
  createdAt: string;
  status: string;
  patientName: string;
  patientDOB: string;
  memberId: string;
  patientSSN?: string;
  insuranceCarrier: string;
  callDuration?: string;
  recordingUrl?: string;
  transcript?: string;
  benefits: Benefits | null;
  referenceNumber?: string;
  repName?: string;
}

// Helper: table cell
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

// Helper: section header
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-slate-800 text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">
      {title}
    </div>
  );
}

// Helper: code row within a coverage column
function CodeRow({ code, label, detail }: { code: string; label: string; detail?: CodeDetail }) {
  return (
    <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
      <p className="text-xs font-semibold text-slate-600">{code} <span className="font-normal text-slate-400">({label})</span></p>
      {detail?.coverage !== undefined && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Coverage</span>
          <span className="font-medium">{detail.coverage}%</span>
        </div>
      )}
      {detail?.frequency && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Frequency</span>
          <span className="font-medium">{detail.frequency}</span>
        </div>
      )}
      {detail?.history && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Last Done</span>
          <span className="font-medium">{detail.history}</span>
        </div>
      )}
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

  // Auto-poll while call is in progress
  useEffect(() => {
    if (!verification || verification.status !== "in_progress") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/verifications/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setVerification(data);
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [verification?.status, params.id]);

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

  const b = verification.benefits;

  // Helpers for backwards compat with old data format
  const getWaitingPeriod = (type: 'preventive' | 'basic' | 'major') => {
    if (!b?.waitingPeriods) return "—";
    if (typeof b.waitingPeriods === 'string') return b.waitingPeriods;
    return b.waitingPeriods[type] || "None";
  };

  // Build normalized code details from new or legacy format
  const diag = {
    bwx: b?.diagnostic?.bwx || { frequency: b?.frequencies?.bwx, history: b?.history?.bwx },
    pano: b?.diagnostic?.pano || { frequency: b?.frequencies?.pano, history: b?.history?.pano },
    fmx: b?.diagnostic?.fmx || { frequency: b?.frequencies?.fmx, history: b?.history?.fmx },
    d0150: b?.diagnostic?.d0150 || {} as CodeDetail,
    d0120: b?.diagnostic?.d0120 || {} as CodeDetail,
    d0140: b?.diagnostic?.d0140 || {} as CodeDetail,
    examsShareFrequency: b?.diagnostic?.examsShareFrequency ?? b?.frequencies?.examsShareFrequency,
  };

  const prev = {
    d1110: b?.preventive?.d1110 || { frequency: b?.frequencies?.prophy, history: b?.history?.prophy },
    d4346: b?.preventive?.d4346 || { coverage: b?.specificCodes?.d4346Coverage, frequency: b?.frequencies?.d4346, sharesWithD1110: b?.specificCodes?.d4346SharesWithD1110 },
    fluoride: b?.preventive?.fluoride || b?.fluoride || {},
  };

  const extract = {
    d7210: b?.extractions?.d7210 || { coverage: b?.specificCodes?.d7210Coverage },
    d7140: b?.extractions?.d7140 || { coverage: b?.specificCodes?.d7140Coverage },
  };

  const perio = {
    d4910: b?.periodontics?.d4910 || { coverage: b?.specificCodes?.d4910Coverage, frequency: b?.frequencies?.d4910 },
    d4341: b?.periodontics?.d4341 || { frequency: b?.frequencies?.srp },
    d4342: b?.periodontics?.d4342 || {},
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

        {verification.status === "in_progress" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-amber-800">Verification Call in Progress</h2>
                <p className="text-amber-700 mt-1">
                  Dani is currently on the phone with {verification.insuranceCarrier || "the insurance company"}.
                  This page will automatically update when the call completes.
                </p>
                <p className="text-amber-600 text-sm mt-2">
                  Insurance hold times can be 15-45 minutes. Feel free to leave this page open or check back later.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-amber-600">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Auto-refreshing every 5 seconds...</span>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {verification.status === "in_progress" ? "Verification In Progress" : "Insurance Breakdown Sheet"}
            </h1>
            <p className="text-slate-600 mt-1">
              {verification.status === "in_progress"
                ? `Started on ${formatDate(verification.createdAt)}`
                : `Verified on ${formatDate(verification.createdAt)}`}
            </p>
          </div>
          {verification.status !== "in_progress" && (
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
          )}
        </div>
      </div>

      {verification.status !== "in_progress" && (<>
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

      {/* Main Form */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

        {/* Row 1: Company, Rep, Subscriber ID */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          <Cell label="Company and #" value={verification.insuranceCarrier} className="border-r border-slate-200" />
          <Cell label="Rep Name / Date" value={verification.repName ? `${verification.repName} / ${formatDate(verification.createdAt)}` : formatDate(verification.createdAt)} className="border-r border-slate-200" />
          <Cell label="Subscriber ID" value={verification.memberId} />
        </div>
        {/* Row 2: Patient, Subscriber, Effective */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          <Cell label="Patient Name" value={verification.patientName} className="border-r border-slate-200" />
          <Cell label="Subscriber Name" value={b?.subscriberName} className="border-r border-slate-200" />
          <Cell label="Effective Date" value={b?.effectiveDate} />
        </div>
        {/* Row 2b: SSN (only if present) */}
        {verification.patientSSN && (
          <div className="grid grid-cols-3 border-b border-slate-200">
            <Cell label="SSN" value={verification.patientSSN} className="border-r border-slate-200" />
            <div className="col-span-2" />
          </div>
        )}
        {/* Row 3: DOBs, Relationship */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          <Cell label="Patient DOB" value={verification.patientDOB} className="border-r border-slate-200" />
          <Cell label="Subscriber DOB" value={b?.subscriberDOB} className="border-r border-slate-200" />
          <Cell label="Relationship to Subscriber" value={b?.relationshipToSubscriber} />
        </div>

        {/* Insurance Payer Information */}
        <SectionHeader title="Insurance Payer Information" />
        <div className="grid grid-cols-3 border-b border-slate-200">
          <Cell label="IN or OUT of Network" value={b?.inNetwork === undefined ? undefined : (b.inNetwork ? "In Network" : "Out of Network")} className="border-r border-slate-200" />
          <Cell label="Plan Type" value={b?.planType} className="border-r border-slate-200" />
          <Cell label="Fee Schedule" value={b?.feeSchedule} />
        </div>
        <div className="grid grid-cols-3 border-b border-slate-200">
          <Cell label="Plan/Group Name" value={b?.planGroupName} className="border-r border-slate-200" />
          <Cell label="Group Number" value={b?.groupNumber} className="border-r border-slate-200" />
          <div className="p-3">
            <p className="text-xs text-slate-500 mb-1">Claims Mailing Address / Payor ID</p>
            <p className="font-medium text-slate-900 text-sm whitespace-pre-line">
              {b?.claimsMailingAddress || b?.payorId || "—"}
              {b?.claimsMailingAddress && b?.payorId && (
                <span className="text-slate-500"> | Payor ID: {b.payorId}</span>
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
              b?.missingToothClause === true ? 'bg-amber-100 text-amber-700' :
              b?.missingToothClause === false ? 'bg-green-100 text-green-700' :
              'bg-slate-200 text-slate-600'
            }`}>
              {b?.missingToothClause === true ? 'YES' : b?.missingToothClause === false ? 'NO' : '—'}
            </span>
          </div>
        </div>

        {/* Benefit Details */}
        <SectionHeader title="Benefit Details" />
        <div className="grid grid-cols-3 border-b border-slate-200">
          <div className="border-r border-slate-200">
            <Cell label="General Maximum" value={b?.annualMaximum ? `$${b.annualMaximum.toLocaleString()}` : undefined} />
            <Cell label="Maximum Used" value={b?.maximumUsed !== undefined ? `$${b.maximumUsed.toLocaleString()}` : undefined} className="border-t border-slate-200" />
            <div className="p-3 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Maximum Applies to:</p>
              <p className="font-medium text-slate-900">{b?.maximumAppliesTo || "Prev / Basic / Major"}</p>
            </div>
          </div>
          <div className="border-r border-slate-200">
            <Cell label="Deductible" value={b?.deductible !== undefined ? `$${b.deductible}` : undefined} />
            <Cell
              label="Deductible Met"
              value={
                b?.deductibleMet === true ? "Yes" :
                b?.deductibleMet === false ? "No" :
                b?.deductibleAmountMet !== undefined ? `$${b.deductibleAmountMet} met` :
                undefined
              }
              className="border-t border-slate-200"
            />
            <div className="p-3 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Deductible Applies to:</p>
              <p className="font-medium text-slate-900">{b?.deductibleAppliesTo || "Prev / Basic / Major"}</p>
            </div>
          </div>
          <div>
            <Cell label="Ortho Maximum" value={b?.orthoMaximum ? `$${b.orthoMaximum.toLocaleString()}` : undefined} />
            <Cell label="Ortho Max. Used" value={b?.orthoMaximumUsed !== undefined ? `$${b.orthoMaximumUsed.toLocaleString()}` : undefined} className="border-t border-slate-200" />
          </div>
        </div>

        {/* Coverage Percentages */}
        <SectionHeader title="Coverage Percentages" />

        {/* Row 1: Diagnostic | Preventive | Basic + Endodontics */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          {/* Diagnostic */}
          <div className="border-r border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">Diagnostic</p>
            <p className="text-2xl font-bold text-slate-900 mb-2">{b?.coverage?.diagnostic !== undefined ? `${b.coverage.diagnostic}%` : "—"}</p>

            <CodeRow code="D0220/D0274" label="Bitewings" detail={diag.bwx} />
            <CodeRow code="D0330" label="Pano" detail={diag.pano} />
            <CodeRow code="D0210" label="FMX" detail={diag.fmx} />
            <CodeRow code="D0150" label="Comp. Exam" detail={diag.d0150} />
            <CodeRow code="D0120" label="Periodic Exam" detail={diag.d0120} />
            <CodeRow code="D0140" label="Limited Exam" detail={diag.d0140} />

            {diag.examsShareFrequency !== undefined && (
              <div className="border-t border-slate-100 pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Exams share freq?</span>
                  <span className="font-medium">{diag.examsShareFrequency ? "Yes" : "No"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Preventive */}
          <div className="border-r border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">Preventive</p>
            <p className="text-2xl font-bold text-slate-900 mb-2">{b?.coverage?.preventive !== undefined ? `${b.coverage.preventive}%` : "—"}</p>

            <CodeRow code="D1110" label="Prophy" detail={prev.d1110} />

            <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
              <p className="text-xs font-semibold text-slate-600">D4346 <span className="font-normal text-slate-400">(Gingivitis Scaling)</span></p>
              {prev.d4346.coverage !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Coverage</span>
                  <span className="font-medium">{prev.d4346.coverage}%</span>
                </div>
              )}
              {prev.d4346.frequency && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Frequency</span>
                  <span className="font-medium">{prev.d4346.frequency}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shares w/ D1110?</span>
                <span className="font-medium">{prev.d4346.sharesWithD1110 !== undefined ? (prev.d4346.sharesWithD1110 ? "Yes" : "No") : "—"}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
              <p className="text-xs font-semibold text-slate-600">D1208 <span className="font-normal text-slate-400">(Fluoride)</span></p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Covered</span>
                <span className="font-medium">{prev.fluoride.covered !== undefined ? (prev.fluoride.covered ? "Yes" : "No") : "—"}</span>
              </div>
              {prev.fluoride.ageLimit && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Age Limit</span>
                  <span className="font-medium">{prev.fluoride.ageLimit}</span>
                </div>
              )}
            </div>
          </div>

          {/* Basic + Endodontics */}
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-700">Basic</p>
            <p className="text-2xl font-bold text-slate-900 mb-2">{b?.coverage?.basic !== undefined ? `${b.coverage.basic}%` : "—"}</p>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Downgrade fillings?</span>
              <span className="font-medium">{b?.downgradeFillings !== undefined ? (b.downgradeFillings ? "Yes" : "No") : "—"}</span>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-700">Endodontics</p>
              <p className="text-2xl font-bold text-slate-900">{b?.coverage?.endodontics !== undefined ? `${b.coverage.endodontics}%` : "—"}</p>
            </div>
          </div>
        </div>

        {/* Row 2: Major | Extractions | Periodontics */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          {/* Major */}
          <div className="border-r border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">Major</p>
            <p className="text-2xl font-bold text-slate-900 mb-2">{b?.coverage?.major !== undefined ? `${b.coverage.major}%` : "—"}</p>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Downgrade crowns?</span>
              <span className="font-medium">{b?.downgradeCrowns !== undefined ? (b.downgradeCrowns ? "Yes" : "No") : "—"}</span>
            </div>
            {(b?.major?.crowns?.frequency || b?.frequencies?.crowns) && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-500">Crown frequency</span>
                <span className="font-medium">{b?.major?.crowns?.frequency || b?.frequencies?.crowns}</span>
              </div>
            )}
          </div>

          {/* Extractions */}
          <div className="border-r border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">Extractions</p>
            <p className="text-2xl font-bold text-slate-900 mb-2">{b?.coverage?.extractions !== undefined ? `${b.coverage.extractions}%` : "—"}</p>

            <div className="space-y-1 border-t border-slate-100 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">D7210 (Surgical)</span>
                <span className="font-medium">{extract.d7210.coverage !== undefined ? `${extract.d7210.coverage}%` : "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">D7140 (Simple)</span>
                <span className="font-medium">{extract.d7140.coverage !== undefined ? `${extract.d7140.coverage}%` : "—"}</span>
              </div>
            </div>
          </div>

          {/* Periodontics */}
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-700">Periodontics</p>
            <p className="text-2xl font-bold text-slate-900 mb-2">{b?.coverage?.periodontics !== undefined ? `${b.coverage.periodontics}%` : "—"}</p>

            <CodeRow code="D4910" label="Perio Maint." detail={perio.d4910} />
            <CodeRow code="D4341" label="SRP 4+ teeth" detail={perio.d4341} />
            <CodeRow code="D4342" label="SRP 1-3 teeth" detail={perio.d4342} />
          </div>
        </div>

        {/* Row 3: Implants | Occlusal Guard | Call Reference */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          {/* Implants */}
          <div className="border-r border-slate-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-slate-700">Implants Covered?</p>
              <span className={`px-2 py-0.5 rounded text-sm font-semibold ${
                b?.implants?.covered ? 'bg-green-100 text-green-700' :
                b?.implants?.covered === false ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {b?.implants?.covered !== undefined ? (b.implants.covered ? "Yes" : "No") : "—"}
              </span>
            </div>
            {b?.implants?.covered && (
              <div className="space-y-1 border-t border-slate-100 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">D6010 (Implant Body)</span>
                  <span className="font-medium">{b.implants.d6010?.coverage !== undefined ? `${b.implants.d6010.coverage}%` : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">D6057 (Abutment)</span>
                  <span className="font-medium">{b.implants.d6057?.coverage !== undefined ? `${b.implants.d6057.coverage}%` : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">D6058 (Crown)</span>
                  <span className="font-medium">{b.implants.d6058?.coverage !== undefined ? `${b.implants.d6058.coverage}%` : "—"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Occlusal Guard */}
          <div className="border-r border-slate-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-slate-700">Occlusal Guard (D9944)</p>
              <span className={`px-2 py-0.5 rounded text-sm font-semibold ${
                b?.occlusialGuard?.covered ? 'bg-green-100 text-green-700' :
                b?.occlusialGuard?.covered === false ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {b?.occlusialGuard?.covered !== undefined ? (b.occlusialGuard.covered ? "Yes" : "No") : "—"}
              </span>
            </div>
            {b?.occlusialGuard?.coverage !== undefined && (
              <div className="border-t border-slate-100 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Coverage</span>
                  <span className="font-medium">{b.occlusialGuard.coverage}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Call Reference */}
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Call Reference</p>
            <div className="space-y-1">
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
        </div>

        {/* Notes */}
        {b?.notes && (
          <>
            <SectionHeader title="Notes" />
            <div className="p-4">
              <p className="text-slate-700 whitespace-pre-wrap">{b.notes}</p>
            </div>
          </>
        )}
      </div>

      {/* Call Recording */}
      {(verification.recordingUrl || verification.transcript) && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide flex items-center justify-between">
            <span>Call Recording</span>
            {verification.recordingUrl && (
              <a href={verification.recordingUrl} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:text-sky-200 text-xs font-normal">
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
                <svg className={`w-5 h-5 transition-transform ${showTranscript ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      </>)}

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
