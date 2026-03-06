import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { exchangeCode, getUserEmail } from "@/lib/gmail";
import { upsertEmailToken } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/setup?error=gmail_no_code", request.url));
  }

  try {
    const tokens = await exchangeCode(code);
    const email = await getUserEmail(tokens.access_token!);
    await upsertEmailToken(session.user.id, "gmail", {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token,
      expiresAt: BigInt(tokens.expiry_date ?? Date.now() + 3600 * 1000),
      email,
    });
    return NextResponse.redirect(new URL("/setup?connected=gmail", request.url));
  } catch (err) {
    console.error("Gmail OAuth error:", err);
    return NextResponse.redirect(new URL("/setup?error=gmail_auth_failed", request.url));
  }
}
