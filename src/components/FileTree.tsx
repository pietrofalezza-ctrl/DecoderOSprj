import { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, ScanSearch } from "lucide-react";

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

export type FileTreeProps = {
  files: FileItem[];
  selectedId?: string | null;
  selectedFolderPath?: string | null;
  onSelect: (f: FileItem) => void;
  onSelectFolder?: (path: string) => void;
};

export function FileTree({
  files,
  selectedId,
  selectedFolderPath,
  onSelect,
  onSelectFolder,
}: FileTreeProps) {
  const root = useMemo(() => buildTree(files), [files]);
  return (
    <div className="text-sm">
      <NodeView
        node={root}
        depth={0}
        selectedId={selectedId}
        selectedFolderPath={selectedFolderPath ?? null}
        onSelect={onSelect}
        onSelectFolder={onSelectFolder}
        startOpen
      />
    </div>
  );
}

function NodeView({
  node,
  depth,
  selectedId,
  selectedFolderPath,
  onSelect,
  onSelectFolder,
  startOpen,
}: {
  node: Node;
  depth: number;
  selectedId?: string | null;
  selectedFolderPath: string | null;
  onSelect: (f: FileItem) => void;
  onSelectFolder?: (path: string) => void;
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
            <NodeView
              node={c}
              depth={depth}
              selectedId={selectedId}
              selectedFolderPath={selectedFolderPath}
              onSelect={onSelect}
              onSelectFolder={onSelectFolder}
            />
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

  const isFolderSelected = selectedFolderPath === node.path;

  return (
    <div>
      <div
        className={cn(
          "group flex w-full items-center gap-1 rounded px-1.5 py-0.5 hover:bg-accent",
          isFolderSelected && "bg-primary/10 text-primary",
        )}
        style={{ paddingLeft: depth * 12 + 6 }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-1 text-left"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          <Folder className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate">{node.name}</span>
        </button>
        {onSelectFolder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectFolder(node.path);
            }}
            className={cn(
              "shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition hover:bg-primary/15 hover:text-primary group-hover:opacity-100",
              isFolderSelected && "text-primary opacity-100",
            )}
            title="Analizza questa cartella"
            aria-label="Analizza questa cartella"
          >
            <ScanSearch className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && (
        <ul>
          {children.map((c) => (
            <li key={c.path}>
              <NodeView
                node={c}
                depth={depth + 1}
                selectedId={selectedId}
                selectedFolderPath={selectedFolderPath}
                onSelect={onSelect}
                onSelectFolder={onSelectFolder}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
