export interface FileInput {
  filename: string;
  content: string;
}

export interface AnalyzedFile {
  filename: string;
  content: string;
  score: number;
  matchedKeywords: string[];
  reason: string;
}

function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9_]/g, ""))
    .filter((w) => w.length >= 2);
}

function extractImports(content: string): string[] {
  const importRegex =
    /import\s+(?:[^'"]+from\s+)?['"]([^'"]+)['"]/g;
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  const imported: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    imported.push(match[1]);
  }
  while ((match = requireRegex.exec(content)) !== null) {
    imported.push(match[1]);
  }
  return imported;
}

function scoreFile(
  file: FileInput,
  keywords: string[]
): { score: number; matchedKeywords: string[]; reason: string } {
  const contentLower = file.content.toLowerCase();
  const filenameLower = file.filename.toLowerCase();

  const matched: string[] = [];
  let baseScore = 0;

  for (const kw of keywords) {
    const inFilename = filenameLower.includes(kw);
    const contentCount = (
      contentLower.match(new RegExp(`\\b${kw}\\b`, "g")) ?? []
    ).length;

    if (inFilename) {
      baseScore += 20;
      if (!matched.includes(kw)) matched.push(kw);
    }
    if (contentCount > 0) {
      const kwScore = Math.min(15, 5 + contentCount * 2);
      baseScore += kwScore;
      if (!matched.includes(kw)) matched.push(kw);
    }
  }

  let reason = "No direct match found.";
  if (matched.length > 0) {
    const inFilenameMatches = matched.filter((kw) =>
      file.filename.toLowerCase().includes(kw)
    );
    if (inFilenameMatches.length > 0) {
      reason = `Filename matches ${inFilenameMatches.join(", ")}; also found in content.`;
    } else {
      reason = `Query term(s) "${matched.join('", "')}" found in file content.`;
    }
  }

  const normalizedScore = Math.min(100, Math.round(baseScore));
  return { score: normalizedScore, matchedKeywords: matched, reason };
}

export function analyzeFiles(
  query: string,
  files: FileInput[],
  topN = 5
): AnalyzedFile[] {
  const keywords = tokenizeQuery(query);

  const scored: (AnalyzedFile & { hasDependency: boolean })[] = files.map(
    (file) => {
      const { score, matchedKeywords, reason } = scoreFile(file, keywords);
      return {
        ...file,
        score,
        matchedKeywords,
        reason,
        hasDependency: false,
      };
    }
  );

  const directlyMatched = new Set(
    scored.filter((f) => f.score > 0).map((f) => f.filename)
  );

  for (const file of files) {
    if (!directlyMatched.has(file.filename)) continue;
    const imports = extractImports(file.content);
    for (const imp of imports) {
      for (const candidate of scored) {
        if (candidate.filename === file.filename) continue;
        const baseName = candidate.filename
          .replace(/\.(ts|tsx|js|jsx|py|go|rb|java|cs)$/, "")
          .split("/")
          .pop();
        if (baseName && imp.includes(baseName)) {
          if (!candidate.hasDependency) {
            candidate.hasDependency = true;
            candidate.score = Math.min(100, candidate.score + 15);
            if (candidate.matchedKeywords.length === 0) {
              candidate.reason = `Imported by matched file "${file.filename}".`;
            } else {
              candidate.reason += ` Also imported by "${file.filename}".`;
            }
          }
        }
      }
    }
  }

  return scored
    .filter((f) => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ hasDependency: _hd, ...rest }) => rest);
}
