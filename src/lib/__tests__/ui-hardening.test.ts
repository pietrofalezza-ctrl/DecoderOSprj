import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("rendered UI hardening", () => {
  it("gives Radix dialogs accessible descriptions on project entry flows", () => {
    const dashboardRoute = readSource("src/routes/_authenticated/dashboard.tsx");
    const projectRoute = readSource("src/routes/_authenticated/projects.$projectId.index.tsx");
    const byokDialog = readSource("src/components/ByokAcknowledgementDialog.tsx");
    const onboardingDialog = readSource("src/components/onboarding/OnboardingDialog.tsx");

    expect(dashboardRoute).toContain("DialogDescription");
    expect(dashboardRoute).toContain('t("dashboard.newProjectDescription")');
    expect(projectRoute).toContain("DialogDescription");
    expect(projectRoute).toContain('t("project.importGithubDescription")');
    expect(byokDialog).toContain("DialogDescription");
    expect(onboardingDialog).toContain("<DialogDescription");
    expect(onboardingDialog).toContain('subtitle || t("onboarding.versionLabel"');
    expect(onboardingDialog).not.toContain("</DialogDescription>\n          ) : null");
  });

  it("protects TanStack server functions with CSRF request middleware", () => {
    const start = readSource("src/start.ts");

    expect(start).toContain("createCsrfMiddleware");
    expect(start).toContain('ctx.handlerType === "serverFn"');
    expect(start).toMatch(/requestMiddleware:\s*\[[^\]]*csrfMiddleware/s);
  });
});
