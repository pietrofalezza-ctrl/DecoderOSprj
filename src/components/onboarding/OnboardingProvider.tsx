import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getOnboardingStatus } from "@/lib/onboarding.functions";
import { OnboardingDialog } from "./OnboardingDialog";

type Ctx = {
  open: boolean;
  openOnboarding: () => void;
  completed: boolean;
  record: { acceptedAt: string; version: string; language: string } | null;
  currentVersion?: string;
};

const OnboardingContext = createContext<Ctx | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be inside OnboardingProvider");
  return ctx;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const fetchStatus = useServerFn(getOnboardingStatus);
  const q = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () => fetchStatus(),
    staleTime: 60_000,
  });

  const [open, setOpen] = useState(false);
  const autoPrompted = useRef(false);

  useEffect(() => {
    if (!q.data || autoPrompted.current) return;
    if (!q.data.completed) {
      autoPrompted.current = true;
      setOpen(true);
    }
  }, [q.data]);

  const openOnboarding = useCallback(() => setOpen(true), []);

  return (
    <OnboardingContext.Provider
      value={{
        open,
        openOnboarding,
        completed: q.data?.completed ?? false,
        record: q.data?.record ?? null,
        currentVersion: q.data?.currentVersion,
      }}
    >
      {children}
      <OnboardingDialog open={open} onOpenChange={setOpen} />
    </OnboardingContext.Provider>
  );
}
