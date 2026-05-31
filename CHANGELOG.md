# CHANGELOG

## 2026-05-30

- 現行機能を維持したまま、HTML内のCSS/JavaScript/語彙データを分割
- `src/state.js` にlocalStorage読み書きと安全な正規化処理を集約
- `src/quiz.js` にレベル、復習、3択生成、レベルアップ判定を集約
- `src/audio.js` に女性音声優先の読み上げと正解音を集約
- `src/stickers.js` に通常シールと特別シール処理を集約
- 英単語データを将来の日本語生活ことばモードと共存しやすい新形式へ変換
- 保存キー `tamako_english_auto_level_review_v1` は変更なし
- Netlify向けにビルド不要の静的構成を維持
- リファクタリング完了版を安定版として確定
- Chromeで動作確認済み
- iPhone Safari実機で動作確認済み
- クイズ画面の「やめる」ボタンのfixed配置を解除し、3択の下へ通常配置
- 保存キー `tamako_english_auto_level_review_v1` は変更なし
- 配布用distはNetlify本番上書き可能
## 2026-05-30 おうえんスタンプMVP

- `src/supportStamps.js` を追加
- 設定画面に写真1枚の登録、プレビュー、削除を追加
- 写真は最大512px程度へ縮小し、JPEG品質0.75前後で端末内localStorageへ保存
- 写真設定ありの場合、通常シール／レベルアップ特別シールの表示だけを写真ベースのおうえんスタンプへ差し替え
- 写真未設定または削除後は既存のもんちゃんシール表示に戻る
- 既存の `state.stickers` / `state.specialStickers` の獲得・保持・リセット仕様は変更なし
- 保存キー `tamako_english_auto_level_review_v1` は変更なし
## 2026-05-30 おうえんスタンプ削除修正

- 「けす」押下時に `state.supportStamp.photoDataUrl` を空文字へ更新
- 「けす」押下時に `state.supportStamp.updatedAt` を更新して即保存
- 写真あり判定を `photoDataUrl` が空でないかどうかに統一
- 写真削除直後に設定画面のプレビューを消し、写真なし状態として再読み込み
- `supportStamp.enabled` のような別フラグがあっても、空の `photoDataUrl` を優先してもんちゃんシールへ戻す
- 保存キー `tamako_english_auto_level_review_v1` は変更なし
## 2026-05-31 応募向けREADME改善

- README冒頭を、Singularity Society BootCamp / Vibe Coding応募時にプロダクト価値が伝わる構成へ整理
- 開発背景、対象ユーザー、おうえんスタンプ、実装状況、今後の予定を追記
- デモURL、技術構成、起動方法、保存キー情報を整理
- アプリ本体のコード、既存機能、保存データ、localStorageキーは変更なし

