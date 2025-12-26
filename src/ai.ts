import { GoogleGenerativeAI } from "@google/generative-ai";
import * as vscode from "vscode";

/**
 * Enforces max 7 words strictly
 */
function enforceSevenWords(message: string): string {
  return message
    .replace(/[\n\r]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 7)
    .join(" ");
}

export async function generateCommitMessage(diff: string): Promise<string> {
  if (!diff) {
    throw new Error("Empty diff");
  }

  const apiKey =
    vscode.workspace.getConfiguration("aiCommit").get<string>("geminiApiKey") ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API Key not found. Please set 'AI Committer: Gemini Api Key' in your settings."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const MAX_DIFF_CHARS = 4000;
  const trimmedDiff =
    diff.length > MAX_DIFF_CHARS ? diff.slice(0, MAX_DIFF_CHARS) : diff;

  const prompt = `
Generate a git commit message.

Rules:
- Maximum 7 words
- Imperative tense
- Describe WHAT changed
- No punctuation
- No quotes

Diff:
${trimmedDiff}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    if (!text) throw new Error("Empty AI response");

    return enforceSevenWords(text);
  } catch (err) {
    console.error("Gemini failed:", err);
    return "Update project files";
  }
}
