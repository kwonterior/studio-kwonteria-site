// 이미지 로드 실패 시 깨진 아이콘 대신 플레이스홀더로 교체
function imgFallback(el) {
  const div = document.createElement("div");
  div.className = "ph-image";
  div.textContent = "사진 준비중";
  el.replaceWith(div);
}

// 새단장 안내 팝업 (세션당 1회, 첫 페이지 진입 시)
function showRenewalNotice() {
  if (sessionStorage.getItem("renewalNoticeShown")) return;
  sessionStorage.setItem("renewalNoticeShown", "1");

  const overlay = document.createElement("div");
  overlay.className = "rn-overlay";
  overlay.innerHTML = `
    <div class="rn-modal" role="dialog" aria-modal="true" aria-labelledby="rn-title">
      <button class="rn-close" aria-label="닫기">&times;</button>
      <p class="rn-eyebrow">STUDIO KWONTERIOR</p>
      <h2 id="rn-title">더 나은 모습으로<br>새단장하고 있습니다</h2>
      <p class="rn-desc">스튜디오 권테리어가 여러분을 더 잘 보여드리기 위해<br>홈페이지를 새롭게 준비하고 있습니다.<br>궁금하신 점은 전화나 카카오톡으로 편하게 문의해주세요.</p>
      <button class="btn btn-primary rn-confirm">확인하고 둘러보기</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector(".rn-close").addEventListener("click", close);
  overlay.querySelector(".rn-confirm").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
}

// 플로팅 상담 버튼 (전화/카카오톡, 전 페이지 공통)
// 히어로가 있는 페이지(.hero-full)에서는 히어로를 벗어나야 나타나고, 없는 페이지에서는 바로 보임
function renderFloatingCta() {
  const wrap = document.createElement("div");
  wrap.className = "float-cta";
  wrap.innerHTML = `
    <a href="tel:" data-tel class="float-cta-btn float-cta-tel">전화 상담</a>
    <a href="#" data-kakao target="_blank" class="float-cta-btn float-cta-kakao">카카오톡 상담</a>
  `;
  document.body.appendChild(wrap);

  const hero = document.querySelector(".hero-full");
  if (!hero) { wrap.classList.add("show"); return; }
  const io = new IntersectionObserver(([entry]) => {
    wrap.classList.toggle("show", !entry.isIntersecting);
  }, { threshold: 0.15 });
  io.observe(hero);
}

// 모바일 메뉴 토글 + 연락처 자동 채우기 + 상담폼 전송
document.addEventListener("DOMContentLoaded", () => {
  showRenewalNotice();
  renderFloatingCta();

  // 전화/카카오 링크 자동 채우기
  document.querySelectorAll("[data-tel]").forEach(el => {
    el.href = "tel:" + COMPANY.phone;
  });
  document.querySelectorAll("[data-kakao]").forEach(el => {
    el.href = COMPANY.kakaoUrl;
  });
  document.querySelectorAll("[data-phone-text]").forEach(el => {
    el.textContent = COMPANY.phoneDisplay;
  });
  document.querySelectorAll("[data-address-text]").forEach(el => {
    el.textContent = COMPANY.address;
  });
  document.querySelectorAll("[data-biz-text]").forEach(el => {
    el.textContent = COMPANY.bizNumber;
  });

  // 모바일 메뉴
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".nav-mobile");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
    });
  }

  // 상담 신청 폼 (CONTACT 페이지)
  const form = document.getElementById("inquiry-form");
  if (form && window.supabase) {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "전송 중...";

      const payload = {
        name: form.name.value,
        phone: form.phone.value,
        region: form.region.value,
        area_pyeong: form.area.value,
        budget: form.budget.value,
        memo: form.memo.value,
        source: "홈페이지",
        status: "문의"
      };

      const { error } = await client.from("customers").insert([payload]);

      if (error) {
        console.error(error);
        alert("전송 중 문제가 발생했습니다. 전화 또는 카카오톡으로 문의해주세요.");
        btn.disabled = false;
        btn.textContent = "상담 신청하기";
        return;
      }

      form.style.display = "none";
      document.getElementById("form-success").style.display = "block";
    });
  }
});
