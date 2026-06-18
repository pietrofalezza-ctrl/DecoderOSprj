import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getOnboardingStatus } from "@/lib/onboarding.functions";
import { OnboardingContext } from "./OnboardingContext";
import { OnboardingDialog } from "./OnboardingDialog";

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
