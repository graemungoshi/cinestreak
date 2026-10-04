"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-zinc-400">Some information may be temporarily unavailable.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-amber-400 px-5 py-2 font-semibold text-zinc-950">Try again</button>
    </div>
  );
}
