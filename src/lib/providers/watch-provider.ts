// Streaming availability must come from a licensed source. Until one is wired
// in, the UI shows a "not available yet" state instead of guessing.
export type Availability = { provider: string; type: "subscription" | "rent" | "buy"; url?: string };

export interface WatchProvider {
  readonly name: string;
  getAvailability(titleId: string, country: string): Promise<Availability[]>;
}
