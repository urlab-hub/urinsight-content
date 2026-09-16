# URINSIGHT carousel renderer · v6

구조화된 JSON → React HTML/CSS → Playwright Chromium → 1080 × 1350 PNG.
뉴스 수집, 이미지 생성/검색, Instagram 게시 기능은 포함하지 않습니다.

## 시작

Node.js 22 이상, pnpm 11.19.0 기준입니다.

```sh
pnpm install --frozen-lockfile
pnpm setup:browser
pnpm generate content/sample-insight.json
pnpm compare output/2026-09-16/information-and-judgment
pnpm typecheck
pnpm test
```

`generate`의 날짜는 실행 시점 **Asia/Seoul** 날짜입니다. compare에는 실제 생성 경로를 전달하세요.
첫 설치 후 렌더링은 외부 네트워크 요청 없이 작동합니다. Chromium 버전과 의존성은 lockfile로 고정됩니다.
기본은 Playwright의 headless shell입니다. Windows 브라우저 런타임 설치 오류가 있는 환경에서는 설치된 Chrome/Edge를 명시적으로 선택할 수 있습니다. PowerShell: `$env:URINSIGHT_BROWSER_CHANNEL='chrome'` 또는 `'msedge'`. `validation.json`에 실제 채널과 버전이 기록됩니다. 환경변수를 해제하면 기본 엔진으로 돌아갑니다.
샘플 cover는 단색 개발용 placeholder입니다. `cover.image`를 넣으면 JSON 파일 기준 상대경로 또는 절대경로의 로컬 이미지를 사용합니다. 없는 파일을 지정하면 실패합니다.

## 구조

```text
docs/                 원본 명세·설정, 설계 및 검증 설명
references/v6/        수정하지 않은 원본 PNG 9개, SHA-256 manifest
src/config/           공통 디자인 tokens
src/schema/           Zod 스키마 및 콘텐츠 무결성 검증
src/renderer/         React 템플릿, 이미지 provider, 검증, PNG/contact sheet 생성
src/cli/              generate / compare 명령
content/              완전한 v6 sample JSON
tests/                스키마·브라우저·통합 테스트
output/               날짜/slug별 생성물 (Git 제외)
```

세부사항: [설계](docs/ARCHITECTURE.md), [폰트 라이선스](docs/FONT_LICENSE.md), [검토 보고서](docs/IMPLEMENTATION_REPORT.md).
원본 자료의 수집·게시·commit 제안은 향후 참고 사항이며 이번 단계의 실행 지시가 아닙니다.

## STEP 3: research → content

유료 API 없이 deterministic mock으로 앞단을 검증합니다.

```sh
pnpm draft research/fixtures/information-and-judgment.json
pnpm draft research/fixtures/information-and-judgment.json --provider mock
pnpm prompt research/fixtures/information-and-judgment.json
pnpm prompt research/samples/manual-business.json
pnpm draft:render research/fixtures/information-and-judgment.json
```

`drafts/<한국 날짜>/<slug>/`에 렌더용 JSON, 출처/근거, 보고서, prompt를 저장합니다. BODY/SUMMARY의 sourceRefs는 엔진 원고와 sources.json에 보존하고 기존 renderer JSON에는 추가하지 않습니다. Mock은 승인된 v6 수동 fixture만 지원합니다. 다른 입력은 `prompt`로 production prompt를 만들 수 있으며 실제 LLM 호출은 구현하지 않았습니다. 상세 계약과 제한: [STEP3_CONTENT_ENGINE.md](docs/STEP3_CONTENT_ENGINE.md).
