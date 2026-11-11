import { useState } from 'react'

type LockScreenProps = {
  onLogin: () => void
}

function LockScreen({ onLogin }: LockScreenProps) {
  const [password, setPassword] = useState('')

  function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password.trim() === '') return

    onLogin()
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#29252d_0%,#674567_55%,#f18a54_100%)] text-white">
      <div className="absolute top-16 text-center">
        <p className="text-xl font-medium">Saturday, November 7</p>
        <h1 className="text-8xl font-semibold tracking-tight">
          09:41
        </h1>
      </div>

      <div className="mt-28 flex flex-col items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-3xl font-bold backdrop-blur-md">
          A
        </div>

        <h2 className="text-2xl font-semibold">ALOC</h2>

        <form onSubmit={handleLogin} className="flex gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-white placeholder:text-white/70 outline-none backdrop-blur-md"
          />

          <button
            type="submit"
            className="rounded-lg bg-white/20 px-4 py-2 hover:bg-white/30"
          >
            →
          </button>
        </form>
      </div>
    </main>
  )
}

export default LockScreen
