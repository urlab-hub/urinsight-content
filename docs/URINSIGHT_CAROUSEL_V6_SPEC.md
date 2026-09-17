# URINSIGHT Carousel v6 — Baseline Specification

- URINSIGHT Carousel Design: v6
- Specification Revision: 1.9
- Cover Image System: v1
- Daily Workflow: v1
- Last Updated: 2026-09-18

Carousel Design은 v6로 유지하며 v7로 변경하지 않는다. Specification Revision은 디자인 버전과 별도로 관리한다. Revision 1.2에서 확정한 편집 원칙과 highlight 규칙은 유지하고, Revision 1.3에서는 이미지가 포함된 INSIGHT와 Cover–Insight 시각적 연속성을 제작 규칙으로 정의한다.

Specification 1.3의 INSIGHT 이미지 layer와 package asset resolution을 구현했다. Daily Runner는 insight 파일 → 실제 cover → placeholder 순으로 선택한다. 이미지가 없는 placeholder fallback은 강한 경고와 품질검수 표시를 남기는 예외이며, 정상 운영 이미지 요건을 충족한 것으로 보지 않는다. 기존 pnpm generate는 runtime insightImage 옵션이 없으면 v6 dark-background 결과를 유지한다. 사진의 시리즈 연속성과 내용 적합성은 사람이 검수한다.

Specification 1.2 복귀 기준 (수정·삭제하지 않음):
- Commit: `9087e9d735fd15da64ff4831706b60f1648596b8`
- Tag: `urinsight-operations-v1`

Specification 1.3 복귀 기준 (수정·삭제하지 않음):
- Commit: `dc42e3a690d7b4b14c6a0e8d4ac6474bb4048a96`
- Tag: `urinsight-operations-v1.1`

Revision 1.4는 BODY/SUMMARY의 고정 vertical frame을 추가한다. Daily Runner는 runtime `contentLayout: 'anchored'`를 전달한다. 기존 `pnpm generate <carousel.json>`과 옵션 없는 `generate()`는 legacy layout을 유지한다. carousel.json schema와 CLI 인터페이스는 변경하지 않는다. Cover/INSIGHT 이미지 시스템 1.3, 레이아웃, 폰트 크기, 좌우 여백, category color, highlight visual padding은 유지한다.

## Status
- Version: v6
- Purpose: URINSIGHT Instagram carousel baseline
- Canvas: 1080 × 1350 px (4:5)
- Font target: Pretendard
- Current renderer font: locally installed Pretendard (font loading is validated before rendering)
- Structure: 8-page default, variable 8–10 pages allowed depending on topic

## Brand / Category Colors
- 사업: #3B5BDB
- 돈: #1F8A5B
- 인사이트: #FF5A36

## Category Rules
- Category label format: #사업 / #돈 / #인사이트
- Category label: no background, category-color text only
- Classification: assign by the topic’s most directly connected core subject

## Mobile Readability — Revision 1.8

Carousel Design v6의 고정 프레임을 유지하고 Daily 운영 모드의 타이포를 확대한다. 새 token은 `mobileTypography`와 `coverOverlay`에 모은다. `designTokens(true)`는 Daily가 기존에 사용하는 anchored runtime mode에만 적용한다. 옵션 없는 `pnpm generate`는 기존 v6 이미지와 같은 결과를 유지한다. FLOW, inbox 처리, package 구조, carousel schema는 변경하지 않는다.

| 요소 | 이전 px | 운영 px |
|---|---:|---:|
| COVER 제목 font / line-height | 89 / 116 | 104 / 126 |
| INSIGHT headline font / line-height | 63.5 / 88 | 72 / 98 |
| COVER category top | 780 | 804 |
| BODY 소제목 font / line-height | 42 / 52 | 48 / 58 |
| BODY / SUMMARY 본문 font / line-height | 30.5 / 47 | 38 / 54 |
| SUMMARY headline font / line-height | 46.4 / 64 | 52 / 70 |
| BODY 강조문장 font / line-height | 30.7 / 43 | 38 / 52 |
| SUMMARY 강조문장 font / line-height | 30.8 / 43 | 38 / 52 |
| 문단 간격 | 26 | 22 |
| 제목→본문 간격 | 57 | 51 |
| BODY / SUMMARY 강조문장 앞 최소 간격 | 31 / 37 | 28 / 28 |

유지: 좌우 110px, BODY brand Y=303 / title Y=395 / body Y=504, SUMMARY label Y=255 / headline Y=394, 공통 강조문장 line box bottom Y=1103. COVER brand Y=306 / title Y=393 / footer Y=919와 제목 3줄 규칙을 유지한다. INSIGHT label Y=255 / headline Y=344 / footer Y=899와 이미지 overlay/crop은 유지하고, Daily headline만 72px / line-height 98px로 확대한다. highlight background-only padding max 5/7px도 유지한다.

실제 cover image가 있는 Daily COVER에는 전체 1080×1350 프레임에 검정 overlay 45%를 적용한다. 국소 scrim, feather mask, 텍스트 shadow 방식은 제거한다. COVER 제목 104px / line-height 126px와 anchor는 유지한다. 원본 이미지는 수정하지 않는다. 이미지 없는 placeholder와 legacy generate에는 새 overlay를 적용하지 않는다.

INSIGHT는 기존 전체 검정 overlay 65%, explicit position 50% 50%, fallback position 58% 50% / scale 1.08을 유지한다. COVER overlay는 INSIGHT보다 약하게 적용한다. 서로 다른 사진의 원본 노출 차이까지 보장하지는 않으므로 COVER가 더 밝고 자연스럽게 보이는지 사람이 확인한다.

확대된 글자에 맞지 않는 기존 원고는 자동 축소·자동 요약·임의 재줄바꿈하지 않는다. COVER는 세 줄을 더 짧게 편집하고 BODY/SUMMARY는 설명을 압축한다. 과거 원고가 legacy에서는 통과해도 새 Daily 모드에서는 overflow로 거절될 수 있다. 과거 성공 output이나 원본 package를 바꾸지 않는다.

