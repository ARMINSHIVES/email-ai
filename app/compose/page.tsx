"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Recipient {
  email: string;
  name: string;
  context: string;
}

function parseRecipients(raw: string): Recipient[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Support: "Name <email>", "email", or "Name, email, context" (CSV-like)
      const angleBracket = line.match(/^(.+?)\s*<([^>]+)>/);
      if (angleBracket) {
        return { name: angleBracket[1].trim(), email: angleBracket[2].trim(), context: "" };
      }
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        return { name: parts[0], email: parts[1], context: parts[2] ?? "" };
      }
      return { name: "", email: line, context: "" };
    });
}

export default function ComposePage() {
  const router = useRouter();
  const [recipientText, setRecipientText] = useState("");
  const [summary, setSummary] = useState("");
  const [provider, setProvider] = useState<"gmail" | "outlook">("gmail");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    // Skip header row if it contains "email" keyword
    const lines = text.split("\n");
    const firstLine = lines[0].toLowerCase();
    const start = firstLine.includes("email") ? 1 : 0;
    setRecipientText(lines.slice(start).filter(Boolean).join("\n"));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleGenerate() {
    setError("");
    const recipients = parseRecipients(recipientText);
    if (!recipients.length) {
      setError("Please enter at least one recipient.");
      return;
    }
    if (!summary.trim()) {
      setError("Please enter a summary of the email.");
      return;
    }

    setGenerating(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipients, summary }),
    });

    const data = await res.json();
    setGenerating(false);

    if (!res.ok) {
      setError(data.error ?? "Generation failed");
      return;
    }

    sessionStorage.setItem("emailai_emails", JSON.stringify(data.emails));
    sessionStorage.setItem("emailai_provider", provider);
    router.push("/review");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Compose</h1>
        <p className="text-gray-400 text-sm">Enter your recipients and what you want to say. Claude will write individualized emails in your voice.</p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Recipients */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Recipients</label>
          <label className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
            Import CSV
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          </label>
        </div>
        <textarea
          value={recipientText}
          onChange={(e) => setRecipientText(e.target.value)}
          placeholder={`One per line. Formats supported:\nemail@example.com\nJohn Doe <john@example.com>\nJohn Doe, john@example.com, context about John`}
          rows={6}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          CSV format: <code>name, email, optional context</code> (one per line)
        </p>
      </section>

      {/* Summary */}
      <section>
        <label className="text-sm font-medium block mb-2">What should the emails say?</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summarize the purpose and key points of the email. E.g. 'Follow up on our meeting last Tuesday, thank them for their time, and ask if they have questions about the proposal.'"
          rows={4}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
        />
      </section>

      {/* Provider */}
      <section>
        <label className="text-sm font-medium block mb-2">Send via</label>
        <div className="flex gap-3">
          {(["gmail", "outlook"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                provider === p
                  ? "bg-blue-700 border-blue-600 text-white"
                  : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
              }`}
            >
              {p === "gmail" ? "Gmail" : "Outlook"}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="self-start py-2.5 px-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-600 text-white font-medium transition-colors text-sm"
      >
        {generating ? "Generating emails..." : "Generate Emails →"}
      </button>
    </div>
  );
}
