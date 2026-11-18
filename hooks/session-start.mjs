import { readFileSync } from "node:fs";

function readPolicy() {
  try {
    const bytes = readFileSync(new URL("../policy.md", import.meta.url));
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return "";
  }
}

function buildOutput(policy, eventName) {
  if (!policy.trim()) return "";

  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: policy,
    },
  });
}

const args = process.argv.slice(2);
if (args.length === 0 || (args.length === 1 && args[0] === "SubagentStart")) {
  const eventName = args.length === 0 ? "SessionStart" : "SubagentStart";
  const output = buildOutput(readPolicy(), eventName);
  if (output) process.stdout.write(`${output}\n`);
}
