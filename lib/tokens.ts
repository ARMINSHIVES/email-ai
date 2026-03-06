import { prisma } from "@/lib/db";

export async function getEmailTokens(userId: string) {
  const tokens = await prisma.emailToken.findMany({ where: { userId } });

  const result: {
    gmail?: { access_token: string; refresh_token: string; expiry_date: number; email?: string };
    outlook?: { access_token: string; refresh_token?: string; expires_at: number; email?: string };
  } = {};

  for (const t of tokens) {
    if (t.provider === "gmail") {
      result.gmail = {
        access_token: t.accessToken,
        refresh_token: t.refreshToken ?? "",
        expiry_date: Number(t.expiresAt),
        email: t.email ?? undefined,
      };
    } else if (t.provider === "outlook") {
      result.outlook = {
        access_token: t.accessToken,
        refresh_token: t.refreshToken ?? undefined,
        expires_at: Number(t.expiresAt),
        email: t.email ?? undefined,
      };
    }
  }

  return result;
}

export async function upsertEmailToken(
  userId: string,
  provider: "gmail" | "outlook",
  data: {
    accessToken: string;
    refreshToken?: string | null;
    expiresAt: bigint;
    email?: string | null;
  }
) {
  return prisma.emailToken.upsert({
    where: { userId_provider: { userId, provider } },
    create: { userId, provider, ...data },
    update: data,
  });
}
