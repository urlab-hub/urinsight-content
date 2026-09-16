# STEP 2 · v6 픽셀 미세조정

## 1. 수정한 파일 목록

- `src/config/tokens.ts`: 측정한 좌표, 자간, 폰트 크기, 하이라이트 상하 여유값.
- `src/renderer/template.tsx`: 위 토큰을 CSS에 연결; BODY 번호 폭을 일관되게 배치.
- `src/renderer/validate.ts`: 실제 glyph 폭 측정 시 CSS letter-spacing 반영. 기존 검증 유지.
- `docs/STEP2_VISUAL_TUNING.md`: 이번 보고서 (신규).

schema, content JSON, CLI, dependency, 일반 output 구조는 변경하지 않았습니다. 원본 PNG는 변경하지 않았습니다.
일회성 측정 스크립트 `.tmp/measure.cjs`, `.tmp/tune.ts`, `.tmp/comparison.cjs`는 Git 제외이며 제품 기능/CLI에 포함하지 않았습니다.

## 2. 조정한 디자인 token 목록

단위는 px. 아래는 STEP 1 최종값 → STEP 2 최종값입니다.

| Token | 이전 → 이후 |
|---|---|
| cover.brandTop | 305 → 306 |
| cover.brandSize | 28 → 28.8 |
| cover.titleTop | 394 → 393 |
| cover.categorySize | 32 → 32.5 |
| cover.categoryLetterSpacing | 0 → -1.25 |
| cover.footerTop | 918 → 919 |
| cover.footerSize | 20 → 20.5 |
| body.brandTop | 공통 302 → 303 |
| body.brandSize | 18 → 18.3 |
| body.titleTop | 공통 393 → 395 |
| body.titleLetterSpacing | 0 → -0.4 |
| body.numberWidth | 숫자별 가변 → 44 |
| body.keyGap | 30 → 31 |
| body.keySize | 30.6 → 30.7 |
| summary.labelTop | 공통 302 → 304 |
| summary.labelLetterSpacing | 0 → -1.2 |
| summary.titleTop | 공통 393 → 394 |
| summary.textTop | 688 → 689 |
| summary.keyGap | 38 → 37 |
| summary.keySize | body.textSize 상속 30.5 → 30.8 |
| insight.labelTop | 254 → 255 |
| insight.labelSize | 28 → 27.6 |
| insight.sloganSize | 24 → 24.5 |
| insight.brandSize | 28 → 28.8 |
| insight.brandGap | 18 → 20 |
| highlight.cover top/bottom | 0/0 → 2/2 |
| highlight.body top/bottom | 0/0 → 1/3 |
| highlight.summary top/bottom | 0/0 → 2/3 |
| highlight.summaryKey top/bottom | 0/0 → 3/3 |
| highlight.insight top/bottom | 0/0 → 2/3 |

공통 `layout.brandTop/contentTop`은 사용하지 않게 되어 제거하고 페이지 종류별 top token으로 분리했습니다. 하이라이트 **horizontal padding은 계속 0**이며 앞뒤 공백은 배경에 포함하지 않습니다. 상하 여유만 원본 사각형 높이에 맞췄습니다.

실측상 이미 맞는 값은 유지했습니다: Cover 제목 행간 116, BODY 본문 행간 47 / 문단 간격 26 / 본문 시작 504, SUMMARY 제목 행간 64, Insight 제목 시작 344 / 행간 88 / footerTop 899.

## 3. page별 조정

좌표는 최종 PNG에서 감지한 유색 또는 텍스트 잉크 범위이며 CSS box 좌표와 다릅니다. 숫자 범위 양 끝 픽셀을 포함합니다.

| 페이지 | 맞춘 내용 | reference와 최종 결과 |
|---|---|---|
| 01 Cover | 제목 블록 1px 위, 브랜드·footer 크기/좌표, category 폭/높이, highlight 상하 | 제목 y=412–490 / 528–606 / 644–722 일치. highlight y=642–723 일치. brand y=312–332, footer y=924–938 일치 |
| 02 BODY 1 | 숫자 1 뒤 제목 시작점, 자간, 제목 baseline, key sentence | highlight x=351–459 일치. key y=876–903 / 919–946 일치 |
| 03 BODY 2 | 제목 자간/번호 폭, baseline, key sentence | title 오른쪽 x=692→684 (원본 682). key y=829–856 / 872–899 일치 |
| 04 BODY 3 | 큐레이션 highlight 시작점, 번호 폭, 자간 | highlight 왼쪽 x=154 일치. title 오른쪽 x=620→612 (원본 610). key y 일치 |
| 05 BODY 4 | 판단 highlight 위치, 제목 폭, key sentence | title 오른쪽 x=694→684 (원본 682). highlight 왼쪽 x=431→424 (원본 423). key y 일치 |
| 06 BODY 5 | 정보 highlight 위치, 제목 폭, key sentence | title 오른쪽 x=702→693 (원본 690). highlight 왼쪽 x=357→352 (원본 351). key y=803–830 / 846–873 일치 |
| 07 Summary | SUMMARY label 폭·상단, headline/body 시작, 마지막 강조문장 | label y=310–328 일치. headline highlight y=530–577 일치. 마지막 highlight y=1064–1097 일치, 오른쪽 x=564 (원본 563) |
| 08 Insight | 상단 label, highlight 높이, slogan 폭, 하단 brand 간격 | highlight y=533–594 일치. slogan y=903–925 / 오른쪽 x=428 일치. 하단 brand y=954–974 일치 |