## 1P Cover
- Brand text: URINSIGHT
- Brand text weight: thin / regular, not bold
- Brand alignment: left
- Main title: 3 lines
- Title: bold
- Key phrase emphasis: category-color background + white text
- Important: highlight background must NOT include leading/trailing spaces
- Category label: directly below title, aligned to title left edge
- Footer line: MONEY · BUSINESS · SUCCESS
- Footer vertical spacing: about twice the title-to-category gap
- No logo
- Person-led topic: use a real photo of the person
- General topic: prioritize realistic premium editorial photography; follow Cover Image System v1 below
- Do not copy Cosmos composition literally; reference mood, negative space, curation, and editorial sophistication

## 2P–6P Body
- Background: white
- Top-right brand: URINSIGHT
- Brand color: current category color
- Brand size: small
- Brand weight: thin / regular
- No underline
- Brand position: upper-right, slightly above subtitle; aligned to the general top zone used by cover/final page
- Subtitle: ONE LINE ONLY
- Subtitle: bold
- Subtitle should be rewritten shorter rather than wrapped
- Subtitle key phrase: category-color background + white text
- Highlight rectangle follows glyph bounds with background-only optical padding; see Highlight Background Visual Padding
- Do not extend optical padding into neighboring literal spaces or adjacent glyphs
- Do not highlight leading/trailing spaces
- Explanation text: concise but sufficiently explanatory, WorkHack Daily-like information density
- Explanation font: regular
- Paragraph line breaks: only at semantic sentence/phrase boundaries
- No forced mechanical wrapping for visual convenience
- Final key sentence: bold + category-color text, no separate box
- No photos inside body pages
- No page numbers

## 7P SUMMARY
- No URINSIGHT brand label
- SUMMARY label only
- SUMMARY label color: current category color
- SUMMARY label uses the INSIGHT upper-label left/top anchor in the 1.4 operating frame (legacy generate retains its original position)
- Summary headline: bold
- Key phrase: category-color background + white text
- Body: regular text
- Final emphasized sentence: category-color background + white text
- Highlight rectangle: glyph-based with background-only optical padding, no highlighted outer spaces

### SUMMARY editorial role

SUMMARY는 BODY를 다시 나열하거나 짧게 반복하는 페이지가 아니다.

답해야 할 질문은 “앞의 여러 사실과 논거를 묶으면 어떤 구조가 보이는가?”다. BODY보다 한 단계 높은 해석을 제시한다. BODY에서 이미 사용한 핵심 문장을 그대로 다시 사용하지 않는다.

## BODY Editorial Density

BODY는 모바일 가독성을 위해 충분한 여백을 유지하되, 본문이 지나치게 짧아 화면 중앙이 비어 보이지 않도록 적정 정보 밀도를 확보한다.

권장 기준:

- 소제목: 1줄
- 설명: 2~3개 semantic paragraph
- 설명 영역의 체감 분량: 대략 5~7줄
- 마지막 강조문장: 1~2줄
- 마지막 강조문장 line box 하단: Y=1103 유지

5~7줄은 편집상 권장 분량이며 강제 줄 수나 새로운 validation 조건이 아니다.

본문이 지나치게 짧으면 다음 우선순위로 1문장 정도 보강한다.

1. 근거 또는 데이터
2. 맥락 또는 원인
3. 실제 사례
4. 독자가 이해해야 할 해석

빈 공간을 채우기 위한 반복·수사·의미 없는 문장은 추가하지 않는다. BODY 페이지별 역할과 논리 전진 원칙은 그대로 유지한다. 같은 주장을 표현만 바꿔 늘리는 것은 금지한다.

본문이 길어지면 중복 제거 → 문장 간결화 → 3문단을 2문단으로 압축하는 순서로 편집한다. 폰트 축소, anchor 이동, 강조문장 위치 이동으로 해결하지 않는다.

이 기준은 BODY의 콘텐츠 편집에만 적용한다. SUMMARY는 이번 변경 대상이 아니며 기존 규칙을 유지한다.

## BODY / SUMMARY Vertical Anchor System — Revision 1.7

“콘텐츠가 디자인을 밀어내는 것이 아니라, 콘텐츠가 고정된 editorial frame 안에 맞춰진다.”

좌표는 1080×1350 canvas의 CSS px 기준이다. 위쪽 좌표는 text box 시작점, 하단은 마지막 강조문장 **line box의 하단**이다. 한 줄이면 아래에서 시작하고, 두 줄이면 위로 확장한다. 글자의 잉크 경계와 line box 경계는 구분한다.

| 요소 | 고정 기준 / token | 값 |
|---|---|---|
| BODY 상단 우측 URINSIGHT | body.brandTop / layout.right | Y 303 / 오른쪽 110 |
| BODY 소제목 | body.titleTop / layout.left | Y 395 / X 110 |
| BODY 본문 시작 | body.textTop | Y 504 |
| SUMMARY label | insight.labelTop / layout.left 공유 | Y 255 / X 110 |
| SUMMARY headline 시작 | summary.titleTop | Y 394 |
| SUMMARY 설명 시작 | headline 실제 하단 + content.titleToBodyGap | 1/2/3줄: Y 515 / 585 / 655 |
| BODY/SUMMARY 마지막 강조문장 하단 | content.emphasisBottomY | Y 1103 |

공통 하단 1103은 승인된 v6 sample SUMMARY의 기존 위치에서 산정했다: 본문 시작 689 + 문단 영역 334 + 강조문장 전 간격 37 + 강조문장 line-height 43 = 1103. reference 원본을 수정하지 않는다. BODY의 top anchors는 기존 좌표를 그대로 사용한다. SUMMARY label은 마지막 INSIGHT의 URINSIGHT와 같은 좌측/상단 기준선을 사용한다.

### Shared Title-to-Body Gap — Revision 1.7

SUMMARY headline은 1~2줄을 권장하며 최대 3줄까지 허용한다. 3줄인 경우 본문 설명을 더 압축하여 고정 bottom anchor를 침범하지 않도록 한다. font size나 anchor 위치는 변경하지 않는다.

SUMMARY의 본문 시작점은 절대 Y좌표가 아니라 headline의 실제 마지막 줄 하단 + BODY와 동일한 title-to-body gap으로 계산한다. BODY와 SUMMARY는 동일한 소제목→본문 시각 간격을 사용한다. 마지막 강조문장은 기존 공통 bottom anchor Y=1103을 유지한다.

