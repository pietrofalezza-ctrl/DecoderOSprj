import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("combines multiple classes with space", () => {
    const result = cn("foo", "bar", "baz");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
    expect(result).toContain("baz");
  });

  it("handles conditional classes (falsy values)", () => {
    expect(cn("base", false && "hidden", undefined, null)).toBe("base");
  });

  it("handles conditional classes (truthy values)", () => {
    expect(cn("base", true && "active")).toBe("base active");
  });

  it("deduplicates conflicting Tailwind classes via twMerge", () => {
    const result = cn("px-4", "px-2");
    // twMerge should pick the later class (px-2) and drop px-4
    expect(result).toContain("px-2");
    expect(result).not.toContain("px-4");
  });

  it("merges bg-color conflicts", () => {
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toContain("bg-blue-500");
    expect(result).not.toContain("bg-red-500");
  });

  it("handles arrays of classes", () => {
    const result = cn(["a", "b"], "c");
    expect(result).toContain("a");
    expect(result).toContain("b");
    expect(result).toContain("c");
  });

  it("handles object notation", () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toContain("foo");
    expect(result).not.toContain("bar");
    expect(result).toContain("baz");
  });
});
