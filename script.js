// menus.csv 読み込みの準備（fetch）
let menus = [];
let drinks = [];
let foods = [];
const totalEl = document.getElementById("total");
const menuList = document.getElementById("menuList");
const gachaBtn = document.getElementById("gachaBtn");

function loadCSV() {
  console.log("LoadCSV開始");

  fetch('./menus.csv')
    .then(response => {
      if (!response.ok) {
        throw new Error('fetch失敗: ' + response.status);
      }
      return response.text();
    })
    .then(data => {
      console.log("CSV取得成功 文字数:", data.length);

      const rows = data.trim().split('\n');
      console.log("行数:", rows.length);

      const headers = rows[0].split(',').map(h => h.trim());
      console.log("ヘッダー:", headers);

      menus = [];  // ここでクリアして再代入

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const cols = row.split(',').map(c => c.trim());
        if (cols.length < 3) continue;

        const price = parseInt(cols[1], 10);
        if (isNaN(price)) continue;

        menus.push({
          name: cols[0],
          price: price,
          category: cols[2]
        });
      }

      drinks = menus.filter(m => m.category === 'drink');
      foods = menus.filter(m => m.category === 'food');

      console.log(`読み込みメニュー数: ${menus.length}`);
      console.log(`ドリンク数: ${drinks.length}`);
      console.log(`食べ物数: ${foods.length}`);

      // 読み込み完了したらボタンを有効化
      const gachaBtn = document.getElementById("gachaBtn");
      if (gachaBtn) {
        gachaBtn.disabled = false;
        gachaBtn.textContent = "ガチャを回す！";
      }
    })
    .catch(error => {
      console.error("CSV読み込みエラー:", error);
      alert("CSV読み込みに失敗しました。詳細はコンソールを確認してください。");
    });
}

// ページ読み込み時に実行
window.addEventListener('load', loadCSV);

// ページ読み込み時に実行
window.addEventListener('load', loadCSV);

// ガチャ処理（アラート部分を調整）
gachaBtn.addEventListener("click", () => {
  if (drinks.length === 0 || foods.length === 0) {
    alert("メニュー読み込み中です... 少し待ってからもう一度ガチャを押してください！");
    return;
  }

  let bestSelected = [];
  let bestTotal = 0;
  const trials = 20;  // 試行回数（20回でだいたい900円以上になることが多い。増やしてもOK）

  for (let t = 0; t < trials; t++) {
    let selected = [];
    let total = 0;

    // ドリンク1杯（ガードなしでそのままランダム）
    const drinkIndex = Math.floor(Math.random() * drinks.length);
    const selectedDrink = drinks[drinkIndex];
    selected.push(selectedDrink);
    total += selectedDrink.price;

    // 食べ物を次々追加（合計1000円を超えないように）
    while (true) {
      const foodIndex = Math.floor(Math.random() * foods.length);
      const item = foods[foodIndex];

      if (total + item.price > 1000) break;

      selected.push(item);
      total += item.price;

      if (selected.length > 30) break;  // 無限ループ防止
    }

    // 今までのベストより「1000円に近い」または「より高い」なら更新
    // （同じ距離なら高い方を優先）
    if (Math.abs(1000 - total) < Math.abs(1000 - bestTotal) || 
        (Math.abs(1000 - total) === Math.abs(1000 - bestTotal) && total > bestTotal)) {
      bestSelected = [...selected];
      bestTotal = total;
    }
  }

  // ベストの結果を表示
  menuList.innerHTML = "";
  bestSelected.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ${item.price}円`;
    menuList.appendChild(li);
  });

  totalEl.textContent = `合計: ${bestTotal}円`;
});