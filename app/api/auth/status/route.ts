import { NextResponse } from "next/server";
import { loadTokens } from "@/lib/tokens";

export async function GET() {
  const tokens = loadTokens();
  return NextResponse.json({
    gmail: tokens.gmail ? { connected: true, email: tokens.gmail.email } : { connected: false },
    outlook: tokens.outlook ? { connected: true, email: tokens.outlook.email } : { connected: false },
  });
}
