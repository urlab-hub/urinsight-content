# 설계와 콘텐츠 계약

## 기준 우선순위

사용자의 이번 단계 요청 → v6 명세·PNG의 디자인/문구 → 첨부 설정 순입니다.
원본 명세와 설정은 그대로 보존합니다. 명세 안의 자동 수집, 이미지 생성, 게시, commit/tag 권고는 실행하지 않습니다.
원본 sample font는 Noto Sans CJK fallback이지만, 실제 renderer는 요청대로 Pretendard만 사용합니다.

## 콘텐츠

Zod `src/schema/content.ts`가 실행 가능한 단일 스키마입니다. 알 수 없는 필드는 거절합니다.

- `category`: business / money / insight. 카테고리 표시명과 색은 tokens에서 결정합니다.
- `slug`: 출력 디렉터리를 위한 소문자 영문·숫자 kebab-case.
- `cover`: URINSIGHT 고정 brand, 정확히 3개 titleLines, highlight, 선택적 image.
- `body`: 5~7개 문단 페이지. `number`는 1부터 연속되는 콘텐츠 소제목 번호로 reference에 있는 `1.` 등을 재현합니다. 별도 페이지 번호는 없습니다.
- 각 body: title, highlight, 의미 단위 paragraphs, keySentence 필수.
- `summary`: SUMMARY 고정 label, headline/highlight/paragraphs/keySentence 필수. `keySentenceHighlight` 생략 시 마지막 문장 전체 강조. 샘플은 원본대로 일부 구절만 강조합니다.
- `insight`: headline/highlight 필수. 하단 slogan/brand는 tokens에 있습니다.
- 모든 highlight는 원문 안의 유일한 구절이며 앞뒤 공백이 없어야 합니다.

기본적으로 paragraphs의 각 문자열이 한 문단이고 브라우저 CSS가 자연스럽게 줄을 바꿉니다. renderer는 문장을 글자 수로 자르거나 내용을 다시 쓰지 않습니다.
원본 v6의 의미 경계 줄 구분을 재현하기 위해 선택적 `paragraphLines`, `keySentenceLines`, `headlineLines`를 제공합니다. 이 배열은 **콘텐츠 편집자가 지정하는 구분**이며, 각 줄을 공백으로 합쳤을 때 원문과 정확히 같아야 합니다. 긴 편집 줄도 CSS wrapping이 가능합니다. cover 제목과 body 소제목은 한 줄 제한을 검사합니다.

## 렌더링

1. CLI가 JSON을 파싱하고 Zod로 필수 필드·개수·하이라이트·편집 줄 무결성을 검증합니다.
2. `LocalCoverImageProvider`가 선택적 로컬 이미지 파일을 읽어 PNG data URI로 정규화합니다. 경로는 JSON 위치 기준입니다. 향후 시스템은 이 인터페이스를 구현할 수 있지만 현재 자동 수집 기능은 없습니다.
3. npm Pretendard 가변 WOFF2를 읽어 HTML 안에 삽입합니다. 폰트 fallback으로 조용히 성공시키지 않습니다.
4. React 서버 정적 렌더링으로 페이지별 HTML/CSS를 만듭니다. Next.js, 개발 서버, 클라이언트 앱은 없습니다.
5. Chromium viewport 1080×1350, deviceScaleFactor=1, ko-KR, Asia/Seoul로 실행합니다. 폰트와 이미지 decode 완료를 기다립니다. HTTP 요청은 차단합니다.
6. 하이라이트는 canvas TextMetrics와 baseline probe로 실제 잉크 경계를 계산합니다. 배경은 pseudo-element이며 horizontal padding이 없습니다. 구절의 외부 공백은 mark 밖에 유지합니다.
7. DOM에서 canvas 크기, 한 줄 제목, 수평/수직 overflow, 텍스트 범위, 상위 텍스트 영역 충돌을 검사합니다. 실패하면 exit code 1입니다. PNG 메타데이터도 검사합니다.
8. 임시 디렉터리에 모든 PNG, contact sheet, validation.json을 작성한 후 최종 날짜/slug 디렉터리를 교체합니다. 렌더링 실패 시 기존 성공 결과는 보존하고 임시 파일을 제거합니다. 동일 slug의 동시 실행은 지원하지 않습니다.

## 시각 비교

`pnpm compare <output-directory>`는 원본 SHA-256부터 검사합니다. 원본 v6 8페이지와 생성 8페이지를 파일명으로 대응시키며, 행별로 **왼쪽 원본 / 중앙 생성 / 오른쪽 절대 픽셀 차이**를 출력합니다.
`reference-diff.json`의 채널 평균 절대 오차와 차이 픽셀 비율은 진단값입니다. 폰트와 placeholder 차이가 있으므로 유사도 합격 기준으로 쓰지 않습니다. 9·10페이지에는 대응되는 v6 reference가 없으므로 compare는 8페이지에만 사용합니다.

## 의도적으로 남는 차이

- 원본 Noto Sans CJK와 Pretendard의 glyph 모양·폭·baseline/래스터화 차이.
- 별도 배경 asset이 없는 표지는 단색 placeholder. 원본의 배경/별무늬를 복사·생성하거나, 글자가 포함된 reference 전체를 배경으로 쓰지 않습니다.
- 원본 이미지로부터 측정한 위치/크기 값은 source layout 파일이 없는 상태의 재현값입니다.
- insight 하단 URINSIGHT는 이미지에 보이는 크기를 따릅니다. 문서의 'slogan보다 작게' 문구와 원본 PNG가 다르며, 시각적 기준인 PNG에 맞췄습니다.

디자인 수정은 `src/config/tokens.ts`에서 수행합니다. reference PNG는 수정하지 마세요.
