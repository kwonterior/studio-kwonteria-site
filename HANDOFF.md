# 스튜디오 권테리어 홈페이지·관리자페이지 — 인수인계 문서 (2차)

작성일: 2026-08-11
작성 배경: 2026-08-10에 Cowork → Claude Code로 1차 인수인계된 뒤, Claude Code(로컬)에서 git/GitHub 연동을 완료하고 관리자페이지를 대폭 개편했습니다. 이 문서는 그 이후 컨텍스트가 리셋된 새 Claude Code 세션이 바로 이어서 작업할 수 있도록 다시 정리한 것입니다. **1차 인수인계 문서의 내용은 대부분 여전히 유효하지만, 4~9번 섹션(폴더구조/스키마/완료기능/TODO)은 이 문서로 대체됩니다.**

---

## 1. 프로젝트 개요 (변경 없음)

경상북도 경주 소재 인테리어 회사 "스튜디오 권테리어"(대표 1인 + 직원 1인, 향후 디자이너 채용 예정)의 홈페이지 + 내부 관리자페이지.

- 홈페이지 목적: 회사 신뢰도 > 지역(경주·포항) 검색 노출 > 채용
- 관리자페이지 목적: 대표가 혼자 처리하던 반복 업무(견적서/정산/발주/공정관리) 부담 경감. "완벽한 프로그램"이 아니라 "매일 실제로 쓰는 프로그램"이 목표. **작업팀(전기팀 등 외주 인력)에게 공정표를 캡처해서 공유하는 것도 실제 업무 방식 중 하나** — 이게 `admin/schedule-share.html`이 존재하는 이유입니다.

---

## 2. 배포/접속 정보

- 홈페이지: https://www.kwonterior.com (2026-08-11 커스텀 도메인 연결, vercel.app 주소도 계속 동작함)
- 관리자페이지 로그인: https://www.kwonterior.com/admin/login.html
- GitHub 저장소: https://github.com/kwonterior/studio-kwonteria-site (main, Public)
- Vercel: kwonterior1 팀 / studio-kwonteria-site (main push마다 자동 배포, 보통 1~2분 소요)
- Supabase: https://supabase.com/dashboard/project/qpyqhgczsigqiuxdujgq (Seoul 리전)
- 로컬 작업 폴더: `~/Desktop/studio-kwonteria-site` — **이제 정식 git 저장소입니다** (아래 3번 참고). GitHub `main`과 완전히 동기화되어 있습니다.

---

## 3. Git / 배포 워크플로 (★ 1차 문서와 달라진 핵심 부분)

- 로컬 폴더가 git 저장소로 초기화되어 있고 (`git remote -v` → `origin` = 위 GitHub 저장소), `git push origin main`이 바로 됩니다.
- **인증**: GitHub fine-grained PAT을 Windows Credential Manager(Git Credential Manager)에 저장해뒀습니다. `protocol=https, host=github.com, username=x-access-token`. 별도 로그인 없이 `git push`가 그냥 동작합니다. 토큰이 만료되거나(발급 시 유효기간 확인 필요) 권한 문제가 생기면, 대표님께 새 fine-grained PAT(해당 저장소 1개, Contents: Read and write)을 요청해서 아래로 재저장:
  ```
  printf 'protocol=https\nhost=github.com\nusername=x-access-token\npassword=<새토큰>\n\n' | git credential-manager store
  ```
- **작업 흐름**: 파일 수정 → `git add <파일>` → `git commit -m "..."` → `git push origin main` → Vercel 자동 배포 → 필요시 실제 페이지에서 확인(가능하면 claude-in-chrome으로 로그인된 세션에서 직접 클릭 테스트).
- 커밋은 항상 구체적 파일만 `git add` (절대 `-A`/`.` 금지 — 다른 사이드 프로젝트 파일 섞일 위험 없음도 확인했지만 습관적으로 지킬 것).
- **DB 스키마 변경(ALTER/CREATE TABLE 등)은 Claude Code가 직접 실행할 수 없습니다.** anon/publishable key로는 DDL이 불가능하고 DB 비밀번호/service_role 키도 없습니다. → 매번 SQL을 만들어서 대표님께 드리고, Supabase SQL Editor에서 대표님이 직접 실행해야 합니다. 실행 후에는 로그인된 브라우저 세션(claude-in-chrome, 이미 대표님 실제 크롬에 로그인되어 있음)에서 `sbClient` 콘솔 쿼리로 즉시 검증 가능합니다.

---

## 4. 폴더/파일 구조 (현재 기준)

```
studio-kwonteria-site/
├── index.html / about.html / projects.html / contact.html   (홈페이지, 변경 없음)
├── css/style.css, js/config.js, js/main.js
├── HANDOFF.md                       ← 이 문서
└── admin/
    ├── login.html
    ├── index.html                   대시보드
    ├── customers.html               고객·상담 관리 (등록/수정/삭제, 이름 클릭→site-detail.html)
    ├── site-detail.html             ★신규 — 현장 상세 페이지 (아래 6번 참고)
    ├── schedule.html                공정표 (대폭 개편, 아래 6번 참고)
    ├── schedule-share.html          ★신규 — 사이드바 없는 전체 폭 "공유용 보기" (작업팀 공유/인쇄용)
    ├── quotes.html                  견적서 관리 (변경 없음 — 삭제 버튼 아직 없음)
    ├── payments.html                정산·지급 관리 (변경 없음 — 삭제 버튼 아직 없음)
    ├── materials.html               자재발주 관리 (변경 없음 — 삭제 버튼 아직 없음)
    ├── portfolio.html               포트폴리오 관리 (변경 없음)
    ├── css/admin.css                공통 스타일 (이번 세션에서 많이 추가됨 — sched-table, qa-chip, sitepanel, tabbar, listrow 등)
    └── js/admin-common.js           변경 없음 (requireAuth, 사이드바, fmtDate/fmtMoney)
```

---

## 5. Supabase 스키마 — 이번 세션에서 추가/변경된 것

1차 문서의 `profiles/customers/quotes/payments/material_orders/projects/schedule_items` 테이블은 그대로 있고, 다음이 **추가**되었습니다 (전부 실행 완료, 대표님이 SQL Editor에서 직접 실행함):

