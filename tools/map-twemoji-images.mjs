import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TWEMOJI_VERSION = "14.0.2";
const TWEMOJI_SOURCE = `https://cdn.jsdelivr.net/gh/twitter/twemoji@${TWEMOJI_VERSION}/assets/72x72`;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CARD_DIR = path.join(ROOT, "assets", "cards", "twemoji");
const UNMAPPED_DOC = path.join(ROOT, "docs", "unmapped-word-images.md");

const SAFE_EN_WORDS = new Set([
  "zero","one","two","three","four","five","six","seven","eight","nine","ten",
  "red","blue","green","yellow","white","black","orange","purple","brown",
  "apple","banana","grape","peach","melon","lemon","strawberry",
  "dog","cat","bird","fish","cow","horse","pig","rabbit","mouse","lion","tiger","bear",
  "father","mother","brother","sister","baby","family",
  "face","eye","ear","nose","mouth","hand","foot",
  "rice","bread","egg","cake","meat","salad","water","milk","juice",
  "book","pen","bag","chair","ball",
  "school","home","shop","station",
  "car","bus","train","bike","plane",
  "run","walk","eat","drink","sleep",
  "hot","cold","happy","sad","angry","hungry",
  "sunny","rainy","cloudy","snowy","sun","moon","star","sky","sea","river","mountain","tree","flower",
  "teacher","student","Japanese","math","music","art","science",
  "kitchen","bath","bed","door","window","sofa",
  "read","write","listen","speak","sing","dance","swim","study",
  "good","bad","fast","slow",
  "man","woman","boy","girl","child","people",
  "doctor","nurse","police officer","firefighter","cook","farmer","driver","singer",
  "city","town","street","road","hospital","library","restaurant","supermarket","bank","post office",
  "soccer","baseball","tennis","basketball","volleyball","running","skiing",
  "shirt","pants","skirt","shoes","cap","coat","socks",
  "breakfast","lunch","dinner","vegetable","potato","tomato","carrot","onion","chicken","beef","cheese","tea","coffee","soup",
  "call","stop","wait","work","learn","teach",
  "morning","evening","night","spring","summer","fall","winter",
  "strong","quiet","sick","tired","ready","right","wrong",
  "clean","wash","cut","draw","paint","send","receive","meet","drive","ride","win","lose",
  "excited","worried","surprised","bored","lonely","glad",
  "letter","email","message","Internet","machine",
  "afraid","dangerous","correct",
  "travel"
]);

const SAFE_JA_IDS = new Set(["ja_life_hello_1", "ja_life_water_2", "ja_life_toilet_3"]);

const EMOJI_OVERRIDES = {
  en_apple_32: "🍎",
  en_dog_40: "🐶",
  en_bus_87: "🚌",
  ja_life_hello_1: "☀️",
  ja_life_water_2: "💧",
  ja_life_toilet_3: "🚻"
};

const FILE_OVERRIDES = {
  en_orange_29: "orange-color.png",
  en_orange_34: "orange-fruit.png",
  en_cook_191: "cook-person.png",
  en_cook_364: "cook-action.png",
  en_running_211: "running-sport.png",
  en_letter_321: "letter-mail.png",
  ja_life_hello_1: "hello.png",
  ja_life_water_2: "water.png",
  ja_life_toilet_3: "toilet.png"
};

const FUTURE_IDEAS = {
  "つなぎことば": "2つの場面を矢印でつなぐ専用イラスト",
  "じかん": "日付や時間の違いが分かる教材用カレンダー図",
  "うごき": "具体的な人物動作を1場面で示す専用イラスト",
  "ようす": "状態の違いを比較できるシンプル図",
  "ことば": "語の意味を示す教材用アイコン",
  "ばしょ": "場所の外観を単純化した専用イラスト",
  "もの": "対象物だけを中央に置いた専用イラスト"
};

function readJson(file) {
  return fs.readFile(file, "utf8").then((text) => JSON.parse(text.replace(/^\uFEFF/, "")));
}

