# 스튜디오 권테리어 홈페이지·관리자페이지 — 인수인계 문서

작성일: 2026-08-10
작성 배경: Cowork AI PM과의 대화로 기획/구축을 진행하다가, 이후 작업을 Claude Code로 이어가기 위해 작성한 인수인계 문서입니다.

---

## 1. 프로젝트 개요

경상북도 경주 소재 인테리어 회사 "스튜디오 권테리어"(대표 1인 + 직원 1인 체제, 향후 디자이너 채용 예정)의 회사 홈페이지와 내부 관리자페이지를 처음부터 구축하는 프로젝트입니다.

- 홈페이지 목적: 회사 신뢰도, 지역(경주·포항) 검색 노출, 채용
- 관리자페이지 목적: 대표가 혼자 처리하던 반복 업무(견적서, 정산, 발주, 공정 관리) 부담을 줄이는 것. "완벽한 프로그램"이 아니라 "매일 실제로 쓰는 프로그램"이 목표.

---

## 2. 배포 정보 (바로 접속 가능한 링크)

- 홈페이지: https://studio-kwonteria-site.vercel.app
- 관리자페이지 로그인: https://studio-kwonteria-site.vercel.app/admin/login.html
- GitHub 저장소: https://github.com/kwonterior/studio-kwonteria-site (main 브랜치, Public)
- Vercel 프로젝트: kwonterior1 팀 / studio-kwonteria-site (GitHub main 브랜치에 push되면 자동 배포됨)
- Supabase 프로젝트: https://supabase.com/dashboard/project/qpyqhgczsigqiuxdujgq (조직명 "스튜디오 권테리어", 프로젝트명 "kwonterior's Project", 리전 Northeast Asia/Seoul)

로컬 작업 폴더: 대표님 컴퓨터 바탕화면의 `studio-kwonteria-site` 폴더가 위 GitHub 저장소 내용을 그대로 미러링하고 있습니다 (Cowork가 파일을 여기 쓰고, 대표님이 GitHub 업로드 화면에 드래그하는 방식으로 배포해왔습니다).

---

## 3. 기술 스택 및 아키텍처

의도적으로 빌드 도구가 필요 없는 순수 정적 사이트(Plain HTML/CSS/JavaScript)로 만들었습니다. Node/React/Next.js 등 빌드 파이프라인이 없습니다. 이유: 이 작업 환경(Cowork sandbox)이 npm 레지스트리·대부분의 외부 도메인에 대한 네트워크 접근이 막혀 있어(allowlist 방식) `npm install`/`npx create-next-app` 등이 불가능했기 때문입니다. Claude Code(로컬 환경)로 이어받으면 이 제약이 없으므로, 필요하다면 이후 Next.js 등으로 마이그레이션해도 되지만 현재는 정적 사이트로 충분히 작동합니다.

- 프런트엔드: 순수 HTML/CSS/JS, 빌드 스텝 없음
- 데이터/인증/파일저장: Supabase (Postgres DB + Auth + Storage), 브라우저에서 `@supabase/supabase-js` CDN(`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`)을 스크립트 태그로 로드해서 사용
- 배포: GitHub 저장소 → Vercel이 main 브랜치 push마다 자동 빌드/배포 (별도 빌드 설정 없이 정적 파일 그대로 서빙)
- 인증 키: Supabase "publishable key"(신형 anon key)를 클라이언트 코드에 그대로 노출해서 사용 중 — 이건 의도된 설계입니다 (공개되어도 안전한 키). DB 접근 제어는 Row Level Security(RLS) 정책으로 처리합니다.

---

## 4. 폴더/파일 구조

