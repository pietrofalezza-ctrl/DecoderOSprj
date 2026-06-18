import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";

const mockOpenAck = vi.fn();

const mockUseQuery = vi.fn();
const mockUseServerFn = vi.fn();
type ByokAckContextValue = { open: () => void };

// eslint-disable-next-line no-var
var ByokAckContext: React.Context<ByokAckContextValue | null>;

vi.mock("@/components/ByokAckContext", () => {
  // Create the context from scratch inside the mock factory since it runs at import time
  ByokAckContext = React.createContext<ByokAckContextValue | null>(null);
  return { ByokAckContext };
});

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock("@tanstack/react-start", () => ({
  useServerFn: (fn: unknown) => mockUseServerFn(fn),
  createServerFn: () => vi.fn(),
}));

vi.mock("@/lib/byok-acknowledgement.functions", () => ({
  getCurrentByokAck: { __brand: "serverFn" },
  recordByokAck: { __brand: "serverFn" },
  listByokAckHistory: { __brand: "serverFn" },
}));

import { useByokAck } from "../../hooks/use-byok-ack";

function Wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(ByokAckContext!.Provider, { value: { open: mockOpenAck } }, children);
}

describe("useByokAck", () => {
  beforeAll(() => {
    if (!ByokAckContext) throw new Error("Context not initialized by mock");
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: {
        accepted: true,
        currentVersion: "1.0.0",
        record: { acceptedAt: "2025-01-01", version: "1.0.0", language: "en" },
      },
      isLoading: false,
    });
  });

  it("returns accepted=true when query returns accepted", () => {
    const { result } = renderHook(() => useByokAck(), { wrapper: Wrapper });
    expect(result.current.accepted).toBe(true);
  });

  it("returns accepted=false when query returns not accepted", () => {
    mockUseQuery.mockReturnValue({
      data: { accepted: false, currentVersion: "1.0.0", record: null },
      isLoading: false,
    });
    const { result } = renderHook(() => useByokAck(), { wrapper: Wrapper });
    expect(result.current.accepted).toBe(false);
  });

  it("returns isLoading from query", () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: true });
    const { result } = renderHook(() => useByokAck(), { wrapper: Wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it("provides currentVersion and record from query", () => {
    const { result } = renderHook(() => useByokAck(), { wrapper: Wrapper });
    expect(result.current.currentVersion).toBe("1.0.0");
    expect(result.current.record?.version).toBe("1.0.0");
    expect(result.current.record?.acceptedAt).toBe("2025-01-01");
  });

  it("requireAck calls onAccepted immediately when already accepted", async () => {
    const onAccepted = vi.fn();
    const { result } = renderHook(() => useByokAck(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.requireAck(onAccepted);
    });
    expect(onAccepted).toHaveBeenCalledTimes(1);
    expect(mockOpenAck).not.toHaveBeenCalled();
  });

  it("requireAck opens ack dialog when not yet accepted", async () => {
    mockUseQuery.mockReturnValue({
      data: { accepted: false, currentVersion: "1.0.0", record: null },
      isLoading: false,
    });
    const onAccepted = vi.fn();
    const { result } = renderHook(() => useByokAck(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.requireAck(onAccepted);
    });
    expect(onAccepted).not.toHaveBeenCalled();
    expect(mockOpenAck).toHaveBeenCalled();
  });

  it("openAck opens the ack dialog with optional callback", () => {
    const onAccepted = vi.fn();
    const { result } = renderHook(() => useByokAck(), { wrapper: Wrapper });
    act(() => {
      result.current.openAck(onAccepted);
    });
    expect(mockOpenAck).toHaveBeenCalledWith(onAccepted);
  });
});
