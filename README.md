# たまこさんのえいご

知的障害・発達特性・学習が苦手な子ども／若者が、英単語をむりなくくり返し練習するための静的Webアプリです。
現行機能を保ったまま、HTML内にまとまっていたCSS/JavaScript/データを分割しています。

## 起動方法

`index.html` をブラウザで直接開けます。語彙データは `src/data/words_en.js` のフォールバックでも読み込まれるため、ローカルファイルでも大きく崩れません。

ローカルHTTPサーバーで確認する場合:

```powershell
cd <このフォルダのパス>
powershell -ExecutionPolicy Bypass -File .\tools\serve-static.ps1
```

表示されたURLをブラウザで開きます。

## Netlifyデプロイ

ビルドコマンドは不要です。配布時は `dist_tamako_words_app_20260530` フォルダ全体をNetlifyのDeploys画面へドラッグ＆ドロップすれば、本番サイトを上書きデプロイできます。

## 保存キー

変更していません。

```text
tamako_english_auto_level_review_v1
```

同じ端末・同じブラウザ・同じURLなら、既存進捗を引き継げます。

## 構成

```text
index.html
src/app.js
src/state.js
src/quiz.js
src/audio.js
src/stickers.js
src/supportStamps.js
src/settings.js
src/styles.css
src/data/words_en.json
src/data/words_en.js
src/data/words_ja_life.json
assets/logo/
assets/stickers/
assets/pinpon.wav
CHANGELOG.md
```

## 維持している仕様

- localStorageで進捗保存
- 英単語モード、3択クイズ、レベル1〜6
- 80%以上で自動レベルアップ
- 連続3回正解で「おぼえた」
- 間違えると連続正解数リセット
- おぼえた単語は通常出題しない
- 復習対象があるときだけ「ふくしゅう」を表示
- 発音、時間、問題数の設定保存
- 女性音声優先
- 通常シール、レベルアップ特別シール
- レベルアップ時は通常シールをリセットし、特別シールは残す

## 安定版メモ

2026-05-30時点で、リファクタリング版を安定版として確定しています。

- リファクタリング完了
- Chrome動作確認済み
- iPhone Safari実機確認済み
- クイズ画面の「やめる」ボタンはfixed解除済み
- localStorageキー変更なし
- Netlify本番上書き可能

## おうえんスタンプMVP

設定画面で写真を1枚登録できます。写真は最大512px程度に縮小し、JPEG品質0.75前後で、この端末のlocalStorageにだけ保存します。サーバー送信、クラウド保存、複数人登録、AIイラスト化は行いません。

- 写真未設定: 既存のもんちゃん通常シール／特別シールを表示
- 写真設定あり: 通常シール表示を写真ベースのおうえんスタンプに差し替え
- 写真設定ありのレベルアップ時: 同じ写真を使った特別おうえんスタンプに差し替え
- 写真削除後: 既存のもんちゃんシール表示に戻る
- シール獲得ロジック、通常シールのリセット、特別シール保持は変更なし

保存キーは変更していません。`state.supportStamp` に次の形式で保存します。

```json
{
  "version": 1,
  "photoDataUrl": "",
  "updatedAt": ""
}
```
## 将来拡張

日本語生活ことばモードは `src/data/words_ja_life.json` を追加していく想定です。
親・先生・支援者による応援シール生成は、`src/stickers.js` に生成元を差し替える入口を追加しやすい構成にしています。




