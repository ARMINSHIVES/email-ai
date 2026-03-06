import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateEmails, Recipient } from "@/lib/anthropic";
import { getSamplesText } from "@/lib/styleProfile";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const writingSamples = await getSamplesText(session.user.id);
  const emails = await generateEmails(recipients, summary, writingSamples);
  return NextResponse.json({ emails });
}
