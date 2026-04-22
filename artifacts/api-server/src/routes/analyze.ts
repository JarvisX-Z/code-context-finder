import { Router, type IRouter } from "express";
import { AnalyzeCodebaseBody, AnalyzeCodebaseResponse } from "@workspace/api-zod";
import { analyzeFiles } from "../lib/analyzer";

const router: IRouter = Router();

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeCodebaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { query, files } = parsed.data;

  if (!query.trim()) {
    res.status(400).json({ error: "Query must not be empty." });
    return;
  }

  if (!Array.isArray(files) || files.length === 0) {
    res.status(400).json({ error: "At least one file is required." });
    return;
  }

  const results = analyzeFiles(query, files, 5);

  res.json(
    AnalyzeCodebaseResponse.parse({
      query,
      totalFilesScanned: files.length,
      results,
    })
  );
});

export default router;
