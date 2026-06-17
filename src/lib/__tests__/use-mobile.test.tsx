import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "../../hooks/use-mobile";

function createMatchMediaMock(matches: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("useIsMobile", () => {
  let originalMatchMedia: typeof window.matchMedia;
  let originalInnerWidth: number;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: originalInnerWidth,
    });
  });

  it("returns true when viewport width < 768px", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 500 });
    window.matchMedia = createMatchMediaMock(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false when viewport width >= 768px", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });
    window.matchMedia = createMatchMediaMock(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns false initially from SSR (undefined coerced via !!)", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });
    window.matchMedia = createMatchMediaMock(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("updates when matchMedia change event fires", () => {
    let listener: EventListener | null = null;
    const mqlMock = {
      matches: true,
      media: "(max-width: 767px)",
      addEventListener: vi.fn((_evt: string, cb: EventListener) => { listener = cb; }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    window.matchMedia = vi.fn().mockReturnValue(mqlMock);
    Object.defineProperty(window, "innerWidth", { writable: true, value: 500 });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      // The hook reads window.innerWidth, not mql.matches
      Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });
      listener?.({} as Event);
    });
    expect(result.current).toBe(false);
  });

  it("uses matchMedia query for max-width 767px", () => {
    const matchMediaSpy = createMatchMediaMock(false);
    window.matchMedia = matchMediaSpy;
    Object.defineProperty(window, "innerWidth", { writable: true, value: 800 });
    renderHook(() => useIsMobile());
    expect(matchMediaSpy).toHaveBeenCalledWith("(max-width: 767px)");
  });
});
