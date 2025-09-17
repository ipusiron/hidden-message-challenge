# Technical Implementation Notes

本ドキュメントは、Hidden Message Challenge の複雑な処理、技巧的な実装、コアアルゴリズムなど、開発者が理解しておくべき技術的詳細をまとめています。

## 🎭 ステンシル機能の複雑な実装

### 二重レイヤーシステム
ステンシル機能では、視覚的なオーバーレイ効果を実現するために独立した二重レイヤーシステムを採用：

```javascript
// 背景レイヤー（暗号文グリッド）
const baseGrid = document.createElement('div');
baseGrid.style.zIndex = '1';

// 前景レイヤー（ステンシルオーバーレイ）
const stencilOverlay = document.createElement('div');
stencilOverlay.style.zIndex = '2';
stencilOverlay.style.pointerEvents = 'none';
```

**技術的ポイント:**
- `pointerEvents: 'none'` により、オーバーレイが下層のクリックイベントを阻害しない
- 各セルは44px固定サイズで、位置計算の一貫性を保つ
- `transformOrigin: 'center center'` により、回転の中心点を固定

### 座標変換とマトリクス計算
ステンシルの移動・回転では、複雑な座標変換を実装：

```javascript
// 回転と平行移動を組み合わせたCSS transform
stencilOverlay.style.transform =
    `translate(-50%, -50%) translate(${this.stencilPosition.x * 44}px, ${this.stencilPosition.y * 44}px) rotate(${this.rotation}deg)`;
```

**アルゴリズムの詳細:**
1. 初期位置を中央に設定 (`translate(-50%, -50%)`)
2. グリッド単位での微調整 (`translate(x*44px, y*44px)`)
3. 中心点での回転変換 (`rotate(deg)`)

## 📊 レーダーチャート描画の数学的実装

### 極座標系による描画
Canvas上でのレーダーチャートは、極座標系の数学的変換を活用：

```javascript
const angleStep = (Math.PI * 2) / data.length;  // 各軸の角度間隔

// 極座標から直交座標への変換
const angle = angleStep * i - Math.PI / 2;      // 12時方向を0度とする
const x = this.centerX + Math.cos(angle) * levelRadius;
const y = this.centerY + Math.sin(angle) * levelRadius;
```

**数学的概念:**
- `Math.PI / 2` のオフセットにより、12時方向（上）を起点に設定
- `Math.cos(angle)` でX座標、`Math.sin(angle)` でY座標を計算
- 5段階のレベル表示で視覚的な評価軸を提供

### グリッド描画の最適化
同心円と放射線を効率的に描画するアルゴリズム：

```javascript
// 同心円の描画（5レベル）
for (let level = 1; level <= this.levels; level++) {
    const levelRadius = (this.radius / this.levels) * level;
    // 各レベルでの円周描画
}

// 軸線の描画（データ数に応じて動的）
for (let i = 0; i < dataCount; i++) {
    // 中心から外周への直線描画
}
```

## 🧮 文字列処理の高度なアルゴリズム

### Unicode範囲を活用したひらがな・カタカナ変換
日本語特有の文字変換を効率的に実装：

```javascript
// ひらがな → カタカナ変換
hiraganaToKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, (match) => {
        const chr = match.charCodeAt(0) + 0x60;  // Unicode値+96
        return String.fromCharCode(chr);
    });
}
```

**技術的詳細:**
- `\u3041-\u3096`: ひらがなのUnicode範囲
- `0x60` (96): ひらがな・カタカナ間のUnicodeオフセット
- 正規表現による一括変換で高いパフォーマンスを実現

### 入力正規化の多段階処理
ユーザー入力の柔軟な受け入れを実現：

```javascript
normalizeString(str) {
    return str
        .trim()                    // 前後空白除去
        .toLowerCase()             // 小文字統一
        .replace(/[ー]/g, '')      // 長音符除去
        .replace(/\s/g, '');       // 全空白文字除去
}
```

## 💾 状態管理の設計パターン

### LocalStorage抽象化レイヤー
データ永続化の一貫性を保つため、Storageクラスで抽象化：

```javascript
// キー命名規則の統一化
const key = `${this.prefix}${challengeName}_${dataType}`;

// JSONシリアライゼーションの自動化
saveProgress(challengeName, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
```

**設計思想:**
- プレフィックス `hiddenMessage_` による名前空間の分離
- 自動JSON変換によるオブジェクト保存の簡素化
- 型安全性を保つためのnullチェック

### 進捗状態の複合データ構造
各チャレンジの進捗を効率的に管理：

```javascript
// 完了問題と不正解問題を独立して管理
const completedProblems = [];    // [0, 2, 4] - インデックス配列
const incorrectProblems = [];    // [1, 3] - 失敗したインデックス

// 三状態システム: 未回答・正解・不正解
const statusClass = isCompleted ? 'completed' :
                   isIncorrect ? 'incorrect' : 'pending';
```

## 🎨 動的UI生成の技術パターン

### プログレスドット生成の柔軟性
配列型と数値型の両パラメーターに対応する汎用関数：

```javascript
createProgressDots(completedParam, total, challengeName = '', currentIndex = 0, incorrectIndices = []) {
    // 型判定による分岐処理
    const completedIndices = Array.isArray(completedParam) ? completedParam : [];
    const isCompleted = Array.isArray(completedParam) ?
        completedIndices.includes(i) :
        i < completedCount;
}
```

**設計の利点:**
- 結果表示（配列）と進行中表示（数値）の両方に対応
- クリック可能/不可能の状態を動的制御
- HTMLテンプレート生成による高速描画

### イベント委譲パターン
大量の動的要素に対する効率的なイベント管理：

```javascript
// 親要素で一括してイベントを捕捉
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('progress-dot') && e.target.dataset.challenge) {
        const challengeName = e.target.dataset.challenge;
        const index = parseInt(e.target.dataset.index);
        // 動的生成された要素のクリック処理
    }
});
```

## ⚡ パフォーマンス最適化

### データ遅延読み込み
大容量のチャレンジデータを効率的に管理：

```javascript
// 初回アクセス時のみデータ読み込み
async loadProgress() {
    if (!this.dataLoaded) {
        const challengeData = await dataLoader.loadChallengeData();
        this.challenges = challengeData.headline;
        this.dataLoaded = true;
    }
}
```

### Canvas描画の最適化
レーダーチャートの高速描画技術：

```javascript
// 描画前のクリアと座標計算の最適化
this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
const angleStep = (Math.PI * 2) / data.length;  // 事前計算
```

## 🔒 セキュリティ考慮事項

### XSS対策
動的なHTML生成における安全性確保：

```javascript
// textContentによる安全な文字設定
td.textContent = char;  // innerHTML ではなく textContent を使用

// dataset による安全な属性設定
td.dataset.x = x;
td.dataset.y = y;
```

### 入力検証
ユーザー入力の適切な処理：

```javascript
// 正規化による統一化（XSS防止効果も含む）
const normalizedUser = this.normalizeString(this.katakanaToHiragana(userAnswer));
```

---

これらの技術的詳細は、本ツールの教育的価値と高いユーザー体験を支える重要な実装基盤となっています。