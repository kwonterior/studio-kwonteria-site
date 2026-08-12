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

1. ~~구글 서치 콘솔 등록~~ — **2026-08-11(다음 세션)에 완료.** URL 접두어(`https://www.kwonterior.com/`) 속성으로 등록, HTML 태그 방식 소유확인(`google-site-verification` 메타태그를 index.html에 추가, naver 태그 바로 아래) → 배포 확인 후 소유권 확인 완료. `sitemap.xml` 제출 완료. 홈/about/projects/contact 4페이지 전부 URL 검사 → 색인 생성 요청 완료.
2. **구글 비즈니스 프로필 등록** — 2026-08-11(다음 세션)에 대부분 진행함(rokosung1077@gmail.com 계정). **남은 작업이 있으니 꼭 읽어주세요:**
   - 기존에 옛 사무실 주소(양정로228번길 17-11)로 미인증 상태로 등록되어 있던 항목을 발견해서 그걸 이어받아 진행함(신규 생성 아님).
   - 완료: 비즈니스 설명 입력, 웹사이트(`https://www.kwonterior.com`) 등록, 서비스 4종(인테리어 디자이너/거실 디자인/공간 플래닝/목공 디자인) 추가, 전화번호 확인(기존 010-7468-0314 정확함).
   - **미완료 — 대표님이 직접 하셔야 함**:
     1. **소유권 인증**: "비즈니스 동영상 제출" 방식만 제공됨(현장에서 위치·장비·신분 촬영). Google 비즈니스 프로필 앱이나 business.google.com에서 진행. 인증 전까지는 수정사항이 실제 검색/지도에 노출 안 됨.
     2. **주소를 새 주소(용황로8길 18)로 업데이트**: Google 지도가 이 도로명주소를 자동 지오코딩하지 못해서(우편번호는 38069로 확인됨, 인근 용황로7길/11길 등과 동일) 지도 핀을 수동으로 정확한 건물 위치에 맞춰야 저장이 됨. business.google.com → 해당 비즈니스 → 프로필 수정 → 위치 탭에서 상세주소를 "용황로8길 18"로 입력 후, 지도의 "조정" 버튼으로 핀을 실제 건물 위치로 드래그하고 저장.
     3. 영업시간, 매장/작업 사진은 정보가 없어 비워둠 — 원하시면 나중에 추가.
     4. ₩600,000 Google Ads 크레딧 제안과 Google Workspace 이메일 제안은 실제 비용/계정 생성이 걸려있어 건너뜀 — 필요하면 대표님이 직접 검토.
3. **견적서/정산/자재발주 삭제 버튼** — 아직 없음. 2026-08-11에 재차 "나중에"로 보류 확인(먼저 제안하지 말 것). 요청 시 `customers.html` 패턴(홑따옴표 onclick + cascade 경고 문구) 그대로 적용.
4. **시공 사진 등록** — 홈페이지 PROJECTS(포트폴리오)는 여전히 비어있음(테스트용 항목 1개만 있음). 관리자 포트폴리오 화면에서 실제 시공 사진 등록 필요.
5. **2순위**: 현장 진행사진 앨범(공사 중 사진, `site-detail.html`의 "도면" 탭과는 별개로 진행 단계별 사진첩 개념이면 새로 설계 필요), A/S 관리.
6. **3순위**: 매출/손익 통계, 자동 알림, 직원 3명 이상 시 역할 추가.
7. **홈페이지 채용 섹션** — 디자이너 채용 시점에 CONTACT 페이지에 추가 예정, 미착수.
8. `customers.address` 컬럼 정리(선택) — 안 쓰지만 남아있음.

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
