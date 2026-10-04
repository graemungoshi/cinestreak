export function runtimeText(min?: number): string | undefined {
  if (!min || min <= 0) return undefined;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function isoDuration(min?: number): string | undefined {
  return min && min > 0 ? `PT${Math.floor(min / 60)}H${min % 60}M` : undefined;
}
