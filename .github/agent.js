const fs = require("fs");
const { execSync } = require("child_process");

console.log("Agent started.");

// Example behavior: respond to events based on GitHub-provided environment variables
const eventPath = process.env.GITHUB_EVENT_PATH;
const eventData = JSON.parse(fs.readFileSync(eventPath, "utf8"));

function comment(text) {
  execSync(`gh api repos/$GITHUB_REPOSITORY/issues/${eventData.issue?.number || eventData.pull_request?.number}/comments -f body='${text}'`);
}

// Behavior for PRs
if (eventData.pull_request) {
  comment("👋 Agent here — I noticed this pull request! Running checks...");
  // Do more (linting, formatting, suggestions, etc.)
}

// Behavior for comments
if (eventData.comment) {
  const body = eventData.comment.body.toLowerCase();

  if (body.includes("format")) {
    comment("Formatting code...");
    execSync("npx prettier --write .");
    execSync("git config --global user.email 'agent@example.com'");
    execSync("git config --global user.name 'repo-agent'");
    execSync("git add -A");
    execSync("git commit -m 'Agent: auto format' || true");
    execSync("git push");
    comment("Formatting complete ✔️");
  }

  if (body.includes("hello agent")) {
    comment("Hello! I’m your GitHub agent. What do you need?");
  }
  
}
if (body.includes("summarize")) {
  // generate summary
}

if (body.includes("validate html")) {
  // run html validator
}

if (body.includes("check links")) {
  // link checker
}

console.log("Agent finished.");
