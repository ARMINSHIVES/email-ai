import { prisma } from "@/lib/db";

export async function getSamples(userId: string) {
  return prisma.styleSample.findMany({
    where: { userId },
    orderBy: { addedAt: "asc" },
  });
}

export async function addSample(userId: string, name: string, text: string) {
  return prisma.styleSample.create({
    data: { userId, name, text },
  });
}

export async function deleteSample(userId: string, id: string) {
  await prisma.styleSample.deleteMany({
    where: { id, userId },
  });
}

export async function getSamplesText(userId: string): Promise<string> {
  const samples = await prisma.styleSample.findMany({
    where: { userId },
    select: { text: true },
    orderBy: { addedAt: "asc" },
  });
  return samples.map((s) => s.text).join("\n\n---\n\n");
}
