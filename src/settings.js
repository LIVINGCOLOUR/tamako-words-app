(function () {
  const ALL_CATEGORY_VALUE = "ランダム";
  const STORAGE_KEY = "tamako_english_auto_level_review_v1";
  const MAX_LEVEL = 6;
  const MAX_SCORE_DISPLAY = 20;
  const LEARN_STREAK = 3;
  const LEVEL_UP_RATE = 0.8;
  const LEVEL_LABELS = {1:"とてもかんたん",2:"かんたん",3:"ふつう",4:"ちょっとむずかしい",5:"むずかしい",6:"ちゅうがく かんせい"};
  const CATEGORY_ORDER = ["すうじ","いろ","くだもの","どうぶつ","かぞく","からだ","たべもの","のみもの","もの","ばしょ","のりもの","うごき","ようす","きもち","ようび","つき","じかん","てんき","しぜん","がっこう","いえ","ひと","しごと","まち","スポーツ","ふく","ことば","つなぎことば"];
  const PRONUNCIATION_OPTIONS = [{value:"native",label:"ほんかく"},{value:"slow",label:"ちょっとほんかく"},{value:"kana",label:"ふつう"}];
  const TIME_OPTIONS = [{value:5,label:"5びょう"},{value:10,label:"10びょう"},{value:15,label:"15びょう"},{value:0,label:"なし"}];
  const QUESTION_OPTIONS = [{value:5,label:"5もん"},{value:10,label:"10もん"},{value:20,label:"20もん"}];
  const DEFAULT_SETTINGS = {pronunciation:"kana",timeLimit:10,questionCount:20};
  window.TamakoSettings = Object.freeze({ALL_CATEGORY_VALUE,STORAGE_KEY,MAX_LEVEL,MAX_SCORE_DISPLAY,LEARN_STREAK,LEVEL_UP_RATE,LEVEL_LABELS,CATEGORY_ORDER,PRONUNCIATION_OPTIONS,TIME_OPTIONS,QUESTION_OPTIONS,DEFAULT_SETTINGS});
})();
