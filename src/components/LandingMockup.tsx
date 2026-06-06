import { useTranslation } from "react-i18next";
import {
  FolderGit2,
  Files,
  Activity,
  Settings,
  ChevronRight,
} from "lucide-react";

/**
 * Purely decorative mockup of the Decoder workspace, used on the landing.
 * Static — no network, no state. Inspired by the reference screenshot but
 * built entirely with semantic design tokens so it follows the active theme.
 */
export function LandingMockup() {
  const { t } = useTranslation();

  const fileTree = [
    { name: "my-project", depth: 0, folder: true },
    { name: "src", depth: 1, folder: true },
    { name: "components", depth: 2, folder: true },
    { name: "hooks", depth: 2, folder: true },
    { name: "services", depth: 2, folder: true },
    { name: "utils", depth: 2, folder: true },
    { name: "auth.ts", depth: 2, folder: false, active: true },
    { name: "api.ts", depth: 2, folder: false },
    { name: "format.ts", depth: 2, folder: false },
    { name: "index.ts", depth: 2, folder: false },
    { name: "tests", depth: 1, folder: true },
    { name: ".gitignore", depth: 1, folder: false },
    { name: "README.md", depth: 1, folder: false },
    { name: "package.json", depth: 1, folder: false },
  ];

  const codeLines: { n: number; html: string }[] = [
    { n: 1, html: `<span class="text-primary">export async function</span> <span class="text-accent-foreground">authenticate</span>(` },
    { n: 2, html: `  email: <span class="text-primary">string</span>,` },
    { n: 3, html: `  password: <span class="text-primary">string</span>` },
    { n: 4, html: `): <span class="text-primary">Promise</span>&lt;<span class="text-primary">User</span>&gt; {` },
    { n: 5, html: `  <span class="text-primary">const</span> user = <span class="text-primary">await</span> db.user.findUnique({` },
    { n: 6, html: `    where: { email }` },
    { n: 7, html: `  });` },
    { n: 8, html: `` },
    { n: 9, html: `  <span class="text-primary">if</span> (!user) {` },
    { n: 10, html: `    <span class="text-primary">throw new</span> Error(<span class="text-emerald-400">'User not found'</span>);` },
    { n: 11, html: `  }` },
    { n: 12, html: `` },
    { n: 13, html: `  <span class="text-primary">const</span> isValid = <span class="text-primary">await</span> verifyPassword(` },
    { n: 14, html: `    password,` },
    { n: 15, html: `    user.passwordHash` },
    { n: 16, html: `  );` },
    { n: 17, html: `` },
    { n: 18, html: `  <span class="text-primary">if</span> (!isValid) {` },
    { n: 19, html: `    <span class="text-primary">throw new</span> Error(<span class="text-emerald-400">'Invalid credentials'</span>);` },
    { n: 20, html: `  }` },
    { n: 21, html: `` },
    { n: 22, html: `  <span class="text-primary">return</span> user;` },
    { n: 23, html: `}` },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl"
      style={{ boxShadow: "var(--shadow-elegant)" }}
      aria-hidden
    >
      <div className="grid grid-cols-[160px_minmax(0,1fr)_220px] divide-x divide-border">
        {/* Sidebar */}
        <aside className="flex flex-col gap-1 p-3 text-xs">
          <div className="mb-2 flex items-center gap-2 px-1 pb-2 font-semibold">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-primary/15 font-mono text-[9px] text-primary">
              &lt;/&gt;
            </span>
            <span className="text-foreground">{t("brand.name")}</span>
          </div>
          <SideRow icon={<FolderGit2 className="h-3.5 w-3.5" />} label={t("landing.mockup.projects")} />
          <SideRow icon={<FolderGit2 className="h-3.5 w-3.5" />} label={t("landing.mockup.repository")} />
          <SideRow icon={<Files className="h-3.5 w-3.5" />} label={t("landing.mockup.files")} />
          <SideRow icon={<Activity className="h-3.5 w-3.5" />} label={t("landing.mockup.analysis")} />
          <SideRow icon={<Settings className="h-3.5 w-3.5" />} label={t("nav.settings")} />
          <div className="mt-auto flex items-center gap-2 rounded-md border border-border p-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
              A
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-medium">Andrea B.</span>
              <span className="text-[9px] text-muted-foreground">Pro</span>
            </div>
          </div>
        </aside>

        {/* Editor */}
        <section className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 text-[11px] text-muted-foreground">
            <span>Explorer</span>
            <span className="font-mono text-foreground">auth.ts</span>
            <span>•••</span>
          </div>
          <div className="grid grid-cols-[120px_minmax(0,1fr)] divide-x divide-border">
            <ul className="space-y-0.5 p-2 text-[10px] text-muted-foreground">
              {fileTree.map((f, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-1 truncate rounded px-1 py-0.5 ${
                    f.active ? "bg-accent text-accent-foreground" : ""
                  }`}
                  style={{ paddingLeft: `${4 + f.depth * 8}px` }}
                >
                  {f.folder ? "📁" : "📄"} {f.name}
                </li>
              ))}
            </ul>
            <pre className="overflow-hidden p-2 font-mono text-[10px] leading-[14px]">
              {codeLines.map((l) => (
                <div key={l.n} className="flex gap-3">
                  <span className="w-4 select-none text-right text-muted-foreground">
                    {l.n}
                  </span>
                  <span
                    className="text-foreground/90"
                    dangerouslySetInnerHTML={{ __html: l.html }}
                  />
                </div>
              ))}
            </pre>
          </div>
        </section>

        {/* AI panel */}
        <aside className="flex flex-col gap-3 p-3 text-[11px]">
          <div className="flex gap-1">
            <span className="rounded-md bg-primary/15 px-2 py-1 text-[10px] font-medium text-primary">
              {t("workspace.tabs.summary")}
            </span>
            <span className="rounded-md px-2 py-1 text-[10px] text-muted-foreground">
              {t("workspace.tabs.security")}
            </span>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">{t("workspace.proficiency")}</div>
            <div className="mt-1 rounded-md border border-border px-2 py-1 text-[11px]">
              {t("proficiency.intermediate")}
            </div>
          </div>
          <Panel title={t("landing.mockup.summary")}>
            {t("landing.mockup.summaryBody")}
          </Panel>
          <Panel title={t("landing.mockup.architecture")}>
            {t("landing.mockup.architectureBody")}
          </Panel>
          <Panel title={t("landing.mockup.dependencies")}>
            <span className="font-mono">db.user</span> · <span className="font-mono">verifyPassword</span>
          </Panel>
          <button
            type="button"
            className="mt-1 rounded-md bg-foreground px-2 py-1.5 text-[11px] font-medium text-background"
            tabIndex={-1}
          >
            {t("landing.mockup.applyComments")}
          </button>
        </aside>
      </div>
    </div>
  );
}

function SideRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent/40">
      {icon}
      <span>{label}</span>
      <ChevronRight className="ml-auto h-3 w-3 opacity-0" />
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border p-2">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="text-[10px] leading-snug text-foreground/80">{children}</div>
    </div>
  );
}
