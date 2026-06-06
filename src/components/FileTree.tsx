import { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, File, Folder } from "lucide-react";

import { cn } from "@/lib/utils";

type FileItem = { id: string; path: string; language: string | null };

type Node = {
  name: string;
  path: string;
  children: Map<string, Node>;
  file?: FileItem;
};

function buildTree(files: FileItem[]): Node {
  const root: Node = { name: "", path: "", children: new Map() };
  for (const f of files) {
    const parts = f.path.split("/");
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      if (!cur.children.has(name)) {
        cur.children.set(name, {
          name,
          path: parts.slice(0, i + 1).join("/"),
          children: new Map(),
        });
      }
      cur = cur.children.get(name)!;
      if (i === parts.length - 1) cur.file = f;
    }
  }
  return root;
}

export function FileTree({
  files,
  selectedId,
  onSelect,
}: {
  files: FileItem[];
  selectedId?: string | null;
  onSelect: (f: FileItem) => void;
}) {
  const root = useMemo(() => buildTree(files), [files]);
  return (
    <div className="text-sm">
      <NodeView node={root} depth={0} selectedId={selectedId} onSelect={onSelect} startOpen />
    </div>
  );
}

function NodeView({
  node,
  depth,
  selectedId,
  onSelect,
  startOpen,
}: {
  node: Node;
  depth: number;
  selectedId?: string | null;
  onSelect: (f: FileItem) => void;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(startOpen || depth < 1);
  const children = Array.from(node.children.values()).sort((a, b) => {
    const aDir = a.children.size > 0;
    const bDir = b.children.size > 0;
    if (aDir !== bDir) return aDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  if (node.name === "") {
    return (
      <ul>
        {children.map((c) => (
          <li key={c.path}>
            <NodeView node={c} depth={depth} selectedId={selectedId} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    );
  }

  if (node.file && node.children.size === 0) {
    const f = node.file;
    return (
      <button
        onClick={() => onSelect(f)}
        className={cn(
          "flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left hover:bg-accent",
          selectedId === f.id && "bg-accent text-accent-foreground",
        )}
        style={{ paddingLeft: depth * 12 + 6 }}
      >
        <File className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left hover:bg-accent"
        style={{ paddingLeft: depth * 12 + 6 }}
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <Folder className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate">{node.name}</span>
      </button>
      {open && (
        <ul>
          {children.map((c) => (
            <li key={c.path}>
              <NodeView node={c} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