Daily의 `content.titleToBodyGap = 51px`: 확대된 BODY 소제목 line box 하단 395 + 58 = 453에서 본문 Y=504까지의 간격이다. BODY 상단과 본문 시작 좌표를 유지한다. 이전 57px는 legacy token에 보존한다. 여기서 하단은 기존 vertical frame과 동일한 line box 기준이며 glyph 잉크 경계가 아니다.

SUMMARY headline 첫 줄 Y=394를 유지하며 운영 모드 line-height는 70px다. Pretendard 로드 후 실제 DOM 높이를 측정하므로 1/2/3줄 및 CSS 자동 wrapping에도 동일한 간격을 적용한다. 계산식은 `summaryBodyStartY = summaryHeadlineActualBottomY + content.titleToBodyGap`이다. label Y=255/X=110, Pretendard hierarchy, highlight, bottom anchor는 유지한다. 절대 `summary.textTop=689`는 legacy generate 호환용으로만 남으며 Daily의 anchored mode에서는 사용하지 않는다.

headline이 길어지면 본문 설명 영역이 줄어든다. 설명 압축 → 중복 문장 제거 → 3문단을 2문단으로 조정하고, 그래도 맞지 않으면 SUMMARY_CONTENT_OVERFLOW로 실패한다. 폰트 축소, bottom anchor 이동, headline 시작점을 위로 당기는 처리는 하지 않는다.

### Variable Middle-Content Zone / Content Fit Validation

본문에 허용되는 높이 = 공통 하단 − 강조문장 실제 높이 − 최소 간격 − 본문 시작 Y.

| 페이지 | 강조문장 1줄 / 2줄 | 본문 최대 높이 1줄 / 2줄 | 본문 끝 한계 Y 1줄 / 2줄 |
|---|---|---|---|
| BODY | 52 / 104px | 519 / 467px | 1023 / 971 |
| SUMMARY headline 1줄 | 52 / 104px | 508 / 456px | 1023 / 971 |
| SUMMARY headline 2줄 | 52 / 104px | 438 / 386px | 1023 / 971 |
| SUMMARY headline 3줄 | 52 / 104px | 368 / 316px | 1023 / 971 |

운영 모드의 강조문장 앞 최소 간격은 BODY/SUMMARY 공통 28px, 문단 사이 간격은 22px다. 문단 영역이 짧아도 headline 시작점과 마지막 강조문장을 이동하지 않는다. SUMMARY 본문 시작점만 headline 실제 높이를 따른다. 남는 공간은 본문 아래 여백으로 남긴다. headline의 하단이 본문 시작을 침범해서도 안 된다.

실제 Pretendard 로드 후 DOM에서 높이를 측정한다. 본문 영역 초과, headline/본문 충돌, 강조문장 2줄 초과 또는 bottom anchor 이탈은 `BODY_CONTENT_OVERFLOW` / `SUMMARY_CONTENT_OVERFLOW`로 실패한다. 오류에는 page, region, currentHeight, allowedHeight 등 측정값과 편집할 영역을 표시한다. 가로 overflow와 subtitle single-line은 기존 validator도 함께 검사한다. 실패한 렌더는 final output으로 확정하거나 processed로 이동하지 않는다. validation.json의 contentFit에 페이지별 측정값을 기록한다.

### Content Authoring / Fit Before Font Resize

- BODY: subtitle 1줄, semantic paragraphs 2~3개, key sentence 1~2줄.
- SUMMARY: label fixed, headline fixed start, 설명 2~3문단, 마지막 강조문장 1~2줄, bottom anchor fixed.
- SUMMARY가 길어져 하단을 밀어내면 요약을 더 압축한다.
- 콘텐츠가 넘치면 중복 제거 → 문장 간결화 → 필요 시 3문단을 2문단으로 압축한다.
- 문단 간격의 소폭 축소는 편집 검토 후 공통 token 차원에서만 검토한다. 현재 운영 renderer는 공통 22px를 사용하며 페이지마다 자동 축소하지 않는다.
- 그래도 맞지 않으면 validation error / editorial review 대상이다. 실제 정보량이 많을 때만 BODY를 추가하여 총 9~10페이지로 확장한다.
- 본문·소제목 font size 자동 축소, line-height 과도한 축소, 소제목 위로 당기기, 강조문장 아래로 밀기, 콘텐츠별 anchor 변경은 금지한다.
- Cover/INSIGHT layout, 이미지 pairing, category colors, typography hierarchy, 좌우 margin, highlight left max 5px / right max 7px와 legacy mode는 변경하지 않는다.

## 8P Final / INSIGHT

INSIGHT는 항상 이미지가 포함된 고정형 마지막 페이지로 제작한다. Text-only INSIGHT는 기본 운영 규칙에서 사용하지 않는다. 9~10페이지 구성에서도 이 규칙은 마지막 INSIGHT 페이지에 적용한다.

- Background / visual layer: Cover와 연관된 editorial image (Daily Runner의 1.3 이미지 모드; 기존 generate의 legacy dark background는 호환성 유지)
- Upper label: URINSIGHT in category color
- No separate INSIGHT label
- Main insight sentence: bold
- Key phrase: category-color background + white text
- Bottom slogan: “돈, 사업, 성공을 더 깊게 읽는 시선”
- Bottom slogan: bold, smaller than main text
- Bottom URINSIGHT: thin / regular, smaller than slogan
- No page number
- 가독성을 위해 필요한 경우 dark overlay / gradient overlay를 사용할 수 있다. 과도한 장식은 추가하지 않는다.
- 상단 URINSIGHT, category color, 강한 headline, category-color highlight, 하단 브랜드 slogan과 URINSIGHT 등 기존 v6 디자인 언어를 유지한다.

### INSIGHT editorial role

INSIGHT는 캐러셀의 마지막 페이지다. 전체 내용을 단순 요약하거나 SUMMARY를 짧게 다시 쓰는 페이지가 아니다.

답해야 할 질문은 “독자가 콘텐츠를 닫고도 기억해야 할 하나의 관점은 무엇인가?”다. SUMMARY와 다른 표현으로 작성하며, 정보 설명보다 관점과 기억성을 우선한다.

