import Editor from "@monaco-editor/react";

export function CodeViewer({
  content,
  language,
}: {
  content: string;
  language: string | null;
}) {
  return (
    <Editor
      height="100%"
      value={content}
      language={language ?? "plaintext"}
      theme="vs-dark"
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
