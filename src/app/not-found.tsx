import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-3xl font-black">We couldn’t find that page</h1>
      <p className="mt-2 text-zinc-400">Try another search, or see what is airing today.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-amber-400 px-5 py-2 font-semibold text-zinc-950">Go home</Link>
    </div>
  );
}
