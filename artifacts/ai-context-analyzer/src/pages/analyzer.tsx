import { useState } from "react";
import { useAnalyzeCodebase } from "@workspace/api-client-react";
import { mockFiles } from "@/lib/mock-files";
import {
  Search, Loader2, FileCode2, BarChart3, AlertCircle,
  ScanSearch, FileText, CheckSquare, Square, Minus,
  ChevronRight, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toUpperCase() ?? "FILE";
}

function getExtColor(ext: string): string {
  const map: Record<string, string> = {
    TS: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    TSX: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    JS: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    JSX: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    PY: "text-green-400 bg-green-400/10 border-green-400/20",
    GO: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    MD: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    JSON: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    CSS: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    SQL: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  };
  return map[ext] ?? "text-muted-foreground bg-muted/50 border-border";
}

function scoreColor(score: number): { text: string; bar: string } {
  if (score >= 75) return { text: "text-emerald-400", bar: "bg-emerald-400" };
  if (score >= 45) return { text: "text-amber-400",   bar: "bg-amber-400" };
  return               { text: "text-rose-400",    bar: "bg-rose-400" };
}

function SelectionIcon({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) {
  if (indeterminate) return <Minus className="h-3.5 w-3.5 text-primary" />;
  if (checked)       return <CheckSquare className="h-3.5 w-3.5 text-primary" />;
  return                    <Square className="h-3.5 w-3.5 text-muted-foreground/50" />;
}

export default function AnalyzerPage() {
  const [query, setQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(
    new Set(mockFiles.map(f => f.filename))
  );

  const analyzeCodebase = useAnalyzeCodebase();

  const allSelected   = selectedFiles.size === mockFiles.length;
  const noneSelected  = selectedFiles.size === 0;
  const indeterminate = !allSelected && !noneSelected;

  const handleToggleFile = (filename: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      next.has(filename) ? next.delete(filename) : next.add(filename);
      return next;
    });
  };

  const handleToggleAll = () => {
    setSelectedFiles(allSelected ? new Set() : new Set(mockFiles.map(f => f.filename)));
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || noneSelected) return;
    analyzeCodebase.mutate({
      data: { query, files: mockFiles.filter(f => selectedFiles.has(f.filename)) }
    });
  };

  const { isPending, data, isError, error } = analyzeCodebase;
  const apiError = error as any;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-8 pt-7 pb-5 border-b border-border/60">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Context Analyzer</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Surface relevant files from a codebase using keyword matching and dependency tracing.
            </p>
          </div>

          {data && (
      <div className="flex items-center gap-3 text-sm shrink-0 ml-6">

        {/* JSON Export */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleExport("json")}
          >
          <FileText className="h-3.5 w-3.5 mr-1" />
          JSON
        </Button>

        {/* Markdown Export */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleExport("md")}
          >

          <FileText className="h-3.5 w-3.5 mr-1" />
          MD
    </Button>

        {/* Stats */}
        <div className="text-right ml-3">
          <p className="text-muted-foreground text-xs mb-0.5">Files scanned</p>
          <p className="font-semibold font-mono">{data.totalFilesScanned}</p>
        </div>

        <div className="w-px h-8 bg-border" />

        <div className="text-right">
          <p className="text-muted-foreground text-xs mb-0.5">Matches found</p>
          <p className="font-semibold font-mono text-primary">
            {data.results.length}
          </p>
        </div>

      </div>
    )}  
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 divide-x divide-border/60">

        {/* Left panel */}
        <div className="w-72 shrink-0 flex flex-col bg-[hsl(220_22%_8%)]">

          {/* Query */}
          <div className="px-5 py-5 border-b border-border/60">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Query</p>
            <form onSubmit={handleAnalyze} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g. JWT authentication..."
                  disabled={isPending}
                  className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors disabled:opacity-50"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-9 text-sm font-medium"
                disabled={isPending || noneSelected || !query.trim()}
              >
                {isPending ? (
                  <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Analyzing...</>
                ) : (
                  <><ScanSearch className="mr-2 h-3.5 w-3.5" />Run Analysis</>
                )}
              </Button>
            </form>
          </div>

          {/* File list */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
              <button
                onClick={handleToggleAll}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <SelectionIcon checked={allSelected} indeterminate={indeterminate} />
                <span className="font-medium">Target Files</span>
              </button>
              <span className="text-xs font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                {selectedFiles.size}/{mockFiles.length}
              </span>
            </div>
            <ScrollArea className="flex-1">
              <div className="py-1">
                {mockFiles.map(file => {
                  const ext = getFileExtension(file.filename);
                  const isSelected = selectedFiles.has(file.filename);
                  const parts = file.filename.split("/");
                  const name = parts.pop() ?? file.filename;
                  const dir  = parts.join("/");
                  return (
                    <button
                      key={file.filename}
                      onClick={() => handleToggleFile(file.filename)}
                      className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left transition-colors ${
                        isSelected
                          ? "text-foreground hover:bg-white/[0.03]"
                          : "text-muted-foreground/50 hover:bg-white/[0.02]"
                      }`}
                    >
                      <SelectionIcon checked={isSelected} />
                      <div className="flex-1 min-w-0 mt-px">
                        {dir && (
                          <p className="text-[10px] font-mono text-muted-foreground/40 truncate leading-none mb-0.5">
                            {dir}/
                          </p>
                        )}
                        <p className="text-xs font-mono truncate leading-snug">{name}</p>
                      </div>
                      <span className={`text-[9px] font-mono font-semibold px-1 py-0.5 rounded border shrink-0 mt-0.5 ${getExtColor(ext)}`}>
                        {ext}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Results panel */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Error */}
          {isError && (
            <div className="m-6 p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose-400">Analysis failed</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {apiError?.error ?? "An unexpected error occurred. Please try again."}
                </p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isPending && !data && !isError && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-12 py-16">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-5">
                <ScanSearch className="h-6 w-6 text-primary/60" />
              </div>
              <h3 className="text-base font-semibold mb-2">Ready to analyze</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Enter a search query on the left and click <span className="text-foreground font-medium">Run Analysis</span> to find the most relevant files in your codebase.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-sm">
                {["JWT authentication", "database connection", "error handling"].map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="text-xs font-mono px-3 py-2 rounded-md border border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all text-left leading-snug"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isPending && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              <div className="text-center">
                <p className="text-sm font-medium">Scanning codebase</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">matching keywords · tracing imports · scoring relevance</p>
              </div>
            </div>
          )}

          {/* Results */}
          {data && !isPending && (
            <ScrollArea className="flex-1">
              <div className="px-7 py-6 space-y-3">

                {/* Query summary */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/10 mb-5">
                  <Hash className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                  <p className="text-sm font-mono text-muted-foreground flex-1 truncate">
                    <span className="text-primary">query:</span> {data.query}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {data.results.length} of {data.totalFilesScanned} files matched
                  </span>
                </div>

                {data.results.length === 0 && (
                  <div className="text-center py-14 border border-dashed border-border/40 rounded-xl">
                    <FileText className="h-7 w-7 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No matching files found for this query.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try different keywords or select more files.</p>
                  </div>
                )}

                {data.results.map((result, idx) => {
                  const ext = getFileExtension(result.filename);
                  const extStyle = getExtColor(ext);
                  const { text: scoreText, bar: scoreBar } = scoreColor(result.score);
                  const parts = result.filename.split("/");
                  const name = parts.pop() ?? result.filename;
                  const dir  = parts.join("/");

                  return (
                    <div
                      key={result.filename + idx}
                      className="rounded-xl border border-border/60 bg-card overflow-hidden transition-all hover:border-border"
                    >
                      {/* Card header */}
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-[hsl(220_20%_11%)]">
                        <span className="text-xs font-mono font-semibold text-muted-foreground/40 w-5 shrink-0">
                          #{idx + 1}
                        </span>
                        <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border shrink-0 ${extStyle}`}>
                          {ext}
                        </span>
                        <div className="flex-1 min-w-0">
                          {dir && (
                            <span className="text-[10px] font-mono text-muted-foreground/50">{dir}/</span>
                          )}
                          <span className="text-sm font-mono font-medium ml-0.5">{name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="score-bar w-16 hidden sm:block">
                            <div
                              className={`score-bar-fill ${scoreBar}`}
                              style={{ width: `${result.score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-mono font-semibold ${scoreText}`}>
                            {result.score}
                          </span>
                        </div>
                      </div>

                      {/* Match info */}
                      <div className="px-4 py-3 space-y-2.5">
                        <div className="flex items-start gap-2">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground leading-relaxed">{result.reason}</p>
                        </div>
                        {result.matchedKeywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pl-5">
                            {result.matchedKeywords.map((kw, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Code block */}
                      <div className="border-t border-border/40">
                        <div className="flex items-center justify-between px-4 py-1.5 bg-[hsl(220_22%_7%)]">
                          <div className="flex items-center gap-1.5">
                            <FileCode2 className="h-3 w-3 text-muted-foreground/40" />
                            <span className="text-[10px] font-mono text-muted-foreground/50">source</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground/40">
                            {result.content.split("\n").length} lines
                          </span>
                        </div>
                        <pre className="px-4 py-3 text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto bg-[hsl(220_22%_7%)] max-h-48">
                          <code>{result.content}</code>
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
