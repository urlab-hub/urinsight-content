# 1단계 구현 보고서 · 2026-09-16

> 이 문서의 절대경로는 구현 당시의 역사적 기록이며 현재 실행 경로가 아닙니다. 현재 운영 절차는 `docs/DAILY_WORKFLOW.md`를 따릅니다.

## 1. 생성한 프로젝트 구조

`docs/`, `references/v6/`, `src/config/`, `src/schema/`, `src/renderer/`, `src/cli/`, `content/`, `output/`, `tests/`.
Node.js + TypeScript + React 정적 HTML/CSS + Playwright. pnpm 사용, Next.js 및 웹 서버 없음.

## 2. 설치한 dependency

런타임: react 19.3.0, react-dom 19.3.0, playwright 1.63.0, sharp 0.35.4, zod 4.6.5, pretendard 1.3.9.
개발: typescript 7.0.2, tsx 4.23.13, @types/node 22.20.2, @types/react 19.3.0, @types/react-dom 19.3.0.
pnpm 11.19.0, 실행 Node.js 24.19.0. 의존성 재현은 pnpm-lock.yaml 사용.
최종 렌더 엔진: Playwright headless-shell Chromium 153.0.8010.12.
전체 Chrome for Testing은 이 PC에서 side-by-side 실행 오류가 있었으나, 최종 기본 headless-shell은 정상 동작함.

## 3. 생성/수정한 파일 전체 목록

기존 저장소는 `.git`만 있는 상태였으며 아래 35개는 모두 신규 파일입니다. 보존 자료는 원본을 복사했으며 수정하지 않았습니다.

```text
.gitignore
README.md
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
tsconfig.json
content/sample-insight.json
docs/ARCHITECTURE.md
docs/FONT_LICENSE.md
docs/PRETENDARD-LICENSE.txt
docs/IMPLEMENTATION_REPORT.md
docs/URINSIGHT_CAROUSEL_V6_SPEC.md
docs/urinsight-v6-config.json
references/v6/00_contact_sheet.png
references/v6/01_cover.png
references/v6/02_body.png
references/v6/03_body.png
references/v6/04_body.png
references/v6/05_body.png
references/v6/06_body.png
references/v6/07_summary.png
references/v6/08_insight.png
references/v6/manifest.json
src/config/tokens.ts
src/schema/content.ts
src/renderer/browser.ts
src/renderer/contact-sheet.ts
src/renderer/cover-image.ts
src/renderer/render.ts
src/renderer/template.tsx
src/renderer/validate.ts
src/cli/generate.ts
src/cli/compare.ts
tests/schema.test.ts
tests/render.test.ts
```

생성물 12개는 아래 경로에 있으며 Git 제외입니다. node_modules와 pnpm 캐시도 제외합니다.

```text
output/2026-09-16/information-and-judgment/
  01_cover.png
  02_body.png
  03_body.png
  04_body.png
  05_body.png
  06_body.png
  07_summary.png
  08_insight.png
  contact-sheet.png
  reference-comparison.png
  reference-diff.json
  validation.json
```

## 4. content schema 설명

Zod strict schema로 category, slug, cover, body, summary, insight를 검증합니다. cover 제목은 정확히 3줄, body는 5~7개로 전체 8~10페이지입니다. 하이라이트는 공백 없는 바깥 경계와 원문 내 유일한 일치를 요구합니다. BODY의 number는 reference 소제목 번호이며 별도 페이지 번호는 표시하지 않습니다.
본문은 semantic paragraphs로 저장합니다. 원본의 의미 경계 줄 구분을 보존하는 선택적 editorial line 배열도 제공하며 원문과 일치 여부를 검증합니다. JSON에 샘플의 모든 문구가 들어 있습니다.

## 5. render architecture 설명

JSON/Zod → 로컬 cover provider → Pretendard 내장 data URI → React renderToStaticMarkup → Playwright → 폰트/이미지 로드 → glyph 측정 하이라이트 → DOM 검증 → PNG → Sharp contact sheet.
임시 디렉터리에서 모든 검증을 마친 후 최종 경로를 교체합니다. 렌더 실패는 nonzero 종료이며 기존 정상 출력은 보존합니다. 디자인 값은 tokens로 분리했습니다.

## 6. pnpm generate 실행 결과

```text
pnpm generate content/sample-insight.json
Generated 8 validated PNGs (1080x1350) + contact-sheet.png
Cover: development placeholder (no cover.image supplied)
```

추가 옵션 없이 기본 headless-shell로 성공했습니다. 표지 image는 지정 시 사용하며, 자동 생성·검색은 하지 않습니다.

## 7. 생성된 이미지 경로

`C:/Users/Jungsoo Bae/Documents/ChatGPT/URINSIGHT/output/2026-09-16/information-and-judgment/`

검토 시작점: `contact-sheet.png`.
원본 비교: `reference-comparison.png` — 각 행 왼쪽 원본 / 중앙 생성 / 오른쪽 절대 픽셀 차이.

## 8. reference 대비 아직 차이가 있는 부분

- 표지의 원본 배경 asset이 별도로 제공되지 않아 단색 개발용 placeholder를 사용합니다. 원본 이미지를 변형하거나 글자를 포함한 reference를 배경으로 재사용하지 않았습니다.
- reference는 Noto Sans CJK fallback, 구현은 요청한 Pretendard입니다. glyph 모양, 글자 사이 간격, weight 느낌, baseline 및 안티앨리어싱이 완전히 같지는 않습니다.
- 이미지에서 측정한 글자 점유 폭과 상단 위치를 바탕으로 크기/위치를 보정했습니다. 원본 레이아웃 소스가 없으므로 pixel-perfect 동일본이라고 주장하지 않습니다.
- 마지막 slogan 아래 URINSIGHT 크기는 원본 PNG를 따릅니다. 명세의 slogan보다 작게라는 설명과 원본 PNG가 다릅니다.
- 픽셀 차이(채널 차이 16 초과)는 표지 32.92%, BODY 2.48~2.93%, SUMMARY 3.91%, INSIGHT 1.48%. 흰 여백 면적을 포함한 진단 수치이므로 디자인 일치율로 해석하지 않습니다.

## 9. 테스트/검증 결과

- TypeScript typecheck 통과.
- 최종 `pnpm test`: 7개 테스트 통과, 실패 0개 (49.2초).
- 스키마 테스트: 카테고리 3종, 필수값, 잘못된 하이라이트, 개수 8~10 제한, 순번, 안전한 slug, 편집 줄 무결성, 한국 날짜 검증.
- 브라우저 테스트: 긴 소제목, 긴 본문, summary 영역 충돌 실패 확인; 실제 glyph 하이라이트 측정.
- 통합 테스트: 9/10페이지 생성, 사업/돈 색상 입력, 로컬 cover 이미지, 잘못된 이미지 경로, 렌더 실패 시 기존 출력 보존 및 임시 파일 제거.
- 최종 8페이지 각각 PNG 메타데이터 1080×1350, Pretendard 로드, 한 줄 제목, overflow/clipping/영역 충돌 검증 통과.
- 원본 reference PNG 9개 SHA-256 일치. 생성 contact sheet 및 전체 비교 이미지 시각 확인 완료.

## 10. git status

35개 파일이 untracked (`??`) 상태입니다. 기존 tracked 파일 변경 및 삭제 없음. output/node_modules/pnpm 캐시는 ignore됨을 확인했습니다. staging, commit, tag, push는 하지 않았습니다.

자동 수집, AI 이미지 생성, Instagram 게시 등 다음 단계는 구현하지 않았습니다. 사용자 검토 대기 상태입니다.
