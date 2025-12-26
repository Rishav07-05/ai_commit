import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

/**
 * Check if the given directory is inside a git repository
 */
export function isGitRepo(workspacePath: string): boolean {
  const gitPath = path.join(workspacePath, ".git");
  return fs.existsSync(gitPath);
}

/**
 * Get staged git diff (git diff --cached)
 */
export async function getStagedDiff(
  workspacePath: string
): Promise<string> {
  if (!isGitRepo(workspacePath)) {
    throw new Error("Not a git repository");
  }

  try {
    const { stdout } = await execAsync("git diff --cached", {
      cwd: workspacePath,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer for large diffs
    });

    return stdout.trim();
  } catch (error) {
    console.error("Failed to get staged diff:", error);
    throw new Error("Failed to read staged git diff");
  }
}

/**
 * Check if there are any staged files
 */
export async function hasStagedChanges(
  workspacePath: string
): Promise<boolean> {
  try {
    const { stdout } = await execAsync("git diff --cached --name-only", {
      cwd: workspacePath,
    });

    return stdout.trim().length > 0;
  } catch (err) {
    console.error("Failed to check staged files:", err);
    throw new Error("Failed to check staged files");
  }
}

/**
 * Commit staged changes with the provided message
 */
export async function commitStaged(
  workspacePath: string,
  message: string
): Promise<string> {
  try {
    // Escape double quotes in message
    const safeMessage = message.replace(/"/g, '\\"');
    const { stdout, stderr } = await execAsync(
      `git commit -m "${safeMessage}"`,
      {
        cwd: workspacePath,
        maxBuffer: 1024 * 1024 * 10,
      }
    );

    if (stderr) {
      console.warn("git commit stderr:", stderr);
    }

    return stdout.trim();
  } catch (err: any) {
    console.error("Failed to commit staged changes:", err);
    // Surface git error message when possible
    const messageText = err?.message || "git commit failed";
    throw new Error(messageText);
  }
}

/**
 * Push commits to the remote 'origin'
 */
export async function push(workspacePath: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync("git push origin main", {
      cwd: workspacePath,
    });

    if (stderr) {
      console.warn("git push stderr:", stderr);
    }

    return stdout.trim();
  } catch (err: any) {
    console.error("Failed to push changes:", err);
    const messageText = err?.message || "git push failed";
    throw new Error(messageText);
  }
}

/**
 * Stage a single file
 */
export async function stageFile(
  workspacePath: string,
  filePath: string
): Promise<void> {
  try {
    await execAsync(`git add "${filePath}"`, { cwd: workspacePath });
  } catch (err: any) {
    console.error(`Failed to stage file ${filePath}:`, err);
    throw new Error(`Failed to stage file: ${err.message}`);
  }
}