```sql
-- customers에 비고 칸 추가 (현장 상세 페이지의 "비고" textarea가 여기 저장됨)
alter table customers add column remark text;

-- customers 삭제 허용 (전에는 delete policy가 없어서 삭제 버튼이 막혀 있었음)
create policy "customers_delete_authenticated" on customers
  for delete using (auth.uid() is not null);

-- 스케줄 항목에 확정/미확정 여부
alter table schedule_items add column confirmed boolean default false;

-- 공정표 "빠른 추가" 카테고리 (36개, 순서/색상 포함, 대표님이 직접 이름 수정·삭제·드래그 순서변경 가능)
create table schedule_categories (
  id bigint generated always as identity primary key,
  name text not null,
  color text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);
-- RLS: 로그인 사용자 전체 권한 (select/insert/update/delete 4개 정책)

-- 현장 상세 페이지의 체크리스트 / 현장보고 / 마감디테일 / 도면(파일)
create table site_checklists (id, customer_id→customers, content, done, sort_order, created_by, created_at);
create table site_reports    (id, customer_id→customers, report_date, content, created_by, created_at);
create table finish_details  (id, customer_id→customers, category, content, sort_order, created_by, created_at);
create table site_files      (id, customer_id→customers, file_url, file_path, label, sort_order, created_by, created_at);
-- 위 4개 모두: RLS "for all using (auth.uid() is not null) with check (auth.uid() is not null)" 정책 1개씩
-- site_files는 기존 "portfolio" Storage 버킷을 재사용 (경로 접두사 sitefiles/{customer_id}/... 로만 구분, 새 버킷 안 만듦)
```

**주의**: `customers.address` 컬럼은 DB에 여전히 존재하지만, 폼에서 없앴습니다(주소는 이제 `memo`에 자유롭게 적도록 통일). 기존 레코드의 `address` 값은 남아있을 수 있으나 UI 어디에도 표시되지 않습니다. 필요시 컬럼 자체를 나중에 정리해도 됩니다(지금은 그냥 방치).

RLS 정책 요약(1차 문서 표에 추가):

| 테이블 | 비고 |
|---|---|
| customers | 이제 delete 가능 (로그인 사용자) |
| schedule_categories | 로그인 사용자 전체 권한 |
| site_checklists / site_reports / finish_details / site_files | 로그인 사용자 전체 권한, customer_id로 연결 |

---

## 6. 공정표 관련 화면 — 이번 세션 핵심 작업 (매우 중요, 꼭 읽어주세요)

### 6.1 실제 엑셀 데이터 이관
대표님이 실제로 쓰던 엑셀 공정표(`공정표(26년).xlsx`, 바탕화면)에서 2026년 8~11월 데이터를 파싱해서 `schedule_items`에 229건, 신규 현장 9개를 `customers`에 등록했습니다 (상태는 실제 진행 상황에 맞게 계약/공사중/준공으로 구분). 향후 비슷한 대량 이관이 필요하면 PowerShell + Excel COM으로 직접 엑셀을 읽는 방식을 썼습니다(파이썬이 이 컴퓨터에 제대로 설치되어 있지 않음 — Windows Store 스텁만 있음).

### 6.2 `admin/schedule.html` (공정표) 현재 동작
- **첫 화면 = 달력만 보임.** "일정 등록" 폼과 "빠른 추가" 팔레트는 `#entry-panel`에 들어있고 기본 `display:none`입니다. 날짜의 "+ 추가"를 누르거나 기존 일정을 클릭해야 `openEntryPanel()`이 패널을 열어줍니다. "취소"를 누르면 다시 닫힙니다. **이 패턴을 절대 되돌리지 마세요** — 초기 버전은 폼이 항상 위에 떠 있어서 "지저분하다"는 피드백을 받고 고친 것입니다.
- **"현장 보기" 필터 칩**: 특정 현장을 클릭하면 그 현장만 강조된 월별 달력(day-grid, `renderDayGrid`)이 나오고, 진행률(%)·비고(remark)가 위에 표시됩니다.
- **"전체 보기"(현장 필터 없음)**: `renderSiteTable()`이 렌더링하며, **반드시 "세로형" — 날짜가 행(위→아래), 현장이 열(좌→우)** 입니다. 가로형(현장이 행, 날짜가 열)은 여러 번 시도했다가 "가로 스크롤 생겨서 안 좋다"는 이유로 명시적으로 폐기됐습니다. **다시 가로형이나, 주 단위로 쪼개서 세로로 쌓는 방식, 점/막대/이니셜 배지로 압축하는 방식으로 되돌리지 마세요** — 전부 시도했다가 반려됐습니다. 이유: 대표님이 이 화면을 캡처해서 외주 작업팀(전기팀 등, 관리자페이지 접근 권한 없음)에게 그대로 보내기 때문에 "글자로 현장+작업내용이 확실히 보이는 것"이 최우선입니다.
- 현장 색상: `SITE_COLORS` 12색 배열(Tableau 계열) + `colorFor(id) = SITE_COLORS[id % 12]`. `schedule.html`, `schedule-share.html`, (site-detail은 단일 현장이라 색 구분 불필요) 전부 이 방식으로 통일.
- 2026년 공휴일(대체공휴일 포함)이 `HOLIDAYS_2026` Set에 하드코딩되어 있음 — 연도 넘어가면 갱신 필요.
- "빠른 추가" 카테고리 팔레트: 클릭하면 (날짜가 이미 선택된 상태면) 즉시 등록. "카테고리 편집" 버튼을 누르면 이름 클릭으로 수정(prompt), ×로 삭제, 드래그로 순서 변경, 하단 입력창으로 새 카테고리 추가 가능.
- 상단에 "공유용 보기 ↗" 버튼 → `schedule-share.html`을 새 탭으로 엶.

### 6.3 `admin/schedule-share.html` (신규, 사이드바 없음)
- 목적: 작업팀에게 캡처해서 보내기 위한 화면. **세로형(날짜=행, 현장=열) 표 하나만 있습니다** (가로형 토글 버튼은 삭제됨 — "전체 공정표"라는 고정 라벨만 남음).
- 한 주씩 옅은 줄무늬(week banding)로 구분되어 있어서 원래 엑셀 느낌과 비슷합니다.
- 확정(●) 표시는 여기서는 제거됨 (관리용 `schedule.html`에는 남아있음 — 이건 의도적 차이).
- "인쇄/PDF" 버튼 (`window.print()`) — `@page{size:landscape;}` 등 인쇄용 CSS 적용됨. **2026-08-11 세션에서 실제로 확인함: 현장이 많은 달(열이 6개 이상)에는 표 전체 폭(2100px+)이 A4 가로 인쇄 가능 폭(~1047px)을 넘어서서 오른쪽(특이사항 등)이 잘려서 안 보이는 버그가 있었음.** `beforeprint`/`afterprint` 이벤트에서 표 폭을 측정해 페이지 폭에 맞게 `transform:scale()`로 자동 축소하는 코드를 추가해 수정·배포 완료(현장 개수와 무관하게 항상 한 페이지에 다 들어감). 실제 브라우저 인쇄 대화상자 자체는 자동화 도구로 열어볼 수 없어서 로직 검증(스크립트로 `beforeprint` 이벤트 발생시켜 배포된 사이트에서 확인)까지만 했음 — 대표님이 실제로 인쇄/PDF 저장 버튼을 한 번 눌러서 최종 확인하면 좋음.
- `requireAuth()`는 그대로 쓰지만 `#sidebar` 엘리먼트가 없어서 `renderSidebar()`가 조용히 no-op 됩니다 (의도된 동작, `admin-common.js`가 이미 그렇게 방어적으로 짜여 있음).

