# cad-pages

CAD利用技術者試験 2次元2級向けの「無料・スマホ対応・過去問道場型」演習Webアプリの初期実装です。  
GitHub Pages のみで公開し、学習履歴は localStorage に保存します。

## 技術スタック

- Astro (静的サイト生成)
- バニラ JavaScript
- localStorage (ブラウザ内保存)

## 公開URL

- https://melos9.github.io/cad-pages/

## ローカル開発

```bash
npm install
npm run dev
npm run build
```

`npm run build` で `dist/` に静的ファイルが出力されます。

## ページ構成

- `/` トップ
- `/quiz/[category]/` 分野別演習
- `/review/` 復習モード(誤答のみ)
- `/stats/` 学習ダッシュボード
- `/guide/` 試験概要
- `/guide/study-method/` 勉強法
- `/guide/exam-date/` 試験日程・申込方法

## 問題データの追加・差し替え

問題データは **`content/questions.json`** のみに定義します。ページやコンポーネントへのハードコードは不要です。

### スキーマ

```json
{
  "exam": "CAD利用技術者試験 2次元2級",
  "categories": [
    {
      "id": "cad-general",
      "name": "CAD一般知識",
      "questions": [
        {
          "id": "q001",
          "text": "問題文(ダミー)",
          "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
          "answer": 0,
          "explanation": "解説(ダミー)"
        }
      ]
    }
  ]
}
```

## AdSense プレースホルダー

各ページ上部・下部に `src/components/AdSlot.astro` を配置しています。  
現在は `<!-- ADSENSE_SLOT -->` コメント入りの空 `div` のみです。

実運用時は `AdSlot.astro` に AdSense タグを差し込んでください(回答ボタン周辺には配置しないこと)。

## GitHub Pages デプロイ

`.github/workflows/deploy.yml` を用意しています。`main` への push で以下を実行します。

1. `npm ci`
2. `npm run build`
3. `dist/` を Pages artifact としてアップロード
4. `actions/deploy-pages` でデプロイ

### 初回有効化手順

1. GitHub リポジトリの **Settings** を開く
2. **Pages** を開く
3. **Source** を **GitHub Actions** に設定する

## 注意

- 問題は著作権配慮のためダミーのみ同梱しています。
- 本番運用時はオリジナル問題に差し替えてください。
