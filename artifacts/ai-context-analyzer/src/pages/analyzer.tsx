import { useState } from "react";
import { useAnalyzeCodebase } from "@workspace/api-client-react";
import { mockFiles } from "@/lib/mock-files";
import { Search, Loader2, FileCode2, ChevronRight, BarChart3, AlertCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function AnalyzerPage() {
  const [query, setQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(
    new Set(mockFiles.map(f => f.filename))
  );

  const analyzeCodebase = useAnalyzeCodebase();

  const handleToggleFile = (filename: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filename)) {
        next.delete(filename);
      } else {
        next.add(filename);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedFiles.size === mockFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(mockFiles.map(f => f.filename)));
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const filesToAnalyze = mockFiles.filter(f => selectedFiles.has(f.filename));
    if (filesToAnalyze.length === 0) return;

    analyzeCodebase.mutate({
      data: {
        query,
        files: filesToAnalyze
      }
    });
  };

  const isPending = analyzeCodebase.isPending;
  const data = analyzeCodebase.data;
  const isError = analyzeCodebase.isError;
  const error = analyzeCodebase.error as any;

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Context Analyzer</h1>
        <p className="text-muted-foreground">Query your codebase to find relevant files, semantic matches, and context logic.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Input & Files */}
        <div className="lg:col-span-4 flex flex-col space-y-6 h-full">
          <Card className="flex-shrink-0 bg-card shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Search className="mr-2 h-4 w-4 text-primary" />
                Query String
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAnalyze} className="space-y-4">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., How does JWT verification work?"
                  className="font-mono text-sm"
                  disabled={isPending}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isPending || selectedFiles.size === 0 || !query.trim()}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Context...
                    </>
                  ) : (
                    "Analyze Codebase"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden bg-card shadow-md">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <FileCode2 className="mr-2 h-4 w-4 text-primary" />
                  Target Files
                </CardTitle>
                <Badge variant="secondary">{selectedFiles.size} / {mockFiles.length}</Badge>
              </div>
              <CardDescription>
                Select files to include in the context window
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col pb-0">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="select-all" 
                  checked={selectedFiles.size === mockFiles.length}
                  onCheckedChange={handleToggleAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Select All Files
                </label>
              </div>
              <ScrollArea className="flex-1 -mx-4 px-4 pb-4">
                <div className="space-y-2">
                  {mockFiles.map(file => (
                    <div key={file.filename} className="flex items-start space-x-3 p-2 rounded-md hover:bg-secondary/50 transition-colors">
                      <Checkbox 
                        id={`file-${file.filename}`}
                        checked={selectedFiles.has(file.filename)}
                        onCheckedChange={() => handleToggleFile(file.filename)}
                        className="mt-1"
                      />
                      <label 
                        htmlFor={`file-${file.filename}`}
                        className="text-sm font-mono cursor-pointer flex-1 break-all"
                      >
                        {file.filename}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-0">
          <Card className="flex-1 flex flex-col bg-card/80 border-border/50 backdrop-blur-sm overflow-hidden shadow-xl">
            <CardHeader className="border-b border-border/50 bg-card flex-shrink-0">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden p-0">
              {isError && (
                <div className="p-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Analysis Failed</AlertTitle>
                    <AlertDescription>
                      {error?.error || "An unexpected error occurred while analyzing the codebase."}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {!isPending && !data && !isError && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
                  <div className="h-24 w-24 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                    <Terminal className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
                  <p className="text-center max-w-sm">
                    Enter a query and select files to begin analyzing your codebase context. The most relevant files will appear here.
                  </p>
                </div>
              )}

              {isPending && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="font-mono text-sm animate-pulse">Computing embeddings & semantic scores...</p>
                </div>
              )}

              {data && !isPending && (
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-4 rounded-lg">
                      <div>
                        <p className="text-sm font-mono text-primary mb-1">Query Executed</p>
                        <p className="font-medium">"{data.query}"</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-muted-foreground mb-1">Stats</p>
                        <p className="text-sm font-medium">
                          Scanned {data.totalFilesScanned} files • Found {data.results.length} matches
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {data.results.map((result, idx) => (
                        <Card key={result.filename + idx} className="overflow-hidden border-border/50">
                          <div className="bg-secondary/30 px-4 py-3 border-b border-border/50 flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center space-x-2 min-w-0">
                              <FileCode2 className="h-4 w-4 text-primary shrink-0" />
                              <h4 className="font-mono text-sm font-bold truncate">{result.filename}</h4>
                            </div>
                            <div className="flex items-center space-x-3 shrink-0">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-muted-foreground">Score</span>
                                <Badge 
                                  variant="outline" 
                                  className={`font-mono ${
                                    result.score > 80 ? 'border-green-500 text-green-500' :
                                    result.score > 50 ? 'border-yellow-500 text-yellow-500' :
                                    'border-muted-foreground'
                                  }`}
                                >
                                  {result.score.toFixed(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2 flex items-start">
                                <ChevronRight className="h-4 w-4 mr-1 shrink-0 mt-0.5 text-primary" />
                                {result.reason}
                              </p>
                              {result.matchedKeywords.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2 ml-5">
                                  {result.matchedKeywords.map((kw, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs font-mono bg-primary/10 text-primary hover:bg-primary/20">
                                      {kw}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="bg-[#0d1117] rounded-md overflow-hidden border border-border/50">
                              <div className="flex items-center px-4 py-1.5 bg-black/40 border-b border-border/50 text-xs font-mono text-muted-foreground">
                                <span className="flex-1">Content Snippet</span>
                              </div>
                              <pre className="p-4 text-xs font-mono overflow-x-auto text-gray-300">
                                <code>{result.content}</code>
                              </pre>
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      {data.results.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                          <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
                          <p>No relevant files found for this query.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