function stableStringify(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function prompt(word) {
  return String(word.promptText || word.word || word.legacyKey || word.id || "");
}

function isEmojiValue(value) {
  const text = String(value || "").trim();
  return text && !/^assets\//.test(text);
}

function existingOpenMojiPath(word) {
  const image = String(word.image || "");
  return /^assets\/cards\/openmoji\//.test(image) ? image : "";
}

function slug(value) {
  const ascii = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || "word";
}

function twemojiFilename(word) {
  if (FILE_OVERRIDES[word.id]) return FILE_OVERRIDES[word.id];
  return `${slug(prompt(word))}.png`;
}

function twemojiPath(word) {
  return `assets/cards/twemoji/${twemojiFilename(word)}`;
}

function emojiFor(word) {
  if (EMOJI_OVERRIDES[word.id]) return EMOJI_OVERRIDES[word.id];
  if (isEmojiValue(word.emoji)) return String(word.emoji).trim();
  if (isEmojiValue(word.image)) return String(word.image).trim();
  return "";
}

function isSafeEnglish(word) {
  if (!SAFE_EN_WORDS.has(prompt(word))) return false;
  if (prompt(word) === "orange") return word.id === "en_orange_29" || word.id === "en_orange_34";
  if (prompt(word) === "cook") return word.id === "en_cook_191" || word.id === "en_cook_364";
  return true;
}

function codePointParts(emoji, keepVariationSelectors) {
  const parts = [];
  for (const char of emoji) {
    const code = char.codePointAt(0);
    if (!keepVariationSelectors && code === 0xfe0f) continue;
    parts.push(code.toString(16));
  }
  return parts.join("-");
}

function codePointCandidates(emoji) {
  const candidates = [];
  const hasJoiner = emoji.includes("\u200d");
  if (hasJoiner) candidates.push(codePointParts(emoji, true));
  candidates.push(codePointParts(emoji, false));
  return [...new Set(candidates.filter(Boolean))];
}

async function downloadTwemoji(emoji, outPath) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  try {
    await fs.access(outPath);
    return { ok: true, cached: true };
  } catch {}
  const errors = [];
  for (const code of codePointCandidates(emoji)) {
    const url = `${TWEMOJI_SOURCE}/${code}.png`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        errors.push(`${response.status} ${url}`);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(outPath, buffer);
      return { ok: true, cached: false, url };
    } catch (error) {
      errors.push(`${error.message} ${url}`);
    }
  }
  return { ok: false, errors };
}

function reasonFor(word) {
  const category = String(word.category || "");
  if (category === "つなぎことば") return "つなぎことば・関係語で、単体のTwemojiでは意味がずれやすい";
  if (category === "じかん" || category === "ようび" || category === "つき") return "時間概念で、カレンダー等だけでは語の違いが伝わりにくい";
  if (category === "うごき") return "広い動詞で、Twemojiだけだと動作の意味が限定されやすい";
  if (category === "ようす") return "抽象的な状態で、記号だけでは誤解が出やすい";
  if (category === "ことば") return "抽象語・機能語で、Twemoji/OpenMojiだけでは意味が曖昧になりやすい";
  return "Twemojiで自然に表現できる絵が見つからない";
}

function futureIdeaFor(word) {
  return FUTURE_IDEAS[String(word.category || "")] || "対象語に合わせた情報量の少ない専用イラスト";
}

function cleanWord(word, { image, emoji, imageAlt }) {
  const next = { ...word };
  delete next.image;
  delete next.emoji;
  delete next.imageAlt;
  if (emoji) next.emoji = emoji;
  if (image) next.image = image;
  if (imageAlt) next.imageAlt = imageAlt;
  return next;
}

function altFor(word) {
  return `${String(word.answerText || word.ja || prompt(word))}の絵カード`;
}

