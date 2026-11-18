# LLM용 입갤 설치 안내

사용자가 명시적으로 요청했을 때 로컬 Codex에 `ipgael@ipgael-local`을 현재 사용자 계정 범위로 설치합니다. 문서 열람은 설치 요청으로 간주하지 않습니다. 기존 설정을 보존하고 이 문서에 적힌 등록·설치만 실행하세요. 도구 업데이트, 제거, 재설치, 자격 증명·라이선스 변경과 훅 신뢰 처리는 별도 작업입니다.

## 설치 전 확인

사용자가 실제로 쓸 Codex 실행 환경에서 도구와 옵션을 확인하세요.

```sh
codex --version
node --version
codex plugin marketplace list --help
codex plugin marketplace add --help
codex plugin list --help
codex plugin add --help
```

검증한 환경은 macOS의 Codex `0.167.0-alpha.3.2`, Node.js `24.15.0`입니다. `node`는 훅 실행 환경의 `PATH`에 있어야 합니다. 최소 Node.js 버전은 미확인이며 npm 설치나 빌드는 필요 없습니다. 도구가 없거나 필수 옵션이 지원되지 않으면 CLI 설치를 멈추고 확인 결과를 보고하세요. 지원되는 Codex Desktop이 있다면 [수동 설치](README.md#desktop-수동-설치)를 안내할 수 있습니다. [공식 CLI 문서](https://learn.chatgpt.com/docs/cli/reference#codex-plugin)

같은 이름으로 발견되는 프로젝트 마켓플레이스와 계정에 등록된 출처를 구분할 수 있도록, 가능하면 `ipgael` 체크아웃 밖에서 목록을 확인하세요.

```sh
codex plugin marketplace list --json
codex plugin list --marketplace ipgael-local --json
```

| 확인 결과 | 처리 |
| --- | --- |
| `ipgael-local`이 `github.com/JeremyDev87/ipgael`의 Git 마켓플레이스로 확인됨 | 기존 등록을 재사용하세요. 목록이 ref를 제공하면 `main`인지도 확인하세요. |
| 같은 `ipgael-local` 이름이 다른 저장소, 로컬 사본, 다른 ref를 가리키거나 출처를 확인할 수 없음 | 기존 등록을 보존하고 충돌 내용을 보고한 뒤 중단하세요. Desktop 수동 설치에서도 같은 이름의 두 출처를 동시에 사용하지 마세요. |
| 공식 출처의 `ipgael@ipgael-local`이 현재 사용자 범위에 이미 설치됨 | 설치 사본과 `enabled` 상태를 확인해 보고하세요. 의도적으로 비활성화된 설치는 그대로 유지하세요. |
| 정상 조회 결과에 등록 또는 설치가 없음 | 확인된 단계만 아래에서 진행하세요. |
| 목록 조회 실패, 결과 해석 실패 또는 설치 범위 불명확 | 미설치로 간주하지 말고 확인할 항목을 보고한 뒤 중단하세요. |

마켓플레이스 목록의 `marketplaceSource`와 `root`를 확인하세요. 저장소 주소는 GitHub 축약형 또는 Git URL로 보일 수 있습니다. 플러그인 목록의 `source`가 `local`이면 마켓플레이스 사본 안의 상대 경로라는 뜻이므로, 그 값만으로 GitHub 출처를 판단할 수 없습니다. `installed` 목록의 `pluginId`와 설치 상태를 보고, `available`에만 있는 항목은 아직 설치되지 않은 것입니다.

## 필요한 단계만 실행

1. 마켓플레이스가 아직 없고 출처 충돌이 없을 때 등록하세요.

   ```sh
   codex plugin marketplace add JeremyDev87/ipgael --ref main --json
   ```

   명령 성공과 `marketplaceName`이 `ipgael-local`인지 확인하세요. `installedRoot`가 등록한 사본을 가리키는지 확인하고 목록을 다시 조회하세요. 이미 동일 출처가 등록되어 있다면 이 단계를 건너뜁니다.

2. 공식 출처를 확인했고 사용자 설치가 없을 때 설치하세요.

   ```sh
   codex plugin add ipgael@ipgael-local --json
   ```

   명령 성공, `pluginId`가 `ipgael@ipgael-local`인지, `installedPath`가 현재 사용자의 Codex 저장소 아래 실제 사본인지 확인하세요. 설치 사본의 `.codex-plugin/plugin.json`, `hooks/hooks.json`, `hooks/session-start.mjs`, `policy.md`를 확인하고 `codex plugin list --marketplace ipgael-local --json`을 다시 읽으세요. 기존 설치는 목록과 Codex가 표시하는 설치 경로를 대조해 재사용하세요. [공식 목록 출력 문서](https://learn.chatgpt.com/docs/cli/reference#codex-plugin)

## 설치 확인과 사용자 검토

완료 보고에 **설치**, **활성화**, **훅 신뢰**, **실제 응답**을 각각 기록하세요. 설치 사본은 사용자가 계속 쓸 수 있도록 보존합니다. `installed`와 `enabled`는 별도 상태입니다. 설치만 확인했다면 훅 실행과 실제 응답은 확인 대기로 표시하세요.

훅 검토가 남았다면 사용자가 CLI의 `/hooks` 또는 Desktop의 **Review hooks**나 **Settings → Hooks**에서 `SessionStart` 정의와 실행 스크립트를 읽고 신뢰 여부를 직접 결정하도록 안내하세요. 신뢰 우회 옵션과 수동 설정 편집을 사용하지 마세요. 검토가 끝난 뒤 [첫 실행 예시](README.md#훅-검토와-첫-실행)로 일반 설명과 정확 출력을 확인할 수 있습니다. [공식 플러그인 훅 문서](https://learn.chatgpt.com/docs/hooks#plugin-bundled-hooks)
