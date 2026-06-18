import { describe, expect, it } from "vitest";

import { formatFolderFixActivityContent } from "../fix-history";

describe("formatFolderFixActivityContent", () => {
  it("combines generated diffs and notes for persisted folder fix history", () => {
    expect(
      formatFolderFixActivityContent([
        { path: "src/a.ts", diff: "+a\n", notes: "A note" },
        { path: "src/b.ts", diff: "", notes: "" },
      ]),
    ).toBe("+a\n\n### src/a.ts\nA note\n\n### src/b.ts\n(no notes)");
  });
});
