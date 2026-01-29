"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Benefits {
  eligible?: boolean;
  effectiveDate?: string;
  inNetwork?: boolean;
  planType?: string;
  feeSchedule?: string;
  planGroupName?: string;
  groupNumber?: string;
  payorId?: string;
  annualMaximum?: number;
  maximumUsed?: number;
  remainingMaximum?: number;
  maximumAppliesTo?: string;
  deductible?: number;
  deductibleMet?: boolean | number;
  deductibleAmountMet?: number;
  deductibleAppliesTo?: string;
  orthoMaximum?: number;
  orthoMaximumUsed?: number;
  coverage?: {
    diagnostic?: number;
    preventive?: number;
    basic?: number;
    major?: number;
    extractions?: number;
    endodontics?: number;
    periodontics?: number;
  };
  frequencies?: {
    prophy?: string;
    bwx?: string;
    pano?: string;
    fmx?: string;
    exams?: string;
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
  waitingPeriods?: {
    preventive?: string;
    basic?: string;
    major?: string;
  } | string;
  missingToothClause?: boolean;
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-4xl py-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-500 mt-4">Loading verification...</p>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="max-w-4xl py-12 text-center">
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
  const remainingPercent = benefits?.annualMaximum && benefits?.remainingMaximum
    ? Math.round((benefits.remainingMaximum / benefits.annualMaximum) * 100)
    : 0;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
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
            <h1 className="text-2xl font-bold text-slate-900">Verification Results</h1>
            <p className="text-slate-600 mt-1">Completed on {formatDate(verification.createdAt)}</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Patient & Insurance Header Card */}
      <div className="bg-gradient-to-r from-sky-500 to-cyan-500 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">{getInitials(verification.patientName)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{verification.patientName}</h2>
              <p className="text-sky-100">
                DOB: {verification.patientDOB || "N/A"} | Member ID: {verification.memberId || "N/A"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sky-100 text-sm">Insurance Carrier</p>
            <p className="text-lg font-semibold">{verification.insuranceCarrier || "Unknown"}</p>
          </div>
        </div>
      </div>

      {/* Call Recording Section */}
      {(verification.recordingUrl || verification.transcript || verification.callDuration) && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Call Recording</h3>
                <p className="text-sm text-slate-500">Duration: {verification.callDuration || "N/A"}</p>
              </div>
            </div>
            {verification.recordingUrl && (
              <a
                href={verification.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            )}
          </div>

          {/* Audio Player */}
          {verification.recordingUrl && (
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <audio controls className="w-full" src={verification.recordingUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Transcript Toggle */}
          {verification.transcript && (
            <div>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showTranscript ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {showTranscript ? "Hide Transcript" : "View Transcript"}
              </button>

              {showTranscript && (
                <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-600">Call Transcript</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{verification.transcript}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status Message for Failed/In-Progress */}
      {verification.status === "failed" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Verification Failed</h3>
              <p className="text-sm text-red-600">Unable to complete verification. The call may have been disconnected or the information could not be confirmed.</p>
            </div>
          </div>
        </div>
      )}

      {verification.status === "in_progress" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="font-semibold text-amber-800">Verification In Progress</h3>
              <p className="text-sm text-amber-600">We&apos;re currently on hold with the insurance company. Results will appear here once complete.</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Grid - only show if we have benefits data */}
      {benefits && (
        <div className="grid grid-cols-2 gap-6">
          {/* Eligibility Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Eligibility Status</h3>
            <div className="flex items-center gap-3">
              {benefits.eligible === true ? (
                <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-lg font-semibold rounded-full">
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Active
                </span>
              ) : benefits.eligible === false ? (
                <span className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-lg font-semibold rounded-full">
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Inactive
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 text-lg font-semibold rounded-full">
                  Unknown
                </span>
              )}
            </div>
            {benefits.effectiveDate && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Effective Date</span>
                  <span className="font-medium text-slate-900">{benefits.effectiveDate}</span>
                </div>
              </div>
            )}
            {benefits.planType && (
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Plan Type</span>
                  <span className="font-medium text-slate-900">{benefits.planType}</span>
                </div>
              </div>
            )}
          </div>

          {/* Annual Maximum Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Annual Maximum</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {benefits.annualMaximum ? `$${benefits.annualMaximum.toLocaleString()}` : "N/A"}
              </span>
              {benefits.annualMaximum && <span className="text-slate-500 mb-1">/ year</span>}
            </div>
            {benefits.remainingMaximum !== undefined && benefits.annualMaximum && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Remaining</span>
                  <span className="font-medium text-green-600">${benefits.remainingMaximum.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${remainingPercent}%` }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Deductible Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Deductible</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-slate-900">
                {benefits.deductible !== undefined ? `$${benefits.deductible}` : "N/A"}
              </span>
              {benefits.deductibleMet !== undefined && (
                benefits.deductibleMet === true ? (
                  <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Met
                  </span>
                ) : benefits.deductibleMet === false ? (
                  <span className="inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                    Not Met
                  </span>
                ) : benefits.deductibleAmountMet !== undefined ? (
                  <span className="inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                    ${benefits.deductibleAmountMet} of ${benefits.deductible}
                  </span>
                ) : null
              )}
            </div>
          </div>

          {/* Coverage Breakdown Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Coverage Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Preventive</span>
                <span className="text-lg font-semibold text-slate-900">
                  {benefits.coverage?.preventive !== undefined ? `${benefits.coverage.preventive}%` : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Basic</span>
                <span className="text-lg font-semibold text-slate-900">
                  {benefits.coverage?.basic !== undefined ? `${benefits.coverage.basic}%` : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Major</span>
                <span className="text-lg font-semibold text-slate-900">
                  {benefits.coverage?.major !== undefined ? `${benefits.coverage.major}%` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Frequencies Card */}
          {(benefits.frequencies?.prophy || benefits.frequencies?.bwx || benefits.frequencies?.pano) && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 col-span-2">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Frequencies & Limitations</h3>
              <div className="grid grid-cols-3 gap-6">
                {benefits.frequencies?.prophy && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Prophylaxis</p>
                    <p className="font-semibold text-slate-900">{benefits.frequencies.prophy}</p>
                  </div>
                )}
                {benefits.frequencies?.bwx && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Bitewing X-rays</p>
                    <p className="font-semibold text-slate-900">{benefits.frequencies.bwx}</p>
                  </div>
                )}
                {benefits.frequencies?.pano && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Panoramic X-ray</p>
                    <p className="font-semibold text-slate-900">{benefits.frequencies.pano}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Waiting Periods Card */}
          {benefits.waitingPeriods !== undefined && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Waiting Periods</h3>
              {(() => {
                // Handle object format
                if (typeof benefits.waitingPeriods === 'object') {
                  const wp = benefits.waitingPeriods;
                  const hasWaitingPeriods = wp.preventive || wp.basic || wp.major;
                  if (!hasWaitingPeriods) {
                    return (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 font-medium rounded-full">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            None
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-3">All services covered immediately</p>
                      </>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {wp.preventive && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Preventive</span>
                          <span className="font-medium text-slate-900">{wp.preventive}</span>
                        </div>
                      )}
                      {wp.basic && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Basic</span>
                          <span className="font-medium text-slate-900">{wp.basic}</span>
                        </div>
                      )}
                      {wp.major && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Major</span>
                          <span className="font-medium text-slate-900">{wp.major}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                // Handle string format (legacy)
                if (benefits.waitingPeriods === "None" || benefits.waitingPeriods === "none" || !benefits.waitingPeriods) {
                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 font-medium rounded-full">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          None
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-3">All services covered immediately</p>
                    </>
                  );
                }
                return <p className="text-slate-700">{benefits.waitingPeriods}</p>;
              })()}
            </div>
          )}

          {/* Reference Card */}
          {(verification.referenceNumber || verification.repName || verification.callDuration) && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Call Reference</h3>
              <div className="space-y-3">
                {verification.referenceNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Reference #</span>
                    <span className="font-mono font-medium text-slate-900">{verification.referenceNumber}</span>
                  </div>
                )}
                {verification.repName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Representative</span>
                    <span className="font-medium text-slate-900">{verification.repName}</span>
                  </div>
                )}
                {verification.callDuration && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Call Duration</span>
                    <span className="font-medium text-slate-900">{verification.callDuration}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Verification
        </Link>
        <button className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Results
        </button>
      </div>
    </div>
  );
}
