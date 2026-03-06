"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Recipient {
  email: string;
  name: string;
  context?: string;
}

interface EmailDraft {
  recipient: Recipient;
  subject: string;
  body: string;
}

type SendStatus = "pending" | "sending" | "sent" | "failed";

interface EmailState extends EmailDraft {
  selected: boolean;
  status: SendStatus;
  error?: string;
}

export default function ReviewPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<EmailState[]>([]);
  const [provider, setProvider] = useState<"gmail" | "outlook">("gmail");
  const [sending, setSending] = useState(false);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("emailai_emails");
    const prov = sessionStorage.getItem("emailai_provider") as "gmail" | "outlook";
    if (!raw) {
      router.push("/compose");
      return;
    }
    const drafts: EmailDraft[] = JSON.parse(raw);
    setEmails(drafts.map((d) => ({ ...d, selected: true, status: "pending" })));
    if (prov) setProvider(prov);
  }, [router]);

  function updateEmail(index: number, field: keyof EmailDraft, value: string) {
    setEmails((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  }

  function toggleSelect(index: number) {
    setEmails((prev) =>
      prev.map((e, i) => (i === index ? { ...e, selected: !e.selected } : e))
    );
  }

  function toggleAll(checked: boolean) {
    setEmails((prev) => prev.map((e) => ({ ...e, selected: checked })));
  }

  const selectedEmails = emails.filter((e) => e.selected);
  const allSelected = emails.length > 0 && emails.every((e) => e.selected);

  async function handleSend() {
    if (!selectedEmails.length) return;
    setSending(true);

    // Mark selected as "sending"
    setEmails((prev) =>
      prev.map((e) => (e.selected ? { ...e, status: "sending" } : e))
    );

    const payload = selectedEmails.map((e) => ({
      to: e.recipient.email,
      subject: e.subject,
      body: e.body,
    }));

    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: payload, provider }),
    });

    const data = await res.json();
    setSending(false);

    if (res.ok && data.results) {
      const resultMap: Record<string, { status: "sent" | "failed"; error?: string }> = {};
      for (const r of data.results) {
        resultMap[r.to] = { status: r.status, error: r.error };
      }
      setEmails((prev) =>
        prev.map((e) => {
          const result = resultMap[e.recipient.email];
          if (!result) return e;
          return { ...e, status: result.status, error: result.error };
        })
      );
      setAllDone(true);
    }
  }

  if (emails.length === 0) {
    return <div className="text-gray-400">Loading emails...</div>;
  }

  const sentCount = emails.filter((e) => e.status === "sent").length;
  const failedCount = emails.filter((e) => e.status === "failed").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Review &amp; Send</h1>
          <p className="text-gray-400 text-sm">
            Edit any email below, select which to send, then click Send.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {selectedEmails.length} of {emails.length} selected
          </span>
          <button
            onClick={handleSend}
            disabled={sending || !selectedEmails.length}
            className="py-2 px-6 rounded-lg bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors text-sm"
          >
            {sending ? "Sending..." : `Send ${selectedEmails.length} Email${selectedEmails.length !== 1 ? "s" : ""} via ${provider === "gmail" ? "Gmail" : "Outlook"}`}
          </button>
        </div>
      </div>

      {allDone && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm flex gap-6">
          {sentCount > 0 && <span className="text-green-400">{sentCount} sent successfully</span>}
          {failedCount > 0 && <span className="text-red-400">{failedCount} failed</span>}
          <a href="/compose" className="text-blue-400 hover:text-blue-300 transition-colors ml-auto">
            Compose another batch →
          </a>
        </div>
      )}

      {/* Select all */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <input
          type="checkbox"
          id="select-all"
          checked={allSelected}
          onChange={(e) => toggleAll(e.target.checked)}
          className="accent-blue-600"
        />
        <label htmlFor="select-all">Select all</label>
      </div>

      {/* Email cards */}
      <div className="flex flex-col gap-6">
        {emails.map((email, index) => (
          <div
            key={index}
            className={`bg-gray-900 border rounded-xl p-6 flex flex-col gap-4 transition-colors ${
              email.status === "sent"
                ? "border-green-800"
                : email.status === "failed"
                ? "border-red-800"
                : email.selected
                ? "border-gray-700"
                : "border-gray-800 opacity-60"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={email.selected}
                  onChange={() => toggleSelect(index)}
                  className="accent-blue-600"
                  disabled={email.status === "sent"}
                />
                <div>
                  <p className="font-medium text-sm">
                    {email.recipient.name || email.recipient.email}
                  </p>
                  {email.recipient.name && (
                    <p className="text-xs text-gray-500">{email.recipient.email}</p>
                  )}
                </div>
              </div>
              <StatusBadge status={email.status} />
            </div>

            {email.error && (
              <p className="text-xs text-red-400 bg-red-900/20 rounded px-3 py-2">
                Error: {email.error}
              </p>
            )}

            {/* Subject */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Subject</label>
              <input
                type="text"
                value={email.subject}
                onChange={(e) => updateEmail(index, "subject", e.target.value)}
                disabled={email.status === "sent"}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
            </div>

            {/* Body */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Body</label>
              <textarea
                value={email.body}
                onChange={(e) => updateEmail(index, "body", e.target.value)}
                disabled={email.status === "sent"}
                rows={10}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500 resize-y disabled:opacity-60 font-mono"
              />
            </div>
          </div>
        ))}
      </div>

      {emails.length > 3 && (
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={sending || !selectedEmails.length}
            className="py-2 px-6 rounded-lg bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors text-sm"
          >
            {sending ? "Sending..." : `Send ${selectedEmails.length} Email${selectedEmails.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: SendStatus }) {
  const styles: Record<SendStatus, string> = {
    pending: "bg-gray-800 text-gray-400",
    sending: "bg-blue-900/50 text-blue-400 animate-pulse",
    sent: "bg-green-900/50 text-green-400",
    failed: "bg-red-900/50 text-red-400",
  };
  const labels: Record<SendStatus, string> = {
    pending: "Ready",
    sending: "Sending...",
    sent: "Sent",
    failed: "Failed",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border border-transparent ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