이미지와 핵심 문장이 함께 마지막 여운을 만든다.

### INSIGHT Text Rule

이미지가 들어가더라도 텍스트가 최우선이다.

- 가장 짧고 강한 관점을 남긴다.
- SUMMARY와 다른 표현으로 작성한다.
- 한 가지 메시지만 전달한다.
- 핵심 구절 1개를 highlight한다.
- 사진 위에서도 즉시 읽혀야 한다.

이미지가 메시지를 방해하면 이미지를 다시 선정하거나 보정한다.

### INSIGHT Image Style

Cover Image System v1과 동일한 사진 언어를 따른다. 목표는 “잡지에서 촬영한 듯한 editorial photograph”다. “AI가 만든 멋있는 그림” 자체를 목표로 삼지 않는다.

우선:

- realistic editorial photography
- documentary-like photography
- natural/cinematic lighting
- restrained colors
- subtle grain
- real-world environment
- premium stock-like composition
- generous negative space

지양:

- obvious AI art
- excessive sci-fi
- cosmic fantasy
- glossy 3D
- excessive glow
- neon cyberpunk
- surreal compositing
- motivational poster aesthetic

INSIGHT에서 SF/우주 표현은 주제 자체가 SF/우주를 직접 다루는 경우만 예외로 허용한다.

## Highlight Background Visual Padding

한글 세로획 등으로 끝나는 글자가 배경 박스에 너무 딱 붙어 잘려 보이거나 답답해 보이는 현상을 방지한다.

- Highlight text 자체는 유지한다. Leading/trailing literal space는 highlight background에 포함하지 않는다.
- Text layout width와 기존 glyph 측정값을 유지한다. 배경 여백 때문에 글자 위치나 줄바꿈을 바꾸지 않는다.
- Background layer만 시각적으로 확장한다. 현재 구현은 `mark::before`를 사용한다.
- Left visual padding: 최대 5px.
- Right visual padding: 최대 7px.
- 우측 여유를 좌측보다 약간 크게 두는 것을 기준으로 한다. 인접 요소와 공간이 부족하면 padding을 자동 축소하며, 모든 위치에 5px/7px를 강제로 적용하지 않는다.
- 인접 일반 글자와 겹치지 않으며, 앞뒤 literal space 방향으로 확장하지 않는다. 기존 glyph overhang은 보존하되 추가 padding으로 공백 영역을 더 칠하지 않는다.
- 상하 padding은 기존 v6 기준을 유지한다: COVER 2px/2px, BODY 1px/3px, SUMMARY headline 2px/3px, SUMMARY key sentence 3px/3px, INSIGHT 2px/3px (top/bottom).
- COVER / BODY / SUMMARY / INSIGHT의 모든 highlight에 동일한 수평 규칙을 적용한다.
- 배경 확장으로 clipping/overflow가 생겨서는 안 된다. 폰트 크기·위치·문단 간격과 v6 전체 배치는 유지한다.

## Tone / Copy
- WorkHack Daily-like: sufficient explanation, concise sentences
- Declarative prose
- Strong, decisive hook
- Data / case / public-figure quotes used heavily when relevant
- Do not force data or quotations when evidence is weak
- Exaggeration allowed in hook/copy, but factual claims must remain defensible
- Politics and direct investment recommendations excluded

## Editorial Deduplication / Narrative Progression

각 BODY 페이지는 반드시 서로 다른 질문 또는 역할에 답해야 한다. 각 페이지는 앞 페이지의 반복이 아니라 새로운 정보, 원인, 사례, 의미 또는 시사점을 추가해야 한다.

권장 진행 예:

| Page | 답해야 할 질문 / 역할 |
| --- | --- |
| BODY 1 | 무엇이 바뀌었는가 |
| BODY 2 | 왜 그런가 / 새로운 병목은 무엇인가 |
| BODY 3 | 시장·회사·사례에서는 어떻게 나타나는가 |
| BODY 4 | 역할·운영 방식은 어떻게 바뀌는가 |
| BODY 5 | 개인 또는 독자가 무엇을 이해해야 하는가 |

이 구조는 주제에 따라 변형 가능하다. 중요한 것은 각 페이지가 서로 다른 기능을 가지는 것이다. BODY 6~7로 확장할 때도 독립적인 역할과 새로운 논거가 있어야 한다.

### 생성 후 중복 검수

원고 생성 후 반드시 다음을 검사한다.

1. 페이지별 핵심 주장 중복
2. 사례·근거 중복
3. 결론 중복
4. 동일 표현 반복
5. 동일 문장 구조 반복
6. SUMMARY가 BODY 내용을 단순 재서술하는지
7. INSIGHT가 SUMMARY를 짧게 줄인 것에 불과한지

검수할 때 각 BODY를 한 문장으로 요약한다.

```text
BODY 1 = AI가 실행 비용을 낮춘다
BODY 2 = 판단이 새로운 병목이 된다
BODY 3 = 조직 구조가 바뀐다
BODY 4 = 관리자의 역할이 바뀐다
BODY 5 = 개인에게 필요한 능력이 바뀐다
```

이 요약끼리 의미가 사실상 같으면 둘 중 하나를 삭제하거나 새로운 관점으로 재작성한다. 삭제 후에는 승인된 8~10페이지 구조를 지키도록 전체 원고를 다시 계획한다. 페이지 수를 채우려고 같은 주장을 반복하지 않는다.

### Narrative Progression

좋은 캐러셀은 페이지를 넘길수록 논리가 앞으로 전진해야 한다.

좋은 예:

```text
실행 비용이 낮아진다
→ 판단이 병목이 된다
→ 조직 구조가 바뀐다
→ 관리자의 역할이 바뀐다
→ 개인의 경쟁력이 바뀐다
```

나쁜 예:

```text
실행보다 판단이 중요하다
→ 실행보다 편집이 중요하다
→ 실행보다 설계가 중요하다
→ 실행보다 기준이 중요하다
```

핵심 단어만 바꾼 반복은 금지한다.

### Expression Variation

핵심 keyword 반복은 허용한다. 하지만 동일한 문장 골격의 반복은 피한다.

과도하게 반복하지 말아야 할 예:

