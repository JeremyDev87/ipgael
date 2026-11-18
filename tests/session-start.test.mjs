import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const emitter = new URL("../hooks/session-start.mjs", import.meta.url);
const rejectedArgs = [
  ["SessionStart"],
  ["Stop"],
  ["FutureEvent"],
  ["subagentstart"],
  [""],
  ["--help"],
  ["SubagentStart", "extra"],
  ["SubagentStart", "SubagentStart"],
  ["--event", "SubagentStart"],
  ["../policy.md"],
];

function createFixture(t, policy) {
  const fixture = mkdtempSync(join(tmpdir(), "ipgael-fixture-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));

  const install = join(fixture, "plugin with spaces");
  const hooks = join(install, "hooks");
  const cwd = join(fixture, "working directory");
  mkdirSync(hooks, { recursive: true });
  mkdirSync(cwd);
  writeFileSync(join(cwd, "policy.md"), "읽으면 안 되는 작업 디렉터리 정책");

  const script = join(hooks, "session-start.mjs");
  copyFileSync(emitter, script);
  if (policy === null) mkdirSync(join(install, "policy.md"));
  else if (policy !== undefined) writeFileSync(join(install, "policy.md"), policy);

  return { script, cwd };
}

function runHook({ script, cwd }, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
  assert.ifError(result.error);
  assert.equal(result.status, 0, "훅은 정상 종료해야 합니다");
  assert.equal(result.stderr, "", "표준 오류는 비어 있어야 합니다");
  return result.stdout;
}

for (const [eventName, args] of [["SessionStart", []], ["SubagentStart", ["SubagentStart"]]]) {
  test(`${eventName}은 설치 경로의 정책 원문만 JSON 한 줄로 전달한다`, (t) => {
    const policy = "\uFEFF  첫 줄 ㅋㅋ\r\n둘째 줄 😎\n\n  ";
    const stdout = runHook(createFixture(t, policy), args);

    assert.match(stdout, /^[^\r\n]+\n$/u);
    assert.deepEqual(JSON.parse(stdout), {
      hookSpecificOutput: {
        hookEventName: eventName,
        additionalContext: policy,
      },
    });
  });

  for (const [description, policy] of [
    ["누락되고 작업 디렉터리에만 존재할 때", undefined],
    ["빈 문자열일 때", ""],
    ["공백뿐일 때", " \t\r\n "],
    ["유효하지 않은 UTF-8일 때", Buffer.from([0xc3, 0x28])],
    ["파일 대신 디렉터리일 때", null],
  ]) {
    test(`${eventName}은 설치 정책이 ${description} 아무것도 출력하지 않는다`, (t) => {
      assert.equal(runHook(createFixture(t, policy), args), "");
    });
  }
}

for (const args of rejectedArgs) {
  test(`인자 ${JSON.stringify(args)}는 정상 정책이 있어도 아무것도 출력하지 않는다`, (t) => {
    assert.equal(runHook(createFixture(t, "설치 정책"), args), "");
  });
}

test("거부한 인자는 정책 파일을 읽지 않는다", (t) => {
  const { script, cwd } = createFixture(t, "설치 정책");
  const preload = `
    import fs from "node:fs";
    import { syncBuiltinESMExports } from "node:module";
    const readFileSync = fs.readFileSync;
    fs.readFileSync = (...args) => {
      if (String(args[0]).endsWith("/policy.md")) process.stderr.write("정책 읽기 감지");
      return readFileSync(...args);
    };
    syncBuiltinESMExports();
  `;
  const preloadArg = `data:text/javascript,${encodeURIComponent(preload)}`;
  const control = spawnSync(process.execPath, ["--import", preloadArg, script], { cwd, encoding: "utf8" });
  assert.ifError(control.error);
  assert.equal(control.status, 0, "읽기 감지 대조군은 정상 종료해야 합니다");
  assert.equal(control.stderr, "정책 읽기 감지", "대조군에서 정책 읽기가 감지되어야 합니다");
  for (const args of rejectedArgs) {
    const result = spawnSync(process.execPath, [
      "--import", preloadArg, script, ...args,
    ], { cwd, encoding: "utf8" });
    assert.ifError(result.error);
    assert.equal(result.status, 0, "거부한 인자도 정상 종료해야 합니다");
    assert.equal(result.stderr, "", "거부한 인자는 정책을 읽으면 안 됩니다");
    assert.equal(result.stdout, "", "거부한 인자는 정책을 출력하면 안 됩니다");
  }
});
