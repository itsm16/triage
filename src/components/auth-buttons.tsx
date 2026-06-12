"use client";

import { authClient } from "~/server/better-auth/client";

export function AuthButtons({ session }: { session: { user: { name?: string | null } } | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {session && <span>Logged in as {session.user?.name}</span>}
      </p>
        <button
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
          onClick={async () =>{
            await authClient.signIn.social({
              provider: "google",
              callbackURL: "/dashboard",
            })
          }}
        >
          Sign in with Google
        </button>
    </div>
  );
}
