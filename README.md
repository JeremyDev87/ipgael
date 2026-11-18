# 입갤 · ipgael

**에이전트 입갤. 설명은 디시체로, 코드는 그대로.**

Codex의 설명·진행 보고·질문·최종 리뷰를 짧고 직설적인 디시인사이드식 반말로 표현하는 응답 스타일 플러그인입니다.

## 어떤 느낌인가

**일반 설명**

> PKCE는 인증 코드를 탈취한 공격자가 해당 코드를 토큰으로 교환하지 못하도록 보호하는 방식입니다.

**입갤 스타일 예시**

> PKCE는 ‘로그인 코드만 주워도 토큰은 못 받게 하는 장치’임.
> 앱이 비밀값을 하나 만들고, 처음에는 그 해시만 서버에 보내둠.
> 나중에 코드를 토큰으로 바꿀 때 원본을 내밀어서 대조하는 거임. 교환권만 주웠다고 받아가는 게 아님 ㅋㅋ

위 문장은 목표로 하는 말투의 예시입니다.

## 적용 범위

- 일반 기술 설명, 진행 보고, 질문, 최종 리뷰의 결론을 먼저 말합니다. `ㅇㅋ`, `ㅋㅋ`, `~임`, `~함` 같은 표현은 문맥에 맞을 때만 씁니다.
- 상위 지침과 프로젝트 규칙, 사용자가 지정한 언어·말투·출력 형식을 우선합니다. 설명의 의미, 근거, 조건, 불확실성, 검증 상태를 유지합니다.
- `JSON만`, `코드만`, `정확히 OK만`처럼 전체 출력의 형식이 지정되면 그 형식을 따릅니다. 코드, 명령어, 로그, 식별자, 오류 메시지, 직접 인용과 제공된 게시용 원문은 그대로 둡니다. 새 PR 본문과 커밋 메시지는 요청과 저장소 형식을 따릅니다.

## macOS에서 로컬 설치

Codex 데스크톱 로컬 세션과 훅 실행 환경의 `PATH`에 있는 `node`가 필요합니다. 추가 npm 패키지는 필요하지 않습니다.

1. 이 저장소를 받아 Codex 데스크톱의 로컬 프로젝트로 열고 앱을 다시 시작합니다. 저장소의 [로컬 마켓플레이스](.agents/plugins/marketplace.json)가 저장소 루트의 플러그인을 가리킵니다. [로컬 플러그인 설치 문서](https://developers.openai.com/plugins/build/plugins#install-a-local-plugin-manually)
2. `Plugins`에서 `ipgael`을 찾아 수동으로 설치하고 활성화합니다. [플러그인 사용 문서](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins)
3. 작성창의 **Review hooks** 또는 **Settings → Hooks**에서 `ipgael`의 `SessionStart` 명령과 [실행 스크립트](hooks/session-start.mjs)를 확인하고, 실행할 훅을 신뢰합니다. 신뢰하지 않은 훅은 Codex가 건너뜁니다. [플러그인 훅 검토 문서](https://learn.chatgpt.com/docs/hooks#plugin-bundled-hooks)
4. 새 로컬 대화에서 일반 기술 질문으로 말투를 확인합니다.

현재 대화에서 잠시 끄려면 `이 대화에서 입갤 말투 꺼줘`, 다시 쓰려면 `이 대화에서 입갤 말투 다시 켜줘`라고 요청하세요. 계속 끄려면 `Plugins`에서 `ipgael`을 비활성화하고 새 대화를 시작하세요. 이미 받은 정책은 기존 대화 문맥에 남을 수 있습니다. 대화 안에서 한 off 요청이 문맥 압축 후에도 유지되는지는 검증이 필요합니다. [로컬 플러그인 활성화 문서](https://developers.openai.com/plugins/build/plugins#how-local-marketplaces-work)

## 동작과 검증

[플러그인 매니페스트](.codex-plugin/plugin.json)는 동기 [`SessionStart` 훅](hooks/hooks.json) 하나를 등록합니다. 시작·재개·초기화·압축·분기에서 [말투 정책](policy.md)을 모델 문맥에 전달합니다. 정책 파일이 없거나 비어 있거나 잘못 인코딩되어 있으면 스크립트는 출력 없이 종료합니다. 말투와 형식 보존은 모델이 정책을 따르는지 실제 응답을 보고 평가합니다.

macOS의 격리된 Codex 데스크톱 번들 런타임 `0.167.0-alpha.3.2`에서 로컬 설치와 훅 발견을 확인했습니다. 이 버전은 루트의 이식형 매니페스트를 읽지만 해당 형식의 훅은 로드 대상에서 제외하므로 호환 매니페스트인 `.codex-plugin/plugin.json`을 사용합니다. [해당 버전의 훅 로더](https://github.com/openai/codex/blob/rust-v0.167.0-alpha.3.2/codex-rs/core-plugins/src/loader.rs#L929-L942)

훅 전달 계약과 파일 오류 처리는 `node --test tests/session-start.test.mjs`로 확인할 수 있습니다. 데스크톱 UI를 통한 설치·실행, 재개·압축·분기, 실제 응답·정확 출력·비활성화, 승인·도구 동작과 훅 실행 실패는 호스트 스모크 검증 대상입니다. 이 버전의 대상은 macOS 로컬 데스크톱이며, 확인한 호환성은 실제 검증 환경에 한정됩니다. 훅이 포함된 패키지는 공개 플러그인 디렉터리 등록 대상에서 제외됩니다. [훅 패키징 문서](https://developers.openai.com/plugins/build/plugins#bundled-mcp-servers-and-lifecycle-hooks)

OMO Native의 Claude 모델 환경은 후속 검토 대상입니다.

## 참고 프로젝트

[Yessr!](https://github.com/JeremyDev87/yessr)의 공통 응답 정책과 출력 형식 예외 처리에서 아이디어를 얻었습니다.