### 6.4 `admin/site-detail.html` (신규)
- `customers.html` 목록에서 고객 이름을 클릭하면 `site-detail.html?id={id}`로 이동.
- 상단: 이름/상태뱃지/연락처·지역·평수·예산·유입경로(빈 값은 숨김)/메모(줄바꿈 유지, `white-space:pre-wrap`)/견적 요약/"정보 수정"(customers.html로 링크).
- 탭 5개: **진행 일정**(그 현장 전용 달력, 이름 라벨 생략, 진행률%+비고, 등록폼도 마찬가지로 클릭해야 나타남) / **체크리스트** / **현장 보고**(날짜+내용) / **마감 디테일**(항목+내용) / **도면**(사진·파일 업로드, portfolio 버킷 재사용).

---

## 7. `admin/customers.html` 변경 사항
- 이름이 `site-detail.html` 링크로 바뀜.
- **주소 입력칸 삭제** — 이제 메모에 주소/공동현관 비번/세대 비번을 줄바꿔서 적도록 안내(placeholder 있음, textarea 6행으로 확대).
- **평수를 자유입력 → 드롭다운**(20평대/30평대/40평대/50평대/60평대/기타)으로 변경. 기존 데이터 중 "32평" 등 형식이 다른 값은 드롭다운과 안 맞아서 대표님이 다시 골라야 할 수 있음.
- **삭제 버튼 추가** (되돌릴 수 없고, 연결된 견적서/정산/자재발주/공정표까지 cascade 삭제됨을 confirm 문구에 명시).
- ⚠️ 과거 버그 메모: 삭제 버튼의 `onclick` 속성을 큰따옴표로 감싸고 안에서 `JSON.stringify()`를 쓰면 따옴표가 충돌해서 버튼이 조용히 깨집니다(클릭해도 아무 반응 없음). `editRow`처럼 **onclick은 항상 홑따옴표로 감쌀 것**.

---

## 8. 남은 작업 / TODO

**다음 세션 최우선:**

A. ~~홈페이지 글씨체~~ — **2026-08-18에 완료.** 전체 리디자인 과정에서 Pretendard 웹폰트 적용됨 (아래 12번 참고).
B. ~~회사 로고 및 글씨체 수정~~ — **2026-08-18에 완료.** 대표님이 실제 로고 이미지(로고+글자 버전, 마크만 있는 버전) 전달, 배경 제거해서 `assets/logo.png`/`assets/logo-mark.png`로 등록. 현재 헤더에는 마크만(`logo-mark.png`) 사용 중.
C. **시공 사례를 공간별로 나누기** — 아직 미착수. "공간별"이 거실/주방/욕실처럼 더 세분화된 분류를 말하는 건지 다음 세션에 먼저 확인. 아래 E(실제 시공 사례 등록)와 묶어서 진행하면 좋음.
D. ~~디오브(diov.kr) 스타일 프로젝트 상세페이지~~ — **2026-08-18에 완료** (아래 14.3 참고). PROJECTS 카드 클릭 → `project-detail.html?id=N`, 사진 갤러리 + Type/Location/Floor Area/Director/Design 정보 패널. DB에 필드 추가 완료(대표님이 SQL 실행 완료).
E. **실제 시공 사례 등록** — "시험용" 테스트 항목 1개뿐, 여전히 미완. 대표님이 히어로용으로 준 사진 11장을 포트폴리오(위치/평수/담당자/디자인 포함)로도 등록할지 다시 물어볼 것 — 이미 여러 번 물어봤지만 아직 답 없음.

**이전부터 남아있던 항목:**

1. ~~구글 서치 콘솔 등록~~ — **2026-08-11(다음 세션)에 완료.** URL 접두어(`https://www.kwonterior.com/`) 속성으로 등록, HTML 태그 방식 소유확인(`google-site-verification` 메타태그를 index.html에 추가, naver 태그 바로 아래) → 배포 확인 후 소유권 확인 완료. `sitemap.xml` 제출 완료. 홈/about/projects/contact 4페이지 전부 URL 검사 → 색인 생성 요청 완료.
2. ~~구글 비즈니스 프로필 등록~~ — **2026-08-11(다음 세션)에 완료.** rokosung1077@gmail.com 계정에 옛 사무실 주소(양정로228번길 17-11)로 미인증 등록되어 있던 항목을 이어받아 진행함(신규 생성 아님). Claude Code가 비즈니스 설명/웹사이트(`https://www.kwonterior.com`)/서비스 4종(인테리어 디자이너·거실 디자인·공간 플래닝·목공 디자인)을 등록한 뒤, **대표님이 직접** (1) 소유권 인증 동영상을 촬영·제출하고 (2) 주소를 새 주소(용황로8길 18, 우편번호 38069)로 업데이트하고 지도 핀을 실제 건물 위치로 조정해서 저장 완료함. business.google.com/locations에서 "용황로 8길 18 · 처리 중" 상태로 확인됨(Google 인증 검토는 최대 5일 소요, 승인되면 검색/지도에 실제 노출). 영업시간·매장사진은 아직 비어있음(선택사항, 나중에 추가 가능). ₩600,000 Google Ads 크레딧과 Google Workspace 이메일 제안은 실제 비용/계정 생성이 걸려있어 건너뜀.
3. **견적서/정산/자재발주 삭제 버튼** — 아직 없음. 2026-08-11에 재차 "나중에"로 보류 확인(먼저 제안하지 말 것). 요청 시 `customers.html` 패턴(홑따옴표 onclick + cascade 경고 문구) 그대로 적용.
4. **시공 사진 등록** — 홈페이지 PROJECTS(포트폴리오)는 여전히 비어있음(테스트용 항목 1개만 있음). 관리자 포트폴리오 화면에서 실제 시공 사진 등록 필요. (위 C번 "공간별로 나누기"와 함께 진행하면 좋음)
5. **2순위**: 현장 진행사진 앨범(공사 중 사진, `site-detail.html`의 "도면" 탭과는 별개로 진행 단계별 사진첩 개념이면 새로 설계 필요), A/S 관리.
6. **3순위**: 매출/손익 통계, 자동 알림, 직원 3명 이상 시 역할 추가.
7. **홈페이지 채용 섹션** — 디자이너 채용 시점에 CONTACT 페이지에 추가 예정, 미착수.
8. `customers.address` 컬럼 정리(선택) — 안 쓰지만 남아있음.
9. **네이버 파워링크(검색광고) 검토 중** — 2026-08-12에 대표님이 문의함. "경주인테리어"보다 "포항인테리어" 검색 관심도가 데이터랩 기준 3배 이상 높음(경쟁·입찰가도 더 셀 가능성). searchad.naver.com은 Claude Code 브라우저에서 접속 차단되어 있어 직접 확인 불가 — 대표님이 사업자등록증으로 광고주 가입 후 "키워드 도구"에서 직접 조회해야 함. 계정 만들고 캡처 공유하면 예산 전략 같이 검토 가능.
10. **유튜브 영상 추가 등록** — 2026-08-17에 기능은 완성됨(관리자페이지 "유튜브 영상" 메뉴). 대표님이 테스트로 3개("연습1~3") 등록해봄, 정식 영상으로 계속 채워나가면 됨.