```
studio-kwonteria-site/              (= GitHub 저장소 루트)
├── index.html                      HOME
├── about.html                      ABOUT (회사소개, 철학, 사업자정보)
├── projects.html                   PROJECTS (포트폴리오 - Supabase에서 동적 로드)
├── contact.html                    CONTACT (상담신청 폼 → customers 테이블에 저장)
├── css/style.css                   홈페이지 공통 스타일
├── js/config.js                    회사 정보(전화번호/카카오/주소 등) + Supabase URL/KEY 상수
├── js/main.js                      네비게이션 토글, 연락처 자동채움, 상담폼 제출 로직
└── admin/                          관리자페이지 (로그인 필요, 검색엔진 노출 안 됨)
    ├── login.html                  로그인 화면
    ├── index.html                  대시보드 (최근 상담 문의 목록)
    ├── customers.html              고객·상담 관리 (CRUD, 삭제 버튼 없음)
    ├── quotes.html                 견적서 관리 (작성/수정은 대표만, 직원은 조회만)
    ├── payments.html               정산·지급 관리 (대표 전용, 직원 접근 차단)
    ├── materials.html              자재발주 관리 (CRUD, 삭제 버튼 없음)
    ├── portfolio.html              포트폴리오 관리 (사진 업로드/수정/삭제 → 홈페이지에 자동 반영)
    ├── schedule.html                공정표 (월별 캘린더, 현장별 일정 + 이슈/메모, CRUD+삭제)
    ├── css/admin.css               관리자페이지 공통 스타일
    └── js/admin-common.js          로그인확인(requireAuth), 사이드바 메뉴 렌더링(역할별), 공통 유틸
```

각 관리자 화면은 상단에 등록/수정 폼이 있고 하단에 목록 테이블이 있는 동일한 패턴입니다. `admin-common.js`의 `requireAuth()`가 모든 관리자 페이지 맨 위에서 로그인·역할(profile)을 확인하고, 결과가 없으면 `login.html`로 리다이렉트합니다.

---

## 5. Supabase 설정

### 5.1 접속 정보
- Project URL: `https://qpyqhgczsigqiuxdujgq.supabase.co`
- Publishable key (클라이언트용, 공개 가능): `sb_publishable_CU5HOfouKF8OrUq3B7wYHw_WmpeBQ2g`
- 데이터베이스 비밀번호, service_role 키는 이 문서에 포함하지 않았습니다. 필요하면 Supabase 대시보드 → Project Settings → API에서 대표님이 직접 확인해서 전달해야 합니다 (민감정보라 채팅/문서에 남기지 않는 것을 권장합니다).

### 5.2 인증 사용자 (Supabase Auth)
- `rdosung@naver.com` — role: `owner` (대표, 권오성)
- `kwonterior1@naver.com` — role: `employee` (직원, 기성수)
- 비밀번호는 대표님만 알고 있으며 이 문서에 없습니다.
- 역할 정보는 `profiles` 테이블에 `auth.users.id`와 1:1로 저장되어 있습니다 (`role` 컬럼: `'owner'` 또는 `'employee'`).

### 5.3 테이블 스키마 (실제 실행된 SQL 기준)

```sql
-- 직원 정보 및 역할
create table profiles (
  id uuid references auth.users(id) primary key,
  name text not null,
  role text not null check (role in ('owner','employee')),
  created_at timestamptz default now()
);

-- 고객/상담 (홈페이지 상담폼이 여기로 자동 insert됨)
create table customers (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  address text,
  region text,
  budget text,
  area_pyeong text,
  status text default '문의',   -- 문의/상담중/견적중/계약/공사중/준공/AS
  source text,                  -- 블로그/인스타그램/지인소개/유튜브/홈페이지/기타
  memo text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 견적서 (작성/수정은 owner만, RLS로 강제)
create table quotes (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  type text check (type in ('simple','detailed')),
  amount numeric,
  content text,
  status text default 'draft', -- draft/confirmed
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 정산/지급 (owner 전용, RLS로 강제)
create table payments (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  type text,       -- 계약금/중도금/잔금/인건비/업체비
  amount numeric,
  paid_to text,
  paid_at date,
  memo text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 자재발주
create table material_orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  vendor_name text,
  item text,
  quantity text,
  ordered_at date,
  expected_arrival date,
  arrived boolean default false,
  memo text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 포트폴리오 (홈페이지 PROJECTS/HOME이 공개 조회함)
create table projects (
  id bigint generated always as identity primary key,
  title text not null,
  category text,          -- 아파트/주택/기타
  description text,
  image_url text,         -- Storage public URL
  image_path text,        -- Storage 내부 경로 (삭제 시 사용)
  sort_order int default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 공정표(캘린더)
create table schedule_items (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete set null,  -- null이면 "이슈/메모"
  item_date date not null,
  content text not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
```

