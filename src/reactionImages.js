(function () {
  const VERSION = "20260616";
  const BASE = "assets/reactions/";
  const REACTIONS = Object.freeze({
    correct: { src: BASE + "correct.png", alt: "せいかいのリアクション", fallback: "○" },
    incorrect: { src: BASE + "incorrect.png", alt: "もういちどのリアクション", fallback: "×" },
    levelUp: { src: BASE + "level-up.png", alt: "レベルアップのリアクション", fallback: "🌟" },
    reviewComplete: { src: BASE + "review-complete.png", alt: "ふくしゅう完了のリアクション", fallback: "🌸" },
    dailyComplete: { src: BASE + "daily-complete.png", alt: "今日のれんしゅう完了のリアクション", fallback: "☀️" },
    streak30: { src: BASE + "streak-30.png", alt: "30日連続達成のリアクション", fallback: "🏆" }
  });
  function get(type) {
    return REACTIONS[type] || null;
  }
  function src(type) {
    const item = get(type);
    return item && item.src ? item.src + "?v=" + VERSION : "";
  }
  function clear(container) {
    if (!container) return;
    container.innerHTML = "";
    container.classList.add("hide");
    container.classList.remove("hasReactionImage");
  }
  function fallback(container, item) {
    if (!container || !item) return;
    container.innerHTML = "";
    container.textContent = item.fallback || "";
    container.classList.remove("hide");
    container.classList.remove("hasReactionImage");
  }
  function render(container, type) {
    const item = get(type);
    clear(container);
    if (!container || !item) return false;
    const image = src(type);
    if (!image) {
      fallback(container, item);
      return false;
    }
    const img = document.createElement("img");
    img.src = image;
    img.alt = item.alt || "";
    img.decoding = "async";
    img.onload = () => {
      container.classList.remove("hide");
      container.classList.add("hasReactionImage");
    };
    img.onerror = () => fallback(container, item);
    container.appendChild(img);
    return true;
  }
  window.TamakoReactionImages = Object.freeze({ VERSION, REACTIONS, get, src, render, clear });
})();
