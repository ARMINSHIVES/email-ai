import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { exchangeCode } from "@/lib/outlook";
import { upsertEmailToken } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/setup?error=outlook_no_code", request.url));
  }

  try {
    const result = await exchangeCode(code);
    const expiresAt = BigInt(result?.expiresOn?.getTime() ?? Date.now() + 3600 * 1000);
    const email = result?.account?.username ?? "";
    await upsertEmailToken(session.user.id, "outlook", {
      accessToken: result!.accessToken,
      expiresAt,
      email,
    });
    return NextResponse.redirect(new URL("/setup?connected=outlook", request.url));
  } catch (err) {
    console.error("Outlook OAuth error:", err);
    return NextResponse.redirect(new URL("/setup?error=outlook_auth_failed", request.url));
  }
}
