import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/outlook";

export async function GET() {
  const url = await getAuthUrl();
  return NextResponse.redirect(url);
}
