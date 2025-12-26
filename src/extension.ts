import * as vscode from "vscode";
import { getStagedDiff, commitStaged, hasStagedChanges, push, stageFile } from "./git";
import { generateCommitMessage } from "./ai";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "aiCommit.generate",
    async () => {
      try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode.window.showErrorMessage("No workspace folder open");
          return;
        }

        const hasStaged = await hasStagedChanges(workspaceFolder.uri.fsPath);
        if (!hasStaged) {
          vscode.window.showWarningMessage(
            "No staged changes found. Stage files first."
          );
          return;
        }

        const generateAndShow = async () => {
          const diff = await getStagedDiff(workspaceFolder.uri.fsPath);
          const commitMessage = await generateCommitMessage(diff);

          if (!commitMessage) {
            vscode.window.showErrorMessage("Failed to generate commit message");
            return null;
          }

          const useAndCommit = "Use, Commit & Push";
          const regenerate = "Regenerate";
          const choice = await vscode.window.showInformationMessage(
            `AI Commit Suggestion: "${commitMessage}"`,
            { modal: true },
            useAndCommit,
            regenerate,
            "Cancel"
          );

          return { choice, commitMessage };
        };

        let attempt = 0;
        while (attempt < 3) {
          const result = await generateAndShow();
          if (!result) return;

          const { choice, commitMessage } = result;

          if (choice === "Use, Commit & Push") {
            try {
              await commitStaged(workspaceFolder.uri.fsPath, commitMessage);
              vscode.window.showInformationMessage(`Committed: ${commitMessage}`);
              
              await push(workspaceFolder.uri.fsPath);
              vscode.window.showInformationMessage("Changes pushed successfully!");
              return;
            } catch (err: any) {
              vscode.window.showErrorMessage(`Operation failed: ${err?.message ?? String(err)}`);
              return;
            }
          } else if (choice === "Regenerate") {
            attempt++;
            continue;
          } else {
            return;
          }
        }
        vscode.window.showWarningMessage("Reached regenerate limit. Try staging clearer changes or commit manually.");
      } catch (error: any) {
        console.error(error);
        vscode.window.showErrorMessage(`AI Commit Helper failed: ${error.message}`);
      }
    }
  );

  const commitFileCommand = vscode.commands.registerCommand(
    "aiCommit.commitFile",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No active editor found.");
        return;
      }

      const fileUri = editor.document.uri;
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found for the current file.");
        return;
      }

      try {
        await stageFile(workspaceFolder.uri.fsPath, fileUri.fsPath);

        // Now that the file is staged, we can reuse the existing generate command
        await vscode.commands.executeCommand("aiCommit.generate");
        
      } catch (error: any) {
        console.error(error);
        vscode.window.showErrorMessage(`Failed to commit file: ${error.message}`);
      }
    }
  );

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.text = "$(rocket) AI Commit";
  statusBar.tooltip = "Generate AI commit message, commit, and push staged changes";
  statusBar.command = "aiCommit.generate";
  statusBar.show();

  context.subscriptions.push(statusBar, disposable, commitFileCommand);
}

export function deactivate() {}
