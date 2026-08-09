// 모바일 메뉴 토글 + 연락처 자동 채우기 + 상담폼 전송
document.addEventListener("DOMContentLoaded", () => {
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
