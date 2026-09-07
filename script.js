const products = [
  { name: "오브제 목걸이", price: 39000, note: "포토카드 5종세트", group: "OBJECT / DAILY SCENE" },
  { name: "오브제 키링", price: 25000, group: "OBJECT / DAILY SCENE" },
  { name: "금속 뱃지", price: 13000, note: "랜덤포토카드", group: "OBJECT / DAILY SCENE" },
  { name: "보이스 카세트", price: 28000, group: "OBJECT / DAILY SCENE" },
  { name: "ID 포토 홀더", price: 12000, note: "증명사진 5종세트", group: "OBJECT / DAILY SCENE" },
  { name: "네임택", price: 6000, group: "OBJECT / DAILY SCENE" },
  { name: "드로잉 티셔츠", price: 45000, note: "A ver. 유닛포토카드 2종 세트\nB ver. 개인포토카드 5종 세트", group: "OBJECT / DAILY SCENE" },
  { name: "숄더백", price: 39000, note: "포토카드 5종세트", group: "OBJECT / DAILY SCENE" },
  { name: "파우치", price: 25000, group: "OBJECT / DAILY SCENE" },
  { name: "랜덤 미니어쳐 키링", price: 10000, group: "REMINI / MEMORY GOODS" },
  { name: "아크릴 체인 키링", price: 15000, group: "REMINI / MEMORY GOODS" },
  { name: "커스텀 포토 홀더", price: 20000, group: "REMINI / MEMORY GOODS" },
  { name: "데스크 매트", price: 22000, group: "REMINI / MEMORY GOODS" },
  { name: "공식 인형 키링", price: 29900, group: "REMINI / MEMORY GOODS" },
  { name: "마그네틱 스마트톡", price: 15000, group: "REMINI / MEMORY GOODS" },
  { name: "볼펜", price: 5500, group: "REMINI / MEMORY GOODS" },
  { name: "스티커팩", price: 7000, group: "REMINI / MEMORY GOODS" },
  { name: "아크릴 키링", price: 10000, group: "REMINI / MEMORY GOODS" },
  { name: "키캡 키링 단품", price: 9000, group: "REMINI / MEMORY GOODS" },
  { name: "키캡 키링 세트", price: 50000, group: "REMINI / MEMORY GOODS" },
  { name: "아크릴 스탠드 디오라마", price: 25000, group: "REMINI / MEMORY GOODS" },
  { name: "쿠션", price: 28000, group: "REMINI / MEMORY GOODS" },
  { name: "담요", price: 28000, group: "REMINI / MEMORY GOODS" },
  { name: "포켓 장바구니", price: 15000, group: "REMINI / MEMORY GOODS" },
  { name: "리유저블백", price: 12000, group: "REMINI / MEMORY GOODS" },
  { name: "포토카드 홀더", price: 12000, group: "REMINI / MEMORY GOODS" },
  { name: "손거울", price: 4500, group: "REMINI / MEMORY GOODS" },
  { name: "마스킹 테이프", price: 4500, group: "REMINI / MEMORY GOODS" },
  { name: "부채", price: 3500, group: "REMINI / MEMORY GOODS" },
];

const storageKeys = { consent: "rescene-storage-consent", cart: "rescene-popup-cart-v1" };
const cart = Object.fromEntries(products.map((_, index) => [index, 0]));
let filter = "all";
let query = "";
let saveTimer;

const money = (value) => `₩${value.toLocaleString("ko-KR")}`;
const $ = (selector) => document.querySelector(selector);

function getConsent() { return localStorage.getItem(storageKeys.consent); }

