import { NextRequest, NextResponse } from "next/server";
import { generateEmails, Recipient } from "@/lib/anthropic";
import { getSamplesText } from "@/lib/styleProfile";

export async function POST(request: NextRequest) {
  const { recipients, summary } = await request.json() as {
    recipients: Recipient[];
    summary: string;
  };

  if (!recipients?.length) {
    return NextResponse.json({ error: "No recipients provided" }, { status: 400 });
  }
  if (!summary?.trim()) {
    return NextResponse.json({ error: "No summary provided" }, { status: 400 });
  }

  const writingSamples = getSamplesText();
  const emails = await generateEmails(recipients, summary, writingSamples);
  return NextResponse.json({ emails });
}
