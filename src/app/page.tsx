"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    practiceName: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        practiceName: "",
        message: "",
      });
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">DentalHold</span>
          </div>
          <a
            href="#early-access"
            className="hidden sm:inline-flex items-center px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors"
          >
            Get Early Access
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 text-sm font-medium rounded-full mb-6">
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                Now in Early Access
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Stop Losing 30 Minutes to Insurance{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-cyan-500">
                  Hold Music
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                AI that calls insurers and verifies benefits while your team gets back to work.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#early-access"
                  className="inline-flex items-center justify-center px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/25"
                >
                  Get Early Access
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* Demo Video Placeholder */}
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                    <svg className="w-8 h-8 text-sky-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="mt-4 text-slate-500 font-medium">Watch Demo Video</p>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              {/* Floating accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-2xl -z-10 opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 px-6 border-y border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-slate-500 text-sm font-medium mb-6">BUILT FOR MODERN DENTAL PRACTICES</p>
          <div className="flex flex-wrap justify-center gap-8 items-center text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium">Real-time Results</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-medium">PMS Integration</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Insurance Verification is Broken
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Your front desk team deserves better than endless hold times and repetitive calls.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Hours Lost on Hold</h3>
              <p className="text-slate-600">
                Your front desk spends hours on hold every day. That&apos;s valuable time not spent helping patients or managing your practice.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Schedules Slip, Staff Burns Out</h3>
              <p className="text-slate-600">
                Patients wait, appointments get delayed, and your team experiences burnout from the monotonous, frustrating process.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Portals Don&apos;t Cover Everything</h3>
              <p className="text-slate-600">
                Even with online portals, many verifications still require a phone call. Some insurers make it intentionally difficult.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Let AI Handle the Hold Time
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              DentalHold does the tedious work so your team can focus on patient care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Makes the Call</h3>
              <p className="text-slate-600 leading-relaxed">
                Our AI calls the insurance company for you. It navigates phone trees, waits on hold, and speaks with representatives.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Complete Information</h3>
              <p className="text-slate-600 leading-relaxed">
                Captures everything: eligibility, coverage details, deductibles, frequencies, waiting periods, and reference numbers.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Delivered Your Way</h3>
              <p className="text-slate-600 leading-relaxed">
                Results delivered via text, email, or synced directly to your practice management software. Your choice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to freedom from hold music.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line (hidden on mobile) */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-sky-200 via-sky-400 to-sky-200"></div>

            <div className="relative text-center">
              <div className="w-16 h-16 bg-sky-500 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Submit Patient Info</h3>
              <p className="text-slate-600">
                Enter patient details and insurance information through our simple interface or your practice software.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 bg-sky-500 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Makes the Call</h3>
              <p className="text-slate-600">
                Our AI calls the insurance company, waits on hold, and gathers all the verification details you need.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 bg-sky-500 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Get Your Results</h3>
              <p className="text-slate-600">
                Receive complete verification results without your team ever picking up the phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">30+</div>
              <div className="text-slate-400">Minutes Saved Per Call</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">100%</div>
              <div className="text-slate-400">Hands-Free Verification</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-slate-400">Available When You Need It</div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section id="early-access" className="py-20 px-6 bg-gradient-to-b from-white to-sky-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-700 text-sm font-medium rounded-full mb-6">
            <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
            Limited Early Access
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ready to Reclaim Your Time?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join the waitlist for early access. Be among the first dental practices to eliminate insurance hold times forever.
          </p>

          {status === "success" ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Thanks! We&apos;ll be in touch soon.</h3>
              <p className="text-green-700">You&apos;re on the waitlist for early access to DentalHold.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto text-left">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Work email *"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  />
                </div>
                <input
                  type="text"
                  name="practiceName"
                  value={formData.practiceName}
                  onChange={handleChange}
                  placeholder="Practice name"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Anything you'd like us to know? (optional)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                />
                {status === "error" && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    {errorMessage}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Get Early Access"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">DentalHold</span>
            </div>
            <p className="text-slate-400 text-sm">
              &copy; 2025 DentalHold. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
