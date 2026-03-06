"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Sample {
  id: string;
  name: string;
  addedAt: string;
  text: string;
}

interface AuthStatus {
  gmail: { connected: boolean; email?: string };
  outlook: { connected: boolean; email?: string };
}

function SetupContent() {
  const searchParams = useSearchParams();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [auth, setAuth] = useState<AuthStatus>({
    gmail: { connected: false },
    outlook: { connected: false },
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSamples();
    fetchAuthStatus();

    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected) setSuccessMsg(`${connected === "gmail" ? "Gmail" : "Outlook"} connected successfully!`);
    if (error) setUploadError(`Auth error: ${error.replace(/_/g, " ")}`);
  }, [searchParams]);

  async function fetchSamples() {
    const res = await fetch("/api/samples");
    const data = await res.json();
    setSamples(data.samples ?? []);
  }

  async function fetchAuthStatus() {
    const res = await fetch("/api/auth/status");
    const data = await res.json();
    setAuth(data);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/samples", { method: "POST", body: form });
    const data = await res.json();

    setUploading(false);
    if (res.ok) {
      setSamples((prev) => [...prev, data.sample]);
      setSuccessMsg("Sample uploaded!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      setUploadError(data.error ?? "Upload failed");
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(id: string) {
    await fetch("/api/samples", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSamples((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold mb-1">Setup</h1>
        <p className="text-gray-400 text-sm">Connect your email accounts and upload writing samples so EmailAI can match your style.</p>
      </div>

      {successMsg && (
        <div className="bg-green-900/40 border border-green-700 text-green-300 rounded-lg px-4 py-3 text-sm">
          {successMsg}
        </div>
      )}
      {uploadError && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          {uploadError}
        </div>
      )}

      {/* Email Accounts */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Email Accounts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Gmail</span>
              {auth.gmail.connected ? (
                <span className="text-xs bg-green-900/50 text-green-400 border border-green-800 px-2 py-0.5 rounded-full">Connected</span>
              ) : (
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">Not connected</span>
              )}
            </div>
            {auth.gmail.email && (
              <p className="text-sm text-gray-400">{auth.gmail.email}</p>
            )}
            <a
              href="/api/auth/gmail"
              className="mt-auto text-center text-sm py-2 px-4 rounded-md bg-blue-700 hover:bg-blue-600 text-white transition-colors"
            >
              {auth.gmail.connected ? "Reconnect Gmail" : "Connect Gmail"}
            </a>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Outlook</span>
              {auth.outlook.connected ? (
                <span className="text-xs bg-green-900/50 text-green-400 border border-green-800 px-2 py-0.5 rounded-full">Connected</span>
              ) : (
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">Not connected</span>
              )}
            </div>
            {auth.outlook.email && (
              <p className="text-sm text-gray-400">{auth.outlook.email}</p>
            )}
            <a
              href="/api/auth/outlook"
              className="mt-auto text-center text-sm py-2 px-4 rounded-md bg-blue-700 hover:bg-blue-600 text-white transition-colors"
            >
              {auth.outlook.connected ? "Reconnect Outlook" : "Connect Outlook"}
            </a>
          </div>
        </div>
      </section>

      {/* Writing Samples */}
      <section>
        <h2 className="text-lg font-semibold mb-1">Writing Samples</h2>
        <p className="text-gray-400 text-sm mb-4">
          Upload emails or other writing (.txt, .pdf, .docx) so AI can match your style. More samples = better results.
        </p>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-blue-600 rounded-lg p-8 cursor-pointer transition-colors gap-2 text-gray-400 hover:text-blue-400">
          <span className="text-3xl">📄</span>
          <span className="text-sm font-medium">
            {uploading ? "Uploading..." : "Click to upload a file (.txt, .pdf, .docx)"}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.pdf,.docx"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>

        {samples.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {samples.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-gray-500">
                    {s.text.length.toLocaleString()} chars &middot; Added {new Date(s.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors ml-4"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {samples.length === 0 && (
          <p className="mt-4 text-sm text-gray-600 text-center">No samples yet. Upload at least one for best results.</p>
        )}
      </section>

      <div className="pt-4 border-t border-gray-800">
        <a
          href="/compose"
          className="inline-block py-2.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors text-sm"
        >
          Continue to Compose →
        </a>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
      <SetupContent />
    </Suspense>
  );
}