- “~보다 ~가 중요하다”
- “~할수록 ~가 비싸진다”
- “결국 중요한 것은 ~다”
- “AI 시대에는 ~가 된다”
- “~가 아니라 ~다”

한 carousel 안에서 문장 리듬과 논리 전개를 자연스럽게 변주한다. 가능한 전개 예:

- 현상 → 이유 → 해석
- 사례 → 공통점 → 의미
- 데이터 → 반전 → 해석
- 비교 → 차이 → 의미
- 문제 → 원인 → 결과
- 행동 → 숨은 이유 → 시사점

### Cover / Body 중복 방지

Cover hook과 BODY 1이 같은 내용을 단순 반복하지 않는다.

- Cover: 독자를 멈추게 하는 핵심 주장.
- BODY 1: 그 주장을 이해하기 위한 첫 번째 새로운 근거·현상·구조.

BODY 1은 Cover 문장을 풀어쓴 설명만으로 구성하지 않는다.

## Default Page Logic
1. Cover
2. Context / first thesis
3. Key point
4. Key point
5. Key point
6. Key point
7. SUMMARY
8. Final URINSIGHT insight
- Expand to 9–10 pages only when content genuinely requires it

## Research / Automation Rules

아래 자동 탐색·게시 항목은 향후 자동화 방향이다. 현재 Daily Workflow v1은 사용자가 준비한 package를 로컬에서 렌더링하고 사람이 검수·업로드하는 흐름이다. 이 스펙 revision은 API 호출, 이미지 자동 수집/생성, 자동 게시 기능을 추가하지 않는다.

- Topic discovery sources: Naver News, foreign news (e.g. BBC/CNN), X and other current sources
- Verify sources:
  - General insight: minimum 2 sources
  - Statistics/data: minimum 3 sources
  - Public-figure quote: 1 primary/original source + 1 supporting source
- Avoid repeating same topic within 7 days
- Initial workflow: generate → human review
- Later workflow after stabilization: generate → save / publish automatically

## Brand Slogan
돈, 사업, 성공을 더 깊게 읽는 시선

## Development Handoff
When Codex implementation begins, preserve this document as the visual/content baseline.
Recommended repository location:
- /docs/URINSIGHT_CAROUSEL_V6.md
- /references/v6/
- /templates/
- /outputs/

Recommended first Git commit/tag:
- commit: "Lock URINSIGHT carousel v6 baseline"
- tag: "carousel-v6-baseline"


---

# Cover Image System v1

## Purpose
The cover image is part of the URINSIGHT brand system, not a disposable background.
The goal is a premium editorial mood that feels curated, thoughtful, and magazine-like.

Reference mood:
- Cosmos-style editorial curation
- sophisticated negative space
- restrained color
- atmospheric lighting
- premium stock / editorial photography feel

Do not copy Cosmos layouts or specific images.
Use only the editorial mood, curation sensibility, visual restraint, and sense of space as reference.

## Cover–Insight Visual Pairing

## Cover–Insight Pair Production

정상 실전 package는 제작 단계부터 Cover와 INSIGHT를 하나의 visual pair로 설계한다. 두 장은 같은 editorial world를 공유하되 Cover는 opener, INSIGHT는 closer다.

```text
URINSIGHT_YYYYMMDD_<slug>/
├─ carousel.json
├─ cover.png
├─ insight.png
└─ sources.md
```

정상 제작에서는 두 이미지를 모두 준비하는 것이 기본이다. 이미지 확장자는 jpg/jpeg/png/webp를 허용하며 package asset으로 관리한다. carousel.json schema는 변경하지 않는다. Fallback은 정상 제작 방식이 아닌 비상 안전장치다. 실전 게시 전 insight image를 별도로 준비하는 것을 원칙으로 한다.

### AI-Generated Image Pair Rule

1. Cover image를 먼저 생성한다.
2. Cover image를 visual reference로 사용한다.
3. 같은 인물·공간·조명·색감·photographic language를 유지한다.
4. 다른 순간, 다른 앵글, 다른 framing의 Insight image를 파생 생성한다.

두 이미지는 같은 editorial photo shoot에서 나온 첫 장면과 마지막 장면처럼 느껴져야 한다. 예를 들어 Cover가 마트 진열대에서 상품을 고르는 사람이라면, Insight는 같은 사람·마트·조명에서 카트를 밀고 이동하거나, 계산을 마치거나, 장바구니를 바라보는 정적인 장면으로 연결한다.

금지:

- Cover와 Insight를 서로 무관한 prompt로 독립 생성.
- Cover는 실사인데 Insight는 SF/판타지인 구성.
- 인물 외형·공간·시대·조명이 갑자기 바뀌는 구성.
- 단순히 category color만 비슷한 이미지 조합.

이 규칙은 package 제작 원칙이며 Daily Runner가 AI를 호출하거나 이미지를 생성한다는 뜻은 아니다.

### Real / Stock / Public Figure Image Pair Rule

실제 사진·stock·실존 인물 콘텐츠는 다음 순서로 선택한다.

1. 같은 촬영 시리즈의 다른 컷
2. 같은 인터뷰 / 행사 / 장소의 다른 컷
3. 같은 인물·공간·오브젝트의 유사한 editorial 컷
4. 동일 Cover image의 crop / zoom / framing 변경

예: CEO 인터뷰의 Cover에는 같은 인터뷰 또는 행사에서 촬영된 다른 장면을 Insight로 연결한다. 실존 인물을 AI로 재생성하여 Insight를 만드는 것은 지양하며, 기존 실제 인물 사진 및 사용 권한 원칙을 따른다.

### Cover / Insight Role Difference

- Cover: 진입, 긴장, 시선을 잡는 첫 장면, 주제를 열어주는 이미지.
- Insight: 정리, 여운, 조금 더 정적인 장면, 콘텐츠를 닫는 이미지.

가능하면 Insight는 Cover보다 차분하고 정적인 framing을 사용한다. 연결된 이미지라도 같은 역할을 반복하지 않는다.

### Fallback Operational Policy

| status | 운영 의미 | requiresQualityReview |
| --- | --- | --- |
| provided | explicit insight image를 준비한 정상 상태 | false (일반 최종 검수는 유지) |
| cover-fallback | cover alternate framing을 사용하는 허용 가능한 비상 상태; warning과 품질검수 필요 | true |
| placeholder-fallback | 개발/비상 안전장치; 실제 게시 권장 상태가 아님 | true |

