import { NextRequest, NextResponse } from "next/server";
import { extractText } from "@/lib/parseFile";
import { addSample, deleteSample, loadProfile } from "@/lib/styleProfile";

export async function GET() {
  const profile = loadProfile();
  return NextResponse.json({ samples: profile.samples });
}

export async function POST(request: NextRequest) {
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

  const sample = addSample(file.name, text);
  return NextResponse.json({ sample });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "No id provided" }, { status: 400 });
  }
  deleteSample(id);
  return NextResponse.json({ success: true });
}