function renderProducts() {
  const groups = products.reduce((acc, product, index) => {
    (acc[product.group] ||= []).push({ ...product, index });
    return acc;
  }, {});
  const html = Object.entries(groups).map(([group, items]) => {
    const visibleItems = items.filter(({ name, index }) => {
      const matchesQuery = name.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "all" || cart[index] > 0;
      return matchesQuery && matchesFilter;
    });
    return `<section class="product-group" data-group="${group}">
      <h3 class="group-heading"><span>${group.split(" /")[0]}</span><small>${group.split("/")[1]}</small></h3>
      ${items.map((product) => productRow(product, visibleItems.some((item) => item.index === product.index))).join("")}
    </section>`;
  }).join("");
  $("#productGroups").innerHTML = html;
  $("#emptyState").hidden = products.every(({ name }, index) => {
    const matchesQuery = name.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === "all" || cart[index] > 0) === false;
  }) === false;
  const hasVisible = products.some(({ name }, index) => name.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || cart[index] > 0));
  $("#emptyState").hidden = hasVisible;
  $("#allCount").textContent = products.length;
  $("#selectedCount").textContent = products.filter((_, index) => cart[index] > 0).length;
}

function productRow({ name, price, note, index }, visible) {
  const quantity = cart[index];
  return `<div class="product-row ${visible ? "" : "is-hidden"}" data-index="${index}">
    <div><span class="product-name">${name}</span>${note ? `<span class="product-note">${note}</span>` : ""}</div>
    <span class="product-price">${money(price)}</span>
    <div class="qty-control" aria-label="${name} 수량 조절">
      <button type="button" data-action="decrease" aria-label="${name} 수량 줄이기">−</button>
      <input type="number" min="0" max="99" value="${quantity}" data-action="input" aria-label="${name} 수량" />
      <button type="button" data-action="increase" aria-label="${name} 수량 늘리기">+</button>
    </div>
    <span class="product-amount">${money(price * quantity)}</span>
  </div>`;
}

function loadCart() {
  if (getConsent() !== "granted") return;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.cart) || "{}");
    products.forEach((_, index) => { cart[index] = Math.max(0, Math.min(99, Number(saved[index]) || 0)); });
  } catch { localStorage.removeItem(storageKeys.cart); }
}

function saveCart() {
  if (getConsent() !== "granted") return;
  localStorage.setItem(storageKeys.cart, JSON.stringify(cart));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => showToast("이 기기에 구매 수량을 저장했어요."), 350);
}

function updateSaveState() {
  const saved = getConsent() === "granted";
  $("#saveState").classList.toggle("is-saved", saved);
  $("#saveState").innerHTML = `<span class="status-dot"></span>${saved ? "이 기기에 저장 중" : "저장 동의 전"}`;
}

function renderSummary() {
  const selected = products.map((product, index) => ({ ...product, index, quantity: cart[index] })).filter((product) => product.quantity > 0);
  const total = selected.reduce((sum, product) => sum + product.price * product.quantity, 0);
  $("#itemCountLabel").textContent = `${selected.reduce((sum, product) => sum + product.quantity, 0)} items`;
  $("#totalAmount").textContent = money(total);
  $("#mobileTotalAmount").textContent = money(total);
  $("#summaryList").innerHTML = selected.length ? selected.map((product) => `<div class="summary-item"><div>${product.name}<small>${product.quantity}개 × ${money(product.price)}</small></div><strong>${money(product.price * product.quantity)}</strong></div>`).join("") : `<div class="summary-empty">아직 담은 상품이 없어요.<br />마음에 드는 상품을 골라보세요.</div>`;
}

let floatingFrame = 0;
function syncFloatingSummary() {
  const summary = $(".summary-panel");
  const grid = $(".content-grid");
  if (!summary || !grid) return;
  if (window.innerWidth <= 860) {
    summary.classList.remove("is-floating");
    summary.style.left = "";
    summary.style.width = "";
    return;
  }
  const gridRect = grid.getBoundingClientRect();
  const panelWidth = summary.getBoundingClientRect().width;
  const shouldFloat = gridRect.top <= 24 && gridRect.bottom > 24 + summary.offsetHeight;
  summary.classList.toggle("is-floating", shouldFloat);
  if (shouldFloat) {
    const width = panelWidth || 320;
    summary.style.left = `${gridRect.right - width}px`;
    summary.style.width = `${width}px`;
  } else {
    summary.style.left = "";
    summary.style.width = "";
  }
}

