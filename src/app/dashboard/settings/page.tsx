"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface PracticeData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax: string;
  npiPractice: string;
  npiIndividual: string;
  taxId: string;
}

const emptyPractice: PracticeData = {
  name: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  fax: "",
  npiPractice: "",
  npiIndividual: "",
  taxId: "",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [practice, setPractice] = useState<PracticeData>(emptyPractice);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchPractice() {
      try {
        const res = await fetch("/api/practice");
        if (res.ok) {
          const data = await res.json();
          setPractice({
            name: data.name || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            zip: data.zip || "",
            phone: data.phone || "",
            fax: data.fax || "",
            npiPractice: data.npiPractice || "",
            npiIndividual: data.npiIndividual || "",
            taxId: data.taxId || "",
          });
        }
      } catch {
        // ignore fetch errors
      } finally {
        setLoading(false);
      }
    }
    fetchPractice();
  }, []);

  if (session?.user?.role !== "admin") {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings</h1>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-slate-600">Access denied. Only admins can manage practice settings.</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/practice", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(practice),
      });

      if (res.ok) {
        setMessage("Settings saved successfully.");
      } else {
        setMessage("Failed to save settings.");
      }
    } catch {
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof PracticeData, value: string) {
    setPractice((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Practice Settings</h1>
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Practice Settings</h1>
        <p className="text-slate-600 mt-1">Manage your practice information</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes("successfully")
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Practice Name */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">General</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Practice Name
              </label>
              <input
                type="text"
                id="name"
                value={practice.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
              />
            </div>
          </div>

          {/* Address */}
          <div className="pt-6 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Address</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={practice.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={practice.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={practice.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-slate-700 mb-1.5">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zip"
                    value={practice.zip}
                    onChange={(e) => handleChange("zip", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="pt-6 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  value={practice.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="fax" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fax
                </label>
                <input
                  type="text"
                  id="fax"
                  value={practice.fax}
                  onChange={(e) => handleChange("fax", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Identifiers */}
          <div className="pt-6 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Identifiers</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="npiPractice" className="block text-sm font-medium text-slate-700 mb-1.5">
                  NPI (Practice)
                </label>
                <input
                  type="text"
                  id="npiPractice"
                  value={practice.npiPractice}
                  onChange={(e) => handleChange("npiPractice", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="npiIndividual" className="block text-sm font-medium text-slate-700 mb-1.5">
                  NPI (Individual)
                </label>
                <input
                  type="text"
                  id="npiIndividual"
                  value={practice.npiIndividual}
                  onChange={(e) => handleChange("npiIndividual", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="taxId" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tax ID
                </label>
                <input
                  type="text"
                  id="taxId"
                  value={practice.taxId}
                  onChange={(e) => handleChange("taxId", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