### 5.4 RLS(Row Level Security) 정책 요약

| 테이블 | 조회(select) | 등록/수정 | 비고 |
|---|---|---|---|
| customers | 로그인 사용자 | 등록: 누구나(익명 포함, 홈페이지 폼용) / 수정: 로그인 사용자 | |
| quotes | 로그인 사용자 | insert/update: `profiles.role='owner'`만 | 직원은 조회만 |
| payments | `profiles.role='owner'`만 (전체 작업) | 위와 동일 | 직원 완전 차단 |
| material_orders | 로그인 사용자 | 로그인 사용자 | |
| projects | **전체 공개**(익명 포함, 홈페이지용) | insert/update/delete: 로그인 사용자 | |
| schedule_items | 로그인 사용자 | 로그인 사용자 (delete 포함) | |
| profiles | 로그인 사용자 | (별도 insert 정책 없음, SQL로 직접 등록) | |

실제 정책은 각 테이블에 `create policy ...` 형태로 개별 실행되어 있습니다. 정확한 정책명과 조건은 Supabase 대시보드 → Authentication → Policies에서 확인 가능합니다.

### 5.5 Storage
- 버킷명: `portfolio` (Public 버킷)
- 정책: 조회는 전체 공개, insert/update/delete는 로그인 사용자만 (`storage.objects`에 대한 정책 4개 실행됨)
- 포트폴리오 관리 화면(`admin/portfolio.html`)에서 사진을 올리면 `{timestamp}-{파일명}` 형태의 경로로 저장되고, public URL이 `projects.image_url`에 저장됩니다.

---

## 6. GitHub / 배포 워크플로

- 저장소: `kwonterior/studio-kwonteria-site` (Public)
- 배포: Vercel이 GitHub 저장소를 Import해서 연결되어 있고, `main` 브랜치에 커밋이 push되면 자동으로 재배포됩니다. 별도 빌드 명령/환경변수 설정 없음 (정적 파일 그대로 서빙).
- **GitHub Personal Access Token 발급됨**: 대표님이 fine-grained PAT을 만들어서 Cowork 세션에 전달했으나, Cowork의 sandbox 환경이 `github.com`에 대한 네트워크 접근 자체를 막고 있어 `git push`나 GitHub API 호출에 사용하지 못했습니다 (이게 Claude Code로 이관하는 주된 이유입니다 — Claude Code는 로컬에서 실행되므로 이 네트워크 제약이 없어 git을 통한 직접 push/배포 자동화가 가능할 것으로 예상됩니다). 토큰 자체는 대표님이 별도로 안전하게 전달해야 하며, 이 문서에는 포함하지 않았습니다. 권한 범위는 이 저장소 1개, Contents: Read and write로 한정되어 있습니다.
- 지금까지의 실제 업로드 방식: Cowork가 바탕화면 `studio-kwonteria-site` 폴더에 파일을 만들면, 대표님이 그 폴더 내용을 GitHub 업로드 화면(`/upload/main` 또는 `/upload/main/{경로}`)에 드래그해서 커밋하는 수동 방식이었습니다. Claude Code로는 `git add / commit / push`로 대체 가능합니다.

---

## 7. 완료된 기능

**홈페이지**: HOME / ABOUT / PROJECTS(동적, Supabase 연동) / CONTACT(상담폼 → DB 저장). 반응형(모바일) 대응 완료. 시공 사진은 아직 미등록 상태 (관리자 포트폴리오 화면에서 등록 필요).

