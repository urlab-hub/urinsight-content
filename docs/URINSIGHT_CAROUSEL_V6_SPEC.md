# URINSIGHT Carousel v6 — Baseline Specification

- URINSIGHT Carousel Design: v6
- Specification Revision: 1.2
- Cover Image System: v1
- Daily Workflow: v1
- Last Updated: 2026-09-16

이번 revision은 현재 구현된 디자인과 두 차례 실전 운영 테스트에서 확인한 편집 원칙을 반영한다. Carousel Design은 v6로 유지하며 v7로 변경하지 않는다. Specification Revision은 디자인 버전과 별도로 관리한다.

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
- Top vertical zone aligned with body-page top system
- Summary headline: bold
- Key phrase: category-color background + white text
- Body: regular text
- Final emphasized sentence: category-color background + white text
- Highlight rectangle: glyph-based with background-only optical padding, no highlighted outer spaces

### SUMMARY editorial role

SUMMARY는 BODY를 다시 나열하거나 짧게 반복하는 페이지가 아니다.

답해야 할 질문은 “앞의 여러 사실과 논거를 묶으면 어떤 구조가 보이는가?”다. BODY보다 한 단계 높은 해석을 제시한다. BODY에서 이미 사용한 핵심 문장을 그대로 다시 사용하지 않는다.

## 8P Final
- Dark background
- Upper label: URINSIGHT in category color
- No separate INSIGHT label
- Main insight sentence: bold
- Key phrase: category-color background + white text
- Bottom slogan: “돈, 사업, 성공을 더 깊게 읽는 시선”
- Bottom slogan: bold, smaller than main text
- Bottom URINSIGHT: thin / regular, smaller than slogan
- No page number

### INSIGHT editorial role

INSIGHT는 SUMMARY를 한 줄로 압축하는 페이지가 아니다.

답해야 할 질문은 “독자가 콘텐츠를 닫고도 기억해야 할 하나의 관점은 무엇인가?”다. SUMMARY와 다른 표현으로 작성하며, 정보 설명보다 관점과 기억성을 우선한다.

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
- add subtle dark overlay if text readability requires it
- add light film grain / texture if appropriate
- reduce overly crisp commercial-stock appearance
- preserve natural skin tones for real people
- do not force the category color into the entire image

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

### LAYOUT

- [ ] BODY title 한 줄
- [ ] highlight 앞뒤 space 제외
- [ ] highlight visual padding 정상
- [ ] clipping/overflow 없음
- [ ] SUMMARY/INSIGHT 역할과 디자인 유지

## Changelog

### Revision 1.2 — 2026-09-16

- Carousel Design v6 유지; Specification Revision을 별도로 명시.
- Added editorial deduplication and post-generation duplicate review.
- Added narrative progression and expression variation rules.
- Clarified SUMMARY / INSIGHT roles and Cover / BODY 1 differentiation.
- Refined editorial cover image priorities and realistic photographic mood.
- Added highlight visual padding specification (left up to 5px / right up to 7px).
- Added final content / cover / layout checklist.
- Updated current renderer font status to Pretendard; retained Cover Image System v1 and Daily Workflow v1.