BODY 공통 브랜드 왼쪽 x=878→877, 상단 y=306→307로 원본에 맞췄습니다. BODY 제목 검은 glyph 상단도 원본 baseline에 맞도록 2px 내렸습니다. 본문의 semantic paragraph 구성과 줄 구분은 그대로입니다.

### 픽셀 차이 전후

동일한 reference에 대해 전체 페이지 RGB 채널 평균 절대 오차(MAE, 0–255)를 계산했습니다. 낮을수록 좋습니다. 아래 감소율은 **오차 감소율**이며 디자인 유사도나 정확도 백분율이 아닙니다. 표지 placeholder와 넓은 여백도 계산에 포함됩니다.

| 페이지 | 이전 MAE | 이후 MAE | 오차 감소 |
|---|---:|---:|---:|
| 01 Cover | 13.286 | 12.509 | 5.85% |
| 02 BODY | 2.745 | 2.022 | 26.35% |
| 03 BODY | 3.214 | 1.973 | 38.62% |
| 04 BODY | 2.890 | 1.874 | 35.17% |
| 05 BODY | 3.064 | 1.771 | 42.19% |
| 06 BODY | 2.750 | 1.621 | 41.07% |
| 07 Summary | 4.448 | 2.346 | 47.25% |
| 08 Insight | 1.412 | 0.939 | 33.48% |

## 4. comparison / diff 산출물

프로젝트 루트: `C:/Users/Jungsoo Bae/Documents/ChatGPT/URINSIGHT/`

- `output/step2/reference-before-after.png`: 8개 행, 왼쪽 reference / 중앙 STEP 1 / 오른쪽 STEP 2. 영문 열 제목 포함.
- `output/step2/pages/01_cover.png` ~ `08_insight.png`: 페이지별 원본 크기 1080×1350을 보존한 3열 비교판 (각 비교판 3320×1420).
- `output/step2/before/`: 조정 전 8 PNG, contact sheet, diff와 소스 3개 snapshot.
- `output/step2/after/`: 최종 8 PNG, contact sheet, diff와 소스 3개 snapshot.
- `output/step2/before-after-metrics.json`: MAE 전후 수치.
- `output/step2/measurements.json`: 최종 reference/생성물의 행별 잉크 좌표.
- `output/step2/title-spacing-experiment.json`: 고정 번호 폭 44px에서 BODY 5개 제목의 자간/단어 간격 후보 측정 결과.
- `output/2026-09-16/information-and-judgment/reference-comparison.png`: 기존 CLI가 생성한 원본 / 최종 / 절대 픽셀 차이.
- 같은 디렉터리의 `reference-diff.json`, `validation.json`, `contact-sheet.png`도 갱신했습니다.

비교판과 BODY 실제 PNG를 직접 열어 확인했습니다. 비교 이미지의 표지 배경 차이는 의도된 placeholder입니다.

## 5. pnpm generate 실행 결과

```text
pnpm generate content/sample-insight.json
Generated 8 validated PNGs (1080x1350) + contact-sheet.png
output/2026-09-16/information-and-judgment
Cover: development placeholder (no cover.image supplied)
```

기본 Playwright headless-shell 153.0.8010.12에서 성공했습니다. CLI 인터페이스와 날짜/slug 출력 구조는 그대로입니다.

## 6. 아직 남는 차이

- Noto Sans CJK 원본과 Pretendard의 glyph 모양·폭·안티앨리어싱은 다릅니다.
- 표지의 세 번째 줄 highlight 시작은 x=660 (원본 666), 끝은 x=812 (원본 821)입니다. 글자 폭 차이를 임의 horizontal padding으로 덮지 않았습니다.
- BODY highlight 높이는 최종 42px이며 원본은 구절에 따라 42~43px입니다. SUMMARY/Insight highlight 상하 범위는 일치합니다.
- 본문 글자 아래쪽 일부는 원본과 1px 정도 차이가 있으며 몇몇 구절 끝은 1~3px 다릅니다. semantic 문단/행 위치는 유지했습니다.
- Cover placeholder는 그대로이며 원본 분위기 배경은 만들지 않았습니다.

## 7. 테스트/검증

- `pnpm typecheck` 통과.
- `pnpm test`: 기존 7개 모두 통과, 실패 0 (17.6초).
- 8 PNG의 1080×1350, BODY 소제목 한 줄, highlight target, overflow/clipping, output 생성 검증 통과.
- 긴 제목/본문 실패, 9/10페이지 생성, 실패 시 이전 결과 보존 검사 유지 및 통과.
- `pnpm compare`: 원본 reference PNG 9개 SHA-256 일치 확인.
- 8페이지 모두 MAE 감소. before 파일은 렌더 전에 복사하여 이후 변경하지 않았습니다.

## 8. git status

기존 STEP 1이 commit되지 않아 저장소 파일은 모두 untracked로 표시됩니다. 이번에 새로 추가한 보고서를 포함하여 36개입니다. 이번 단계의 실제 소스 수정은 위 3개 파일뿐이며 output/.tmp/node_modules는 계속 Git 제외입니다.

staging/commit/push는 하지 않았습니다. 기능 확장 없이 사용자 검토를 기다립니다.
