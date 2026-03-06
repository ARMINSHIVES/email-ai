import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getUserEmail } from "@/lib/gmail";
import { updateGmailTokens } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/setup?error=gmail_no_code", request.url));
  }

  try {
    const tokens = await exchangeCode(code);
    const email = await getUserEmail(tokens.access_token!);
    updateGmailTokens({
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
      expiry_date: tokens.expiry_date!,
      email,
    });
    return NextResponse.redirect(new URL("/setup?connected=gmail", request.url));
  } catch (err) {
    console.error("Gmail OAuth error:", err);
    return NextResponse.redirect(new URL("/setup?error=gmail_auth_failed", request.url));
  }
}
