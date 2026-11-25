# 입갤 · ipgael

**Codex 답변을 디시체로.**

저장 버튼 눌렀는데 DB에 쓰기도 전에 ‘저장 완료’가 뜸. 이 버그를 설명해달라고 하면:

> **적용 전:** 비동기 저장 작업의 완료 시점을 보장한 뒤 성공 메시지를 표시하도록 개선하는 것을 권장합니다.
>
> **입갤:** DB에 쓰기도 전에 ‘저장 완료’부터 띄움 ㅋㅋ 축포부터 쏘고 경기 시작하냐. `await save()`가 성공한 뒤에 띄워.

이런 식으로 **뭐가 문제고 뭘 고치면 되는지** 바로 말하게 하는 로컬 Codex 플러그인임. 테스트만 돌렸으면 “테스트 통과. 배포는 아직 안 봄”이라고 함. 안 한 걸 했다고 포장하거나 코드·로그를 말투에 맞춰 뜯어고치진 않음.

[릴리스](https://github.com/JeremyDev87/ipgael/releases/latest) · [Desktop 설치](#desktop-수동-설치) · [CLI 설치](#cli-설치) · [LLM에게 설치 맡기기](#llm에게-설치-맡기기)

## 설치하고 써보기

**로컬 Codex와 `node`가 필요함.** 훅이 실행되는 환경의 `PATH`에서 `node`를 찾을 수 있으면 됨. npm 설치나 빌드는 필요 없음.

### Desktop 수동 설치

1. 이 저장소의 `main` 사본을 받아 Codex Desktop에서 로컬 프로젝트로 열고 앱을 재시작.
2. **Plugins → 입갤 로컬 → 입갤 · ipgael**에서 설치하고, 쓸 프로젝트에서 켜져 있는지 확인.
3. [훅 검토와 첫 실행](#훅-검토와-첫-실행)으로.

이미 공식 GitHub 출처로 `ipgael-local`을 등록했으면 그걸 써. 같은 이름으로 로컬 사본까지 추가할 필요 없음.

### CLI 설치

[설치 전 확인](install.md#설치-전-확인)에서 기존 설치랑 `ipgael-local`의 출처부터 확인. **등록이나 설치가 안 된 단계만** 실행하면 됨. 같은 이름이 다른 출처를 가리키면 덮어쓰지 말고 멈춰.

마켓플레이스 등록이 안 돼 있으면:

```sh
codex plugin marketplace add JeremyDev87/ipgael --ref main --json
```

등록된 이름이 `ipgael-local`인지 확인하고, 플러그인이 아직 안 깔렸으면:

```sh
codex plugin add ipgael@ipgael-local --json
```

`codex plugin list --marketplace ipgael-local --json`으로 설치와 활성화 상태를 각각 확인. 일부러 꺼둔 설치는 그대로 두면 됨.

### 훅 검토와 첫 실행

설치만 하면 끝인 줄 알았지? **훅은 직접 검토하고 신뢰해야 실행됨.** CLI는 `/hooks`, Desktop은 **Review hooks** 또는 **Settings → Hooks**에서 `SessionStart`의 [정의](hooks/hooks.json)와 [실행 스크립트](hooks/session-start.mjs)를 확인해.

신뢰한 뒤 **새 로컬 대화**에서 두 가지만 찍어봐.

1. `Redis 캐시 만료 시간을 왜 설정해?` → 결론부터 쉽게 설명하는지 확인. 실제 말투는 모델과 대화에 따라 달라짐.
2. `정확히 OK만 출력해줘.` → `OK`만 나와야 함. 여기서 ㅋㅋ 붙이면 입갤이 아니라 오답임.

### LLM에게 설치 맡기기

로컬 셸을 쓸 수 있는 LLM에 아래를 복붙. 설치를 맡겨도 훅 신뢰 여부는 님이 결정함.

```text
아래 안내를 읽고 현재 사용자 계정의 로컬 Codex에 입갤(ipgael)을 지속 설치해줘.
https://raw.githubusercontent.com/JeremyDev87/ipgael/main/install.md
기존 설치와 출처를 먼저 확인하고, 훅 신뢰 검토가 남으면 내가 진행할 위치를 알려줘.
```

## 평소엔 그냥 쓰면 됨

- 질문마다 플러그인 부를 필요 없음. 이 대화에서만 빼고 싶으면 `이 대화에서 입갤 말투 꺼줘`, 다시 쓰려면 `이 대화에서 입갤 말투 다시 켜줘`. 문맥 압축 뒤에도 기억하는지는 확인 안 됨.
- 아예 끄려면 **Plugins**에서 입갤을 끄고 새 대화를 열어. 기존 대화엔 이미 전달된 정책이 남을 수 있음.
- JSON만 달라면 JSON만. PR 본문이나 커밋 메시지는 님이 정한 형식과 저장소 규칙에 맞춤. 입갤체는 기본값이지 산출물까지 덮어쓰는 룰이 아님.
- 막힌 일 보고는 세 줄: 뭐가 막혔는지, 어떻게 풀 건지, 지금 뭘 하면 되는지. 항목명 없이 내용부터 씀. 잡담까지 세 줄로 자르진 않음.

**깔았는데 그대로임?** 플러그인이 켜졌는지 → 훅을 신뢰했는지 → 훅이 `node`를 찾는지 → 새 로컬 대화인지 순서대로 봐. CLI에 설치 명령이 없으면 [Desktop 수동 설치](#desktop-수동-설치)로.

<details>
<summary>어떻게 동작하고 어디까지 확인했냐</summary>

`SessionStart` 훅이 시작·재개·초기화·압축·분기 때 [말투 정책](policy.md)을 모델에 전달함. 정책 파일을 읽지 못하면 출력 없이 끝남. 도구 호출·권한·승인은 기존 Codex 설정 그대로임.

- **확인함:** macOS에서 Codex `0.167.0-alpha.3.2`와 Node.js `24.15.0` 조합으로 로컬 설치, 훅 발견·전달, 미신뢰·비활성 상태와 승인 흐름을 확인함. `node --test tests/session-start.test.mjs`로 훅 전달과 파일 오류를 검사함.
- **아직 안 봄:** 최소 지원 버전, 다른 OS, Desktop UI에서 처음부터 끝까지 설치하는 흐름. 모델이 모든 대화에서 같은 말투와 형식을 지키는 것도 보장하지 않음.

[플러그인 매니페스트](.codex-plugin/plugin.json) · [공식 로컬 설치 문서](https://developers.openai.com/plugins/build/plugins#install-a-local-plugin-manually) · [공식 훅 검토 문서](https://learn.chatgpt.com/docs/hooks#review-and-trust-hooks)

</details>
