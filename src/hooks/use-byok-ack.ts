import { useCallback, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getCurrentByokAck } from "@/lib/byok-acknowledgement.functions";
import { ByokAckContext } from "@/components/ByokAckContext";

export function useByokAck() {
  const fetchAck = useServerFn(getCurrentByokAck);
  const ctx = useContext(ByokAckContext);
  const q = useQuery({
    queryKey: ["byok-ack"],
    queryFn: () => fetchAck(),
    staleTime: 60_000,
  });

  const accepted = q.data?.accepted ?? false;

  const requireAck = useCallback(
    (onAccepted: () => void | Promise<void>) => {
      if (accepted) return Promise.resolve(onAccepted());
      ctx?.open(onAccepted);
      return Promise.resolve();
    },
    [accepted, ctx],
  );

  return {
    accepted,
    isLoading: q.isLoading,
    record: q.data?.record ?? null,
    currentVersion: q.data?.currentVersion,
    requireAck,
    openAck: (onAccepted?: () => void | Promise<void>) => ctx?.open(onAccepted),
  };
}
