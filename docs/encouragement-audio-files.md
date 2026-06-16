# おうえん音声ファイル一覧

終了時と復習完了時の固定文言を、事前生成した音声ファイルとして再生するための一覧です。

今回のPoCではリアルタイムTTS APIは使わず、音声ファイルが配置されていればそれを再生し、未配置または再生失敗時はWeb Speech API fallbackで同じ文言を読み上げます。

## ブラウザ録音ツール

ローカル作業用の録音ページがあります。

```text
tools/encouragement-recorder.html
```

このページをブラウザで開くと、15文言を1つずつ録音し、`finish-01.webm` などのファイル名でダウンロードできます。録音にはブラウザのMediaRecorderを使います。

録音したWebMファイルは、以下に配置してください。

```text
assets/voices/encouragement/
```

mp3にしたい場合は、あとでWebMからmp3へ変換してもよいです。

## 配置場所

音声ファイルは以下に配置します。

```text
assets/voices/encouragement/
```

## 通常終了時

| WebMファイル | mp3ファイル | 文言 |
| --- | --- | --- |
| `assets/voices/encouragement/finish-01.webm` | `assets/voices/encouragement/finish-01.mp3` | きょうもできたね |
| `assets/voices/encouragement/finish-02.webm` | `assets/voices/encouragement/finish-02.mp3` | よくがんばったね |
| `assets/voices/encouragement/finish-03.webm` | `assets/voices/encouragement/finish-03.mp3` | さいごまでできたね |
| `assets/voices/encouragement/finish-04.webm` | `assets/voices/encouragement/finish-04.mp3` | またやろうね |
| `assets/voices/encouragement/finish-05.webm` | `assets/voices/encouragement/finish-05.mp3` | いいちょうしだね |
| `assets/voices/encouragement/finish-06.webm` | `assets/voices/encouragement/finish-06.mp3` | すごいね |
| `assets/voices/encouragement/finish-07.webm` | `assets/voices/encouragement/finish-07.mp3` | えらかったね |
| `assets/voices/encouragement/finish-08.webm` | `assets/voices/encouragement/finish-08.mp3` | ひとつずつできてるよ |
| `assets/voices/encouragement/finish-09.webm` | `assets/voices/encouragement/finish-09.mp3` | つづけていてすごいね |
| `assets/voices/encouragement/finish-10.webm` | `assets/voices/encouragement/finish-10.mp3` | きょうもありがとう |

## 復習完了時

| WebMファイル | mp3ファイル | 文言 |
| --- | --- | --- |
| `assets/voices/encouragement/review-01.webm` | `assets/voices/encouragement/review-01.mp3` | ふくしゅうできたね |
| `assets/voices/encouragement/review-02.webm` | `assets/voices/encouragement/review-02.mp3` | よくおぼえていたね |
| `assets/voices/encouragement/review-03.webm` | `assets/voices/encouragement/review-03.mp3` | もういちどできてすごいね |
| `assets/voices/encouragement/review-04.webm` | `assets/voices/encouragement/review-04.mp3` | だいじょうぶ、できてるよ |
| `assets/voices/encouragement/review-05.webm` | `assets/voices/encouragement/review-05.mp3` | またいっしょにやろうね |

## fallback仕様

- `supportVoiceUsage.encouragement` が `true` のときだけ再生を試します。
- まず対象文言に対応するWebMを再生します。
- WebMが未配置、読み込み失敗、再生失敗の場合はmp3を試します。
- mp3も未配置、読み込み失敗、再生失敗の場合は、同じ文言をWeb Speech APIで読み上げます。
- `supportVoiceUsage.encouragement` が `false` のときは、WebM再生、mp3再生、Web Speech API読み上げのどれもしません。
- 正解時・不正解時には、このおうえん音声は再生しません。

## 作成方針

将来、本人が安心できる人の声で、この15ファイルだけを作れば運用できます。リアルタイムTTS APIを呼ばないため、APIキー管理、通信失敗、継続的なTTS費用を避けやすくなります。

すきな人の声を使う場合は、話者本人の同意が必要です。保護者・家族・支援者の声を勝手に登録しないでください。本人が安心して聞ける声だけを使います。

録音音声をlocalStorageに保存しない方針は維持します。音声ファイルは、同意を得て作成した固定ファイルとして `assets/voices/encouragement/` に配置します。
