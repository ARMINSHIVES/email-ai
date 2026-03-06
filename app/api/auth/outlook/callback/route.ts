import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/outlook";
import { updateOutlookTokens } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/setup?error=outlook_no_code", request.url));
  }

  try {
    const result = await exchangeCode(code);
    const expiresAt = result?.expiresOn?.getTime() ?? Date.now() + 3600 * 1000;
    const email = result?.account?.username ?? "";

    updateOutlookTokens({
      access_token: result!.accessToken,
      expires_at: expiresAt,
      email,
    });
    return NextResponse.redirect(new URL("/setup?connected=outlook", request.url));
  } catch (err) {
    console.error("Outlook OAuth error:", err);
    return NextResponse.redirect(new URL("/setup?error=outlook_auth_failed", request.url));
  }
}
