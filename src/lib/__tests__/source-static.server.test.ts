import { describe, expect, it } from "vitest";
import {
  analyzeSourceFile,
  sourceStaticToSarif,
  type SourceStaticRule,
} from "../source-static.server";

describe("analyzeSourceFile", () => {
  it("extracts source symbols, imports, classes, and functions for TypeScript", () => {
    const source = `
      import express from "express";
      import { saveUser } from "./users";

      export class UserController {
        async store(req: Request) {
          const name = String(req.body.name);
          return saveUser(name);
        }
      }

      export function helper(value: string) {
        if (value.length > 3) return value.trim();
        return "short";
      }
    `;

    const report = analyzeSourceFile({
      path: "src/controllers/user-controller.ts",
      language: "typescript",
      content: source,
    });

    expect(report.file).toBe("src/controllers/user-controller.ts");
    expect(report.symbols).toEqual(
      expect.arrayContaining(["UserController", "store", "helper", "saveUser"]),
    );
    expect(report.imports).toEqual(expect.arrayContaining(["express", "./users"]));
    expect(report.classes.map((c) => c.name)).toContain("UserController");
    expect(report.functions.map((fn) => fn.name)).toEqual(
      expect.arrayContaining(["store", "helper"]),
    );
    expect(report.metrics.total_functions).toBeGreaterThanOrEqual(2);
    expect(report.metrics.cyclomatic_complexity).toBeGreaterThanOrEqual(2);
  });

  it("flags a tainted HTTP source reaching a raw SQL sink without sanitizer", () => {
    const source = `
      export async function search(req: Request, db: any) {
        const term = req.query.q;
        const sql = "select * from users where name = '" + term + "'";
        return db.query(sql);
      }
    `;

    const report = analyzeSourceFile({
      path: "src/routes/search.ts",
      language: "typescript",
      content: source,
    });

    expect(report.metrics.tainted_source_count).toBe(1);
    expect(report.metrics.dangerous_sink_count).toBe(1);
    expect(report.metrics.unsanitized_sink_count).toBe(1);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "source-taint-raw-sql",
          severity: "high",
          source: "req.query",
          sink: "db.query",
          cwe: "CWE-89",
        }),
      ]),
    );
    expect(report.findings[0].path).toEqual(
      expect.arrayContaining(["req.query.q", "sql", "db.query"]),
    );
  });

  it("does not flag sanitized request data before a sink", () => {
    const source = `
      export function safe(req: Request, db: any) {
        const term = sanitize(req.body.term);
        return db.query("select * from users where name = ?", [term]);
      }
    `;

    const report = analyzeSourceFile({
      path: "src/routes/safe.ts",
      language: "typescript",
      content: source,
    });

    expect(report.metrics.tainted_source_count).toBe(1);
    expect(report.metrics.dangerous_sink_count).toBe(1);
    expect(report.metrics.unsanitized_sink_count).toBe(0);
    expect(report.findings).toEqual([]);
  });

  it("handles PHP/Laravel request sources and raw SQL sinks", () => {
    const source = `<?php
      class UserController {
        public function show() {
          $id = request('id');
          return DB::select("select * from users where id = " . $id);
        }
      }
    `;

    const report = analyzeSourceFile({
      path: "app/Http/Controllers/UserController.php",
      language: "php",
      content: source,
    });

    expect(report.classes.map((c) => c.name)).toContain("UserController");
    expect(report.functions.map((fn) => fn.name)).toContain("show");
    expect(report.metrics.unsanitized_sink_count).toBe(1);
    expect(report.findings[0]).toMatchObject({
      id: "source-taint-raw-sql",
      severity: "high",
      cwe: "CWE-89",
    });
  });

  it("applies declarative JSON rules to source-to-sink paths", () => {
    const rules: SourceStaticRule[] = [
      {
        id: "custom-tainted-eval",
        title: "Tainted request reaches eval",
        severity: "critical",
        language: "typescript",
        source: { any: ["req.body"] },
        sink: { any: ["eval"] },
        sanitizer: { any: ["sanitize"] },
        condition: { require_path: "source_to_sink", forbid_sanitizer: true },
        cwe: "CWE-95",
        owasp: "A03:2021-Injection",
        remediation: "Do not execute request-controlled strings.",
      },
    ];

    const report = analyzeSourceFile({
      path: "src/routes/run.ts",
      language: "typescript",
      rules,
      content: `
        export function run(req: Request) {
          const body = req.body.script;
          return eval(body);
        }
      `,
    });

    expect(report.findings).toEqual([
      expect.objectContaining({
        id: "custom-tainted-eval",
        severity: "critical",
        source: "req.body",
        sink: "eval",
        cwe: "CWE-95",
      }),
    ]);
  });

  it("does not apply declarative rules for another language", () => {
    const rules: SourceStaticRule[] = [
      {
        id: "php-only-eval",
        title: "PHP eval",
        severity: "high",
        language: "php",
        source: { any: ["req.body"] },
        sink: { any: ["eval"] },
        condition: { require_path: "source_to_sink", forbid_sanitizer: true },
        remediation: "Do not execute request-controlled strings.",
      },
    ];

    const report = analyzeSourceFile({
      path: "src/routes/run.ts",
      language: "typescript",
      rules,
      content: `
        export function run(req: Request) {
          const body = req.body.script;
          return eval(body);
        }
      `,
    });

    expect(report.findings).toEqual([]);
    expect(report.metrics.dangerous_sink_count).toBe(1);
  });

  it("honors declarative sanitizer rules", () => {
    const rules: SourceStaticRule[] = [
      {
        id: "custom-tainted-eval",
        title: "Tainted request reaches eval",
        severity: "critical",
        language: "typescript",
        source: { any: ["req.body"] },
        sink: { any: ["eval"] },
        sanitizer: { any: ["sanitize"] },
        condition: { require_path: "source_to_sink", forbid_sanitizer: true },
        remediation: "Do not execute request-controlled strings.",
      },
    ];

    const report = analyzeSourceFile({
      path: "src/routes/run.ts",
      language: "typescript",
      rules,
      content: `
        export function run(req: Request) {
          const body = sanitize(req.body.script);
          return eval(body);
        }
      `,
    });

    expect(report.findings).toEqual([]);
    expect(report.metrics.sanitizer_coverage).toBe(1);
  });
});

describe("sourceStaticToSarif", () => {
  it("exports deterministic SARIF 2.1.0 results for source findings", () => {
    const report = analyzeSourceFile({
      path: "src/routes/search.ts",
      language: "typescript",
      content: `
        export function search(req: Request, db: any) {
          const q = req.query.q;
          return db.query("select * from users where q = " + q);
        }
      `,
    });

    const sarif = sourceStaticToSarif(report);

    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0].tool.driver.name).toBe("DecoderOS Source Static Analyzer");
    expect(sarif.runs[0].tool.driver.rules.map((rule) => rule.id)).toContain(
      "source-taint-raw-sql",
    );
    expect(sarif.runs[0].results[0]).toMatchObject({
      ruleId: "source-taint-raw-sql",
      level: "error",
    });
    expect(sarif.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri).toBe(
      "src/routes/search.ts",
    );
  });
});
