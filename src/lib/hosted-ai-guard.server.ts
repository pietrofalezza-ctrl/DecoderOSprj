// Server-side guard for the managed "Lovable AI" provider.
// The hosted provider is OFF by default — the project owner must set
// ALLOW_HOSTED_LOVABLE_AI=true in project secrets to opt in. Otherwise
// every server function rejects provider="lovable", so no end-user can
// ever consume the owner's AI Gateway balance via this app.

export function assertHostedLovableAllowed(provider: string): void {
  if (provider !== "lovable") return;
  if (process.env.ALLOW_HOSTED_LOVABLE_AI !== "true") {
    throw new Error("hosted_lovable_ai_disabled");
  }
  if (!process.env.LOVABLE_API_KEY) {
    throw new Error("lovable_ai_not_configured");
  }
}
