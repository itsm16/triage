"use client";

import { useState } from "react"
import { useRouter } from "next/navigation"

import { AuthButtons } from "~/components/auth-buttons"
import { authClient } from "~/server/better-auth/client"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const { error: err } = await authClient.signIn.email({ email, password })
    if (err) {
      setError(err.message ?? err.statusText ?? "Something went wrong")
    } else {
      router.replace("/dashboard")
    }
  }


  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-[32px] font-semibold leading-10 tracking-tight text-[#e3e2e7]">
          Sign in to Triage
        </h1>
        <p className="text-[#c3c5d9]">Connect your Google account to get started</p>
      </div>

      {/* Email/password sign-in - hidden for now
      <form onSubmit={handleEmailSignIn} className="mb-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block font-mono text-xs font-medium uppercase tracking-[0.05em] text-[#c3c5d9]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#434656] bg-[#1a1b1f] px-4 py-3 text-sm text-[#e3e2e7] outline-none focus:border-[#0055ff] focus:ring-1 focus:ring-[#0055ff]"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block font-mono text-xs font-medium uppercase tracking-[0.05em] text-[#c3c5d9]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#434656] bg-[#1a1b1f] px-4 py-3 text-sm text-[#e3e2e7] outline-none focus:border-[#0055ff] focus:ring-1 focus:ring-[#0055ff]"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-[#0055ff] px-6 py-3 text-sm font-bold text-[#e3e6ff] transition-opacity hover:opacity-90"
        >
          Sign in with email
        </button>
      </form>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#434656]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#121317] px-2 text-[#c3c5d9]">or</span>
        </div>
      </div>
      */}

      <AuthButtons session={null} />
    </div>
  )
}