---

## 9. 회사 정보 (변경 없음, 1차 문서와 동일)

- 상호명: 스튜디오 권테리어 / 사업자등록번호: 601-15-92480 / 주소: 경상북도 경주시 용황로8길 18
- 활동 지역: 경주·포항 / 주요 고객: 아파트·주택 / 평균 공사금액 5천~6천만원, 월 평균 3건
- 조직: 대표(권오성, 전체 총괄) + 직원 1명(기성수, 현장관리·시공) — 1년 내 디자이너 채용 예정
- 유입 경로: 블로그, 인스타그램, 지인소개
- 가장 불편했던 업무: 견적서 작성, 정산 시점 기억 못 함, 자재발주 기록 누락 → 이게 관리자페이지 설계 근거.
- **실무 습관**: 대표님이 공정표를 캡처해서 전기팀 등 외주 작업자에게 직접 전달하고, 그들이 보고 스스로 일정 조정해서 현장에 들어옴. 관리자페이지 접근권한이 없는 외주 인력이 있다는 전제를 항상 고려할 것.

---

## 10. 2026-08-11 저녁 세션 — 홈페이지 검색노출(SEO) 작업 + 버그 수정 요약

- **커스텀 도메인 구매·연결 완료**: `kwonterior.com` (Vercel에서 직접 구매, apex→www 308 리다이렉트, 실제 서빙은 `https://www.kwonterior.com`). robots.txt/sitemap.xml/canonical/OG태그/JSON-LD 전부 새 도메인 기준으로 갱신·배포함. 기존 `studio-kwonteria-site.vercel.app`도 계속 살아있음.
- **SEO 기초 작업**: `robots.txt`, `sitemap.xml`, `favicon.svg`, 4개 공개 페이지에 canonical/OG/Twitter카드/`HomeAndConstructionBusiness` JSON-LD(NAP 정보) 추가 완료.
- **네이버 서치어드바이저**: 소유확인(HTML 태그 방식, index.html에 `naver-site-verification` 메타태그 삽입) 완료 → sitemap 제출 완료 → 홈/about/projects/contact 4페이지 전부 수집 요청 완료. **네이버 쪽은 이걸로 끝.**
- **네이버 스마트플레이스**: 이미 등록되어 있었음(사업자등록증 보유). 홈페이지 링크는 스마트플레이스 UI에 일반 "홈페이지" 카테고리가 없어서(카페/예약/밴드/페이스북/유튜브/스마트스토어만 있음) 추가 보류함 — 억지로 잘못된 카테고리에 넣지 않기로 함.
- **구글 서치 콘솔**: 다음 세션에서 이어서 진행 (8번 TODO 1번 참고).
- **버그 수정 3건** (모두 배포 완료):
  1. 공정표(`schedule.html`) 현장 필터 선택 후 "+ 추가"를 눌러도 현장이 자동 선택 안 되던 문제 → `setForm()`에서 `selectedCustomerId` 기본값으로 채우도록 수정.
  2. `customers.html`/`portfolio.html` 목록의 수정·삭제 버튼이 `<td style="display:flex">`라서 세로 중앙정렬이 깨져 다른 열보다 위로 붙어 보이던 문제 → 버튼을 `<td><div style="display:flex">`로 감싸서 해결.
  3. `portfolio.html`/`projects.html`/`index.html`에서 Storage에 파일이 없는(404) 사진이 깨진 이미지 아이콘으로 보이던 문제 → `imgFallback()` onerror 핸들러로 "사진 없음"/"사진 준비중" 플레이스홀더 표시하도록 수정.
- **공정표 개선**: `준공` 상태 현장은 `schedule.html`의 "현장 보기" 필터 목록에서 자동으로 빠지도록 수정.
- **권한(RLS)**: `schedule_items` insert/update/delete를 대표(owner)만 가능하도록 DB 정책 변경 완료(대표님이 SQL Editor에서 직접 실행함, [[project-studio-kwonteria]] 참고). 직원 계정은 조회만 가능. 관리자페이지 UI(`schedule.html`, `site-detail.html`)도 직원 계정에는 편집 버튼/링크가 아예 안 보이도록 같이 수정함.
- **schedule-share.html**: "인쇄/PDF" 버튼 자체를 완전히 제거함(대표님 판단: "의미가 없다"). 관련 print CSS와 beforeprint/afterprint JS도 같이 삭제. **1차 문서에 있던 "인쇄 결과물 확인" TODO는 이제 무효.**
- **로컬 Claude Code 권한 설정**: `~/Desktop/.claude/settings.local.json`(스튜디오 권테리어 프로젝트가 아니라 세션 루트인 Desktop 기준)에 git/파일도구/브라우저자동화 도구 allow 목록 추가함 — 매번 승인 프롬프트 뜨는 문제 해결.

---

## 10. 주의사항 (1차 문서 + 추가)

- 비밀번호/service_role 키/DB 비밀번호/GitHub PAT 원문은 이 문서에도, 대화 로그 검색으로도 남기지 않았습니다. 필요하면 대표님께 요청.
- `payments` 테이블은 직원 접근 RLS로 완전 차단 — 유지할 것.
- 모든 새 테이블은 RLS enabled 상태로 만들었음(확인됨).
- **GitHub PAT은 Windows Credential Manager에 저장되어 있어 `git push`가 바로 동작합니다** — 3번 섹션 참고.

---

## 11. 2026-08-12 세션 요약 (구글 서치콘솔/비즈니스프로필 마무리 + 팝업 + 광고 문의)

