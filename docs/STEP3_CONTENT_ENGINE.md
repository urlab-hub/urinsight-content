# STEP 3 · URINSIGHT content engine

## 범위와 기준점

- Branch: `feature/content-engine`.
- 시작 commit: `3236a23c976ad0871d3a38c803548fa326cb24b6`.
- 보호 기준점: `main`, annotated tag `carousel-v6-renderer`.
- 기존 renderer, 디자인 tokens, content schema, 승인 sample, references를 수정하지 않았습니다.
- 이 단계는 오프라인 research 입력 → 원고 엔진입니다. 뉴스/X 수집, 이미지, 게시, 실제 LLM/API 호출은 없습니다. 새 dependency도 없습니다.

## Architecture

```text
research JSON
  → normalizeResearch / researchSchema
  → source metadata, source IDs, recommended count validation
  → allowed / review / blocked topic filter
  → direct-subject category classification
  → topic, angle, thesis, BODY argument planning
  → production prompt builder
  → ContentProvider (MockContentProvider only)
  → provider envelope schema + copy / factual grounding validation
  → renderer content schema projection
  → existing Playwright layout validation (no PNG required for draft)
  → atomic drafts bundle
  → optional unchanged renderer → PNG
```

`draft`도 실제 Pretendard/Chromium으로 모든 페이지를 검사합니다. 단순 글자 수 검사를 통과한 폭이 넓은 제목도 실제 overflow 검사에서 거절합니다. 따라서 `pnpm setup:browser` 설치가 필요합니다. `prompt`는 브라우저나 provider를 호출하지 않습니다.

## Research schema

`src/research/schema.ts`의 Zod strict schema가 기준입니다.

| 필드 | 계약 |
|---|---|
| topic | 필수, 핵심 주제, 최대 300자 |
| slug | 선택, 기존 renderer의 안전한 slug 규칙. 생략하면 topic SHA-256 일부로 안정적인 `research-...` 생성 |
| requestedCategory | business / money / insight / null, 기본 null |
| angleHint | 선택적 편집 관점, null 허용 |
| sources | source 배열; 0개도 입력 검증상 허용하지만 부족 경고, 생성 copy에는 실제 근거 필수 |
| notes | 편집 메모 배열, 기본 [] |
| outline | 선택적 1~7개 `{thesis, sourceRefs}`. 추가 페이지가 필요한 독립 논거를 편집자가 명시 |

Source: id, title, publisher, url, publishedAt, type, isPrimary, summary, facts[], quotes[]. Quote는 speaker, text, isDirectQuote를 모두 요구합니다. 날짜는 실제 ISO 날짜/시간인지 검사합니다. URL은 HTTP(S), manual 자료에는 `urn:`도 허용합니다. URL을 가져오거나 읽지는 않습니다.

`type`은 news/report/interview/official/social/research/manual을 알려진 값으로 취급하며, 새로운 소문자 타입은 보존하고 info를 남깁니다. 같은 ID는 error. 중복 URL(추적 query/hash 제외)은 독립 출처로 중복 계산하지 않습니다. 미래 날짜, manual, 출처/발행처 다양성 부족은 warning입니다. 원문은 NFC·줄 끝·바깥 공백만 정규화하며 facts/quotes 내용을 다시 쓰지 않습니다.

## Category logic

분류는 모델 호출 없이 결정적 keyword scoring입니다. topic 키워드 가중치 3, angleHint 가중치 4. 출처 본문에 우연히 포함된 키워드로 주제를 뒤집지 않습니다.

- business: 고객, 마케팅, 브랜딩, 판매, 창업, 사업모델, 회사 운영, 경영 등.
- money: 소비, 저축, 자산, 현금흐름, 가계, 재무, 돈 관리 등.
- insight: 시장 변화, 사회, 심리, 성공, 시대, 판단, 사고방식, 관점 등.

requestedCategory가 있으면 우선 유지합니다. 요청 category 점수 0이고 다른 category 점수 6 이상이면 CATEGORY_CONFLICT warning. 동점/근거 부족은 info, 키워드가 없으면 insight입니다. 이 분류는 의미 이해 모델이 아니므로 복합 주제는 편집 검토가 필요합니다.

