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

## 問題データの追加・差し替え

問題データは **`content/questions.json`** のみに定義します。ページやコンポーネントへのハードコードは不要です。

### スキーマ

```json
{
  "exam": "CAD利用技術者試験 2次元2級",
  "categories": [
    {
      "id": "cad-system",
      "name": "CADシステムと周辺知識",
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

## Google AdSense

各ページ上部・下部に `src/components/AdSlot.astro` を配置しています。以下の環境変数をビルド時に設定すると、AdSense広告タグ（`adsbygoogle.js` ローダーと `<ins>` タグ）が自動で出力されます。

```
PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
PUBLIC_ADSENSE_SLOT_TOP=1234567890
PUBLIC_ADSENSE_SLOT_BOTTOM=0987654321
```

- 未設定時：本番ビルドでは広告枠は出力されません（`npm run dev` 中はプレースホルダーを表示）。
- GitHub Actions で使う場合は Repository の **Settings > Secrets and variables > Actions > Variables** に上記名の変数を追加し、`deploy.yml` の `env:` で渡してください。
- AdSense ポリシーに従い、回答ボタンやコンテンツと広告を見分けにくい配置は避けてください。

## SNSシェア

フッターに X (旧Twitter) へのシェアボタンを設置しています。クイズ完了画面では「結果をXでシェア」ボタン（正答率付きツイート）も表示されます。

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
