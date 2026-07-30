const [major, minor] = process.versions.node.split(".").map(Number);
const supported = major > 22 || (major === 22 && minor >= 12);

if (!supported) {
  console.error(
    [
      "",
      `Node ${process.versions.node} is active, but this project requires Node 22.12 or newer.`,
      "",
      "With nvm:",
      "  nvm install",
      "  nvm use",
      "",
      "Without a Node version manager, use one of the repository wrappers:",
      "  npm run check:node22",
      "  npm run build:node22",
      "  npm run dev:node22",
      "",
    ].join("\n"),
  );
  process.exit(1);
}
