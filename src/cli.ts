#!/usr/bin/env node
import { getStagedDiff, commitStaged, hasStagedChanges, push } from "./git";
import { generateCommitMessage } from "./ai";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  try {
    const workspacePath = process.cwd();

    if (!hasStagedChanges(workspacePath)) {
      console.warn("No staged changes found. Stage files to commit first.");
      return;
    }

    const diff = await getStagedDiff(workspacePath);
    const commitMessage = await generateCommitMessage(diff);

    console.log(`\nAI-generated commit message:\n\n> ${commitMessage}\n`);

    rl.question(
      "Do you want to commit with this message? (y/n/r) ",
      async (answer) => {
        if (answer.toLowerCase() === "y") {
          await commitStaged(workspacePath, commitMessage);
          console.log("\nChanges committed successfully!");
          console.log("Pushing to remote...");
          await push(workspacePath);
          console.log("Changes pushed successfully!");
        } else if (answer.toLowerCase() === "r") {
          console.log("\nRegenerating message...");
          main(); // Re-run the main function
          return;
        } else {
          console.log("\nCommit aborted.");
        }
        rl.close();
      }
    );
  } catch (error: any) {
    console.error("\nAn error occurred:", error.message);
    rl.close();
  }
}

main();



// all work of the AI is done here

// this is for checking purpose that is it working or not 