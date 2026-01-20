/*************************************************
 * 画像の読み込み方式（保険つき）
 *************************************************/
const IMAGE_MODE = "drive"; 
// "local" or "drive"

/*************************************************
 * スプレッドシートURL
 *************************************************/
const DAILY_MENU_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQW-ZfLjTvUgnTESFQ38CHIeRMEShMfGWQz1TbYdnCApKwQ7SzW7qsEmxLf-3vJRnAfjWjZuRnyTlQ/pub?gid=0&single=true&output=csv";

const NEWS_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQW-ZfLjTvUgnTESFQ38CHIeRMEShMfGWQz1TbYdnCApKwQ7SzW7qsEmxLf-3vJRnAfjWjZuRnyTlQ/pub?gid=673495674&single=true&output=csv";

/*************************************************
 * 共通関数
 *************************************************/
function parseCsv(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .map((row) => row.split(","));
}

function cleanCell(value) {
  return (value || "").replace(/\r/g, "").replace(/^"|"$/g, "").trim();
}

function resolveImageSrc(value, folder = "img") {
  if (IMAGE_MODE === "drive") {
    return value; // B列にURLが入っている前提
  }
  return `${folder}/${value}`;
}

/*************************************************
 * 本日の日替わりメニュー
 *************************************************/
async function loadDailyMenuImage() {
  const imgEl = document.getElementById("dailyMenuImage");
  const capEl = document.getElementById("dailyMenuCaption");
  if (!imgEl || !capEl) return;

  try {
    const res = await fetch(DAILY_MENU_SHEET_URL);
    const text = await res.text();
    const rows = parseCsv(text);
    const dataRows = rows.slice(1);

    if (dataRows.length === 0) {
      imgEl.style.display = "none";
      capEl.textContent = "メニューはまだ登録されていません。";
      return;
    }

    const latest = dataRows[dataRows.length - 1];
    const imageValue = cleanCell(latest[1]);
    const caption = cleanCell(latest[2]);

    if (imageValue) {
      imgEl.src = resolveImageSrc(imageValue);
      imgEl.style.display = "block";
      capEl.textContent = caption || "本日の日替わりメニュー";
    } else {
      imgEl.style.display = "none";
      capEl.textContent = "メニューの画像が登録されていません。";
    }
  } catch (e) {
    console.error(e);
    imgEl.style.display = "none";
    capEl.textContent = "メニューを読み込めませんでした。";
  }
}

/*************************************************
 * 日替わりメニュー ギャラリー
 *************************************************/
const DAILY_GALLERY_INITIAL_LIMIT = 6;

async function loadDailyGallery() {
  const container = document.getElementById("dailyGallery");
  const moreBtn = document.getElementById("galleryMoreButton");
  if (!container) return;

  try {
    const res = await fetch(DAILY_MENU_SHEET_URL);
    const text = await res.text();
    const rows = parseCsv(text);
    const dataRows = rows.slice(1);

    if (dataRows.length === 0) {
      container.innerHTML = "<p>まだメニューが登録されていません。</p>";
      if (moreBtn) moreBtn.style.display = "none";
      return;
    }

    let visibleCount = 0;

    for (let i = dataRows.length - 1; i >= 0; i--) {
      const row = dataRows[i];
      const date = cleanCell(row[0]);
      const imageValue = cleanCell(row[1]);
      const caption = cleanCell(row[2]);

      if (!imageValue) continue;

      const item = document.createElement("div");
      item.className = "gallery-item";
      if (visibleCount >= DAILY_GALLERY_INITIAL_LIMIT) {
        item.classList.add("is-hidden");
      }
      visibleCount++;

      const img = document.createElement("img");
      img.src = resolveImageSrc(imageValue);
      img.alt = caption || `${date} の日替わりメニュー`;

      const meta = document.createElement("p");
      meta.className = "gallery-meta";
      meta.textContent = caption ? `${date}｜${caption}` : date;

      item.appendChild(img);
      item.appendChild(meta);
      container.appendChild(item);
    }

    if (!moreBtn) return;
    if (visibleCount <= DAILY_GALLERY_INITIAL_LIMIT) {
      moreBtn.style.display = "none";
    } else {
      moreBtn.style.display = "inline-flex";
      moreBtn.onclick = () => {
        container
          .querySelectorAll(".gallery-item.is-hidden")
          .forEach((el) => el.classList.remove("is-hidden"));
        moreBtn.style.display = "none";
      };
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = "<p>メニュー一覧を読み込めませんでした。</p>";
    if (moreBtn) moreBtn.style.display = "none";
  }
}

/*************************************************
 * お知らせ画像
 *************************************************/
async function loadNewsImage() {
  const imgEl = document.getElementById("newsImage");
  const capEl = document.getElementById("newsCaption");
  if (!imgEl || !capEl) return;

  try {
    const res = await fetch(NEWS_SHEET_URL);
    const text = await res.text();
    const rows = parseCsv(text);
    const dataRows = rows.slice(1);

    if (dataRows.length === 0) {
      imgEl.style.display = "none";
      capEl.textContent = "お知らせはまだ登録されていません。";
      return;
    }

    const latest = dataRows[dataRows.length - 1];
    const imageValue = cleanCell(latest[1]);
    const caption = cleanCell(latest[2]);

    if (imageValue) {
      imgEl.src = resolveImageSrc(imageValue, "img/news");
      imgEl.style.display = "block";
      capEl.textContent = caption || "";
    } else {
      imgEl.style.display = "none";
      capEl.textContent = "お知らせ画像が登録されていません。";
    }
  } catch (e) {
    console.error(e);
    imgEl.style.display = "none";
    capEl.textContent = "お知らせを読み込めませんでした。";
  }
}

/*************************************************
 * スプラッシュ画面
 *************************************************/
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  if (!splash) return;
  setTimeout(() => splash.classList.add("hide"), 1200);
});

/*************************************************
 * 初期実行
 *************************************************/
loadDailyMenuImage();
loadDailyGallery();
loadNewsImage();
