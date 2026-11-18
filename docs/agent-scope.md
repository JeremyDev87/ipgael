# 역할과 새 메인에서 선택하여 사용하기

입갤은 문체 기본값입니다. 정확한 문자열·JSON·코드·게시용 원문과 명시한 출력 형식을 보존하며, 도구 권한·승인 절차·작업 범위는 기존 규칙을 따릅니다. [정책](../policy.md)을 먼저 확인하십시오.

## 역할 opt-in 전제

정상 설치·신뢰 검토를 마친 사본을 사용하십시오. `node`가 훅 실행 환경의 `PATH`에 있어야 합니다. 패키지의 기본 `SessionStart`가 비활성인 상태에서 프로젝트의 `SubagentStart`만 추가하십시오. **입갤 패키지만 비활성화하고 전체 훅 엔진은 활성 상태로 유지하십시오.** 설치와 신뢰 검토는 별도 절차입니다. [설치 안내](../install.md)

매칭 기준은 훅 이벤트에 실제로 보고된 `agent_type`입니다. Codex의 UI 이름·`task_name`, Claude의 파일명·별명으로 추정하지 마십시오. Claude 사용자 정의 역할은 frontmatter의 `name`, 플러그인 역할은 namespace를 포함한 이름을 확인하십시오. 예를 들어 실제 타입이 `my-plugin:reviewer`일 때만 아래 matcher를 그대로 사용합니다. 두 호스트 모두 실제 타입이 다르면 변경해야 합니다. [Codex 훅](https://learn.chatgpt.com/docs/hooks#subagentstart), [Claude 훅](https://code.claude.com/docs/en/hooks#subagentstart)

같은 타입으로 시작한 A/B 두 인스턴스는 모두 대상입니다. 이 설정으로 특정 `agent_id` 하나만 고를 수 없습니다. 자식에게 전달한 정책은 부모의 요약 문체를 지정하지 않습니다. 정책 이력이 없는 부모·비대상 형제·비대상 중첩 자식에는 이 matcher로 새 정책을 전달하지 않는 것이 검증 목표입니다. 자식 설정 상속과 기존 대화 이력은 별도로 확인해야 합니다.

## 프로젝트별 예제

두 예제는 각각 해당 프로젝트 파일의 기존 설정에 병합하십시오. 파일 전체를 덮어쓰지 마십시오. `/확인된 설치 경로/ipgael`은 placeholder입니다. 실제 설치 사본의 절대 경로와 `SubagentStart`를 지원하는 emitter를 확인한 뒤 바꾸십시오. 프로젝트 훅에 `PLUGIN_ROOT` 또는 `CLAUDE_PLUGIN_ROOT`가 제공된다고 가정하지 않습니다.

Codex: `.codex/hooks.json`

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "^my-plugin:reviewer$",
        "hooks": [
          {
            "type": "command",
            "command": "node '/확인된 설치 경로/ipgael/hooks/session-start.mjs' SubagentStart",
            "timeout": 3
          }
        ]
      }
    ]
  }
}
```

Claude Code: `.claude/settings.local.json` ([개인 프로젝트 설정](https://code.claude.com/docs/en/settings#settings-files-and-who-they-affect))

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "^my-plugin:reviewer$",
        "hooks": [
          {
            "type": "command",
            "command": "node '/확인된 설치 경로/ipgael/hooks/session-start.mjs' SubagentStart",
            "timeout": 3
          }
        ]
      }
    ]
  }
}
```

역할 이름의 정규식 메타문자는 먼저 이스케이프하고 양끝을 `^`와 `$`로 고정하십시오. 실제 타입 `my.plugin:reviewer`의 정규식은 `^my\.plugin:reviewer$`, JSON의 matcher 값은 `"^my\\.plugin:reviewer$"`입니다. 점을 그대로 쓰면 `myXplugin:reviewer`도 매칭할 수 있습니다.

위 명령은 macOS의 POSIX 셸 인용 규칙을 사용합니다. **경로 리터럴** 전체를 작은따옴표로 감싸고, 내부 작은따옴표 하나는 `'\''`로 바꾸십시오. 셸 명령을 완성한 뒤 command 전체를 JSON 문자열로 직렬화하십시오. 예를 들어 경로 ``/tmp/공백 ' $HOME `id`/session-start.mjs``의 셸 인용은 다음과 같습니다. 달러·백틱은 실행할 코드가 아니라 경로 문자입니다.

```sh
node '/tmp/공백 '\'' $HOME `id`/session-start.mjs' SubagentStart
```

위 command의 JSON 문자열 값은 ``"node '/tmp/공백 '\\'' $HOME `id`/session-start.mjs' SubagentStart"``입니다. JSON 직렬화에는 `JSON.stringify(command)`를 사용할 수 있지만, 이것만으로 셸 인용이 되지는 않습니다. 확인된 경로가 셸 변수에 이미 들어 있다면 `"$TASK_PLUGIN_ROOT/hooks/session-start.mjs"`처럼 변수 확장을 큰따옴표로 감싸십시오. Windows 셸의 인용 방식은 미검증입니다.

