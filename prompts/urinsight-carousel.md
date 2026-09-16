# 출력과 구성 지시

JSON 객체 하나를 반환한다: {"carousel": {...}, "claims": [...]}.
계획의 category와 pageCount를 지킨다. 기본 8페이지(cover + BODY 5 + summary + insight), 명시된 독립 논거가 있을 때만 BODY 6~7로 늘려 9~10페이지를 만든다.

## carousel

- category: business / money / insight. business는 고객·마케팅·판매·경영, money는 소비·저축·자산·현금흐름, insight는 사회·심리·시대·관점. 직접 설명하는 핵심 주제를 기준으로 한다.
- slug: 안전한 소문자 ASCII kebab-case, 100자 이하. 예약 파일명은 금지.
- cover.brand: URINSIGHT. titleLines 정확히 3개. 전체가 하나의 자연스러운 단정형 문장이어야 한다. 검색 제목/목차형 hook을 피한다. 핵심 구절 하나를 highlight로 지정한다. image는 생성하지 않는다.
- BODY: number는 1부터 연속. title에 숫자 '1.'를 쓰지 않는다. renderer가 번호를 그린다. title은 28자 이하의 짧은 한 줄이며 실제 860px 폭을 넘지 않아야 한다. highlight는 유일한 실제 구절. paragraphs는 2~3개의 의미 문단. keySentence는 해당 페이지의 의미를 압축하되 본문을 그대로 반복하지 않는다. sourceRefs는 실제 research source ID 배열.
- summary.label: SUMMARY. headline은 BODY 전체를 한 단계 위에서 묶는 해석이다. 단순 순서 recap 금지. paragraphs 2~3개, keySentence는 전체 논리를 압축하되 insight와 다른 표현. sourceRefs 필수. keySentenceHighlight는 선택이며 생략하면 문장 전체가 강조된다.
- insight: headline은 독자가 기억할 가장 짧고 강한 관점. 요약 목록 대신 새 표현으로 재구성. 유일한 핵심 구절 highlight.
- highlight의 앞뒤 공백은 금지한다. highlight는 원문에 정확히 한 번 존재하며 편집 줄을 가로지르지 않는다.
- paragraphs는 자동으로 글자 수에 맞춰 자르지 않는다. 의미 경계의 선택적 paragraphLines/headlineLines/keySentenceLines를 사용할 수 있으나 공백으로 합치면 원문과 정확히 같아야 한다. cover는 3 visual lines를 준수한다. 참고 크기: cover 89px/116px, BODY title 42px/52px, body 30.5px/47px, summary headline 46.4px/64px, insight 63.5px/88px. 모든 페이지는 1080×1350이고 제목·본문 영역 충돌이 없어야 한다.

## claims: 모든 실제 텍스트 필드를 근거에 연결

각 필드마다 정확히 하나의 record: {"path":"body.0.paragraphs.0","text":"필드 전체 원문","kind":"interpretation","evidence":[{"sourceId":"source-1","field":"facts","index":0}]}.

유효한 path: cover.title(3줄을 공백으로 합친 문장), body.N.title, body.N.paragraphs.M, body.N.keySentence, summary.headline, summary.paragraphs.M, summary.keySentence, insight.headline. N/M은 0-based. 브랜드/라벨/highlight 중복 문자열에는 record를 만들지 않는다.

kind:
- fact: 이번 엔진은 보수적인 추출형 검증을 한다. 필드 전체 text가 인용한 source.facts[index] 또는 summary와 정확히 같아야 한다. 숫자만 같고 관계가 다른 문장은 허용되지 않는다. 재서술한 구체적 사실을 통과시키려고 interpretation으로 표시하지 않는다.
- quote: source.quotes[index]에 isDirectQuote=true인 동일 text와 speaker가 있어야 한다. record에도 speaker를 넣는다. 없는 인용, 발언자 생략, 문맥상 추정 인용을 만들지 않는다. 인용 text는 원문 전체를 그대로 사용한다.
- interpretation: 자료에서 도출한 관점. evidence 필수이며 회사 행동, 연구 결과, 숫자 같은 구체적 사실을 숨겨 넣지 않는다. 의미적 타당성은 사람이 검토한다.
- hypothetical: 입력에 명시된 가정만 허용. 인용한 facts/summary와 text가 정확히 같아야 하고 가정임이 표현되어야 한다. 수치 예시는 실제 통계로 제시하지 않는다.

evidence.field는 facts / summary / quotes. facts·quotes에는 0-based index 필수, summary에는 index를 넣지 않는다. BODY/SUMMARY evidence의 sourceId는 해당 페이지 sourceRefs에도 포함되어야 한다. Cover/Insight도 evidence가 필요하다.

입력 근거에 없는 정확한 수치·단위·연도, 가짜 인용, unsupported factual claim marker는 오류다. 출처 수 권고는 일반 2개, 수치 중심 3개, 인용은 primary 1개 + supporting 1개다. 개수가 모자란다고 출처를 발명하지 않는다.

carousel.json 저장 단계에서는 sourceRefs를 분리하여 renderer 호환성을 유지한다. 하지만 provider 응답에서는 BODY/SUMMARY sourceRefs와 claims를 반드시 반환한다.
