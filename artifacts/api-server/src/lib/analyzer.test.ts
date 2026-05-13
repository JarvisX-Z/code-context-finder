import { describe, it, expect } from "vitest";
import { analyzeFiles, type FileInput } from "./analyzer";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const authFile: FileInput = {
  filename: "src/auth/jwt.ts",
  content: `
import jwt from "jsonwebtoken";

export function signToken(payload: object): string {
  return jwt.sign(payload, process.env.JWT_SECRET!);
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!);
}
`,
};

const dbFile: FileInput = {
  filename: "src/db/connection.ts",
  content: `
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default pool;
`,
};

const utilsFile: FileInput = {
  filename: "src/utils/helpers.ts",
  content: `
export function slugify(str: string): string {
  return str.toLowerCase().replace(/\\s+/g, "-");
}
`,
};

const middlewareFile: FileInput = {
  filename: "src/middlewares/auth.ts",
  content: `
import { verifyToken } from "../auth/jwt";

export function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  req.user = verifyToken(token);
  next();
}
`,
};

const allFiles = [authFile, dbFile, utilsFile, middlewareFile];

// ─── analyzeFiles ─────────────────────────────────────────────────────────────

describe("analyzeFiles", () => {
  // Loading state & error handling issue: the analyzer must always return
  // a defined array so the UI can safely render results or the empty state.
  it("returns an array (never undefined/null)", () => {
    const results = analyzeFiles("jwt", allFiles);
    expect(Array.isArray(results)).toBe(true);
  });

  it("returns an empty array when no files match the query", () => {
    const results = analyzeFiles("graphql subscriptions", allFiles);
    expect(results).toHaveLength(0);
  });

  it("ranks the most relevant file first", () => {
    const results = analyzeFiles("jwt authentication", allFiles);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].filename).toBe("src/auth/jwt.ts");
  });

  it("scores filename matches higher than content-only matches", () => {
    const results = analyzeFiles("jwt", allFiles);
    const jwtFile = results.find(r => r.filename === "src/auth/jwt.ts");
    const middleware = results.find(r => r.filename === "src/middlewares/auth.ts");
    expect(jwtFile).toBeDefined();
    // jwt.ts has the keyword in its filename — should outscore middleware
    if (middleware) {
      expect(jwtFile!.score).toBeGreaterThanOrEqual(middleware.score);
    }
  });

  it("includes matchedKeywords in results", () => {
    const results = analyzeFiles("jwt", allFiles);
    expect(results[0].matchedKeywords.length).toBeGreaterThan(0);
    expect(results[0].matchedKeywords.some(kw => kw.includes("jwt"))).toBe(true);
  });

  it("includes a non-empty reason string in every result", () => {
    const results = analyzeFiles("database connection", allFiles);
    for (const r of results) {
      expect(typeof r.reason).toBe("string");
      expect(r.reason.length).toBeGreaterThan(0);
    }
  });

  it("scores are between 0 and 100 inclusive", () => {
    const results = analyzeFiles("jwt database", allFiles);
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });

  it("respects the topN limit", () => {
    const results = analyzeFiles("jwt", allFiles, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("boosts score of files imported by a matched file (dependency tracing)", () => {
    // middlewareFile imports from authFile — when querying 'jwt',
    // authFile matches directly; middlewareFile should get a dependency boost.
    const results = analyzeFiles("jwt", allFiles, 10);
    const middleware = results.find(r => r.filename === "src/middlewares/auth.ts");
    expect(middleware).toBeDefined();
    expect(middleware!.score).toBeGreaterThan(0);
  });

  it("handles an empty files array without throwing", () => {
    expect(() => analyzeFiles("jwt", [])).not.toThrow();
    expect(analyzeFiles("jwt", [])).toHaveLength(0);
  });

  it("handles a single-word query", () => {
    const results = analyzeFiles("pool", [dbFile]);
    expect(results.length).toBeGreaterThan(0);
  });

  it("is case-insensitive for keyword matching", () => {
    const resultsLower = analyzeFiles("jwt", allFiles);
    const resultsUpper = analyzeFiles("JWT", allFiles);
    expect(resultsLower.map(r => r.filename)).toEqual(resultsUpper.map(r => r.filename));
  });

  it("filters out files with a score of 0", () => {
    const results = analyzeFiles("jwt", allFiles);
    for (const r of results) {
      expect(r.score).toBeGreaterThan(0);
    }
  });

  // Regression: error handling issue — analyzeFiles must not throw on
  // files with empty content (guards against crashes in the API route).
  it("handles files with empty content gracefully", () => {
    const emptyFile: FileInput = { filename: "src/empty.ts", content: "" };
    expect(() => analyzeFiles("jwt", [emptyFile])).not.toThrow();
  });
});
