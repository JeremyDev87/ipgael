import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const emitter = new URL("../hooks/session-start.mjs", import.meta.url);

function runHook(t, policy) {
  const fixture = mkdtempSync(join(tmpdir(), "ipgael-fixture-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));

  const install = join(fixture, "plugin with spaces");
  const hooks = join(install, "hooks");
  const cwd = join(fixture, "working directory");
  mkdirSync(hooks, { recursive: true });
  mkdirSync(cwd);

  const script = join(hooks, "session-start.mjs");
  copyFileSync(emitter, script);
  if (policy !== undefined) writeFileSync(join(install, "policy.md"), policy);

  const result = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test("emits only the original policy as SessionStart context", (t) => {
  const policy = "\uFEFF  첫 줄 ㅋㅋ\r\n둘째 줄 😎\n\n  ";
  const stdout = runHook(t, policy);

  assert.match(stdout, /^[^\r\n]+\n$/u);
  assert.deepEqual(JSON.parse(stdout), {
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: policy,
    },
  });
});

for (const [description, policy] of [
  ["missing", undefined],
  ["empty", ""],
  ["whitespace-only", " \t\r\n "],
  ["invalid UTF-8", Buffer.from([0xc3, 0x28])],
]) {
  test(`emits no output when the policy is ${description}`, (t) => {
    assert.equal(runHook(t, policy), "");
  });
}
