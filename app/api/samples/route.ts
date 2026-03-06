import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { extractText } from "@/lib/parseFile";
import { addSample, deleteSample, getSamples } from "@/lib/styleProfile";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const samples = await getSamples(session.user.id);
  return NextResponse.json({ samples });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await extractText(buffer, file.type, file.name);

  if (!text.trim()) {
    return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });
  }

  const sample = await addSample(session.user.id, file.name, text);
  return NextResponse.json({ sample });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "No id provided" }, { status: 400 });
  }
  await deleteSample(session.user.id, id);
  return NextResponse.json({ success: true });
}
