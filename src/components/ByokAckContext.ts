import { createContext } from "react";

export type ByokAckContextValue = {
  open: (onAccepted?: () => void | Promise<void>) => void;
};

export const ByokAckContext = createContext<ByokAckContextValue | null>(null);