## Topic/thesis extraction and planning

topic은 입력 핵심 주제를 보존합니다. angleHint가 있으면 angle/thesis에 반영하고, 없으면 첫 outline 논거 또는 첫 distinct source fact를 thesis 후보로 사용합니다. 역할은 현상 → 원리 → 사례 → 가치 변화 → 해석을 기본으로 합니다.

기본 BODY 5개, 전체 8페이지. 단순 facts 수가 많다고 늘리지 않습니다. 편집자가 outline에 서로 다른 출처 연결 논거 6/7개를 명시했을 때만 9/10페이지 계획을 만듭니다. 근거가 부족하면 SPARSE_RESEARCH warning을 내고 빈 논거 자리를 주제로 표시하되 사실을 발명하지 않습니다. 생산용 모델은 이런 경우 추가 조사/검토가 필요합니다. Mock은 승인 fixture의 8페이지만 반환합니다.

## Copy contract

`prompts/urinsight-system.md`와 `urinsight-carousel.md`가 production 지시입니다. prompt-builder는 지시 + 승인 v6 문체 예시 + 실제 Zod 출력 JSON Schema + plan + research를 결합합니다.

- 3개 cover visual lines, 하나의 강한 자연스러운 문장, 짧고 유일한 highlight.
- BODY title은 숫자 접두사 없이 28자 이하 + 실제 한 줄 layout 검사. number는 renderer가 표시합니다.
- BODY/SUMMARY paragraphs 2~3개, 의미 단위. 글자 수로 강제 줄바꿈 금지.
- 명확하고 짧은 평서문, 과장된 hook과 사실을 구분. 가짜 사례·인용·수치 금지.
- keySentence는 해당 페이지를 압축하며 본문 복사는 warning.
- SUMMARY는 상위 해석, INSIGHT는 기억할 관점. 두 마지막 문장의 동일 복사는 error.
- highlight는 실제 유일한 구절, 바깥 공백 없음. cover 장문 highlight는 warning.
- v6 optional editorial lines와 원문 일치 검증도 그대로 적용합니다.

Research 문자열은 신뢰하지 않는 데이터로 prompt에서 명확히 분리하며 내부 지시를 따르지 않도록 최종 지시를 둡니다. 이는 prompt 경계이며 미래 모델의 prompt injection에 대한 완전한 방어를 보증하지 않습니다.

## Provider and renderer schemas

Provider 응답은 `{carousel, claims}`입니다. engine carousel은 v6 content에 BODY/SUMMARY `sourceRefs`를 추가한 형태입니다. 모든 실제 copy field마다 claim record를 요구합니다.

```json
{
  "path": "body.0.paragraphs.0",
  "text": "필드 전체 원문",
  "kind": "interpretation",
  "evidence": [{ "sourceId": "source-1", "field": "facts", "index": 0 }]
}
```

Path는 cover.title(3줄을 공백으로 합침), body.N.title/paragraphs.M/keySentence, summary.headline/paragraphs.M/keySentence, insight.headline. index는 0-based입니다. 브랜드·하이라이트 중복 text는 별도 record가 아닙니다.

`toRendererContent`는 sourceRefs를 제거한 투영 결과에 기존 `contentSchema.parse`를 적용합니다. **기존 renderer schema는 변경하지 않습니다.** sourceRefs를 버리는 것이 아니라 `sources.json.pageSourceRefs`와 엔진 provider fixture에 보존합니다. cover/insight도 claims에 source ID가 연결됩니다.

## Grounding and validation

Severity는 info/warning/error. error가 있으면 파일 생성 전 실패하고 CLI exit code 1입니다.

| kind | 검증 |
|---|---|
| fact | 필드 전체가 명시적으로 인용한 source fact/summary와 정확히 같아야 함. 숫자만 맞고 의미 관계가 바뀐 문장은 실패 |
| quote | source.quotes의 동일 text + speaker + isDirectQuote=true. speaker/source 누락, 다른 발언은 실패 |
| interpretation | 근거 index/ID와 페이지 refs 확인. 구체적인 연구 결과·회사 행동·숫자를 해석으로 위장하면 규칙 기반 거절. 해석 자체는 human review warning |
| hypothetical | 입력에 존재하는 가정 문구를 그대로 사용하고 가정임을 표현. 실제 통계로 바꾸지 않음 |

