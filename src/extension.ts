import * as vscode from "vscode";
import { getStagedDiff, commitStaged, hasStagedChanges } from "./git";
import { generateCommitMessage } from "./ai";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "aiCommit.generate",
    async () => {
      try {
        // 1. Ensure workspace exists
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode.window.showErrorMessage("No workspace folder open");
          return;
        }

        // 2. Ensure there are staged changes
        const hasStaged = await hasStagedChanges(workspaceFolder.uri.fsPath);
        if (!hasStaged) {
          vscode.window.showWarningMessage(
            "No staged changes found. Stage files first."
          );
          return;
        }

        // helper to generate and show UI for commit actions
        const generateAndShow = async () => {
          const diff = await getStagedDiff(workspaceFolder.uri.fsPath);

          // 3. Generate AI commit message
          const commitMessage = await generateCommitMessage(diff);

          if (!commitMessage) {
            vscode.window.showErrorMessage("Failed to generate commit message");
            return null;
          }

          // Show message with action buttons
          const useAndCommit = "Use & Commit";
          const regenerate = "Regenerate";
          const choice = await vscode.window.showInformationMessage(
            `AI Commit Suggestion: "${commitMessage}"`,
            useAndCommit,
            regenerate,
            "Cancel"
          );

          return { choice, commitMessage } as
            | { choice: string | undefined; commitMessage: string }
            | null;
        };

        // loop for regenerate attempts (max 3)
        let attempt = 0;
        while (attempt < 3) {
          const result = await generateAndShow();
          if (!result) return;

          const { choice, commitMessage } = result;

          if (choice === "Use & Commit") {
            // perform commit
            try {
              const out = await commitStaged(
                workspaceFolder.uri.fsPath,
                commitMessage
              );
              vscode.window.showInformationMessage(
                `Committed: ${commitMessage}`
              );
              return;
            } catch (err: any) {
              vscode.window.showErrorMessage(
                `Commit failed: ${err?.message ?? String(err)}`
              );
              return;
            }
          } else if (choice === "Regenerate") {
            attempt++;
            // continue loop to regenerate
            continue;
          } else {
            // Cancel or undefined
            return;
          }
        }
        vscode.window.showWarningMessage(
          "Reached regenerate limit. Try staging clearer changes or commit manually."
        );
      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage("AI Commit Helper failed");
      }
    }
  );

  // Add a status bar button for quick access
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBar.text = "$(rocket) AI Commit";
  statusBar.tooltip = "Generate a short AI commit message and commit staged changes";
  statusBar.command = "aiCommit.generate";
  statusBar.show();

  context.subscriptions.push(statusBar);

  context.subscriptions.push(disposable);
}

export function deactivate() {}
