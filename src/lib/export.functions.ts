import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Returns a base64-encoded zip with one .md per (file, explanation) plus INDEX.md.
export const exportRepoMarkdown = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ repo_id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { zipSync, strToU8 } = await import("fflate");

    const { data: repo, error: rErr } = await context.supabase
      .from("repositories")
      .select("id, name")
      .eq("id", data.repo_id)
      .maybeSingle();
    if (rErr || !repo) throw rErr ?? new Error("not_found");

    const { data: files, error: fErr } = await context.supabase
      .from("files")
      .select("id, path")
      .eq("repository_id", data.repo_id);
    if (fErr) throw fErr;
    const fileById = new Map((files ?? []).map((f) => [f.id, f]));

    const { data: rows, error: eErr } = await context.supabase
      .from("explanations")
      .select(
        "id, file_id, explanation_type, proficiency, language, content, provider, model, created_at",
      )
      .in(
        "file_id",
        (files ?? []).map((f) => f.id),
      );
    if (eErr) throw eErr;

    const out: Record<string, Uint8Array> = {};
    const index: string[] = [`# ${repo.name}`, "", `Exported: ${new Date().toISOString()}`, ""];

    if (!rows || rows.length === 0) {
      index.push("_No explanations yet._");
    } else {
      for (const r of rows) {
        const f = fileById.get(r.file_id);
        if (!f) continue;
        const safe = f.path.replace(/[^A-Za-z0-9._/-]/g, "_");
        const fname = `docs/${safe}.${r.explanation_type}.${r.proficiency}.${r.language}.md`;
        const header =
          `# ${f.path}\n\n` +
          `- type: ${r.explanation_type}\n- audience: ${r.proficiency}\n- language: ${r.language}\n` +
          `- provider: ${r.provider}${r.model ? ` (${r.model})` : ""}\n- generated: ${r.created_at}\n\n---\n\n`;
        out[fname] = strToU8(header + r.content);
        index.push(`- \`${f.path}\` — ${r.explanation_type} / ${r.proficiency} / ${r.language}`);
      }
    }

    out["INDEX.md"] = strToU8(index.join("\n"));
    const zipped = zipSync(out, { level: 6 });
    // serializable transport
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < zipped.length; i += chunk) {
      bin += String.fromCharCode.apply(null, Array.from(zipped.subarray(i, i + chunk)));
    }
    return {
      zip_base64: btoa(bin),
      filename: `${repo.name.replace(/[^A-Za-z0-9_.-]/g, "_")}.docs.zip`,
    };
  });