- **구글 서치 콘솔**: 완료 (8번 TODO 1번 참고).
- **구글 비즈니스 프로필**: 완료 (8번 TODO 2번 참고). 대표님이 인증 동영상 제출 + 주소 핀 조정까지 직접 완료함.
- **"새단장 중" 안내 팝업 추가·배포 완료**: `js/main.js`의 `showRenewalNotice()` 함수 + `css/style.css`의 `.rn-*` 클래스. 공개 페이지(홈/about/projects/contact — `main.js`를 쓰는 모든 페이지) 방문 시 세션당 1회(`sessionStorage.renewalNoticeShown`) 모달 팝업 표시. 문구: "더 나은 모습으로 새단장하고 있습니다" (대표님이 "준비중"보다 있어 보이는 문구로 요청). 닫기(X)/확인 버튼/배경 클릭으로 닫힘. **주의**: 검색엔진 노출을 위해 방금 SEO 작업을 마친 상황에서 대표님이 "상관없다"고 명시적으로 확인한 후 진행한 것 — 이탈률 관련 트레이드오프를 미리 설명드렸음.
- **네이버 파워링크 광고 문의**: 대표님이 "얼마냐"고 물어봄. CPC(클릭당 과금) 구조, 최저 70원, 하루예산 상한 직접 설정 가능이라고 설명. 데이터랩으로 "경주인테리어" vs "포항인테리어" 검색 관심도 비교함(포항이 3배 이상 높음). **searchad.naver.com은 Claude Code 브라우저 정책상 접속 차단됨**(naver.com 전체가 안전 정책으로 막혀있음, google.com 계열은 됨) — 정확한 예상 입찰가는 대표님이 직접 광고주 가입 후 조회해야 함. 8번 TODO 9번 참고.
- **브라우저 자동화 관련 알아둘 점**: `business.google.com`의 "프로필 수정 → 위치" 편집 다이얼로그는 마우스 휠 스크롤이 잘 안 먹고, 스크롤바 위치도 매번 리셋됨 — Tab 키 연타로 포커스 이동시키며 스크린샷으로 확인하는 방식이 그나마 안정적이었음. 주소 텍스트를 입력해도 Google이 지오코딩 못 하면(신생 도로명 등) "저장" 눌러도 실제로는 저장 안 되고 조용히 무시됨 — 반드시 새로고침 후 재확인 필요.

---

## 12. 2026-08-17 세션 요약 (공정표 노출 버그 수정 + 홈페이지 리디자인 + 유튜브 기능 추가)

