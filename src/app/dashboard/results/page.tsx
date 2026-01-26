"use client";

import { useState } from "react";
import Link from "next/link";

const transcript = [
  { time: "0:00", speaker: "Sarah", text: "Hi, this is Sarah from Triangle Family Dentistry. This call may be recorded. I'm calling to verify benefits for a patient." },
  { time: "0:05", speaker: "Rep", text: "Thank you for calling Delta Dental, this is Maria. Can I get your NPI?" },
  { time: "0:08", speaker: "Sarah", text: "Sure, it's 1234567890." },
  { time: "0:12", speaker: "Rep", text: "Got it. And the patient's name?" },
  { time: "0:14", speaker: "Sarah", text: "John Smith, date of birth March 15, 1985." },
  { time: "0:20", speaker: "Rep", text: "Member ID?" },
  { time: "0:22", speaker: "Sarah", text: "DSM123456789." },
  { time: "0:30", speaker: "Rep", text: "One moment... Okay I have John Smith pulled up. What do you need?" },
  { time: "0:35", speaker: "Sarah", text: "Is the patient currently eligible?" },
  { time: "0:38", speaker: "Rep", text: "Yes, he's active. Effective January 1, 2024." },
  { time: "0:42", speaker: "Sarah", text: "What's the annual maximum and how much remains?" },
  { time: "0:46", speaker: "Rep", text: "Annual max is $1,500. He's used $350, so $1,150 remaining." },
  { time: "0:52", speaker: "Sarah", text: "And the deductible?" },
  { time: "0:54", speaker: "Rep", text: "$50 deductible. It's been met." },
  { time: "0:58", speaker: "Sarah", text: "What's the coverage for preventive, basic, and major?" },
  { time: "1:02", speaker: "Rep", text: "Preventive is 100%, basic is 80%, major is 50%." },
  { time: "1:08", speaker: "Sarah", text: "How often are cleanings and x-rays covered?" },
  { time: "1:12", speaker: "Rep", text: "Cleanings twice per year. Bitewings once every 12 months. Pano every 5 years." },
  { time: "1:20", speaker: "Sarah", text: "Is there a waiting period for any services?" },
  { time: "1:24", speaker: "Rep", text: "No waiting periods." },
  { time: "1:26", speaker: "Sarah", text: "Is there a missing tooth clause?" },
  { time: "1:28", speaker: "Rep", text: "Yes, there is." },
  { time: "1:32", speaker: "Sarah", text: "Can I get a reference number for this call?" },
  { time: "1:35", speaker: "Rep", text: "Reference number is DLT20250123." },
  { time: "1:38", speaker: "Sarah", text: "And your name?" },
  { time: "1:40", speaker: "Rep", text: "Maria Thompson." },
  { time: "1:42", speaker: "Sarah", text: "Thank you, have a great day." },
  { time: "1:44", speaker: "Rep", text: "You too, bye." },
];

export default function VerificationResults() {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="max-w-4xl">
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

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Verification Results</h1>
            <p className="text-slate-600 mt-1">Completed on January 24, 2025 at 9:15 AM</p>
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
              <span className="text-xl font-bold">SJ</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Sarah Johnson</h2>
              <p className="text-sky-100">DOB: 05/12/1985 | Member ID: DLT789456123</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sky-100 text-sm">Insurance Carrier</p>
            <p className="text-lg font-semibold">Delta Dental PPO</p>
          </div>
        </div>
      </div>

      {/* Call Recording Section */}
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
              <p className="text-sm text-slate-500">Duration: 1 min 44 sec</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>

        {/* Audio Player Placeholder */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0">
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="h-2 bg-slate-200 rounded-full">
                <div className="h-2 bg-sky-500 rounded-full w-0"></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-slate-500">
                <span>0:00</span>
                <span>1:44</span>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0" />
              </svg>
            </button>
          </div>
        </div>

        {/* Transcript Toggle */}
        <div className="mt-4">
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

          {/* Transcript Content */}
          {showTranscript && (
            <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-600">Call Transcript</p>
              </div>
              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {transcript.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${entry.speaker === "Sarah" ? "" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        entry.speaker === "Sarah"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {entry.speaker === "Sarah" ? "AI" : "Rep"}
                    </div>
                    <div
                      className={`flex-1 max-w-[80%] ${entry.speaker === "Sarah" ? "" : "text-right"}`}
                    >
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl ${
                          entry.speaker === "Sarah"
                            ? "bg-sky-500 text-white rounded-tl-sm"
                            : "bg-slate-100 text-slate-800 rounded-tr-sm"
                        }`}
                      >
                        <p className="text-sm">{entry.text}</p>
                      </div>
                      <p className={`text-xs text-slate-400 mt-1 ${entry.speaker === "Sarah" ? "" : "text-right"}`}>
                        {entry.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Eligibility Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Eligibility Status</h3>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-lg font-semibold rounded-full">
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Active
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Effective Date</span>
              <span className="font-medium text-slate-900">01/01/2024</span>
            </div>
          </div>
        </div>

        {/* Benefits Summary Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Annual Maximum</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">$1,500</span>
            <span className="text-slate-500 mb-1">/ year</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Remaining</span>
              <span className="font-medium text-green-600">$1,150</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "77%" }}></div>
            </div>
          </div>
        </div>

        {/* Deductible Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Deductible</h3>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-slate-900">$50</span>
            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              Met
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Applied to</span>
              <span className="font-medium text-slate-900">Basic & Major only</span>
            </div>
          </div>
        </div>

        {/* Coverage Breakdown Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Coverage Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Preventive</span>
              <span className="text-lg font-semibold text-slate-900">100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Basic</span>
              <span className="text-lg font-semibold text-slate-900">80%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Major</span>
              <span className="text-lg font-semibold text-slate-900">50%</span>
            </div>
          </div>
        </div>

        {/* Frequencies Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 col-span-2">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Frequencies & Limitations</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Prophylaxis (D1110)</p>
              <p className="font-semibold text-slate-900">2x per year</p>
              <p className="text-xs text-slate-500 mt-1">Last: 07/15/2024</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Bitewing X-rays (D0274)</p>
              <p className="font-semibold text-slate-900">1x per 12 months</p>
              <p className="text-xs text-slate-500 mt-1">Last: 07/15/2024</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Panoramic X-ray (D0330)</p>
              <p className="font-semibold text-slate-900">1x per 5 years</p>
              <p className="text-xs text-slate-500 mt-1">Last: 01/20/2022</p>
            </div>
          </div>
        </div>

        {/* Waiting Periods Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Waiting Periods</h3>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 font-medium rounded-full">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              None
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-3">All services covered immediately with no waiting period</p>
        </div>

        {/* Reference Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">Call Reference</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Reference #</span>
              <span className="font-mono font-medium text-slate-900">REF-2025012409151847</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Representative</span>
              <span className="font-medium text-slate-900">Maria (ID: 4521)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Call Duration</span>
              <span className="font-medium text-slate-900">1 min 44 sec</span>
            </div>
          </div>
        </div>
      </div>

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
