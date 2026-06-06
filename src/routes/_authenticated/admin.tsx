import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { isAdmin, listUsers, setUserRole } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    // Client-only — _authenticated has ssr:false
    const r = await isAdmin();
    if (!r.admin) throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

function AdminPage() {
  const { t } = useTranslation();
  const list = useServerFn(listUsers);
  const set = useServerFn(setUserRole);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["admin", "users"], queryFn: () => list() });

  const setMut = useMutation({
    mutationFn: (vars: { user_id: string; role: "admin"; grant: boolean }) =>
      set({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    onError: (e: any) => toast.error(e?.message ?? t("errors.generic")),
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">{t("admin.title")}</h1>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">{t("admin.intro")}</p>

        <div className="rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">{t("admin.email")}</th>
                <th className="px-3 py-2 text-left">{t("admin.roles")}</th>
                <th className="px-3 py-2 text-right">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {q.data?.users.map((u) => {
                const isA = u.roles.includes("admin");
                return (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-mono">{u.email || u.id}</td>
                    <td className="px-3 py-2">{u.roles.join(", ")}</td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant={isA ? "outline" : "default"}
                        disabled={setMut.isPending}
                        onClick={() =>
                          setMut.mutate({ user_id: u.id, role: "admin", grant: !isA })
                        }
                      >
                        {isA ? t("admin.demote") : t("admin.promote")}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
