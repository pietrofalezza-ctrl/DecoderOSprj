import { createContext, useContext } from "react";

export type OnboardingContextValue = {
  open: boolean;
  openOnboarding: () => void;
  completed: boolean;
  record: { acceptedAt: string; version: string; language: string } | null;
  currentVersion?: string;
};

export const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be inside OnboardingProvider");
  return ctx;
}
