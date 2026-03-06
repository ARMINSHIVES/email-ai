import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getEmailTokens } from "@/lib/tokens";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { gmail: { connected: false }, outlook: { connected: false } }
    );
  }

  const tokens = await getEmailTokens(session.user.id);
  return NextResponse.json({
    gmail: tokens.gmail
      ? { connected: true, email: tokens.gmail.email }
      : { connected: false },
    outlook: tokens.outlook
      ? { connected: true, email: tokens.outlook.email }
      : { connected: false },
  });
}