공통 error: 잘못된 sourceRefs, evidence index, 미연결 copy field, duplicate claim path, text 불일치, 근거 없는 정확한 숫자/단위/연도, unsupported factual claim marker, 없는 highlight, 계획과 다른 페이지/category/slug, 생성된 임의 이미지 경로.

source 수 권고는 일반 2, 통계 중심 3, 직접 인용 primary 1 + supporting 1입니다. 부족하면 warning이며 개수를 채우기 위해 자료를 발명하지 않습니다. summary를 근거로 쓸 수 있지만 그 summary가 실제 사실인지는 입력 편집자의 책임입니다.

**한계:** source ID가 있다고 사실이 참인 것은 아닙니다. URL 원문/인물 신원/입력 facts 진위는 확인하지 않습니다. 해석의 의미적 함의와 모든 고유명사·새 회사 행동을 정규식으로 완전히 검증할 수 없습니다. 따라서 모든 generation-report는 `requiresHumanReview: true`입니다. 구체적 사실의 자연어 paraphrase는 현재 보수적으로 거절하고 추출형 일치만 허용합니다. 향후 별도 검증기나 편집 검토를 넣어야 합니다.

## Topic filter

정치·선거·정당 중심, 직접 투자 권유, 수익 보장 문구를 규칙 기반으로 차단합니다. 자료에만 위험 주제가 있으면 review, 일반 경제/사업 구조는 allowed. 생성 후 본문도 재검사합니다. filter는 allowed/review/blocked를 반환합니다. 키워드 방식이라 우회 표현·정치 인물 전체 목록을 완벽하게 다루지는 않으며, 보수적 오탐도 가능하므로 사람이 검토합니다.

## Mock provider

`ContentProvider.generateCarousel({research, plan, prompt}): Promise<unknown>` 인터페이스입니다. 엔진은 provider 결과를 신뢰하지 않고 runtime schema부터 검증합니다.

Mock은 checked-in research fingerprint와 일치할 때만 checked-in output fixture를 반환합니다. requestedCategory/angleHint는 fingerprint 비교에서 제외하고 category는 plan을 적용합니다. angleHint를 바꿔도 mock 문구를 재작성하지 않습니다. 시간·난수·API를 사용하지 않습니다. 관련 없는 입력을 주면 명확히 실패하므로 승인 sample을 다른 주제의 생성 원고처럼 반환하지 않습니다.

Fixture는 승인 원고를 두 manual 편집 자료로 나눴습니다. 실제 기사/외부 연구가 아니며 독립 publisher가 아닙니다. `100개 상품`, `1만 개 리뷰`는 승인 원고의 가정 사례입니다. 따라서 MANUAL_SOURCE, LOW_SOURCE_DIVERSITY, INTERPRETATION_REVIEW warning이 정상적으로 출력됩니다.

향후 OpenAIContentProvider/LocalModelProvider는 인터페이스를 구현할 수 있지만 이번에는 stub/API key 요구/SDK/API 호출조차 추가하지 않았습니다.

## CLI usage and outputs

```sh
pnpm draft research/fixtures/information-and-judgment.json
pnpm draft research/fixtures/information-and-judgment.json --provider mock
pnpm prompt research/fixtures/information-and-judgment.json
pnpm prompt research/samples/manual-business.json
pnpm draft:render research/fixtures/information-and-judgment.json
pnpm generate content/sample-insight.json
```

날짜는 Asia/Seoul 기준입니다. 이 작업 실행일의 결과:

```text
drafts/2026-09-16/information-and-judgment/
  carousel.json
  generation-report.json
  sources.json
  prompt.txt
  prompt-only/                 # pnpm prompt를 별도로 실행한 경우
    prompt.txt
    generation-report.json
output/2026-09-16/information-and-judgment/
  01_cover.png ... 08_insight.png
  contact-sheet.png
  validation.json
```

