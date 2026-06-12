import { DropletField } from "~/components/droplet-field"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="relative hidden overflow-hidden md:block">
        <DropletField />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#0055ff]">
              <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-2xl font-bold text-white">Triage</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold leading-tight text-white">
            Your inbox.<br />Under command.
          </h2>
          <p className="max-w-md text-lg text-[#c3c5d9]">
            The first AI-native control system for professionals who live in their inbox and calendar.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-[#121317] px-4">
        {children}
      </div>
    </div>
  )
}
