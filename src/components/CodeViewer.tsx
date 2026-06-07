import Editor, { type OnMount } from "@monaco-editor/react";

export type CodeSelection = {
  content: string;
  startLine: number;
  endLine: number;
};

export function CodeViewer({
  content,
  language,
  onSelectionChange,
}: {
  content: string;
  language: string | null;
  onSelectionChange?: (sel: CodeSelection | null) => void;
}) {
  const handleMount: OnMount = (editor) => {
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
      }}
    />
  );
}