**관리자페이지 (로그인 필요)**:
- 대시보드: 최근 상담 문의 10건
- 고객·상담 관리: 등록/수정 (삭제 기능 없음)
- 견적서 관리: 등록/수정 (owner만, 삭제 기능 없음)
- 정산·지급 관리: 등록/수정 (owner 전용, 삭제 기능 없음)
- 자재발주 관리: 등록/수정 (삭제 기능 없음)
- 포트폴리오 관리: 등록/수정/**삭제**, 사진 업로드(Storage 연동), 홈페이지에 실시간 반영
- 공정표: 월별 캘린더 UI, 현장별 일정 + 이슈/메모, 등록/수정/**삭제**

역할 구분: `owner`(전체 권한) / `employee`(정산·지급 접근 불가, 견적서는 조회만 가능).

---

## 8. 남은 작업 / TODO (대표님이 언급했거나 설계상 다음 순서로 예정된 것들)

1. **삭제 기능 보완**: customers, quotes, payments, materials 화면에는 삭제 버튼이 없습니다. 필요 여부를 대표님께 확인 후 추가 권장.
2. **시공 사진 등록**: 관리자 포트폴리오 화면에서 실제 사진 11~12장 등록 필요 (현재 홈페이지 PROJECTS는 빈 상태).
3. **2순위 기능 (아직 미착수)**: 현장 사진 관리(공사 진행 사진 앨범), A/S 관리
4. **3순위 (회사 성장 시)**: 매출/손익 통계, 자동 알림(발주/결제/미수금 등), 세 번째 이상 직원 채용 시 역할 추가
5. **홈페이지 채용 섹션**: 디자이너 채용 시점에 CONTACT 페이지에 채용 문의 섹션 추가 예정이었음 (아직 미착수)
6. **자동화 파이프라인**: 위 6번 항목의 GitHub PAT을 활용해 Claude Code에서 git 기반 자동 push/배포로 전환하는 것을 권장.

---

## 9. 회사 정보 (컨텍스트 — 카피/디자인 결정 시 참고)

- 상호명: 스튜디오 권테리어 / 사업자등록번호: 601-15-92480 / 주소: 경상북도 경주시 용황로8길 18
- 활동 지역: 경주·포항 / 주요 고객: 아파트·주택 / 평균 공사금액 5천~6천만원, 월 평균 3건
- 조직: 대표(전체 총괄) + 직원 1명(현장관리·시공) — 1년 내 디자이너 채용 예정
- 유입 경로: 블로그, 인스타그램, 지인소개 (계약 전환 좋은 경로: 인스타, 블로그)
- 브랜드 철학 3기둥: ① 선한 영향력 ② 합리적 가치 ③ 실력과 디자인 (전체 문구는 `about.html` 참고)
- 홈페이지 목적 우선순위: 회사 신뢰도 > 지역 검색 노출 > 채용 (상담문의 최대화가 최우선 목적은 아님)
- 가장 불편했던 업무(관리자페이지 설계 근거): 견적서 작성, 블로그 작성, 스케치업 디자인 작업이 번거로움. 정산(계약금/중도금/인건비 지급 시점)을 종종 기억 못 해서 문제가 됐음. 자재발주 내역을 따로 기록 안 해서 누락 위험 있었음.

---

## 10. 주의사항

- 이 문서에는 비밀번호, service_role 키, DB 비밀번호, GitHub PAT 원문을 포함하지 않았습니다. 이관 시 별도의 보안 채널로 전달받아야 합니다.
- `payments`(정산) 테이블은 직원 접근이 RLS로 완전히 차단되어 있습니다 — 관련 코드/정책 수정 시 이 제약이 깨지지 않도록 주의해야 합니다.
- Supabase publishable key는 공개되어도 안전하지만, 그렇다고 RLS 정책 없이 테이블을 만들면 안 됩니다 (모든 테이블이 RLS enabled 상태여야 함).
