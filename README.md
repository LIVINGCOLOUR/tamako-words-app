# たまこさんのことばトレーニング

Demo: https://tamako-words-app.pages.dev

知的障害・発達特性・学習が苦手な子ども／若者向けの、絵・文字・音声・3択クイズでことばを練習できるWebアプリです。

## 開発の背景

このアプリは、友人であるダウン症の「たまこさん」から「英語を勉強したい」という話があったことをきっかけに作り始めました。

既存の英単語アプリにも良いものはたくさんありますが、漢字が読めない利用者や、文字情報が多い画面が苦手な利用者にとっては、操作や理解が難しい場合があります。そこで、画面の日本語表示をひらがな中心にし、本人が迷いにくい英単語学習Webアプリとして試作しました。

現在は、英単語を対象に、絵・文字・音声・3択クイズ・レベル制・復習機能を組み合わせて、無理なくくり返し練習できる形にしています。

## このアプリの特徴

- ひらがな中心の、読みやすい画面
- 絵・文字・音声を組み合わせた英単語練習
- 大きなボタンの3択クイズ
- レベル1〜6の自動レベル進行
- 覚えた単語は通常出題から外れる仕組み
- まちがえた・まだ覚えていない単語を練習しやすい復習機能
- 1端末1ユーザー想定のlocalStorage進捗保存
- 学習後のごほうびとして表示される「おうえんスタンプ」

## おうえんスタンプとは

「おうえんスタンプ」は、親・先生・支援者など、本人を応援する人の写真を1枚登録できる機能です。

写真を設定すると、学習後にもらえる通常シールやレベルアップ特別シールの代わりに、その写真を使ったスタンプが表示されます。本人が信頼している人から応援される体験を、学習を続けるためのうれしい報酬に変えることを目指しています。

- 写真未設定時は、デフォルトのもんちゃんシールを表示
- 写真設定時は、写真ベースのおうえんスタンプを表示
- レベルアップ時は、同じ写真を使った特別おうえんスタンプを表示
- 写真は端末内のlocalStorageに保存
- 写真はサーバーへ送信しません
- 初期MVPでは写真1枚のみ対応

## おうえんのこえ

「おうえんのこえ」は、本人が好きな人・信頼している人の声で応援される体験を、将来的に学習継続の支えにするための設定MVPです。

今回の無料MVPでは、ElevenLabs APIや外部サーバーへ録音音声を送信しません。ブラウザ上で録音・停止・試聴を行い、localStorageには録音データそのものではなく、同意済み・録音済みを示す `supportVoiceProfile` のメタ情報だけを保存します。

- 設定画面で「たんまつのこえ」と「すきな人のこえ」を選択できます
- 「すきな人のこえ」ではMediaRecorder APIでマイク録音できます
- 登録前に、録音される人の同意チェックが必要です
- 録音データ自体はlocalStorageに保存しません
- APIキー未設定でもアプリは止まりません
- 実際の読み上げは、無料MVPでは既存のWeb Speech APIへフォールバックします
- 将来ElevenLabs等を使う場合も、APIキーをフロントエンドに置かず、サーバー側で扱う想定です

保存されるメタ情報の例:

```json
{
  "supportVoiceProfile": {
    "provider": "elevenlabs",
    "type": "supporter_voice",
    "voiceId": null,
    "status": "recorded_local_only",
    "label": "すきな人のこえ",
    "speakerRole": "guardian",
    "speakerDisplayName": "",
    "speakerConsentChecked": true,
    "guardianConsentChecked": true,
    "createdAt": "2026-06-16T00:00:00+09:00"
  },
  "supportVoiceUsage": {
    "encouragement": true,
    "japaneseWords": true,
    "englishWords": false
  }
}
```

## 絵カード画像

単語ごとに、事前に用意した絵カード画像を表示できます。アプリ本体から画像生成APIや外部サーバーは呼び出さず、静的ファイルとして配置した画像だけを読み込みます。

単語データに `image` を追加すると、回答後の正解・不正解フィードバック画面で、その単語の絵カードを表示します。出題中は画像を表示しないため、学習者は画像ヒントではなく英単語を見て3択を選びます。

```json
{
  "id": "en_apple_32",
  "mode": "english",
  "level": 1,
  "category": "くだもの",
  "promptText": "apple",
  "reading": "アップル",
  "answerText": "りんご",
  "emoji": "🍎",
  "image": "assets/cards/twemoji/apple.png",
  "imageAlt": "りんごの絵カード",
  "audioText": "apple",
  "legacyKey": "apple"
}
```

- Twemoji画像は `assets/cards/twemoji/` 配下に置きます
- 既存OpenMoji画像を使う場合は `assets/cards/openmoji/` など既存配置を維持します
- `image` は任意項目です。未設定の単語は従来どおり文字中心で表示されます
- 既存の絵文字表示を残したい場合は `emoji` に入れます
- `imageAlt` には、読み上げや代替表示を意識した短い説明を入れます
- 推奨サイズは正方形または横長の `512px`〜`1024px` 程度です
- 形式は `png`, `jpg`, `jpeg`, `webp`, `gif`, `svg` を想定しています
- 画像の読み込みに失敗した場合は、画像枠を閉じて文字中心表示のまま学習を続けます
- 画像あり単語でも出題中は画像を表示せず、回答後の正解・不正解フィードバックでだけ同じ単語の絵カード画像を表示します
- 回答後のフィードバックは、画像、○または×、日本語、英語の順にシンプルに表示します

