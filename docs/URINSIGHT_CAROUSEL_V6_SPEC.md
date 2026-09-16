# URINSIGHT Carousel v6 — Baseline Specification

## Status
- Version: v6
- Purpose: URINSIGHT Instagram carousel baseline
- Canvas: 1080 × 1350 px (4:5)
- Font target: Pretendard
- Current sample-render font: Noto Sans CJK fallback
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
- General topic: use premium editorial stock / stock-like imagery with a Cosmos-inspired editorial mood
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
- Highlight rectangle must fit glyphs tightly
- No horizontal highlight padding into neighboring spaces
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
- Highlight rectangle: tight to glyphs, no highlighted outer spaces

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

## Tone / Copy
- WorkHack Daily-like: sufficient explanation, concise sentences
- Declarative prose
- Strong, decisive hook
- Data / case / public-figure quotes used heavily when relevant
- Do not force data or quotations when evidence is weak
- Exaggeration allowed in hook/copy, but factual claims must remain defensible
- Politics and direct investment recommendations excluded

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

1. Rights-cleared real photo / editorial image
2. Licensed stock or editorial-style stock
3. AI-generated image designed to resemble premium editorial photography

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
- understated
- contemporary editorial
- negative space suitable for title placement

Avoid:
- obvious AI art
- glossy 3D render
- neon cyberpunk
- excessive glow
- fantasy-heavy visuals
- cartoon / illustration look
- motivational poster aesthetic
- overly surreal compositions
- excessive symmetry
- over-rendered sci-fi imagery unless the topic genuinely demands it

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
