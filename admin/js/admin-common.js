// 관리자페이지 공통 기능: 로그인 확인, 역할(대표/직원) 확인, 메뉴 렌더링, 로그아웃
const SUPABASE_URL = "https://qpyqhgczsigqiuxdujgq.supabase.co";
const SUPABASE_KEY = "sb_publishable_CU5HOfouKF8OrUq3B7wYHw_WmpeBQ2g";

const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const MENU = [
  { href: "index.html", label: "대시보드", ownerOnly: false },
  { href: "customers.html", label: "견적문의", ownerOnly: false },
  { href: "hero.html", label: "대표사진", ownerOnly: false },
  { href: "portfolio.html", label: "포트폴리오", ownerOnly: false },
  { href: "youtube.html", label: "유튜브", ownerOnly: false }
];
// 공정표/견적서/정산·지급/자재발주 메뉴는 당분간 미사용으로 숨김(2026-09-07) — 페이지 자체는 그대로 남아있음, 필요해지면 위 배열에 다시 추가할 것
// { href: "schedule.html", label: "공정표", ownerOnly: false },
// { href: "quotes.html", label: "견적서", ownerOnly: false },
// { href: "payments.html", label: "정산·지급", ownerOnly: true },
// { href: "materials.html", label: "자재발주", ownerOnly: false }

// 로그인 여부 + 역할(profile) 확인. 로그인 안 되어 있으면 login.html로 이동.
async function requireAuth() {
  const { data: { session } } = await sbClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  const { data: profile, error } = await sbClient
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    alert("계정 정보를 찾을 수 없습니다. 관리자에게 문의해주세요.");
    await sbClient.auth.signOut();
    window.location.href = "login.html";
    return null;
  }
  renderSidebar(profile);
  return { user: session.user, profile };
}

function renderSidebar(profile) {
  const current = document.body.dataset.page;
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  let navHtml = "";
  MENU.forEach(item => {
    if (item.ownerOnly && profile.role !== "owner") return;
    const active = current === item.href ? "active" : "";
    navHtml += `<a href="${item.href}" class="${active}">${item.label}</a>`;
  });

  sidebar.innerHTML = `
    <div class="brand">스튜디오 권테리어<br><span style="font-weight:400;font-size:12px;color:#c9c2b8;">관리자페이지</span></div>
    <div class="user">${profile.name}님 (${profile.role === "owner" ? "대표" : "직원"})</div>
    <nav>${navHtml}</nav>
    <div class="logout" id="logout-btn">로그아웃</div>
  `;
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await sbClient.auth.signOut();
    window.location.href = "login.html";
  });
}

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ko-KR");
}
function fmtMoney(n) {
  if (n === null || n === undefined || n === "") return "-";
  return Number(n).toLocaleString("ko-KR") + "원";
}
function fmtPhone(raw) {
  if (!raw) return "-";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 11) return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
  if (digits.length === 10) return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1 $2 $3");
  return raw;
}

// 스마트폰 원본 사진(수 MB~십수 MB)을 그대로 올리면 목록 화면이 느려지므로,
// 업로드 전에 브라우저에서 가로/세로 최대 1600px, JPEG 82% 품질로 줄여서 올림.
// 이미지가 아니거나(PDF 등) 이미 충분히 작으면 원본 그대로 사용.
function compressImage(file, maxDimension = 1600, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file.type || !file.type.startsWith("image/") || file.type === "image/gif") {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        if (width <= maxDimension && height <= maxDimension && file.size < 800 * 1024) {
          resolve(file);
          return;
        }
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        }, "image/jpeg", quality);
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