현재 fallback 구현과 순서는 유지한다. 실제 게시 전 마지막 장을 반드시 검수하며, 정상 package의 두 이미지 준비를 fallback으로 대체하지 않는다.

### Cover / Insight Image Relationship

Cover와 INSIGHT는 각각 독립적인 랜덤 이미지가 아니다. 두 이미지는 반드시 “같은 editorial photo series에서 나온 것처럼” 느껴져야 한다.

- Cover: 콘텐츠의 첫 장면. 관심을 끌고 주제로 진입시키는 이미지.
- INSIGHT: 같은 이야기를 닫는 마지막 장면. 정리와 여운을 남기는 이미지.

표지와 마지막 장은 역할은 다르지만 같은 세계에 있어야 한다. Cover를 선정할 때부터 INSIGHT용 연관 이미지를 확보할 수 있는지 고려한다.

### Visual Continuity Rule

Cover와 INSIGHT 이미지는 아래 항목 중 최소 3개 이상의 연결성을 가져야 한다.

- 동일한 주제 축
- 동일하거나 유사한 피사체 계열
- 동일하거나 유사한 인물
- 동일하거나 유사한 공간
- 유사한 오브젝트
- 유사한 색감
- 유사한 조명
- 비슷한 시간대
- 유사한 무드
- 유사한 구도 성격
- 동일한 editorial texture / photographic language

단순히 색깔만 비슷한 것은 충분한 연관성으로 보지 않는다. 최소 3개 조건과 함께 두 장이 같은 시리즈처럼 느껴지는지 확인한다. 가능하면 3개보다 더 많은 요소를 공유한다.

### 좋은 예 / 나쁜 예

좋은 예:

| Cover | INSIGHT |
| --- | --- |
| 마트에서 상품을 고르는 소비자 | 같은 톤의 계산대, 장바구니, 결제를 마친 뒤 걷는 소비자, 같은 공간의 다른 장면 |
| 어두운 사무실에서 모니터를 보는 인물 | 같은 인물의 다른 각도, 같은 사무실의 다른 컷, 업무가 끝난 뒤의 장면, 비슷한 조명과 공간 |
| 도시에서 혼자 걷는 사람 | 같은 도시·시간대, 유사한 인물/실루엣, 조금 더 정적인 마무리 장면 |

나쁜 예:

- Cover는 사무실인데 INSIGHT는 숲/바다.
- Cover는 마트인데 INSIGHT는 우주 이미지.
- Cover는 실사인데 INSIGHT는 3D 렌더.
- Cover는 차분한 editorial photo인데 INSIGHT는 네온 cyberpunk.
- 동일한 주제라는 이유만으로 시각 언어가 완전히 다른 사진을 조합하는 경우.

### INSIGHT Image Priority

1. Cover와 같은 시리즈의 다른 컷
2. 같은 인물 / 같은 장소 / 같은 오브젝트의 다른 컷
3. 같은 촬영 콘셉트와 무드를 가진 유사 컷
4. 같은 이미지의 crop / zoom / framing 변경
5. 위 조건을 만족하는 새 이미지

완전히 다른 이미지를 단순히 “주제와 관련 있다”는 이유로 사용하는 것은 지양한다.

### 동일 Cover 이미지 재사용

표지 이미지를 INSIGHT에 다시 사용하는 것은 허용한다. 다만 그대로 복사하기보다 가능하면 crop, zoom, framing, focal point, overlay 강도를 변경해 첫 장과 마지막 장의 역할 차이를 만든다.

새로운 관련 이미지를 억지로 찾는 것보다 표지 이미지를 다른 방식으로 재구성하는 편이 시각적 연속성이 높다면 이를 우선한다.

### Package Support / Runtime Integration

콘텐츠 package를 준비할 때 `cover.png`와 `insight.png`를 하나의 시각 세트로 확보한다. 두 asset은 .jpg / .jpeg / .png / .webp를 지원한다. carousel.json schema는 그대로 유지하며 새 필드는 요구하지 않는다.

```text
package/
├─ carousel.json
├─ cover.png
├─ insight.png
└─ sources.md
```

Daily Runner는 명시적 insight 파일을 자동 탐색·decode하고 runtime insightImage로 전달한다. 다중 insight 파일이나 decode 오류는 실패 처리하며, URL 다운로드는 하지 않는다. insight가 없으면 resolve된 cover에 alternate framing을 적용하고 경고한다. cover도 없으면 placeholder-fallback과 requiresQualityReview=true를 manifest에 기록한다. 원본 파일은 변경 없이 processed로 이동하고 output에는 원본 insight 이미지를 별도 복사하지 않는다. dry-run도 동일한 탐색·decode·fallback 검사를 수행하되 렌더링·이동은 하지 않는다.

이미지 모드 token: 검정 overlay 65%, object-fit:cover, 명시적 이미지 position 50% 50%, cover fallback position 58% 50% / scale 1.08. category tint나 gradient는 적용하지 않는다. 브랜드·headline 시작·footer 좌표와 highlight 규칙은 유지한다. Daily headline은 Revision 1.8의 72px / 98px를 적용하고 legacy typography는 보존한다. manifest.insight는 status(provided / cover-fallback / placeholder-fallback), source, requiresQualityReview를 기록한다.

## Image Type by Topic

### 1. Person-led topics
Examples:
- Jensen Huang
- Elon Musk
- Warren Buffett
- founders / CEOs / public business figures

Rules:
- Prefer a real photo of the actual person
- Prefer interview, work, stage, candid, or contemplative moments over generic portrait shots
- Avoid overly tight face crops when they interfere with title placement
- Prefer subject placement in center-right / right side when possible
- Preserve clear title space on the left
- Do not AI-generate a real person to imitate their likeness

### 2. Company / industry / product-led topics
Examples:
- NVIDIA
- Starbucks
- AI industry
- platform strategy
- business model analysis

Priority:
1. Real contextual image related to the company / product / industry
2. Editorial stock image that represents the industry or situation
3. Conceptual editorial image if an appropriate real image is unavailable

