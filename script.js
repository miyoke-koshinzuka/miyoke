// ▼ ゆかのスプレッドシート（CSV）のURL
const DAILY_MENU_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQW-ZfLjTvUgnTESFQ38CHIeRMEShMfGWQz1TbYdnCApKwQ7SzW7qsEmxLf-3vJRnAfjWjZuRnyTlQ/pub?gid=0&single=true&output=csv";

// CSV文字列を2次元配列にする
function parseCsv(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .map((row) => row.split(","));
}

// セルの値をきれいにする（余計なクォーテーションなど除去）
function cleanCell(value) {
  return (value || "").replace(/\r/g, "").replace(/^"|"$/g, "").trim();
}

// 本日メニューを読み込む
async function loadDailyMenuImage() {
  const imgEl = document.getElementById("dailyMenuImage");
  const capEl = document.getElementById("dailyMenuCaption");
  if (!imgEl || !capEl) return;

  try {
    const res = await fetch(DAILY_MENU_SHEET_URL);
    const text = await res.text();
    const rows = parseCsv(text);

    // ヘッダー行を除いたデータ
    const dataRows = rows.slice(1);

    if (dataRows.length === 0) {
      imgEl.style.display = "none";
      capEl.textContent = "メニューはまだ登録されていません。";
      return;
    }

    // 最終行を最新データとする
    const latest = dataRows[dataRows.length - 1];

    const fileName = cleanCell(latest[1]);  // B列：ファイル名（例：2026-01-15-menu.jpg）
    const caption = cleanCell(latest[2]);   // C列：キャプション

    console.log("fileName from sheet:", fileName);

    if (fileName) {
      // imgフォルダの中にある画像を読み込む
      imgEl.src = "img/" + fileName;
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
// これまでの日替わりメニューギャラリーを読み込む
async function loadDailyGallery() {
  const container = document.getElementById("dailyGallery");
  if (!container) return;

  try {
    const res = await fetch(DAILY_MENU_SHEET_URL);
    const text = await res.text();
    const rows = parseCsv(text);
    const dataRows = rows.slice(1); // 1行目はヘッダー

    if (dataRows.length === 0) {
      container.innerHTML = "<p>まだメニューが登録されていません。</p>";
      return;
    }

    // 新しいものが上に来るように逆順で回す
    for (let i = dataRows.length - 1; i >= 0; i--) {
      const row = dataRows[i];

      const date = cleanCell(row[0]);     // A列: date
      const fileName = cleanCell(row[1]); // B列: ファイル名（例: 2026-01-15-menu.jpg）
      const caption = cleanCell(row[2]);  // C列: キャプション

      if (!fileName) continue; // 画像名が入ってない行はスキップ

      // カード用の div を作る
      const item = document.createElement("div");
      item.className = "gallery-item";

      const img = document.createElement("img");
      img.src = "img/" + fileName;
      img.alt = caption || `${date} の日替わりメニュー`;

      const meta = document.createElement("p");
      meta.className = "gallery-meta";
      // 日付 + キャプションを1行にまとめる
      meta.textContent = caption ? `${date}｜${caption}` : date;

      item.appendChild(img);
      item.appendChild(meta);

      container.appendChild(item);
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = "<p>メニュー一覧を読み込めませんでした。</p>";
  }
}


// ページ読み込み時に実行
loadDailyMenuImage();

// ▼ お知らせ用スプレッドシート（CSV）のURL
const NEWS_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQW-ZfLjTvUgnTESFQ38CHIeRMEShMfGWQz1TbYdnCApKwQ7SzW7qsEmxLf-3vJRnAfjWjZuRnyTlQ/pub?gid=673495674&single=true&output=csv";

// お知らせ画像を読み込む（最新の1件）
async function loadNewsImage() {
  const imgEl = document.getElementById("newsImage");
  const capEl = document.getElementById("newsCaption");
  if (!imgEl || !capEl) return;

  try {
    const res = await fetch(NEWS_SHEET_URL);
    const text = await res.text();
    const rows = parseCsv(text);
    const dataRows = rows.slice(1); // 1行目はヘッダー

    if (dataRows.length === 0) {
      imgEl.style.display = "none";
      capEl.textContent = "お知らせはまだ登録されていません。";
      return;
    }

    // 一番下の行を最新として使う
    const latest = dataRows[dataRows.length - 1];

    const fileName = cleanCell(latest[1]); // B列: file_name
    const caption = cleanCell(latest[2]);  // C列: caption

    if (fileName) {
      // 画像は「img/news/ファイル名」に置く前提
      imgEl.src = `img/news/${fileName}`;
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

const DAILY_GALLERY_INITIAL_LIMIT = 6; // 最初に見せる枚数（好きな数に変えてOK）

// これまでの日替わりメニューギャラリーを読み込む
async function loadDailyGallery() {
  const container = document.getElementById("dailyGallery");
  const moreBtn = document.getElementById("galleryMoreButton");
  if (!container) return;

  try {
    const res = await fetch(DAILY_MENU_SHEET_URL);
    const text = await res.text();
    const rows = parseCsv(text);
    const dataRows = rows.slice(1); // 1行目はヘッダー

    if (dataRows.length === 0) {
      container.innerHTML = "<p>まだメニューが登録されていません。</p>";
      if (moreBtn) moreBtn.style.display = "none";
      return;
    }

    let visibleCount = 0;

    // 新しいものが上に来るように逆順でカード作成
    for (let i = dataRows.length - 1; i >= 0; i--) {
      const row = dataRows[i];

      const date = cleanCell(row[0]);     // A列: date
      const fileName = cleanCell(row[1]); // B列: ファイル名
      const caption = cleanCell(row[2]);  // C列: キャプション

      if (!fileName) continue;

      const item = document.createElement("div");
      item.className = "gallery-item";

      // 最初の◯枚以外は非表示クラスを付ける
      if (visibleCount >= DAILY_GALLERY_INITIAL_LIMIT) {
        item.classList.add("is-hidden");
      }
      visibleCount++;

      const img = document.createElement("img");
      img.src = "img/" + fileName;
      img.alt = caption || `${date} の日替わりメニュー`;

      const meta = document.createElement("p");
      meta.className = "gallery-meta";
      meta.textContent = caption ? `${date}｜${caption}` : date;

      item.appendChild(img);
      item.appendChild(meta);

      container.appendChild(item);
    }

    // 枚数が少ないときは「もっと見る」ボタンを隠す
    if (!moreBtn) return;

    if (visibleCount <= DAILY_GALLERY_INITIAL_LIMIT) {
      moreBtn.style.display = "none";
    } else {
      moreBtn.style.display = "inline-flex";
      moreBtn.addEventListener("click", () => {
        const hiddenItems = container.querySelectorAll(".gallery-item.is-hidden");
        hiddenItems.forEach((el) => el.classList.remove("is-hidden"));
        moreBtn.style.display = "none"; // 全部出したらボタン非表示
      });
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = "<p>メニュー一覧を読み込めませんでした。</p>";
    if (moreBtn) moreBtn.style.display = "none";
  }
}

// すでにあるやつをまとめて呼ぶ
loadDailyMenuImage();
loadNewsImage();
loadDailyGallery();


// ページ読み込み完了後にスプラッシュを消す
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  if (!splash) return;

  // 少しだけ見せてからフェードアウト
  setTimeout(() => {
    splash.classList.add("splash-hidden");
  }, 800); // 0.8秒後に消し始める
});

// ===== スプラッシュ画面を自動で消す =====
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  if (!splash) return;

  // ちょっとだけロゴを見せてから消す
  setTimeout(() => {
    splash.classList.add("hide");
  }, 1200);
});
