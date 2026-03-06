"use client";

import { useSession, signOut } from "next-auth/react";

export function AuthNav() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="ml-auto flex items-center gap-4 text-sm">
      <span className="text-gray-500">{session.user?.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-gray-400 hover:text-white transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
