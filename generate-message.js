
const { getStagedDiff } = require('./out/git.js');
const { generateCommitMessage } = require('./out/ai.js');

process.env.GEMINI_API_KEY = "AIzaSyAts2SkhvuBD0ktOYGN6eYtHPNO8tiClho";

async function main() {
  try {
    const diff = await getStagedDiff(process.cwd());
    if (!diff) {
      console.log("feat: Add single file commit button"); // Fallback message
      return;
    }
    const message = await generateCommitMessage(diff);
    console.log(message);
  } catch (e) {
    console.error("Failed to generate commit message:", e);
    console.log("feat: Add single file commit button"); // Fallback message on error
  }
}

main();