emitter의 인자는 정확히 `SubagentStart` 하나입니다. 무인자 호출은 기존 `SessionStart`이며, 명시적 `SessionStart`·다른 이벤트·추가 인자는 출력 없이 종료합니다. 정책 읽기에 실패해도 출력 없이 계속 진행하는 계약을 사용합니다.

## 독립된 새 메인 opt-in

역할 예제와 별도의 프로젝트에서 시작하십시오. 해당 프로젝트에는 위 `SubagentStart` 설정을 넣지 않고 패키지 기본 비활성을 유지합니다. 정상 설치·신뢰를 확인한 뒤 **새 대화**에서만 아래 옵션을 사용하십시오.

Codex:

```sh
codex -c 'plugins.ipgael@ipgael-local.enabled=true'
```

이 실행의 설정 재정의입니다. 지속 설정을 저장하는 명령이 아닙니다. 적용된 설정과 패키지 훅을 확인하십시오. [플러그인 설정](https://learn.chatgpt.com/docs/config-file/config-reference), [설정 우선순위](https://learn.chatgpt.com/docs/config-file/config-basic#configuration-precedence)

Claude Code:

```sh
claude --append-system-prompt-file "<확인된 설치 경로>/policy.md"
```

placeholder를 확인한 절대 경로로 바꾸십시오. 특수문자가 든 경로 리터럴에는 앞의 POSIX 작은따옴표 규칙을 적용하거나 확인한 변수 값 `"$TASK_PLUGIN_ROOT/policy.md"`를 사용하십시오. append-file은 기본 system prompt에 파일을 덧붙이는 옵션입니다. [Claude CLI](https://code.claude.com/docs/en/cli-reference#system-prompt-flags)

이 방법은 메인을 고르는 방법이며, 모든 자식을 강제로 제외하는 격리 기능이 아닙니다. 자식 설정 상속·분기 방식에 따라 전달 범위를 확인하십시오.

## 비활성화와 새 대화

역할 opt-in을 끝내려면 추가한 해당 matcher 항목만 제거하고 새 대화를 시작하십시오. 독립 메인 opt-in을 끝내려면 해당 옵션 없이 `codex` 또는 `claude`로 별도의 새 대화를 시작하십시오. 패키지 기본 비활성은 유지합니다. 기존 대화에서 문체를 끄는 요청은 문맥에 남아 있는 동안의 정책 예외이며, 이미 받은 정책을 지우는 기능이 아닙니다.

## 재개·분기·압축의 한계

| 상황 | 구분하여 확인할 항목 |
| --- | --- |
| 정책 이력이 없는 새 부모와 새 자식 | 실제 역할별 신규 주입 여부와 자식 설정 상속 |
| Codex `fork_turns: none` / `all` | 새 문맥과 전체 이력 복제를 구분합니다. `all`에는 부모 정책 이력이 남을 수 있습니다. |
| Claude 일반 자식 / fork | 일반 자식의 새 문맥과 fork의 문맥 재사용을 구분합니다. [자식 시작 문맥](https://code.claude.com/docs/en/sub-agents#what-loads-at-startup) |
| resume / fork / clear / compact | 이번 훅의 신규·재주입과 이전 문맥 잔존을 따로 기록합니다. 옵션 생략만으로 잔존 정책이 사라졌다고 판단하지 않습니다. |

Claude의 재개는 저장된 system prompt snapshot을 사용할 수 있습니다. append-file 옵션을 생략하거나 바꾸더라도 즉시 이전 정책이 없어지는 것으로 해석하지 마십시오. [재개 시 prompt](https://code.claude.com/docs/en/cli-reference#system-prompt-flags-in-resumed-conversations)

## 검증 범위

| 구분 | 환경 / 상태 |
| --- | --- |
| 계획 탐색에서 기록한 환경 | macOS, Codex `0.167.0-alpha.3.2`, Claude Code `2.1.318`, Node.js `24.15.0`. 이번 역할·메인 실행 결과가 아닙니다. |
| 이번 문서 예제 검사 | macOS Darwin `25.6.0`, Node.js `24.15.0`, `/bin/sh`. JSON 두 예제, 정확 matcher, 특수문자 경로 인자 전달만 검사합니다. |
| Codex 실제 역할·독립 메인·수명·승인 | 미검증. 별도 호스트 검증이 필요합니다. |
| Claude 직접 프로젝트 훅·append-file·수명·승인 | 미검증. 별도 호스트 검증이 필요합니다. |
| Claude 설치 패키지 결합 | [#5](https://github.com/JeremyDev87/ipgael/issues/5) 반영과 정상 설치·신뢰 확인 후 별도 검증합니다. 직접 파일 검사는 패키지 결합 증거가 아닙니다. |

기능별 최소 버전과 다른 운영체제는 미확인입니다. 호스트 검증에서는 동일 역할 두 인스턴스, 비대상 형제·중첩·부모, 선택/일반 새 메인, 정확 출력, 정상 승인 거절과 미실행, 지속 설정 전후를 확인해야 합니다. 훅 stdout이나 모델의 자기 보고만으로 실제 자식 전달을 입증할 수 없습니다. [#7](https://github.com/JeremyDev87/ipgael/issues/7)의 공유 테스트·공존 검증은 후속 범위입니다.