Rules:
- Prefer contextual scenes over oversized logos
- Avoid obvious promotional or corporate PR imagery when possible
- The image should communicate context, not merely show a logo

### 3. Concept / insight-led topics
Examples:
- judgment
- time
- attention
- loneliness
- convenience
- information overload
- decision fatigue

Rules:
- Use symbolic, atmospheric, editorial imagery
- Do not illustrate the concept too literally
- Favor visual metaphor, composition, light, space, shadow, texture, and mood

Examples:
- judgment → branching paths, layered choices, contrast, directional light
- time → movement, blur, transit, changing light, traces of motion
- money → urban spaces, consumption traces, assets, materials, spaces; avoid literal cash bundles
- success → tension, scale, discipline, distance, work environments; avoid cliché mountain-top imagery

## Image Acquisition Priority

일반 주제형 cover는 가능하면 실사 기반의 premium editorial photography를 우선한다.

1. Rights-cleared real editorial photo
2. Premium stock / editorial stock (사용 권한이 확인된 이미지)
3. Realistic editorial AI-generated photo

AI 생성 시에도 “AI art”처럼 보이는 이미지보다 실제 잡지 촬영물처럼 보이는 사진을 목표로 한다. 추상적인 주제도 가능하면 실제 환경·사물·빛·구도로 표현한다.

Important:
- News articles, X posts, and social media may be used for research and topic discovery
- Do not automatically reuse article or social-media images unless usage rights are clear

## AI Image Generation Rules

When AI generation is used, the target should be:
- editorial photography
- cinematic natural lighting
- sophisticated composition
- subtle film grain
- muted / restrained colors
- atmospheric
- premium magazine photography
- realistic photography
- documentary/editorial feeling
- real-world environment
- understated
- contemporary editorial
- negative space suitable for title placement

Avoid:
- obvious AI art
- glossy 3D render
- neon cyberpunk
- excessive glow
- fantasy-heavy visuals
- surreal cosmic scene
- cartoon / illustration look
- motivational poster aesthetic
- overly surreal compositions
- excessive symmetry
- over-rendered sci-fi imagery unless the topic genuinely demands it

주제 자체가 우주·SF·기술 시각화를 직접 요구하는 경우에는 해당 표현을 예외적으로 사용할 수 있다. 주제와 무관한 우주 장면, 과도한 SF·glow·cyberpunk/neon을 분위기만을 위해 추가하지 않는다.

## Cover Composition Rules

### Text zone
- Title is left-aligned
- Reserve approximately the left 50–60% as usable text space whenever possible
- Main visual subject should preferably sit center-right or right
- Reject visually strong images that make the title hard to read

### Visual balance
- Image should support the headline, not compete with it
- Avoid busy backgrounds behind the title
- Maintain generous negative space
- Prefer one dominant visual idea over many small visual elements

## Image Treatment / Grading

To unify images from different sources:
- slightly reduce saturation when needed
- maintain moderate contrast
- apply the Daily COVER full-frame black overlay at 45%, weaker than INSIGHT at 65%
- add light film grain / texture if appropriate
- reduce overly crisp commercial-stock appearance
- preserve natural skin tones for real people
- do not force the category color into the entire image

### Full-frame COVER Dark Overlay — Revision 1.8

Daily COVER는 전체 프레임에 검정 dark overlay 45%를 기본 적용한다. Revision 1.6/1.7의 localized text-area readability treatment는 폐기한다. 브랜드·제목·카테고리 가독성을 확보하면서 이미지의 자연스러운 명암과 editorial 무드를 보존한다. category color로 사진을 tint하지 않는다.

### COVER / INSIGHT Brightness Relationship

COVER는 INSIGHT보다 밝고 자연스러운 진입 장면, INSIGHT는 더 깊고 어두운 마무리 장면으로 제작한다. COVER 45% < INSIGHT 65%의 overlay 강도를 유지한다. 서로 다른 원본 이미지의 노출도 고려하여 최종 밝기와 글자 가독성을 검수한다.

작업 순서, package 구조, FLOW 문서, schema는 변경하지 않는다. 기본 legacy generate는 기존 결과를 유지한다.

## Category Color Usage on Cover

Category colors:
- 사업: #3B5BDB
- 돈: #1F8A5B
- 인사이트: #FF5A36

Use category color for:
- key phrase highlight background
- category label text

Do NOT automatically tint the entire photo with the category color.

## Forbidden / Reject Conditions

Reject cover images that are:
- watermarked
- low resolution
- screenshots
- already covered with heavy text
- generic handshake / smiling-office-worker corporate stock
- cliché money-stack / luxury-flex imagery
- cliché mountain-top success imagery
- visually noisy behind the title
- unrelated but merely “pretty”
- over-stylized AI imagery
- AI recreations of real public figures
- legally unclear for reuse

## Automated Candidate Selection

When multiple candidate images are available, score on:
- Editorial Fit
- Topic Relevance
- Text Space
- Visual Quality
- Brand Fit
- Rights / Usage Clarity

Suggested internal weighting:
- Editorial Fit: 25
- Topic Relevance: 25
- Text Space: 20
- Visual Quality: 15
- Brand Fit: 10
- Rights / Usage Clarity: 5

Reject any image with unresolved rights concerns regardless of visual score.

## Final Cover Image Decision Logic

- Real person topic → real person photo
- Company / industry topic → real contextual or editorial industry photo
- Abstract insight topic → editorial stock / stock-like image
- If no suitable image exists → AI-generated editorial photo

The goal is:
“premium editorial media cover”
not
“generic social-card background”

---

## 실전 제작 전 최종 체크리스트

콘텐츠 package 생성 전에 다음을 확인한다. 편집 항목은 제작자의 검수 기준이며 Daily Runner가 의미적 중복이나 문체를 자동 판단한다는 뜻은 아니다.

### CONTENT

- [ ] category가 핵심 주제와 맞는가
- [ ] cover hook이 충분히 강한가
- [ ] BODY 1~5의 역할이 서로 다른가 (확장 시 BODY 6~7도 확인)
- [ ] BODY 간 핵심 주장 중복이 없는가
- [ ] 사례/근거 반복이 없는가
- [ ] 문장 패턴 반복이 과하지 않은가
- [ ] SUMMARY가 BODY recap에 그치지 않는가
- [ ] INSIGHT가 SUMMARY 축약에 그치지 않는가
- [ ] 데이터/인용이 출처와 일치하는가

