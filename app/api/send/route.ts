import { NextRequest, NextResponse } from "next/server";
import { sendGmail } from "@/lib/gmail";
import { sendOutlook } from "@/lib/outlook";
import { loadTokens } from "@/lib/tokens";

interface EmailToSend {
  to: string;
  subject: string;
  body: string;
}

export async function POST(request: NextRequest) {
  const { emails, provider } = await request.json() as {
    emails: EmailToSend[];
    provider: "gmail" | "outlook";
  };

  if (!emails?.length) {
    return NextResponse.json({ error: "No emails provided" }, { status: 400 });
  }

  const tokens = loadTokens();
  const results: { to: string; status: "sent" | "failed"; error?: string }[] = [];

  for (const email of emails) {
    try {
      if (provider === "gmail") {
        if (!tokens.gmail) throw new Error("Gmail not connected");
        await sendGmail(email.to, email.subject, email.body, tokens.gmail);
      } else {
        if (!tokens.outlook) throw new Error("Outlook not connected");
        await sendOutlook(email.to, email.subject, email.body, tokens.outlook.access_token);
      }
      results.push({ to: email.to, status: "sent" });
    } catch (err) {
      results.push({
        to: email.to,
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ results });
}
