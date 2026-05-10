import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import AnalyzerPage from "@/pages/analyzer";
import { useEffect, Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      // Don't retry mutations by default — let the user decide via the Retry button
      retry: false,
    },
    queries: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// ─── Error Boundary ──────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-1">Something went wrong</h2>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {this.state.message}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={this.handleReset}>
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={AnalyzerPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  // Force dark mode for the editor aesthetic
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