### 単語画像素材とライセンス

現在の単語画像は、短時間・低コストで分かりやすい絵カードを増やすため、主にTwemoji画像を利用しています。Twemojiで意味が曖昧になる単語には無理に画像を付けず、`docs/unmapped-word-images.md` に未対応語としてまとめています。

- Twemoji
  - 配置場所: `assets/cards/twemoji/`
  - 取得元: [`twitter/twemoji`](https://github.com/twitter/twemoji) v14.0.2 の `assets/72x72`
  - ライセンス: グラフィックは [CC-BY 4.0](https://github.com/twitter/twemoji/blob/master/LICENSE-GRAPHICS)、コードは [MIT License](https://github.com/twitter/twemoji/blob/master/LICENSE)
- OpenMoji
  - 配置場所: 既存画像がある場合は `assets/cards/openmoji/` などの既存配置を維持
  - 取得元: [`OpenMoji`](https://github.com/hfg-gmuend/openmoji)
  - ライセンス: [CC BY-SA 4.0](https://github.com/hfg-gmuend/openmoji/blob/master/LICENSE.txt)
  - 今回の更新時点では、既存OpenMoji画像の維持対象はありません

画像を差し替える場合は、画像ファイルを `assets/cards/twemoji/` または適切な素材別フォルダへ置き、単語データの `image` に相対パスを指定します。`image` がない単語は、文字中心の表示でそのまま動きます。

今回は処理時間短縮のため、GPT Image 2.0 などの画像生成APIは使っていません。将来的には、Twemoji / OpenMoji で表現しにくい重要語だけを、事前生成した専用画像で補う方針です。APIキーをフロントエンドに置く必要はありません。

## 現在の実装状況

- 英単語モード実装済み
- 英単語471語を収録
- 3択クイズ、レベル制、復習、成績、シール画面を実装
- 一部単語の絵カード画像表示に対応
- Twemoji優先の単語画像マッピングに対応
- おうえんのこえ無料MVPを実装
- おうえんスタンプMVPを実装
- iPhone Safari実機確認済み
- Chrome動作確認済み
- Cloudflare Pagesで公開済み
- ビルド不要の静的Webアプリとして動作
- 進捗と設定はlocalStorageへ保存

## 今後の予定

- 日本語の生活ことばモード
- あいさつ、気持ち、持ち物、場所、困ったときの表現の追加
- 支援者が使いやすい設定画面の改善
- 実利用者の反応を見ながら、問題数・表示・報酬体験を調整

## 技術構成

- 静的Webアプリ
- HTML / CSS / JavaScript
- Cloudflare Pages
- localStorage
- Web Speech API
- ビルドツール不要

## 開発・起動方法

`index.html` をブラウザで直接開けます。語彙データは `src/data/words_en.js` のフォールバックでも読み込まれるため、ローカルファイルでも大きく崩れません。

ローカルHTTPサーバーで確認する場合:

```powershell
cd <このフォルダのパス>
powershell -ExecutionPolicy Bypass -File .\tools\serve-static.ps1
```

表示されたURLをブラウザで開きます。

## デプロイ

ビルドコマンドは不要です。静的サイトとしてそのまま配置できます。

現在のデモはCloudflare Pagesで公開しています。

```text
https://tamako-words-app.pages.dev
```

## 保存キー

localStorageキーは変更していません。

```text
tamako_english_auto_level_review_v1
```

同じ端末・同じブラウザ・同じURLなら、既存進捗を引き継げます。

`state.supportStamp` は、おうえんスタンプ用に次の形式で保存します。

```json
{
  "version": 1,
  "photoDataUrl": "",
  "updatedAt": ""
}
```

`photoDataUrl` が空の場合は、写真未設定として扱い、既存のもんちゃんシールを表示します。

## 主な仕様

- localStorageで進捗保存
- 英単語モード、3択クイズ、レベル1〜6
- 80%以上で自動レベルアップ
- 連続3回正解で「おぼえた」
- 1回でも間違えると連続正解数リセット
- おぼえた単語は通常出題しない
- 復習対象があるときだけ「ふくしゅう」を表示
- 発音、時間、問題数の設定保存
- 女性音声優先
- 通常シール、レベルアップ特別シール
- レベルアップ時は通常シールをリセットし、特別シールは残す
- 写真設定時は、シール表示だけをおうえんスタンプへ差し替え

## ファイル構成

```text
index.html
src/app.js
src/state.js
src/quiz.js
src/audio.js
src/stickers.js
src/supportStamps.js
src/supportVoice.js
src/settings.js
src/styles.css
src/data/words_en.json
src/data/words_en.js
src/data/words_ja_life.json
assets/cards/
assets/cards/twemoji/
assets/logo/
assets/stickers/
assets/pinpon.wav
docs/unmapped-word-images.md
tools/map-twemoji-images.mjs
CHANGELOG.md
```

## 注意

このアプリは試作品です。実際に使う人の反応を見ながら、画面の分かりやすさ、練習量、報酬体験、支援者向け設定を少しずつ改善しています。

ElevenLabsなどの音声APIやGPT Imageなどの画像生成APIを将来使う場合は費用が発生する可能性があります。APIキーはフロントエンドやGitに置かず、必要になった段階でサーバー側に安全に分離してください。
