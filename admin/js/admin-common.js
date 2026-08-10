// 관리자페이지 공통 기능: 로그인 확인, 역할(대표/직원) 확인, 메뉴 렌더링, 로그아웃
const SUPABASE_URL = "https://qpyqhgczsigqiuxdujgq.supabase.co";
const SUPABASE_KEY = "sb_publishable_CU5HOfouKF8OrUq3B7wYHw_WmpeBQ2g";

const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const MENU = [
  { href: "index.html", label: "대시보드", ownerOnly: false },
  { href: "schedule.html", label: "공정표", ownerOnly: false },
  { href: "customers.html", label: "고객·상담", ownerOnly: false },
  { href: "portfolio.html", label: "포트폴리오", ownerOnly: false },
  { href: "quotes.html", label: "견적서", ownerOnly: false },
  { href: "payments.html", label: "정산·지급", ownerOnly: true },
  { href: "materials.html", label: "자재발주", ownerOnly: false }
];

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
