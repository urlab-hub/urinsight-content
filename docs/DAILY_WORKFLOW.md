# URINSIGHT 일상 운영

평소에는 Codex를 실행할 필요가 없다. ChatGPT에서 받은 package를 넣고 PowerShell에서 `pnpm daily`를 실행한다. PNG를 검수한 뒤 Instagram에는 직접 업로드한다.

## 매일 하는 일

1. ChatGPT에 “오늘 URINSIGHT 만들어줘”라고 요청한다. 기존 v6 carousel JSON 형식을 전달하고 package를 받는다.
2. 받은 ZIP 또는 package를 압축 해제한다. 이 프로그램은 ZIP 압축을 자동으로 풀지 않는다.
3. `carousel.json`이 바로 들어 있는 폴더를 `C:\Users\Jungsoo Bae\Documents\ChatGPT\URINSIGHT\inbox\` 아래에 넣는다.
4. PowerShell을 연다.
5. 프로젝트로 이동한다.

```powershell
cd "C:\Users\Jungsoo Bae\Documents\ChatGPT\URINSIGHT"
```

6. 먼저 dry-run으로 입력을 확인한다.

```powershell
pnpm daily -- --dry-run
```

7. 실제 이미지를 생성한다.

```powershell
pnpm daily
```

8. `output\YYYY-MM-DD\<slug>\`에서 PNG와 contact-sheet.png를 확인한다. 날짜는 실행 시작 시 한국 날짜다.
9. 완료 입력은 `processed\YYYY-MM-DD\<package-name>\`에서 확인한다.
10. 오류 package는 inbox에 그대로 있다. 안내에 따라 수정하고 다시 실행한다. 다른 정상 package는 계속 처리된다. 실패가 하나라도 있으면 command exit code는 1이다.

## Package 형식

```text
inbox/
  URINSIGHT_20260917_ai-judgment/
    carousel.json   필수: 기존 v6 schema
    cover.png       선택: jpg / jpeg / png / webp 중 하나
    sources.md      선택: 원문 보존
    sources.json    선택: 원문 보존
```

폴더명과 JSON slug가 다르면 경고가 나오지만 정상 처리한다. 한 폴더에 cover 파일을 여러 개 넣으면 오류다. sources는 파싱·재포맷 없이 byte 그대로 복사한다. 심볼릭 링크·junction을 통한 입력/출력 경로는 지원하지 않는다.

특정 package만 처리하려면:

```powershell
pnpm daily -- --only URINSIGHT_20260917_ai-judgment
```

없는 이름, 잘못된 옵션, 경로 이동 문자열은 오류다. 명령은 프로젝트 루트에서 실행한다. 운영 루트는 현재 작업 폴더다.

## Cover 선택

1. JSON의 `cover.image`가 존재하는 로컬 파일이면 사용한다. 상대경로는 package 폴더 기준이다. 로컬 절대경로도 지원하지만 이동 후에도 재사용하려면 package 안의 상대경로를 권장한다.
2. 지정 파일이 없으면 경고 후 package의 `cover.jpg`, `cover.jpeg`, `cover.png`, `cover.webp`를 찾는다(대소문자 무관).
3. 이미지가 없으면 경고 후 기존 개발용 placeholder를 사용한다.

여러 cover가 있으면 명시 경로가 있어도 오류로 처리한다. URL, UNC 네트워크 경로, 지원하지 않는 확장자, 깨진 이미지, 링크 파일은 오류다. 외부 파일을 다운로드하지 않는다. 이미지 decode는 기존 로컬 cover provider를 사용한다. 원본 carousel.json에는 cover 경로를 쓰지 않고 runtime provider로 이미지만 전달한다.

## 결과와 덮어쓰기 방지

```text
output/YYYY-MM-DD/<slug>/
  01_cover.png
  02_body.png ...
  07_summary.png
  08_insight.png
  contact-sheet.png
  validation.json
  manifest.json
  sources.md       있을 때
  sources.json     있을 때
```

BODY 5~7개, 전체 8~10페이지를 지원한다. 모든 페이지 PNG는 1080×1350이다. contact sheet는 여러 페이지를 모은 별도 크기의 검수용 이미지다. manifest에는 slug/category/pageCount/processedAt/inputPackage/cover/outputs/sources를 기록한다.

같은 날짜의 output slug 또는 processed package 폴더가 이미 있으면 `ERROR_EXISTING_OUTPUT` 또는 `ERROR_EXISTING_PROCESSED`를 출력한다. 덮어쓰거나 자동 삭제하지 않는다. `--force`는 없다. 기존 결과를 먼저 확인하고 새 콘텐츠에는 다른 slug/package 이름을 사용한다.

dry-run은 JSON schema, highlight, BODY 수, cover decode, 최종 경로와 충돌만 확인한다. PNG·output·processed·temp를 만들지 않는다. 실제 font 기반 subtitle single-line/overflow/clipping 검증은 생성 시 수행하며, 실패하면 성공으로 표시하지 않는다.

## 내부 처리와 실패 복구

Daily Runner는 기존 `generate()`를 호출하는 로컬 orchestration layer다. renderer/schema/tokens/reference를 복제하거나 수정하지 않는다. 기존 `pnpm generate <carousel.json>`도 그대로다.

`.tmp/daily-<unique>/`에서 임시 JSON과 전체 렌더링을 생성한다. renderer 검증, contact sheet, sources 복사, manifest 저장 후 최종 폴더로 rename한다. 이어 package 전체를 processed로 rename한다. processed 이동이 실패하면 이번 output을 다시 임시 위치로 돌려놓고 정리한다. 렌더 실패는 inbox를 이동하지 않으며 임시 파일을 정리한다. 기존 성공 output은 건드리지 않는다.

동시 Daily Runner 실행은 `.tmp/daily.lock`으로 차단한다. 실행 중 inbox 파일을 편집하거나 다른 generate 명령으로 같은 output 경로에 쓰지 않는다. 두 폴더 이동은 단일 filesystem transaction은 아니다. 전원 종료/프로세스 강제 종료 시 완료 output과 inbox가 함께 남을 수 있으며, 다음 실행은 덮어쓰기 대신 충돌 오류를 낸다. 이때 output의 manifest/validation과 PNG를 확인해 수동 정리한다. 남은 lock은 실행 중인 daily가 없는 것을 확인한 뒤 지운다. output과 processed는 같은 로컬 디스크의 일반 폴더로 사용한다.

## 처음 한 번 준비

프로젝트의 Node.js/pnpm, 설치된 dependency와 Playwright Chromium이 필요하다. 기존 renderer 설치가 끝나 있으면 추가 설치는 없다. Daily Runner 실행 자체에는 인터넷이나 API key가 필요 없다. 설치 과정은 일상 실행과 별도다. 네트워크 드라이브는 사용하지 않는다.

샘플은 `examples/inbox-sample/`에 있다. 실제 inbox로 자동 복사하지 않는다. 시험하려면 사용자가 직접 복사한다. 이 샘플 sources.md는 형식 예시이며 외부 뉴스 검증 자료가 아니다.

## 이번 단계에서 하지 않는 일

- 자동 주제 탐색, 뉴스 크롤링, X 수집
- ChatGPT 자동 호출, Codex 자동 호출, OpenAI API, LLM 호출
- AI 표지 생성, 스톡 이미지 자동 검색, 외부 이미지 다운로드
- Instagram 자동 업로드, 예약 게시, 성과 분석

미래 API 자동화용 `feature/content-engine`과 `content-engine-step3`는 별도 보존한다. Daily Runner에 merge하지 않는다.