function requestFloatingSummarySync() {
  cancelAnimationFrame(floatingFrame);
  floatingFrame = requestAnimationFrame(syncFloatingSummary);
}

function render() { renderProducts(); renderSummary(); updateSaveState(); requestFloatingSummarySync(); }

function setQuantity(index, value) {
  cart[index] = Math.max(0, Math.min(99, Number.isFinite(Number(value)) ? Math.floor(Number(value)) : 0));
  saveCart();
  render();
}

function showStorageModal() { $("#storageModal").hidden = false; document.body.style.overflow = "hidden"; }
function hideStorageModal() { $("#storageModal").hidden = true; document.body.style.overflow = ""; }
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("is-visible"); setTimeout(() => toast.classList.remove("is-visible"), 2200); }

function summaryText() {
  const selected = products.map((product, index) => ({ ...product, quantity: cart[index] })).filter((product) => product.quantity > 0);
  const total = selected.reduce((sum, product) => sum + product.price * product.quantity, 0);
  return ["[RESCENE POP-UP 구매 리스트]", ...selected.map((product) => `· ${product.name} / ${product.quantity}개 / ${money(product.price * product.quantity)}`), `총 금액: ${money(total)}`].join("\n");
}

async function copySummary() {
  if (!products.some((_, index) => cart[index] > 0)) { showToast("먼저 담고 싶은 상품의 수량을 입력해 주세요."); return; }
  try { await navigator.clipboard.writeText(summaryText()); showToast("구매 리스트를 클립보드에 복사했어요."); }
  catch { showToast("복사할 수 없어요. 브라우저 권한을 확인해 주세요."); }
}

$("#productGroups").addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const row = control.closest("[data-index]");
  const index = Number(row.dataset.index);
  setQuantity(index, cart[index] + (control.dataset.action === "increase" ? 1 : -1));
});
$("#productGroups").addEventListener("change", (event) => {
  if (event.target.dataset.action !== "input") return;
  setQuantity(Number(event.target.closest("[data-index]").dataset.index), event.target.value);
});
$("#searchInput").addEventListener("input", (event) => { query = event.target.value.trim(); renderProducts(); });
document.querySelectorAll(".filter-button").forEach((button) => button.addEventListener("click", () => {
  filter = button.dataset.filter;
  document.querySelectorAll(".filter-button").forEach((item) => { item.classList.toggle("active", item === button); item.setAttribute("aria-selected", item === button); });
  renderProducts();
}));
$("#storageSettings").addEventListener("click", showStorageModal);
$("#closeStorage").addEventListener("click", hideStorageModal);
$("#allowStorage").addEventListener("click", () => { localStorage.setItem(storageKeys.consent, "granted"); saveCart(); hideStorageModal(); render(); showToast("앞으로 이 기기에 구매 수량을 저장할게요."); });
$("#denyStorage").addEventListener("click", () => { localStorage.setItem(storageKeys.consent, "denied"); localStorage.removeItem(storageKeys.cart); hideStorageModal(); updateSaveState(); showToast("이번 브라우저에는 구매 수량을 저장하지 않아요."); });
$("#resetCart").addEventListener("click", () => { products.forEach((_, index) => { cart[index] = 0; }); saveCart(); render(); showToast("모든 수량을 초기화했어요."); });
$("#copySummary").addEventListener("click", copySummary);
$("#mobileCopySummary").addEventListener("click", copySummary);
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !$("#storageModal").hidden) hideStorageModal(); });
window.addEventListener("scroll", requestFloatingSummarySync, { passive: true });
window.addEventListener("resize", requestFloatingSummarySync);

loadCart();
render();
if (!getConsent()) setTimeout(showStorageModal, 350);