- **공정표 계약 전 고객 노출 버그 수정**: 홈페이지 문의 폼(`js/main.js`)으로 들어온 고객이 `customers` 테이블에 상태 "문의"로 등록되자마자 `admin/schedule.html`의 "현장 보기" 필터 칩과 "전체 보기" 표에 즉시 나타나던 문제. 대표님이 "계약을 해야 공정표에 올라오게 해달라"고 요청. `admin/schedule.html`·`admin/schedule-share.html`에 `PRE_CONTRACT_STATUSES = ["문의","상담중","견적중"]` 상수를 추가해서 이 상태인 동안은 필터 칩/표 양쪽 모두에서 제외되도록 수정. 상태가 계약/공사중/준공/AS로 바뀌면 그때부터 노출됨. (커밋 `69fb2fd`)
- **홈페이지 메인 리디자인** — 대표님이 [apartmentary.com](https://apartmentary.com) 레퍼런스를 주고 "비슷하게 하고 싶다"고 요청:
  - 히어로를 텍스트 중심 → **풀블리드 이미지형**으로 전환(`css/style.css`의 `.hero-full`/`.hero-media`/`.hero-scrim`). 실제 시공 사진이 아직 없어서 지금은 그라데이션 배경 + "대표 시공 사진 준비중" 배지가 자리를 잡고 있음. 나중에 사진 생기면 `index.html`의 `.hero-media` 안 내용만 `<img>`로 교체하면 됨.
  - **섹션 순서를 히어로 → 시공 사례 → 철학 3가지 → 신뢰지표 → CTA → 푸터로 재배치**(기존엔 철학이 시공사례보다 먼저였음). 말보다 실제 작업물을 먼저 보여주는 구조.
  - 시공 사례 카드에 호버 확대 효과 + 소개 글(description) 노출 추가.
  - **플로팅 상담 버튼**(전화/카카오톡) 추가 — `js/main.js`의 `renderFloatingCta()`, 모든 공개 페이지(홈/about/projects/contact) 공통. `.hero-full`이 있는 페이지(홈)에서는 히어로를 스크롤로 벗어나야 나타나고(IntersectionObserver), 없는 페이지에서는 바로 보임. (커밋 `c00c81d`)
- **유튜브 영상 기능 신규 추가** — 대표님이 [homefaber.com](https://homefaber.com) 레퍼런스를 주고 "시공 사례 밑에 내 유튜브 영상 업데이트할 수 있게 해달라"고 요청:
  - 새 DB 테이블 `youtube_videos`(id, title, youtube_url, sort_order, created_by, created_at) + RLS(공개 select + 로그인 사용자 전체 관리 권한). 대표님이 SQL Editor에서 직접 실행 완료.
  - 새 관리자페이지 `admin/youtube.html` (사이드바 메뉴에도 추가): 유튜브 링크(watch?v=, youtu.be/, shorts/ 형식 다 지원)와 정렬 순서만 입력하면 등록. 썸네일은 `https://img.youtube.com/vi/{videoId}/hqdefault.jpg`로 자동 표시, 별도 업로드 없음.
  - **제목 입력란은 만들었다가 바로 뺐음** — 대표님 피드백: "썸네일에 이미 제목이 노출되니까 입력란 필요없다". 지금은 링크만 넣으면 되고, DB의 `title` 컬럼에는 화면에 보이지 않는 내부 식별용으로 유튜브 영상 ID를 자동 저장함(관리자 목록 화면에서 구분용). **비슷하게 "이미지/썸네일 자체에 텍스트가 있는 콘텐츠"를 다룰 땐 별도 제목 입력을 먼저 만들지 말고 필요한지부터 확인할 것.**
  - 홈페이지 "시공 사례" 섹션 바로 아래에 그리드로 노출(`#video-section`), **영상이 하나도 없으면 섹션 자체가 자동으로 숨겨짐** (빈 섹션 노출 방지). (커밋 `1d677a6`, `236d993`)
  - 실제로 SQL 실행 → 테스트 영상 등록 → 홈페이지 노출 확인 → 삭제까지 전 과정을 대표님과 함께 검증 완료. 대표님이 이후 실제 영상 3개("연습1~3")를 직접 등록해봄.
- **다음 세션 최우선 순위** (대표님이 오늘 마지막에 지정, 8번 TODO 상단 A/B/C 참고): (A) 홈페이지 글씨체, (B) 회사 로고 및 글씨체 수정, (C) 시공 사례를 공간별로 나누기. 시작 전에 방향성(원하는 느낌, 로고 유무, "공간별"의 정확한 의미)부터 확인할 것.

---

## 13. 2026-08-18 세션 요약 (디오브 스타일 전면 리디자인 — 매우 중요, 꼭 읽어주세요)

대표님이 [diov.kr](https://diov.kr) 레퍼런스를 주고 "이렇게 거의 똑같이 만들고 싶어"라고 요청해서, 어제 만든 아파트멘터리 스타일 홈페이지를 다시 갈아엎었습니다. **오늘 세션이 사실상 홈페이지 디자인의 최종 기준**이니 다음에 홈페이지를 만질 땐 어제(8/17)의 아파트멘터리 스타일 기록보다 이 섹션을 우선할 것.

### 13.1 로고 실제 파일 적용
- 대표님이 로고 이미지(로고+글자 버전 "스튜디오 권테리어 INTERIOR", 마크만 있는 K자 버전)를 채팅에 직접 붙여넣음 → Claude Code가 파일로 못 가져와서 **프로젝트 루트 폴더에 저장해달라고 요청**하는 방식으로 받음(이후 사진 업로드도 전부 이 방식 재사용, 채팅 붙여넣기 이미지는 Claude Code가 파일로 접근 불가).
- PowerShell + `System.Drawing`(.NET, Python/ImageMagick 없이도 이 컴퓨터에서 바로 됨)으로 배경 제거(색상 키 방식 alpha 처리) + 타이트 크롭 → `assets/logo.png`(로고+글자), `assets/logo-mark.png`(마크만) 생성. 원본은 `assets/logo-source-lockup.jpg`, `assets/logo-source-mark.jpg`로 보관.
- **주의**: 처음 크롭할 때 저해상도 썸네일로 bbox를 근사해서 만들었더니 사진 위에 얹었을 때 아주 옅은 사각형 테두리(halo)가 보이는 버그가 있었음 → **원본 전체 해상도에서 직접 bbox를 스캔하고, alpha 경계를 더 가파르게(threshold 폭을 좁게)** 잡아서 재작업해야 깨끗해짐. 앞으로 투명 배경 로고/아이콘 만들 때 이 방식(전체 해상도 스캔 + 좁은 alpha 경계) 바로 쓸 것.
- 헤더에는 로고+글자 버전이 아니라 **마크만(`logo-mark.png`) 사용** — 대표님이 "로고만 노출하게 해줘"로 명시 요청.

### 13.2 전체 디자인 시스템 교체 (`css/style.css` 전면 재작성)
- 색상: 따뜻한 그레이지 배경(`--bg:#e8e3d6`) 하나로 통일, 카드 배경/그림자/둥근모서리 다 제거, 헤어라인(`--line`) 구분선 위주.
- 폰트: **Pretendard 웹폰트**를 jsdelivr CDN으로 4개 공개 페이지 `<head>`에 추가(`https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css`). 어제 TODO였던 "홈페이지 글씨체"가 이걸로 해결됨.
- 버튼 색: 테라코타(`--accent`) → 거의 검정(`--ink`)으로 톤다운, 브랜드 컬러는 로고에만 남김.
- 헤더/메뉴 패턴: 상시 노출 nav 대신 **우측 상단 `+` 아이콘 하나로 통일**(클릭하면 ×로 회전, `.nav-mobile`이 우측 정렬로 펼쳐짐). 데스크톱/모바일 구분 없이 전 브레이크포인트에서 동일 패턴. **HOME 메뉴 항목은 나중에 삭제함**(로고 클릭으로 충분, 대표님 요청) — 최종 메뉴는 ABOUT/PROJECTS/CONTACT 3개뿐.
- PROJECTS 페이지: 상단에 `+ 전체/아파트/주택/기타` 필터 탭 추가(클라이언트 사이드 필터링, `category` 필드 기준). 카드는 평소엔 사진만, 호버해야 제목+구분이 사진 위에 오버레이로 뜸(`.project-card-overlay`).
- ABOUT 페이지: 큰 제목 한 줄 + 짧은 문단들로 재구성, "대표 소개 사진 준비중" placeholder는 디오브처럼 사진 없는 텍스트형이라 뺐음.
- CONTACT 페이지: 입력폼을 박스형 → 표 형태(라벨-값, 밑줄 없는 인풋)로 변경.

### 13.3 홈페이지 히어로 — 여러 차례 시행착오 끝에 확정된 구조 (재현 시 참고)
최종 구조는 **완전히 디오브와 동일**: `<header class="site-header site-header--overlay">`가 히어로 위에 **position:absolute로 얹혀있고**(배경 없는 헤더바), 그 아래 `<section class="hero-split hero-split--full">`가 화면 전체(100vh)를 좌우 반반으로 채움.

- **왼쪽 (`.hero-media-col`)**: 사진 **캐러셀**(정적 이미지 아님). 대표님이 처음엔 사진 1장만 요청했다가, 총 11장을 순차적으로 올려주셔서 최종적으로 `assets/hero-1.jpg` ~ `hero-11.jpg` 11장이 전부 돌아감(크로스페이드, 좌우 화살표, 하단 점 인디케이터, 6초 자동전환). `index.html`의 `#hero-carousel` 스크립트가 `.hero-slide` 개수를 그대로 세서 동작하므로, **사진을 더 추가할 땐 `hero-12.jpg`부터 이어서 만들고 `<img class="hero-slide">` 태그와 `<span class="hero-dot">` 하나씩만 추가하면 됨**(JS 수정 불필요).
  - 원본 사진들이 카메라 원본 그대로라 최대 15MB짜리도 있었음 → PowerShell + System.Drawing으로 전부 **2400px 이하, JPEG quality 82로 압축**(대부분 300KB 안팎). 앞으로 사진 추가할 때도 이 처리 먼저 할 것.
- **오른쪽 (`.hero-panel`)**: 처음엔 헤드라인 문구를 넣었는데(트래픽/SEO 고려해서 Claude Code가 임의로 추가한 것), 대표님이 "디오브처럼 심플하게, 하단에 매장정보만"이라고 명시적으로 고쳐달라고 함 → **최종적으로 텍스트 카피 전부 제거**하고: 상단에 유튜브 영상 그리드(최대 4개, `#home-video-grid`, `youtube_videos` 테이블에서 가져옴, 패널 너비 꽉 채움), 하단에 **영문 회사정보**(`STUDIO KWONTERIOR` / 로마자 주소 / `E 이메일 P 전화` / `Biz. Reg. No. 사업자번호`) — 디오브 푸터 형식 그대로 따라함. `js/config.js`에 `nameEn`/`addressEn`/`phoneIntl`/`email` 필드 추가함(이메일은 대표님이 rdosung@naver.com으로 지정).
- **홈페이지의 시공사례/철학/신뢰지표/CTA/푸터 섹션은 전부 삭제됨** — 대표님이 "이런거 전부 필요없다니까, 디오브 홈페이지처럼 이미지+유튜브+회사정보만"이라고 명시적으로 요청. 그 콘텐츠 자체가 없어진 건 아니고 시공사례→projects.html, 철학→about.html에 각각 남아있음. **홈페이지는 이제 스크롤 없는(또는 영상 4개일 때 아주 살짝만 스크롤되는) 단일 화면**임 — 이 구조를 절대 "SEO에 안 좋다"는 이유 등으로 되돌리지 말 것, 이미 두 번 되돌렸다가 재차 요청받음.

### 13.4 자잘한 버그 수정 기록 (재발 방지용)
- **히어로가 화면에 꽉 안 차던 버그**: `.hero-split`이 `<section>` 태그라서 전역 `section{padding:80px 0;}` 규칙을 그대로 물려받고 있었음(상하 80px 여백 생김). `.hero-split{padding:0;}`로 명시적 리셋해야 했음. **앞으로 어떤 섹션이든 "화면 꽉 채우기" 요구가 있으면 전역 section padding부터 의심할 것.**
- **로고 테두리 버그**: 13.1 참고 — drop-shadow 필터도 원인이었다가(제거함), PNG 자체의 옅은 anti-alias 경계도 원인이었음(재크롭으로 해결).
- 오버레이 헤더의 `+`/메뉴는 사진 위에 얹히므로 **가독성용 상단 스크림(어두운 그라데이션 150px)**을 얹었고, `.nav-mobile` 텍스트에도 `text-shadow` 추가함(배경 없이 투명해야 한다는 요청 때문에 — 디오브도 메뉴 펼쳤을 때 배경 없이 사진이 그대로 비쳐 보임).

### 13.5 이미지 처리 관련 도구 메모
이 컴퓨터엔 Python도 ImageMagick도 없음(HANDOFF 다른 곳에도 기록됨). **PowerShell + `Add-Type -AssemblyName System.Drawing`(.NET GDI+)로 크롭/리사이즈/압축/투명배경 처리가 전부 가능**하다는 걸 이번 세션에서 확인함 — 앞으로 이미지 관련 요청(리사이즈, 배경 제거, 크롭)엔 이 방법을 기본으로 쓸 것. `assets/` 폴더에 임시 처리 스크립트(`process-logo.ps1` 등)를 만들었다가 작업 끝나면 지우는 패턴 사용함.

---

## 14. 2026-08-18 세션 후반부 (13번에 이어서 — 프로젝트 상세페이지, About 여러 차례 수정, 헤더/푸터 통일, 모바일 버그)

같은 날 세션이 매우 길게 이어져서 13번 이후 내용을 여기 정리합니다. **이 섹션이 현재 사이트의 최종 상태**이니 13번과 충돌하면 이 섹션을 따를 것.

### 14.1 히어로 사진이 화면 꽉 안 차던 버그 (13번에서 100vh로 고쳤다고 했지만 실은 미완)
- 오늘 아침 대표님이 "홈페이지도 사진이 잘려보여"라고 지적 → 확인해보니 좌우 반반 분할(50/50) + `min-height:100vh` 조합에서 이미지 칸의 실제 박스 비율이 거의 정사각형(0.98)이 되어, 가로로 넓은 사진(우리 사진 11장 중 8장)이 양옆으로 크게 잘리고 있었음.
- **해결**: `.hero-media-col`을 `flex:1 1 50%` → `flex:1 1 56%`로, `.hero-panel`을 `44%`로 넓힘(사진 위주 컷). `.hero-split--full`은 실험적으로 `92vh`로 줄였다가 화면 맨 아래에 빈 띠가 생기는 부작용 발견 → **다시 `100vh`로 원복**(높이를 줄이는 건 비율 개선에 거의 도움이 안 되고 빈 여백만 만듦, 비율은 가로세로 "폭" 조정으로 풀 것).
- **교훈**: 사진이 잘린다고 컨테이너 세로 높이를 줄이는 건 답이 아님 — 가로/세로 비율(폭 배분)을 조정해야 함.

### 14.2 모바일 히어로 — 사진과 유튜브 사이 빈 공간 버그 (두 번 왔다 갔다 했음)
- 처음엔 모바일에서 히어로 전체 높이가 콘텐츠보다 짧아서 화면 맨 아래에 빈 여백이 생기는 문제가 있었음 → `.hero-split{min-height:100dvh}` + `.hero-panel{flex:1 1 auto}`(패널이 남는 공간을 채우도록) + `justify-content:flex-end`(영상+정보를 패널 하단에 붙임)로 고침.
- 그런데 이 방식이 **빈 공간을 "맨 아래"에서 "사진과 영상 사이"로 옮긴 것뿐**이었음(패널이 늘어나면서 영상이 패널 하단으로 밀려남) — 대표님이 실제 휴대폰 스크린샷으로 "사진이랑 유튜브 썸네일 사이 여백 너무 큼"이라고 재지적.
- **최종 해결**: 모바일에서 강제 전체화면 채우기를 포기하고 **자연스러운 콘텐츠 흐름**으로 원복(`.hero-split{min-height:auto}`, `.hero-panel{flex:none;justify-content:flex-start}`) — 사진 다음에 바로 영상이 붙어서 나옴. **교훈**: "화면 꽉 채우기"와 "콘텐츠 사이 자연스러운 간격"이 충돌할 때, 홈페이지 히어로처럼 사진+영상+정보가 순서대로 쌓이는 레이아웃에서는 자연스러운 흐름이 우선. (반대로 about.html처럼 텍스트 하나만 있는 짧은 콘텐츠에는 화면 채우기+중앙정렬이 잘 맞음 — 아래 14.4 참고. 페이지 성격에 따라 다르게 접근할 것.)

### 14.3 새 기능: 디오브 스타일 프로젝트 상세페이지
- PROJECTS 카드 클릭 → `project-detail.html?id=N`으로 이동(예전엔 클릭해도 반응 없었음). 좌측에 대표사진+갤러리 사진이 풀블리드로 쭉 이어지고, 우측에 스크롤을 따라오는(`position:sticky`) 정보 패널(Type/Location/Floor Area/Director/Design/Story + CONTACT 링크).
- **DB 변경 완료**(대표님이 SQL Editor에서 실행함): `projects` 테이블에 `location`/`floor_area`/`director`/`designer` 컬럼 추가, 신규 테이블 `project_photos`(갤러리용, `portfolio` 버킷의 `gallery/{project_id}/` 경로 재사용).
- `admin/portfolio.html`에 위치/평수/담당자/디자인 입력칸 추가 + "상세페이지 갤러리 사진" 섹션(현장을 한 번 저장한 뒤에만 나타남, project_id가 있어야 사진을 연결할 수 있어서). 여러 장 한 번에 업로드 가능, 사진별 순서 지정/삭제 가능.
- **테스트 완료**: "시험용" 항목으로 등록→클릭→상세페이지 확인까지 전부 정상 동작 확인함. **아직 실제 시공 사례는 이 필드들을 채워서 등록된 게 없음** — 다음에 진짜 시공 사례 등록할 때 이 필드들도 같이 채우는 걸 안내할 것.

### 14.4 About 페이지 — 여러 차례 수정 끝에 확정된 최종 형태
디오브 About 화면 스크린샷을 여러 번 참고하며 반복 수정함. **최종 형태**(중간에 시도했다 되돌린 것들도 기록):
- **시도했다 되돌린 것**: 우측에 유튜브 영상 썸네일을 넣는 좌우 분할 레이아웃(대표님이 "글자만 노출, 유튜브는 다시 홈으로" 요청 → 되돌림, 지금은 About에 영상 없음. **홈페이지 유튜브 영상 관리는 대표님이 직접 admin/youtube.html에서 하기로 함** — Claude Code가 먼저 손대지 말 것).
- **최종**: `<section class="about-lead"><div class="wrap">` 안에 h1(작은 굵은 글씨, 16px) + `.about-lines`(5개 문단, 각 `<br>`로 강제 줄바꿈, 대표님이 정확한 줄바꿈까지 지정한 카피). 철학 3가지 기둥 섹션은 완전히 삭제(다른 곳에도 없음, 콘텐츠 자체가 사라진 것 — 나중에 되살려달라고 하면 git log에서 찾을 것).
- **한 화면에 꽉 차게(스크롤 없이)**: `body.page-fit-screen` 클래스(about.html 전용) — `<body>`를 flex column으로 만들어 헤더는 고정 높이, `.about-lead`는 `flex:1 1 auto`로 남는 공간을 다 차지하며 세로 중앙정렬, 푸터는 맨 아래 고정. 위아래 여백은 여러 번 조정 끝에 `padding:40px 0`(짧은 화면에서는 `max-height:760px` 미디어쿼리로 더 줄임)으로 확정 — **너무 크게 주면 다시 스크롤 생김, 이 값이 균형점**.
- **모바일**: `.wrap`의 `margin:0 auto`가 flex 안에서 텍스트 블록 전체를 가운데 정렬시켜버리는 문제가 있었음 → `max-width:600px`에서 `margin-left:0`으로 좌측 정렬 강제.
- **버그 메모(재발 방지)**: `.wrap`처럼 `margin:0 auto`로 중앙정렬하는 요소를 **column 방향 flex 컨테이너의 자식으로 넣으면, stretch 대신 콘텐츠 크기로 쪼그라드는(shrink-to-fit) 버그**가 생김(flex의 auto-margin이 block 중앙정렬과 다르게 동작). 고치려면 그 자식에 `width:100%`를 명시로 줘야 함. `body.page-fit-screen .about-lead > .wrap{width:100%;}` 규칙이 이걸 막아줌 — **비슷한 패턴(flex column + margin:auto 자식)을 또 쓸 일 있으면 반드시 width:100% 같이 넣을 것**.
- 유튜브 썸네일을 잠깐 썼을 때 배운 것: `maxresdefault.jpg`는 없는 영상이면 진짜 404가 뜨긴 하지만, 화면에는 깨진 것처럼 보이는 경우가 있었음 → 확인 결과 `sddefault.jpg`(640x480)는 실제로 존재했고 `hqdefault.jpg`(480x360, 항상 존재 보장)보다 화질이 나음. **유튜브 썸네일을 크게 쓸 일 있으면 `sddefault.jpg`를 우선 시도하고 `hqdefault.jpg`를 onerror 폴백으로 쓸 것** (`maxresdefault`는 신뢰하지 말 것 — 화면에 이상하게 나올 수 있음).

### 14.5 헤더 위치 · 푸터 통일 (4개 공개 페이지 전부)
- 로고/`+` 아이콘 좌우 여백이 홈(오버레이 헤더, 20px)과 나머지 페이지(일반 헤더, 32px)가 서로 달랐음 → `.site-header .wrap{padding:0 20px}`로 통일, `.site-header--overlay`용 별도 규칙 제거.
- **PROJECTS/CONTACT 푸터도 홈/ABOUT과 동일한 영문 포맷으로 교체**: `STUDIO KWONTERIOR` / 로마자 주소 / `E 이메일 P 전화` / `Biz. Reg. No.` (`.hero-panel-info`/`.hero-panel-info-name` 클래스 재사용, 폰트 크기까지 완전히 동일). 기존에 있던 "전화 상담/카카오톡 상담" 텍스트 링크는 4개 페이지 전부에서 삭제됨(우측 하단 플로팅 버튼이 이미 그 역할을 함).

### 14.6 로고 크기 — 최종 18px
- 대표님이 "아직도 크다"를 3번 반복해서 지적함(30px → 26px → 22px → **18px**로 최종 확정). `.logo img{height:18px}` 하나로 전 페이지 통일. **더 줄여달라는 요청이 다시 오면 15-16px 정도까지는 시도해볼 수 있지만, 그 밑으로는 가독성 문제 있을 수 있어 먼저 확인할 것.**

### 14.7 다음 세션 우선순위
A. **실제 시공 사례 등록** — 아직 "시험용" 테스트 항목 1개뿐. 대표님이 히어로용으로 준 사진 11장을 포트폴리오(위치/평수/담당자/디자인 필드 포함)로도 등록할지 다시 물어볼 것(이미 두 번 이상 물어봤지만 아직 답 없음, 이번엔 대표님이 먼저 꺼낼 수도 있음).
B. **시공 사례 공간별 분류** — 여전히 미착수. "공간별"의 정확한 의미(거실/주방/욕실 세분화인지) 확인 필요.
C. **홈페이지 유튜브 영상 관리** — 대표님이 직접 admin/youtube.html에서 하기로 함, Claude Code가 먼저 손대지 말 것.
D. 그 외 오래된 TODO(견적서 삭제버튼, A/S 관리, 네이버 파워링크 등)는 8번 섹션 그대로 유효함.