generation-report에는 category/angle/thesis/pageCount/plan/filter, source 및 grounding 경고, layout 검증, provider, timestamp, research fingerprint가 들어갑니다. sources.json에는 정규화된 research, 페이지 refs, 모든 claim/evidence가 들어가 향후 sources.md를 만들 수 있습니다. sources.md 자체는 생성하지 않습니다.

prompt-only 모드는 기존 draft의 prompt/metadata를 따로 덮어쓰지 않도록 하위 디렉터리에 저장합니다. 다음 draft 생성은 같은 날짜/slug의 전체 bundle을 교체하므로 prompt-only 산출물도 교체 대상입니다. 필요한 독립 prompt는 draft 생성 후 실행하세요. 같은 slug 동시 쓰기는 지원하지 않습니다.

출력은 임시 디렉터리에서 작성 후 교체합니다. 내용/레이아웃 검증 실패는 기존 성공 draft를 건드리지 않습니다. 실패 이유는 구조화된 validation issues를 CLI에 표시합니다. 초안과 raw research에는 검토 중 자료가 포함될 수 있어 `drafts/`는 Git 제외합니다.

## History / future integration

`ContentHistory` 인터페이스와 `HistoryEntry`(slug/topic/category/publishedAt/keywords), 문자 bigram Jaccard similarity 및 7일 이내 유사 주제 조회 함수를 제공합니다. 정확히 7일 이전·미래·잘못된 날짜는 제외합니다. 한국어 형태소/embedding 모델은 쓰지 않습니다. 실제 이력 저장·발행 자동 기록·crawler 연결은 없습니다.

향후 연결점: research JSON 공급기, provider 구현, 의미적 grounding verifier, 검토 승인, sources.md exporter, persistent ContentHistory. 뉴스/X 수집·이미지·Instagram 기능은 이번 코드에 없습니다.

## 실행 및 회귀 검증

- draft 기본/명시적 mock 모두 성공: 8페이지, 기존 schema 및 실제 layout 통과.
- prompt fixture 및 별도 business sample 성공: provider/API 호출 없음.
- draft:render 성공: 8 PNG 1080×1350 + contact sheet.
- 기존 pnpm generate 성공.
- 기존 7개 + 신규 17개, 총 24개 테스트 통과.
- 생성 JSON과 승인 sample 깊은 동등 비교 통과.
- 동일 엔진에서 draft 결과와 승인 sample을 각각 렌더한 PNG 8장 및 contact sheet가 byte-for-byte 동일.
- reference 9개 SHA-256 manifest 일치.
- main/tag와 renderer/schema/config/reference/sample은 baseline에서 변경 없음.
- 생성 prompt는 checked-in 전체 snapshot과 비교합니다.

## 생성/수정 파일 전체 목록

수정:

```text
.gitignore
package.json
README.md
```

신규:

```text
docs/STEP3_CONTENT_ENGINE.md
prompts/urinsight-system.md
prompts/urinsight-carousel.md
research/fixtures/information-and-judgment.json
research/fixtures/information-and-judgment.output.json
research/samples/manual-business.json
src/research/schema.ts
src/research/normalize.ts
src/research/validate.ts
src/content-engine/types.ts
src/content-engine/classify.ts
src/content-engine/filters.ts
src/content-engine/planner.ts
src/content-engine/prompt-builder.ts
src/content-engine/validators.ts
src/content-engine/layout-validation.ts
src/content-engine/generator.ts
src/providers/content-provider.ts
src/providers/mock-provider.ts
src/history/similarity.ts
src/cli/content-args.ts
src/cli/draft.ts
src/cli/prompt.ts
src/cli/draft-render.ts
tests/content-engine.test.ts
tests/content-engine-integration.test.ts
tests/snapshots/information-and-judgment.prompt.txt
```

일회성 fixture 준비 스크립트 `.tmp/create-step3-fixture.ts`와 생성 draft/output은 Git 제외입니다. pnpm-lock.yaml 및 의존성은 변경하지 않았습니다. 이번 단계에서 staging/commit/push하지 않았습니다.
