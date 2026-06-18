import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Download, Info } from "lucide-react";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DiffViewer({
  diff,
  notes,
  filename = "decoder-fix.patch",
}: {
  diff: string;
  notes?: string;
  filename?: string;
}) {
  const { t } = useTranslation();
  const [showRaw, setShowRaw] = useState(false);
  const hasDiff = useMemo(() => diff.trim().length > 0, [diff]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(diff);
      toast.success(t("workspace.fix.copied"));
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const onDownload = () => {
    const blob = new Blob([diff], { type: "text/x-diff;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasDiff) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t("workspace.fix.empty")}</p>
        {notes && (
          <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-3 text-xs leading-relaxed">
            {notes}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="default" onClick={onCopy}>
            <Copy className="mr-1 h-3.5 w-3.5" />
            {t("workspace.fix.copyDiff")}
          </Button>
          <Button size="sm" variant="secondary" onClick={onDownload}>
            <Download className="mr-1 h-3.5 w-3.5" />
            {t("workspace.fix.downloadPatch")}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost">
                <Info className="mr-1 h-3.5 w-3.5" />
                {t("workspace.fix.howToApply")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-xs leading-relaxed">
              <p className="mb-2 font-medium">{t("workspace.fix.howToTitle")}</p>
              <ol className="list-decimal space-y-1 pl-4">
                <li>{t("workspace.fix.how1")}</li>
                <li>
                  <code className="rounded bg-muted px-1 py-0.5 font-mono">
                    git apply {filename}
                  </code>
                </li>
                <li>{t("workspace.fix.how3")}</li>
              </ol>
            </PopoverContent>
          </Popover>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setShowRaw((v) => !v)}>
          {showRaw ? t("workspace.fix.showEditor") : t("workspace.fix.showRaw")}
        </Button>
      </div>
      {showRaw ? (
        <pre className="flex-1 overflow-auto whitespace-pre rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed">
          {diff}
        </pre>
      ) : (
        <div className="min-h-[260px] flex-1 overflow-hidden rounded-md border border-border">
          <Editor
            value={diff}
            language="diff"
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              wordWrap: "on",
              scrollBeyondLastLine: false,
              renderLineHighlight: "none",
            }}
          />
        </div>
      )}
      {notes && (
        <details className="rounded-md border border-border bg-muted/20 p-2 text-xs">
          <summary className="cursor-pointer font-medium">{t("workspace.fix.notes")}</summary>
          <pre className="mt-2 whitespace-pre-wrap leading-relaxed">{notes}</pre>
        </details>
      )}
    </div>
  );
}
