import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

export function RouterPendingIndicator() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isPending = useRouterState({
    select: (s) => s.status === "pending" || s.isLoading,
  });

  if (!mounted || !isPending) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-0.5 overflow-hidden"
    >
      <div className="h-full w-1/3 animate-[pending-bar_1.1s_ease-in-out_infinite] bg-primary/70" />
      <style>{`
        @keyframes pending-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}

export function RouterPendingFallback() {
  return null;
}