async function processWords(words, kind, unmapped, stats) {
  const updated = [];
  for (const word of words) {
    const openmoji = existingOpenMojiPath(word);
    const safe = kind === "ja" ? SAFE_JA_IDS.has(word.id) : isSafeEnglish(word);
    const emoji = emojiFor(word);
    if (safe && emoji) {
      const image = twemojiPath(word);
      const outPath = path.join(ROOT, image);
      const downloaded = await downloadTwemoji(emoji, outPath);
      if (downloaded.ok) {
        stats.twemoji += 1;
        updated.push(cleanWord(word, { image, emoji, imageAlt: altFor(word) }));
        continue;
      }
      unmapped.push({ word, status: "unmapped", reason: `Twemoji画像の取得に失敗: ${downloaded.errors.join("; ")}`, future: futureIdeaFor(word) });
      updated.push(cleanWord(word, {}));
      continue;
    }
    if (openmoji) {
      stats.openmoji += 1;
      unmapped.push({ word, status: "openmoji_kept", reason: "既存OpenMoji画像が設定済みのため維持", future: "-" });
      updated.push(cleanWord(word, { image: openmoji, emoji, imageAlt: word.imageAlt || altFor(word) }));
      continue;
    }
    stats.unmapped += 1;
    unmapped.push({ word, status: "unmapped", reason: reasonFor(word), future: futureIdeaFor(word) });
    updated.push(cleanWord(word, {}));
  }
  return updated;
}

function escapeCell(value) {
  return String(value || "-").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function makeUnmappedDoc(rows, stats) {
  const lines = [
    "# 単語画像 未対応リスト",
    "",
    "Twemojiで意味が明確に表現できる単語は `assets/cards/twemoji/` に画像を配置しています。",
    "Twemojiでは意味がずれやすく、既存OpenMoji画像もない単語は無理に画像を付けず、このリストに残します。",
    "",
    "## 集計",
    "",
    `- Twemojiに更新: ${stats.twemoji}語`,
    `- OpenMojiのまま維持: ${stats.openmoji}語`,
    `- 未対応: ${stats.unmapped}語`,
    "",
    "## 一覧",
    "",
    "| id | word | ja | level | category | status | reason | future image idea |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |"
  ];
  rows.forEach(({ word, status, reason, future }) => {
    lines.push(`| ${escapeCell(word.id)} | ${escapeCell(prompt(word))} | ${escapeCell(word.answerText || word.ja)} | ${escapeCell(word.level)} | ${escapeCell(word.category)} | ${escapeCell(status)} | ${escapeCell(reason)} | ${escapeCell(future)} |`);
  });
  lines.push("");
  return lines.join("\n");
}

async function removeGeneratedSamples() {
  const sampleFiles = ["apple.png", "bus.png", "dog.png", "hello.png", "water.png", "toilet.png"];
  for (const file of sampleFiles) {
    const full = path.join(ROOT, "assets", "cards", file);
    try {
      await fs.unlink(full);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

async function main() {
  const enPath = path.join(ROOT, "src", "data", "words_en.json");
  const jaPath = path.join(ROOT, "src", "data", "words_ja_life.json");
  const enJsPath = path.join(ROOT, "src", "data", "words_en.js");
  const enWords = await readJson(enPath);
  const jaWords = await readJson(jaPath);
  const stats = { twemoji: 0, openmoji: 0, unmapped: 0 };
  const unmapped = [];

  await removeGeneratedSamples();
  const updatedEn = await processWords(enWords, "en", unmapped, stats);
  const updatedJa = await processWords(jaWords, "ja", unmapped, stats);
  await fs.mkdir(path.dirname(UNMAPPED_DOC), { recursive: true });
  await fs.writeFile(enPath, stableStringify(updatedEn), "utf8");
  await fs.writeFile(jaPath, stableStringify(updatedJa), "utf8");
  await fs.writeFile(enJsPath, `window.TAMAKO_WORDS_EN=${JSON.stringify(updatedEn)};\n`, "utf8");
  await fs.writeFile(UNMAPPED_DOC, makeUnmappedDoc(unmapped, stats), "utf8");
  console.log(JSON.stringify(stats, null, 2));
  console.log(`Twemoji source: ${TWEMOJI_SOURCE}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
