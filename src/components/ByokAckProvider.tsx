import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getCurrentByokAck } from "@/lib/byok-acknowledgement.functions";
import { BYOK_ACK_ERROR } from "@/lib/byok-acknowledgement";
import { ByokAcknowledgementDialog } from "./ByokAcknowledgementDialog";
import { ByokAckContext } from "./ByokAckContext";

export function ByokAckProvider({ children }: { children: React.ReactNode }) {
  const fetchAck = useServerFn(getCurrentByokAck);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["byok-ack"],
    queryFn: () => fetchAck(),
    staleTime: 60_000,
  });

  const [open, setOpen] = useState(false);
  const pendingCallback = useRef<(() => void | Promise<void>) | undefined>(undefined);
  const autoPrompted = useRef(false);

  // Auto-open once on first load if user has not yet accepted the current
  // terms version. They can dismiss; gated server fns still 403 until accepted.
  useEffect(() => {
    if (!q.data || autoPrompted.current) return;
    if (!q.data.accepted) {
      autoPrompted.current = true;
      setOpen(true);
    }
  }, [q.data]);

  // Global listener: any thrown error containing the ack code re-opens the
  // dialog. Covers server-side enforcement when a callsite forgot to gate.
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg = (event.reason && (event.reason.message || String(event.reason))) || "";
      if (typeof msg === "string" && msg.includes(BYOK_ACK_ERROR)) {
        qc.invalidateQueries({ queryKey: ["byok-ack"] });
        setOpen(true);
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, [qc]);

  const openDialog = useCallback((cb?: () => void | Promise<void>) => {
    pendingCallback.current = cb;
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((v: boolean) => {
    setOpen(v);
    if (!v) pendingCallback.current = undefined;
  }, []);

  const handleAccepted = useCallback(async () => {
    const cb = pendingCallback.current;
    pendingCallback.current = undefined;
    if (cb) await cb();
  }, []);

  return (
    <ByokAckContext.Provider value={{ open: openDialog }}>
      {children}
      <ByokAcknowledgementDialog
        open={open}
        onOpenChange={handleOpenChange}
        onAccepted={handleAccepted}
      />
    </ByokAckContext.Provider>
  );
}
