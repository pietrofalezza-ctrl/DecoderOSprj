import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthLayout,
});

function AuthLayout() {
  // Re-render on sign-out: the root onAuthStateChange invalidates the router.
  const [_, setTick] = useState(0);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => setTick((t) => t + 1));
    return () => sub.subscription.unsubscribe();
  }, []);
  return <Outlet />;
}
