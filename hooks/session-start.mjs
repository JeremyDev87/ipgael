import { readFileSync } from "node:fs";

function readPolicy() {
  try {
    const bytes = readFileSync(new URL("../policy.md", import.meta.url));
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return "";
  }
}

function buildOutput(policy) {
  if (!policy.trim()) return "";

  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: policy,
    },
  });
}

const output = buildOutput(readPolicy());
if (output) process.stdout.write(`${output}\n`);
