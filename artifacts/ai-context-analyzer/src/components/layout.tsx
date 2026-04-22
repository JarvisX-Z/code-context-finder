import React, { useState } from "react";
import { Link } from "wouter";
import { Terminal, Code2, LayoutDashboard, Settings, GitBranch } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-16 md:w-64 border-r border-border bg-card flex flex-col items-center md:items-stretch py-4">
        <div className="mb-8 flex items-center justify-center md:justify-start md:px-6">
          <Terminal className="h-8 w-8 text-primary" />
          <span className="ml-3 font-mono font-bold text-lg hidden md:block">CtxAnalyzer</span>
        </div>
        
        <nav className="flex-1 w-full space-y-2 px-2 md:px-4">
          <Link href="/" className="flex items-center p-3 rounded-md hover:bg-secondary text-primary transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span className="ml-3 hidden md:block font-medium">Analyze</span>
          </Link>
          <div className="flex items-center p-3 rounded-md hover:bg-secondary text-muted-foreground transition-colors cursor-not-allowed opacity-50">
            <Code2 className="h-5 w-5" />
            <span className="ml-3 hidden md:block font-medium">Snippets</span>
          </div>
          <div className="flex items-center p-3 rounded-md hover:bg-secondary text-muted-foreground transition-colors cursor-not-allowed opacity-50">
            <GitBranch className="h-5 w-5" />
            <span className="ml-3 hidden md:block font-medium">Graph</span>
          </div>
        </nav>
        
        <div className="mt-auto px-2 md:px-4">
          <div className="flex items-center p-3 rounded-md hover:bg-secondary text-muted-foreground transition-colors cursor-pointer">
            <Settings className="h-5 w-5" />
            <span className="ml-3 hidden md:block font-medium">Settings</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span className="text-sm font-mono text-muted-foreground">System Online</span>
          </div>
          <div className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
            v1.0.0
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"}}></div>
          {children}
        </main>
      </div>
    </div>
  );
}
