import React from "react";
import { Link, useLocation } from "wouter";
import { Cpu, LayoutDashboard, Code2, GitBranch, Settings, Zap } from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Analyze", active: true },
  { href: "#", icon: Code2,           label: "Snippets", active: false },
  { href: "#", icon: GitBranch,       label: "Graph",    active: false },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col border-r"
        style={{ background: "hsl(var(--sidebar))", borderColor: "hsl(var(--sidebar-border))" }}
      >
        {/* Brand */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 border border-primary/20">
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">CtxAnalyzer</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">
            Tools
          </p>
          {navItems.map(({ href, icon: Icon, label, active }) => {
            const isCurrent = active && location === href;
            if (!active) {
              return (
                <div
                  key={label}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground/40 cursor-not-allowed select-none"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                  <span className="ml-auto text-[10px] font-mono bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground/50">soon</span>
                </div>
              );
            }
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isCurrent
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
                {isCurrent && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t pt-3 space-y-0.5" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
            <Settings className="h-4 w-4 shrink-0" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 shrink-0 border-b flex items-center justify-between px-6" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.5)]" />
            <span className="text-xs font-mono text-muted-foreground">API connected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              <span className="font-mono">v1.0.0</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
