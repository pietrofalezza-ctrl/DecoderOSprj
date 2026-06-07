import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // Use cached session (reads from localStorage) instead of getUser() which
    // does a network round-trip on every navigation. The root-level
    // onAuthStateChange listener invalidates the router on sign-in/out, so
    // the cached session stays accurate.
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }
    return { user: data.session.user };
  },
  component: () => <Outlet />,
});
