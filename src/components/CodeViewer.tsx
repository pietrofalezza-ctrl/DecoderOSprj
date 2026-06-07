import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";

import type { Finding } from "@/lib/findings";

export type CodeSelection = {
  content: string;
  startLine: number;
  endLine: number;
};

export type CodeViewerHandle = {
  revealLine: (line: number, options?: { select?: { from: number; to: number } }) => void;
};

type Props = {
  content: string;
  language: string | null;
  onSelectionChange?: (sel: CodeSelection | null) => void;
  findings?: Finding[];
};

function glyphSeverity(s: Finding["severity"]): string {
  if (s === "critical" || s === "high") return "decoder-finding-glyph decoder-finding-glyph--high";
  if (s === "medium") return "decoder-finding-glyph decoder-finding-glyph--medium";
  if (s === "low") return "decoder-finding-glyph decoder-finding-glyph--low";
  return "decoder-finding-glyph decoder-finding-glyph--info";
}

function lineClass(s: Finding["severity"]): string {
  if (s === "critical" || s === "high") return "decoder-finding decoder-finding--high";
  if (s === "medium") return "decoder-finding decoder-finding--medium";
  if (s === "low") return "decoder-finding decoder-finding--low";
  return "decoder-finding decoder-finding--info";
}

export const CodeViewer = forwardRef<CodeViewerHandle, Props>(function CodeViewer(
  { content, language, onSelectionChange, findings },
  ref,
) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const decorationsRef = useRef<Monaco.editor.IEditorDecorationsCollection | null>(null);
  const hoverDisposeRef = useRef<Monaco.IDisposable | null>(null);
  const findingsRef = useRef<Finding[]>(findings ?? []);

  useImperativeHandle(ref, () => ({
    revealLine(line, options) {
      const ed = editorRef.current;
      const monaco = monacoRef.current;
      if (!ed || !monaco) return;
      const model = ed.getModel();
      if (!model) return;
      const maxLine = model.getLineCount();
      const target = Math.min(Math.max(1, line), maxLine);
      ed.revealLineInCenter(target);
      const from = options?.select?.from ?? target;
      const to = Math.min(options?.select?.to ?? target, maxLine);
      const endCol = model.getLineMaxColumn(to);
      ed.setSelection(new monaco.Selection(from, 1, to, endCol));
      ed.focus();
    },
  }));

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorSelection(() => {
      if (!onSelectionChange) return;
      const sel = editor.getSelection();
      const model = editor.getModel();
      if (!sel || !model || sel.isEmpty()) {
        onSelectionChange(null);
        return;
      }
      const text = model.getValueInRange(sel);
      if (!text.trim()) {
        onSelectionChange(null);
        return;
      }
      onSelectionChange({
        content: text,
        startLine: sel.startLineNumber,
        endLine: sel.endLineNumber,
      });
    });
  };

  // Sync decorations + hover provider with the current findings + language.
  useEffect(() => {
    findingsRef.current = findings ?? [];
    const ed = editorRef.current;
    const monaco = monacoRef.current;
    if (!ed || !monaco) return;
    const model = ed.getModel();
    if (!model) return;

    // Decorations
    if (!decorationsRef.current) {
      decorationsRef.current = ed.createDecorationsCollection([]);
    }
    const maxLine = model.getLineCount();
    const decos: Monaco.editor.IModelDeltaDecoration[] = (findings ?? []).map((f) => {
      const start = Math.min(Math.max(1, f.start_line), maxLine);
      const end = Math.min(Math.max(start, f.end_line), maxLine);
      return {
        range: new monaco.Range(start, 1, end, model.getLineMaxColumn(end)),
        options: {
          isWholeLine: true,
          className: lineClass(f.severity),
          glyphMarginClassName: glyphSeverity(f.severity),
          hoverMessage: {
            value: `**${f.title}** _(L${start}${end !== start ? `–${end}` : ""}, ${f.severity})_\n\n${f.message}`,
          },
        },
      };
    });
    decorationsRef.current.set(decos);

    // Hover provider — registers per language; dispose previous on language change or unmount.
    hoverDisposeRef.current?.dispose();
    hoverDisposeRef.current = null;
    const lang = language ?? "plaintext";
    hoverDisposeRef.current = monaco.languages.registerHoverProvider(lang, {
      provideHover(_m, position) {
        const line = position.lineNumber;
        const hits = findingsRef.current.filter(
          (f) => line >= f.start_line && line <= f.end_line,
        );
        if (!hits.length) return null;
        return {
          contents: hits.map((f) => ({
            value: `**${f.title}** _(${f.severity})_\n\n${f.message}`,
          })),
        };
      },
    });
  }, [findings, language]);

  useEffect(() => {
    return () => {
      hoverDisposeRef.current?.dispose();
      hoverDisposeRef.current = null;
    };
  }, []);

  return (
    <Editor
      height="100%"
      value={content}
      language={language ?? "plaintext"}
      theme="vs-dark"
      onMount={handleMount}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 13,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        renderLineHighlight: "none",
        glyphMargin: true,
      }}
    />
  );
});