### COVER

- [ ] 실사 editorial mood가 우선되었는가
- [ ] 제목 영역 negative space가 확보됐는가
- [ ] AI-art 느낌이 과하지 않은가
- [ ] category color가 사진 전체를 지배하지 않는가
- [ ] 제목 3줄이 첫눈에 읽히는가
- [ ] highlight가 배경과 겹쳐 묻히지 않는가
- [ ] 전체 overlay가 과도한 보정처럼 보이지 않는가
- [ ] 이미지 전체가 불필요하게 탁해지거나 무드가 죽지 않았는가
- [ ] COVER가 INSIGHT보다 과하게 어두워지지 않았는가

### LAYOUT

- [ ] BODY title 한 줄
- [ ] highlight 앞뒤 space 제외
- [ ] highlight visual padding 정상
- [ ] clipping/overflow 없음
- [ ] SUMMARY/INSIGHT 역할과 디자인 유지

### INSIGHT

- [ ] INSIGHT에 이미지가 포함됐는가
- [ ] Cover와 시각적으로 연결되는가
- [ ] Cover와 최소 3개 이상의 시각적/개념적 요소를 공유하는가
- [ ] 완전히 다른 사진처럼 느껴지지 않는가
- [ ] Cover와 동일한 역할이 아니라 마무리 장면의 역할을 하는가
- [ ] 같은 editorial series처럼 보이는가
- [ ] SUMMARY를 다시 말한 문장이 아닌가
- [ ] 핵심 문장이 짧고 강한가
- [ ] 텍스트 가독성이 충분한가
- [ ] 과도한 AI-art 느낌이 없는가
- [ ] 필요하다면 동일 Cover 이미지를 crop/framing 변경으로 재사용했는가

INSIGHT 이미지 항목은 1.3 제작 스펙의 검수 기준이다. Daily Runner는 asset 유효성과 렌더링 overflow/clipping을 검사한다. 같은 editorial series인지, 표현·이미지의 적합성과 실제 가독성이 충분한지는 사람이 확인한다.

## Changelog

### Revision 1.9 — 2026-09-18

- Added recommended BODY editorial density for mobile readability.
- Short BODY pages should be enriched with evidence, context, or interpretation rather than moving anchors or adding filler.
- Editorial guidance only; SUMMARY, design, renderer, validation, FLOW and schema remain unchanged.

### Revision 1.8 — 2026-09-18

- Replaced localized COVER treatment with a full-frame 45% black overlay.
- Kept COVER lighter than the 65% INSIGHT overlay.
- Enlarged Daily INSIGHT headline from 63.5/88px to 72/98px.
- Preserved all top/footer anchors and BODY/SUMMARY emphasis bottom Y=1103.
- Retained legacy generate, image pairing, package schema and Daily workflow.
- Supersedes the localized treatment recorded in revisions 1.6 and 1.7.

### Revision 1.7 — 2026-09-17

- Enlarged Daily COVER/BODY/SUMMARY typography for mobile readability.
- Kept top anchors and shared emphasis bottom Y=1103; refined shared gaps.
- Implemented text-range-based localized cover scrim and subtle text shadow.
- Preserved INSIGHT, legacy generate, schema and Daily workflow.
- Added mobile, localized-background and overflow regression checks.

### Revision 1.6 — 2026-09-17

- Added localized cover readability treatment rule. Cover now prioritizes text-area-only correction instead of global darkening.
- Clarified COVER / INSIGHT brightness relationship and added COVER readability quality checks.
- Documentation-only update; retained Carousel Design v6, workflow and package structure.

### Revision 1.5 — 2026-09-17

- Added shared titleToBodyGap (57px), measured from the unchanged BODY layout.
- SUMMARY explanation now follows the actual headline bottom after font loading.
- Preserved SUMMARY top anchors and shared emphasis bottom Y=1103.
- Added 1/2/3-line and CSS-wrapped headline tests and dynamic content-fit validation.
- Preserved legacy generate, Daily image workflow and immutable references/tags.

### Revision 1.4 — 2026-09-17

- Added fixed vertical anchors for BODY.
- Added fixed vertical anchors for SUMMARY.
- Unified final emphasis bottom line at Y=1103.
- Added variable middle-content zone.
- Added editorial fit-before-font-resize rule.
- Added BODY/SUMMARY overflow validation with measured limits.
- Daily Runner opts into the anchored frame; legacy generate and Specification 1.3 image mode remain supported.

### Revision 1.3 — 2026-09-16

- Normal package now pairs cover + insight images.
- AI covers use reference-based derivative Insight generation.
- Real/stock imagery uses same-series pairing.
- Cover fallback classified as emergency fallback requiring quality review.
- Placeholder fallback requires quality review and is not recommended for publishing.
- Added Cover–Insight Pair Production rules; opener/closer roles are distinct.

- INSIGHT page uses imagery in Daily Runner; missing real assets trigger a flagged placeholder exception.
- Added Cover–Insight visual continuity rule.
- Added same-series image priority.
- Added minimum visual consistency criteria (at least three shared elements).
- Added Cover image reuse/crop fallback.
- Added INSIGHT image validation checklist.
- Implemented package insight image support and optional runtime image mode; preserved legacy generate behavior.
- Retained Carousel Design v6, Cover Image System v1, Daily Workflow v1, and the Specification 1.2 recovery commit/tag.
- Added image resolution, fallback status, overlay/crop tokens and tests; retained the existing carousel schema and immutable references.

### Revision 1.2 — 2026-09-16

- Carousel Design v6 유지; Specification Revision을 별도로 명시.
- Added editorial deduplication and post-generation duplicate review.
- Added narrative progression and expression variation rules.
- Clarified SUMMARY / INSIGHT roles and Cover / BODY 1 differentiation.
- Refined editorial cover image priorities and realistic photographic mood.
- Added highlight visual padding specification (left up to 5px / right up to 7px).
- Added final content / cover / layout checklist.
- Updated current renderer font status to Pretendard; retained Cover Image System v1 and Daily Workflow v1.
