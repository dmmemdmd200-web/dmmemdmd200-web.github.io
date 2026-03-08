document.addEventListener("DOMContentLoaded", () => {
  setupI18nSwitch();
  setupPageLoader();
  setupScenarioCards();
  setupMoodSelector();
  setupStepTracker();
  setupMbtiLab();
  setupCareerMaze();
  setupCareerChatWidget();
});

let i18nScriptInjected = false;
function setupI18nSwitch() {
  const navLinks = document.querySelector(".ce-nav .ce-nav-links");
  if (!navLinks) return;
  const wrap = document.createElement("div");
  wrap.className = "ce-lang-switch";
  const btnTw = document.createElement("button");
  btnTw.className = "ce-lang-btn";
  btnTw.type = "button";
  btnTw.textContent = "繁";
  btnTw.dataset.lang = "zh-TW";
  const btnCn = document.createElement("button");
  btnCn.className = "ce-lang-btn";
  btnCn.type = "button";
  btnCn.textContent = "简";
  btnCn.dataset.lang = "zh-CN";
  wrap.appendChild(btnTw);
  wrap.appendChild(btnCn);
  navLinks.appendChild(wrap);
  const hidden = document.getElementById("google_translate_element") || document.createElement("div");
  hidden.id = "google_translate_element";
  hidden.style.position = "absolute";
  hidden.style.insetInlineStart = "-9999px";
  hidden.style.insetBlockStart = "0";
  document.body.appendChild(hidden);
  window.googleTranslateElementInit = function () {
    new window.google.translate.TranslateElement(
      { pageLanguage: "zh-TW", includedLanguages: "zh-TW,zh-CN", autoDisplay: false },
      "google_translate_element"
    );
    const saved = localStorage.getItem("site-lang");
    if (saved) applyLang(saved);
  };
  if (!i18nScriptInjected) {
    const s = document.createElement("script");
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(s);
    i18nScriptInjected = true;
  }
  [btnTw, btnCn].forEach(b => {
    b.addEventListener("click", () => {
      applyLang(b.dataset.lang);
    });
  });
  let saved = localStorage.getItem("site-lang");
  if (saved === "en") {
    saved = "zh-TW";
    localStorage.setItem("site-lang", saved);
  }
  highlightActiveLang(saved || "zh-TW");
  if (saved) applyLang(saved);
}

function highlightActiveLang(lang) {
  const buttons = document.querySelectorAll(".ce-lang-btn");
  buttons.forEach(btn => {
    if (btn instanceof HTMLButtonElement) {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    }
  });
}

function applyLang(lang) {
  localStorage.setItem("site-lang", lang);
  document.documentElement.setAttribute("lang", lang === "zh-CN" ? "zh-Hans" : lang === "zh-TW" ? "zh-Hant" : lang);
  highlightActiveLang(lang);
  const setSelect = () => {
    const combo = document.querySelector("select.goog-te-combo");
    if (combo) {
      if (combo.value !== lang) {
        combo.value = lang;
        combo.dispatchEvent(new Event("change"));
      }
      return true;
    }
    return false;
  };
  if (location.protocol === "file:" || !setSelect()) {
    let tries = 0;
    const timer = setInterval(() => {
      if (setSelect() || ++tries > 40) {
        clearInterval(timer);
      }
    }, 100);
  }
  translateStaticUI(lang);
  translatePerPage(lang);
  if (lang === "zh-CN") {
    ensureOpenCC().then(() => convertChineseOnPage("tw", "cn"));
  } else if (lang === "zh-TW") {
    ensureOpenCC().then(() => convertChineseOnPage("cn", "tw"));
  }
}

function setupPageLoader() {
  const loader = document.getElementById("pageLoader");
  if (!loader) return;

  // Hide loader shortly after page is ready
  window.setTimeout(() => {
    loader.classList.add("page-loader-hidden");
  }, 350);

  const internalLinks = document.querySelectorAll(
    'a[href$=".html"]:not([href^="http"])'
  );

  internalLinks.forEach(link => {
    link.addEventListener("click", event => {
      // 開新分頁或有修飾鍵時，維持預設行為
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const href = link.getAttribute("href");
      if (!href) return;

      event.preventDefault();
      loader.classList.remove("page-loader-hidden");

      window.setTimeout(() => {
        window.location.href = href;
      }, 200);
    });
  });
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function setAttr(selector, attr, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

const I18N = {
  en: {
    brand: "Career Navigation",
    nav_s1: "Confused",
    nav_map: "Next Steps Map",
    nav_lab: "Personality & Jobs",
    nav_maze: "Career Maze",
    nav_practice: "Interactive Practice",
    nav_refs: "References",
    loading: "Loading, please wait…"
  },
  "zh-CN": {
    brand: "职业导航",
    nav_s1: "迷惘",
    nav_map: "职业准备地图",
    nav_lab: "性格测验与职业库",
    nav_maze: "职业迷宫游戏",
    nav_practice: "互动练习",
    nav_refs: "参考资料",
    loading: "载入中，请稍候…"
  },
  "zh-TW": {
    brand: "職涯導航",
    nav_s1: "迷惘",
    nav_map: "職涯準備地圖",
    nav_lab: "性格測驗與職業庫",
    nav_maze: "職涯迷宮遊戲",
    nav_practice: "互動練習",
    nav_refs: "參考資料",
    loading: "載入中，請稍候…"
  }
};

function translateStaticUI(lang) {
  const dict = I18N[lang] || I18N["zh-TW"];
  const brand = document.querySelector(".ce-logo");
  if (brand) brand.textContent = dict.brand;
  const nav = document.querySelectorAll(".ce-nav-links a");
  nav.forEach(a => {
    const href = a.getAttribute("href") || "";
    if (href.includes("index.html")) a.textContent = dict.nav_s1;
    if (href.includes("next-steps.html")) a.textContent = dict.nav_map;
    if (href.includes("career-lab.html")) a.textContent = dict.nav_lab;
    if (href.includes("career-maze.html")) a.textContent = dict.nav_maze;
    if (href.includes("interactive-solutions.html")) a.textContent = dict.nav_practice;
    if (href.includes("references.html")) a.textContent = dict.nav_refs;
  });
  setText(".page-loader-sub", dict.loading);
}

function translatePerPage(lang) {
  const file = (location.pathname.split("/").pop() || "").toLowerCase();
  if (file === "index.html" || file === "") translateIndex(lang);
  else if (file === "next-steps.html") translateNextSteps(lang);
  else if (file === "career-lab.html") translateCareerLab(lang);
  else if (file === "career-maze.html") translateCareerMaze(lang);
  else if (file === "interactive-solutions.html") translateInteractive(lang);
  else if (file === "references.html") translateReferences(lang);
}

// ---- OpenCC-based T<->S conversion for full coverage ----
let openccReady = null;
function ensureOpenCC() {
  if (window.OpenCC) return Promise.resolve();
  if (openccReady) return openccReady;
  openccReady = new Promise(resolve => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js";
    s.onload = () => resolve();
    s.onerror = () => resolve(); // fail softly; fallback remains
    document.head.appendChild(s);
  });
  return openccReady;
}

let openccObserver = null;
let openccBusy = false;
function convertChineseOnPage(from, to) {
  if (!window.OpenCC) return;
  const converter = window.OpenCC.Converter({ from, to });
  const isCJK = /[\u4E00-\u9FFF]/;

  const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT"]);
  const skipClasses = /(^|\\s)goog\\-|notranslate/;

  const convertNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      if (text && isCJK.test(text)) {
        const converted = converter(text);
        if (converted !== text) {
          node.nodeValue = converted;
        }
      }
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node;
      if (skipTags.has(el.tagName)) return;
      if (el.className && skipClasses.test(el.className)) return;
      for (let child = el.firstChild; child; child = child.nextSibling) {
        convertNode(child);
      }
    }
  };

  openccBusy = true;
  try {
    convertNode(document.body);
  } finally {
    openccBusy = false;
  }

  if (openccObserver) {
    try { openccObserver.disconnect(); } catch {}
  }
  openccObserver = new MutationObserver(mutations => {
    if (openccBusy) return;
    openccBusy = true;
    try {
      mutations.forEach(m => {
        m.addedNodes.forEach(n => convertNode(n));
        if (m.type === "characterData" && m.target && m.target.nodeType === Node.TEXT_NODE) {
          convertNode(m.target);
        }
      });
    } finally {
      openccBusy = false;
    }
  });
  openccObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
}
function translateIndex(lang) {
  if (lang === "zh-TW") {
    document.title = "迷惘的十字路口 - 職涯導航";
    setText(".ce-tag", "");
    setText(".ce-subtitle", "剛開始規劃職涯的年輕人");
    setText(".ce-title", "迷惘的十字路口");
    setText(".ce-top-note", "本網站主要面向 18–25 歲的你：對未來感到不安、卻還在尋找下一步方向，也沒有關係。");
    const quick = document.querySelectorAll(".site-quick-link-title");
    if (quick[0]) quick[0].textContent = "看見自己的職涯迷惘情境";
    if (quick[1]) quick[1].textContent = "把迷惘拆成可行的小步驟";
    if (quick[2]) quick[2].textContent = "用性格測驗發現可能職業";
    setText(".ce-footer p", "你不需要一次看清全部，只要先看見下一步就夠了。");
    setText(".ce-primary-link", "前往職涯準備地圖 ➜");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "下一頁：職涯準備地圖");
    return;
  }
  if (lang === "en") {
    document.title = "At the Crossroads of Confusion - Career Navigation";
    setText(".ce-tag", "");
    setText(".ce-subtitle", "Young adults starting career planning");
    setText(".ce-title", "At the Crossroads of Confusion");
    setText(".ce-top-note", "For ages 18–25: it’s okay to feel uncertain while seeking your next step.");
    const quick = document.querySelectorAll(".site-quick-link-title");
    if (quick[0]) quick[0].textContent = "See your career confusion clearly";
    if (quick[1]) quick[1].textContent = "Break it into small, doable steps";
    if (quick[2]) quick[2].textContent = "Use tests to discover possible jobs";
    setText(".ce-footer p", "You don’t need to see it all—just the very next step.");
    setText(".ce-primary-link", "Go to Next Steps Map ➜");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "Next page: Next Steps Map");
    return;
  }
  if (lang === "zh-CN") {
    document.title = "迷惘的十字路口 - 职涯导航";
    setText(".ce-tag", "");
    setText(".ce-subtitle", "刚开始规划职涯的年轻人");
    setText(".ce-title", "迷惘的十字路口");
    setText(".ce-top-note", "本网站主要面向 18–25 岁的你：对未来感到不安、却还在寻找下一步方向，也没有关系。");
    const quick = document.querySelectorAll(".site-quick-link-title");
    if (quick[0]) quick[0].textContent = "看见自己的职涯迷惘情境";
    if (quick[1]) quick[1].textContent = "把迷惘拆成可行的小步骤";
    if (quick[2]) quick[2].textContent = "用性格测验发现可能职业";
    setText(".ce-footer p", "你不需要一次看清全部，只要先看见下一步就够了。");
    setText(".ce-primary-link", "前往职业准备地图 ➜");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "下一页：职业准备地图");
    return;
  }
}

function translateNextSteps(lang) {
  if (lang === "zh-TW") {
    document.title = "職涯準備地圖 - 職涯導航";
    setText("#stepsHeader .ce-tag", "行動指南");
    setText("#stepsHeader .ce-subtitle", "從迷惘到行動");
    setText("#stepsHeader .ce-title", "職涯準備地圖");
    setText("#stepsHeader .ce-top-note", "把大問題拆成小步驟，一次完成一點點，就能慢慢看見方向。");
    const quick = document.querySelectorAll(".site-quick-link-title");
    if (quick[0]) quick[0].textContent = "先認識自己的迷惘樣子";
    if (quick[1]) quick[1].textContent = "跟著地圖一步步往前";
    if (quick[2]) quick[2].textContent = "搭配測驗選擇職業方向";
    document.querySelectorAll(".ce-step-card h3").forEach((el, i) => {
      const map = [
        "Step 1｜認識自己",
        "Step 2｜盤點條件",
        "Step 3｜畫出「不想要」清單",
        "Step 4｜探索真實職業日常",
        "Step 5｜做小型體驗",
        "Step 6｜定期檢視與調整"
      ];
      el.textContent = map[i] || el.textContent;
    });
    document.querySelectorAll(".ce-step-btn").forEach(el => el.textContent = "標記為完成");
    setText(".ce-badge", "小步開始就很好");
    setText(".ce-center-text", "把職涯當成實驗，而不是一次就要答對的考題。");
    setText(".ce-footer p", "職涯沒有標準答案，只有一步步更接近自己的選擇。");
    setText(".ce-primary-link", "回到迷惘畫面 ←");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "上一頁：迷惘");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "下一頁：性格測驗與職業推薦");
    return;
  }
  if (lang === "en") {
    document.title = "Next Steps Map - Career Navigation";
    setText("#stepsHeader .ce-tag", "Action Guide");
    setText("#stepsHeader .ce-subtitle", "From confusion to action");
    setText("#stepsHeader .ce-title", "Next Steps Map");
    setText("#stepsHeader .ce-top-note", "Break big questions into small steps; progress a little at a time.");
    const quick = document.querySelectorAll(".site-quick-link-title");
    if (quick[0]) quick[0].textContent = "First see your pattern of confusion";
    if (quick[1]) quick[1].textContent = "Follow the map step by step";
    if (quick[2]) quick[2].textContent = "Use tests to choose directions";
    const titles = [
      "Step 1 | Know yourself",
      "Step 2 | Inventory your conditions",
      "Step 3 | Make a “Don’t want” list",
      "Step 4 | Explore real workdays",
      "Step 5 | Try small experiences",
      "Step 6 | Review and adjust regularly"
    ];
    document.querySelectorAll(".ce-step-card h3").forEach((el, i) => { el.textContent = titles[i] || el.textContent; });
    document.querySelectorAll(".ce-step-btn").forEach(el => el.textContent = "Mark as done");
    setText(".ce-badge", "Small starts are great");
    setText(".ce-center-text", "Treat your career as experiments, not a single right answer.");
    setText(".ce-footer p", "There’s no single right path—only choices that bring you closer to yourself.");
    setText(".ce-primary-link", "Back to Confused ←");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "Previous: Confused");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "Next: Personality & Jobs");
    return;
  }
  if (lang === "zh-CN") {
    document.title = "职业准备地图 - 职涯导航";
    setText("#stepsHeader .ce-tag", "行动指南");
    setText("#stepsHeader .ce-subtitle", "从迷惘到行动");
    setText("#stepsHeader .ce-title", "职业准备地图");
    setText("#stepsHeader .ce-top-note", "把大问题拆成小步骤，一次完成一点点，就能慢慢看见方向。");
    const quick = document.querySelectorAll(".site-quick-link-title");
    if (quick[0]) quick[0].textContent = "先认识自己的迷惘样子";
    if (quick[1]) quick[1].textContent = "跟着地图一步步往前";
    if (quick[2]) quick[2].textContent = "搭配测验选择职业方向";
    const titles = [
      "Step 1｜认识自己",
      "Step 2｜盘点条件",
      "Step 3｜画出「不想要」清单",
      "Step 4｜探索真实职业日常",
      "Step 5｜做小型体验",
      "Step 6｜定期检视与调整"
    ];
    document.querySelectorAll(".ce-step-card h3").forEach((el, i) => { el.textContent = titles[i] || el.textContent; });
    document.querySelectorAll(".ce-step-btn").forEach(el => el.textContent = "标记为完成");
    setText(".ce-badge", "小步开始就很好");
    setText(".ce-center-text", "把职涯当成实验，而不是一次就要答对的考题。");
    setText(".ce-footer p", "职涯没有标准答案，只有一步步更接近自己的选择。");
    setText(".ce-primary-link", "回到迷惘畫面 ←");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "上一页：职业准备地图");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "下一页：性格测验与职业推荐");
    return;
  }
}

function translateCareerLab(lang) {
  if (lang === "zh-TW") {
    document.title = "性格測驗與職業推薦 - 職涯導航";
    setText(".ce-tag", "互動測驗");
    setText(".ce-subtitle", "探索你的風格");
    setText(".ce-title", "性格測驗與職業推薦");
    setText(".ce-top-note", "這不是正式心理測驗，而是一個幫你整理方向的小工具。");
    const quick = document.querySelectorAll(".site-quick-link-title");
    if (quick[0]) quick[0].textContent = "從情境認識職涯迷惘";
    if (quick[1]) quick[1].textContent = "跟著地圖安排行動";
    if (quick[2]) quick[2].textContent = "用測驗連結到職業庫";
    setText(".lab-section-title", "快速 MBTI 風格測驗（非正式）");
    setText("#quizPrev", "← 上一題");
    setText("#quizNext", "下一題 →");
    setText("#quizSubmit", "生成我的 MBTI 風格與職業建議");
    setText(".quiz-note", "※ 僅作為自我探索的起點，不會被儲存或當成標籤。");
    setText("#jobsResultPanel .lab-section-title", "測驗結果會出現在這裡");
    setText("#jobsResultPanel .lab-intro", "完成上方四題後，我們會根據你的 MBTI 風格，推薦幾種可以優先探索的職業方向與工作型態。");
    setText(".lab-jobs-library .lab-section-title", "職業探索圖書館");
    setText(".lab-jobs-library .lab-intro", "先逛逛各種職業，再回頭做測驗也可以。你可以依照領域快速瀏覽，或從測驗結果開始延伸。");
    setText(".jobs-filter label", "依領域瀏覽：");
    setText(".ce-footer p", "測驗提供的是方向靈感，真正重要的是你親自去觀察、體驗與調整。");
    setText(".ce-primary-link", "回到迷惘畫面 ←");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "上一頁：職涯準備地圖");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "下一頁：職涯迷宮遊戲");
    return;
  }
  if (lang === "en") {
    document.title = "Aptitude Test & Job Suggestions - Career Navigation";
    setText(".ce-tag", "Interactive Quiz");
    setText(".ce-subtitle", "Explore your style");
    setText(".ce-title", "Aptitude Test & Job Suggestions");
    setText(".ce-top-note", "This is not a formal psychological test; it helps organize your direction.");
    const quick = document.querySelectorAll(".site-quick-link-title");
    if (quick[0]) quick[0].textContent = "Understand confusion through scenarios";
    if (quick[1]) quick[1].textContent = "Plan actions with the map";
    if (quick[2]) quick[2].textContent = "Link results to the jobs library";
    setText(".lab-section-title", "Quick MBTI-style quiz (informal)");
    setText("#quizPrev", "← Previous");
    setText("#quizNext", "Next →");
    setText("#quizSubmit", "Generate my MBTI style and job suggestions");
    setText(".quiz-note", "For self-exploration only; nothing is stored or used as a label.");
    setText("#jobsResultPanel .lab-section-title", "Your result will appear here");
    setText("#jobsResultPanel .lab-intro", "After finishing the questions, we suggest career directions based on your MBTI style.");
    setText(".lab-jobs-library .lab-section-title", "Jobs Library");
    setText(".lab-jobs-library .lab-intro", "Browse jobs first or start from your quiz results.");
    const label = document.querySelector(".jobs-filter label");
    if (label) label.childNodes[0].nodeValue = "Browse by field:";
    setText(".ce-footer p", "The quiz offers inspiration; what matters is observing, trying, and adjusting yourself.");
    setText(".ce-primary-link", "Back to Confused ←");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "Previous: Next Steps Map");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "Next: Career Maze");
    return;
  }
  if (lang === "zh-CN") {
    document.title = "性格测验与职业推荐 - 职涯导航";
    setText(".ce-tag", "互动测验");
    setText(".ce-subtitle", "探索你的风格");
    setText(".ce-title", "性格测验与职业推荐");
    setText(".ce-top-note", "这不是正式心理测验，而是一个帮你整理方向的小工具。");
    const quick = document.querySelectorAll(".site-quick-link-title");
    if (quick[0]) quick[0].textContent = "从情境认识职涯迷惘";
    if (quick[1]) quick[1].textContent = "跟着地图安排行动";
    if (quick[2]) quick[2].textContent = "用测验连结到职业库";
    setText(".lab-section-title", "快速 MBTI 风格测验（非正式）");
    setText("#quizPrev", "← 上一题");
    setText("#quizNext", "下一题 →");
    setText("#quizSubmit", "生成我的 MBTI 风格与职业建议");
    setText(".quiz-note", "仅作为自我探索的起点，不会被储存或当成标签。");
    setText("#jobsResultPanel .lab-section-title", "测验结果会出现在这里");
    setText("#jobsResultPanel .lab-intro", "完成上方问题后，我们会根据你的 MBTI 风格，推荐可以優先探索的职业方向與工作型態。");
    setText(".lab-jobs-library .lab-section-title", "职业探索图书馆");
    setText(".lab-jobs-library .lab-intro", "先逛逛各种职业，再回头做测验也可以。你可以依照领域快速浏览，或從測驗結果開始延伸。");
    const label = document.querySelector(".jobs-filter label");
    if (label) label.childNodes[0].nodeValue = "依领域浏览：";
    setText(".ce-footer p", "测验提供的是方向灵感，真正重要的是你亲自去观察、体验與調整。");
    setText(".ce-primary-link", "回到迷惘畫面 ←");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "上一页：职业准备地图");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "下一页：职业迷宫游戏");
    return;
  }
}

function translateCareerMaze(lang) {
  if (lang === "zh-TW") {
    document.title = "職涯迷宮遊戲 - 職涯導航";
    setText(".ce-tag", "小遊戲");
    setText(".ce-subtitle", "用路線選擇職涯");
    setText(".ce-title", "職涯迷宮：走出你的方向");
    setText(".ce-top-note", "跟著直覺走，用一場小迷宮遊戲，看見你目前偏好的工作風格。");
    setText(".maze-panel .lab-section-title", "玩法說明");
    setText("#mazeLeft", "←");
    setText("#mazeRight", "→");
    setText("#mazeReset", "重來一次");
    setText(".maze-tip", "提示：← 表示「比較符合」，→ 表示「比較不符合」。也可以使用鍵盤方向鍵。");
    setText("#mazeResult", "一步步慢慢走，看看你自然會走到哪一種出口。");
    setText(".ce-footer p", "迷宮只是縮小版的人生選擇，真正重要的是你願不願意多走幾條路、試試不同的出口。");
    setText(".ce-primary-link", "做完迷宮後，用測驗延伸探索 ➜");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "上一頁：性格測驗與職業推薦");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "下一頁：互動練習");
    return;
  }
  if (lang === "en") {
    document.title = "Career Maze Game - Career Navigation";
    setText(".ce-tag", "Mini Game");
    setText(".ce-subtitle", "Choose career paths by routes");
    setText(".ce-title", "Career Maze: Find Your Direction");
    setText(".ce-top-note", "Follow your instinct in a mini maze to see your preferred work style.");
    setText(".maze-panel .lab-section-title", "How to play");
    setText("#mazeReset", "Restart");
    setText(".maze-tip", "Tip: ← means “more fitting”, → means “less fitting”. Arrow keys work too.");
    setText("#mazeResult", "Move step by step and see which exit you naturally reach.");
    setText(".ce-footer p", "The maze is a miniature of life choices; keep trying different routes.");
    setText(".ce-primary-link", "After the maze, explore further with the quiz ➜");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "Previous: Personality & Jobs");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "Next: Interactive Practice");
    return;
  }
  if (lang === "zh-CN") {
    document.title = "职业迷宫游戏 - 职涯导航";
    setText(".ce-tag", "小游戏");
    setText(".ce-subtitle", "用路线选择职涯");
    setText(".ce-title", "职业迷宫：走出你的方向");
    setText(".ce-top-note", "跟着直觉走，用一场小迷宫游戏，看见你目前偏好的工作风格。");
    setText(".maze-panel .lab-section-title", "玩法说明");
    setText("#mazeReset", "重来一次");
    setText(".maze-tip", "提示：← 表示「比较符合」，→ 表示「比较不符合」。也可以使用键盘方向键。");
    setText("#mazeResult", "一步步慢慢走，看看你自然会走到哪一种出口。");
    setText(".ce-footer p", "迷宫只是缩小版的人生选择，重要的是多走几条路、试试不同的出口。");
    setText(".ce-primary-link", "做完迷宫后，用测验延伸探索 ➜");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "上一页：性格测验与职业推荐");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "下一页：互动练习");
    return;
  }
}

function translateInteractive(lang) {
  if (lang === "zh-TW") {
    document.title = "互動練習：陪你走過迷惘 - 職涯導航";
    setText(".ce-tag", "實作活動");
    setText(".ce-subtitle", "從對話與體驗開始");
    setText(".ce-title", "互動練習：陪你走過迷惘");
    setText(".ce-footer p", "當你願意多做幾次這些小練習，迷惘就會慢慢變成可以被說清楚、也能一起面對的問題。");
    setText(".ce-primary-link", "下一頁：參考資料與延伸閱讀 ➜");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "上一頁：職涯迷宮遊戲");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "下一頁：參考資料");
    setText(".ce-badge", "一起動手，比單打獨鬥更不孤單");
    return;
  }
  if (lang === "en") {
    document.title = "Interactive Practice: Through Confusion Together - Career Navigation";
    setText(".ce-tag", "Hands-on Activities");
    setText(".ce-subtitle", "Start from dialogue and experience");
    setText(".ce-title", "Interactive Practice: Through Confusion Together");
    setText(".ce-footer p", "With repeated small practices, confusion becomes clearer and manageable together.");
    setText(".ce-primary-link", "Next: References ➜");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "Previous: Career Maze");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "Next: References");
    setText(".ce-badge", "Do it together; it’s less lonely than solo.");
    return;
  }
  if (lang === "zh-CN") {
    document.title = "互动练习：陪你走过迷惘 - 职涯导航";
    setText(".ce-tag", "实作活动");
    setText(".ce-subtitle", "从对话与体验开始");
    setText(".ce-title", "互动练习：陪你走过迷惘");
    setText(".ce-footer p", "当你愿意多做几次这些小练习，迷惘就会慢慢变成能说清楚、也能一起面对的问题。");
    setText(".ce-primary-link", "下一页：参考资料与延伸阅读 ➜");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "上一页：职业迷宫游戏");
    setAttr('.page-arrow-link.page-arrow-next', "aria-label", "下一页：参考资料");
    setText(".ce-badge", "一起动手，比单打独斗更不孤单");
    return;
  }
}

function translateReferences(lang) {
  if (lang === "zh-TW") {
    document.title = "參考資料與延伸閱讀 - 職涯導航";
    setText(".ce-tag", "APA 參考資料");
    setText(".ce-subtitle", "理論與實務來源");
    setText(".ce-title", "本專題使用的主要參考");
    setText(".ce-top-note", "以下以 APA 第七版格式整理，方便課堂報告或書面說明直接引用。");
    setText(".ce-footer p", "如果你在報告或教案中引用了本網站內容，也歡迎一併標註這些原始參考資料。");
    setText(".ce-primary-link", "回到情境一畫面 ←");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "上一頁：互動練習");
    return;
  }
  if (lang === "en") {
    document.title = "References & Further Reading - Career Navigation";
    setText(".ce-tag", "APA References");
    setText(".ce-subtitle", "Theory and practice sources");
    setText(".ce-title", "Key references used in this project");
    setText(".ce-top-note", "Compiled in APA 7th edition for easy citation.");
    setText(".ce-footer p", "If you cite the site in reports or lesson plans, please cite these sources as well.");
    setText(".ce-primary-link", "Back to Confused ←");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "Previous: Interactive Practice");
    return;
  }
  if (lang === "zh-CN") {
    document.title = "参考资料与延伸阅读 - 职涯导航";
    setText(".ce-tag", "APA 参考资料");
    setText(".ce-subtitle", "理论与实务来源");
    setText(".ce-title", "本专题使用的主要参考");
    setText(".ce-top-note", "以下以 APA 第七版格式整理，方便课堂报告或书面说明直接引用。");
    setText(".ce-footer p", "如果你在报告或教案中引用了本网站内容，也欢迎一并标注这些原始参考资料。");
    setText(".ce-primary-link", "回到情境一画面 ←");
    setAttr('.page-arrow-link.page-arrow-prev', "aria-label", "上一页：互动练习");
    return;
  }
}

function setupScenarioCards() {
  const cards = document.querySelectorAll(".career-explore .ce-card");
  const badge = document.getElementById("challengeBadge");
  const text = document.getElementById("challengeText");
  const mouth = document.querySelector(".ce-avatar-mouth");

  if (!cards.length || !badge || !text) return;

  const messages = [
    {
      title: "搞不清喜歡什麼？",
      text: "先從排除「明顯不想要」開始，比逼自己立刻找到熱愛更實際。"
    },
    {
      title: "前景看起來很不安？",
      text: "與其猜未來，不如先了解工作背後需要的能力，讓自己多一點主動權。"
    },
    {
      title: "家人期待與自己不同？",
      text: "先理解他們在擔心什麼，再用具體資料和行動計畫回應，比單純說「我想要」更有力量。"
    },
    {
      title: "資訊太夢幻不真實？",
      text: "主動去問正在那個位置上的人，一天實際在做什麼，比看再多宣傳都更有幫助。"
    },
    {
      title: "怕決定錯影響一輩子？",
      text: "把職涯想成一連串可以修正的選擇，而不是一次就要答對的考題。"
    },
    {
      title: "不知道現在能做什麼？",
      text: "先選一個最小的行動，例如約一位學長姐聊 30 分鐘，就已經是往前的一步。"
    }
  ];

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      if (card.classList.contains("is-active")) return;
      
      cards.forEach(c => c.classList.remove("is-active"));
      card.classList.add("is-active");

      const msg = messages[index % messages.length];
      
      // Animate text transition
      [badge, text].forEach(el => el.classList.add("fade-out"));
      
      // Character smile animation
      if (mouth) {
        mouth.classList.add("is-smiling");
        setTimeout(() => {
          mouth.classList.remove("is-smiling");
        }, 2000);
      }
      
      setTimeout(() => {
        badge.textContent = msg.title;
        text.textContent = msg.text;
        [badge, text].forEach(el => {
          el.classList.remove("fade-out");
          el.classList.add("fade-in");
        });
        
        setTimeout(() => {
          [badge, text].forEach(el => el.classList.remove("fade-in"));
        }, 300);
      }, 300);
    });
  });
}

function setupMoodSelector() {
  const buttons = document.querySelectorAll(".ce-mood-btn");
  const output = document.getElementById("moodOutput");
  if (!buttons.length || !output) return;

  const moodMessages = {
    lost: "先照顧好自己的節奏和壓力，再來談選擇也不遲。你可以只先完成今天的一個小任務。",
    curious: "恭喜你已經開始探索！為自己設定「這個月至少認識兩種新職業」這樣的輕鬆目標。",
    deciding: "試著把選擇拆成幾個條件（興趣、薪資、工作型態…），就能看得更清楚，也比較不會全擠在一起。"
  };

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-selected")) return;

      const mood = btn.dataset.mood;
      buttons.forEach(b => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      
      // Animate text transition
      output.classList.add("fade-out");
      
      setTimeout(() => {
        output.textContent = moodMessages[mood] || "";
        output.classList.remove("fade-out");
        output.classList.add("fade-in");
        
        setTimeout(() => {
          output.classList.remove("fade-in");
        }, 300);
      }, 300);
    });
  });
}

function setupStepTracker() {
  const stepCards = document.querySelectorAll(".ce-step-card");
  if (!stepCards.length) return;

  const totalSteps = stepCards.length;
  const header = document.getElementById("stepsHeader");

  const progress = document.createElement("div");
  progress.className = "ce-progress";
  progress.innerHTML = `
    <span id="stepsProgressLabel">已完成 0 / ${totalSteps} 步</span>
    <div class="ce-progress-bar">
      <div class="ce-progress-fill" id="stepsProgressFill"></div>
    </div>
  `;
  header.appendChild(progress);

  const label = document.getElementById("stepsProgressLabel");
  const fill = document.getElementById("stepsProgressFill");

  const doneKey = "career-steps-done";
  let doneSet = new Set();
  try {
    const saved = window.localStorage.getItem(doneKey);
    if (saved) {
      JSON.parse(saved).forEach(n => doneSet.add(String(n)));
    }
  } catch {
    // ignore storage errors
  }

  stepCards.forEach(card => {
    const step = card.dataset.step;
    const btn = card.querySelector(".ce-step-btn");
    if (doneSet.has(step)) {
      card.classList.add("is-done");
    }

    const toggle = () => {
      card.classList.toggle("is-done");
      if (card.classList.contains("is-done")) {
        doneSet.add(step);
      } else {
        doneSet.delete(step);
      }
      updateProgress();
      try {
        window.localStorage.setItem(doneKey, JSON.stringify([...doneSet]));
      } catch {
        // ignore storage errors
      }
    };

    card.addEventListener("click", event => {
      // avoid double toggle when button clicked
      if (event.target instanceof HTMLElement && event.target.classList.contains("ce-step-btn")) {
        return;
      }
      toggle();
    });

    if (btn) {
      btn.addEventListener("click", event => {
        event.stopPropagation();
        toggle();
      });
    }
  });

  let confettiTriggered = false;
  updateProgress();

  function updateProgress() {
    const doneCount = doneSet.size;
    label.textContent = `已完成 ${doneCount} / ${totalSteps} 步`;
    const width = totalSteps ? (doneCount / totalSteps) * 100 : 0;
    if (fill) fill.style.width = `${width}%`;

    if (doneCount === totalSteps && totalSteps > 0 && !confettiTriggered) {
      triggerConfetti();
      confettiTriggered = true;
    } else if (doneCount < totalSteps) {
      confettiTriggered = false;
    }
  }
}

function triggerConfetti() {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "9999";
  document.body.appendChild(container);

  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
  const particles = 150;
  
  for (let i = 0; i < particles; i++) {
    const particle = document.createElement("div");
    particle.className = "confetti-particle";
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = Math.random() * 100 + "vw";
    particle.style.top = "-10px";
    particle.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(particle);

    const animation = particle.animate([
      { transform: `translate3d(0, 0, 0) rotate(0deg)`, opacity: 1 },
      { transform: `translate3d(${(Math.random() - 0.5) * 400}px, 100vh, 0) rotate(${Math.random() * 1000}deg)`, opacity: 0 }
    ], {
      duration: Math.random() * 3000 + 3000,
      easing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
      delay: Math.random() * 1000
    });

    animation.onfinish = () => particle.remove();
  }

  setTimeout(() => {
    if (container.parentNode) {
      container.remove();
    }
  }, 10000);
}

function setupCareerMaze() {
  const grid = document.getElementById("mazeGrid");
  const resultBox = document.getElementById("mazeResult");
  const upBtn = document.getElementById("mazeUp");
  const downBtn = document.getElementById("mazeDown");
  const leftBtn = document.getElementById("mazeLeft");
  const rightBtn = document.getElementById("mazeRight");
  const resetBtn = document.getElementById("mazeReset");

  if (!grid || !resultBox) return;

  const mazeMap = [
    ["#", "#", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", ".", "C", "#"],
    ["#", ".", ".", ".", ".", ".", "#"],
    ["#", "S", ".", ".", ".", ".", "#"],
    ["#", ".", ".", ".", ".", "A", "#"],
    ["#", ".", ".", ".", ".", "B", "#"],
    ["#", "#", "#", "#", "#", "#", "#"]
  ];

  const exits = {
    exitA: {
      label: "出口 A｜創意探索型",
      text:
        "你偏好有彈性、能自己發想點子的工作環境，適合深入設計、內容創作、品牌與體驗設計等角色。"
    },
    exitB: {
      label: "出口 B｜實作行動型",
      text:
        "你喜歡在現場解決問題、看到成果被實際用起來，適合工程實作、營運管理、服務現場等需要快速行動的工作。"
    },
    exitC: {
      label: "出口 C｜分析規劃型",
      text:
        "你習慣先理解全局、評估風險再行動，適合資料分析、產品規劃、專案管理與策略相關工作。"
    }
  };

  const decisionNodes = {
    start: {
      id: "start",
      row: 3,
      col: 1,
      question:
        "Q1｜現在對你來說，更重要的是？（← 比較重視可以自由發想、玩創意 ｜ → 比較重視有穩定制度與發展）",
      yes: "creative1",
      no: "structure1"
    },
    creative1: {
      id: "creative1",
      row: 2,
      col: 2,
      question:
        "Q2｜在工作內容中，你更期待哪一種？（← 與人交流、主持活動、分享故事 ｜ → 深入創作、設計作品本身）",
      yes: "creative2People",
      no: "creative2Solo"
    },
    creative2People: {
      id: "creative2People",
      row: 1,
      col: 3,
      question:
        "Q3｜如果有一個需要帶領他人的專案，你的直覺是？（← 想試試看，喜歡把大家的想法整合起來 ｜ → 比較想專心在內容本身）",
      yes: "creative3PeopleIdeas",
      no: "creative3PeopleStructure"
    },
    creative2Solo: {
      id: "creative2Solo",
      row: 2,
      col: 4,
      question:
        "Q3｜如果可以選擇，你會更想要？（← 花時間打磨作品細節、學新工具 ｜ → 協助團隊規劃整體方向與流程）",
      yes: "creative3SoloCraft",
      no: "creative3SoloPlan"
    },
    creative3PeopleIdeas: {
      id: "creative3PeopleIdeas",
      row: 1,
      col: 4,
      question:
        "Q4｜如果未來工作中要長期投入，你更希望？（← 有空間嘗試各種新點子 ｜ → 能把流程規劃得更穩定清楚）",
      yes: "exitA",
      no: "exitC"
    },
    creative3PeopleStructure: {
      id: "creative3PeopleStructure",
      row: 2,
      col: 3,
      question:
        "Q4｜如果未來工作中要長期投入，你更希望？（← 有空間嘗試各種新點子 ｜ → 能把流程規劃得更穩定清楚）",
      yes: "exitA",
      no: "exitC"
    },
    creative3SoloCraft: {
      id: "creative3SoloCraft",
      row: 3,
      col: 4,
      question:
        "Q4｜在創作相關工作裡，你更在意？（← 可以專心打磨作品細節、學新工具 ｜ → 能一起參與規劃整體方向與流程）",
      yes: "exitA",
      no: "exitC"
    },
    creative3SoloPlan: {
      id: "creative3SoloPlan",
      row: 2,
      col: 5,
      question:
        "Q4｜在創作相關工作裡，你更在意？（← 可以專心打磨作品細節、學新工具 ｜ → 能一起參與規劃整體方向與流程）",
      yes: "exitA",
      no: "exitC"
    },
    structure1: {
      id: "structure1",
      row: 4,
      col: 2,
      question:
        "Q2｜當遇到複雜問題時，你通常會先？（← 開資料、查指標、畫表格 ｜ → 直接到現場了解發生什麼事）",
      yes: "structure2Data",
      no: "structure2Field"
    },
    structure2Data: {
      id: "structure2Data",
      row: 5,
      col: 2,
      question:
        "Q3｜如果要長期投入一個領域，你更能想像自己？（← 圍繞數據、研究、系統優化打轉 ｜ → 常常需要出差、與不同單位協調）",
      yes: "structure3DataSystem",
      no: "structure3DataTravel"
    },
    structure2Field: {
      id: "structure2Field",
      row: 5,
      col: 3,
      question:
        "Q3｜在團隊裡，你比較喜歡的角色是？（← 在第一線協調、排除狀況 ｜ → 在後方規劃流程與標準）",
      yes: "structure3FieldFront",
      no: "structure3FieldBack"
    },
    structure3DataSystem: {
      id: "structure3DataSystem",
      row: 4,
      col: 3,
      question:
        "Q4｜在穩定發展的工作裡，你更在意？（← 把系統或流程越做越有效率 ｜ → 跟不同人實際合作、解決現場狀況）",
      yes: "exitC",
      no: "exitB"
    },
    structure3DataTravel: {
      id: "structure3DataTravel",
      row: 3,
      col: 2,
      question:
        "Q4｜在穩定發展的工作裡，你更在意？（← 把系統或流程越做越有效率 ｜ → 跟不同人實際合作、解決現場狀況）",
      yes: "exitC",
      no: "exitB"
    },
    structure3FieldFront: {
      id: "structure3FieldFront",
      row: 5,
      col: 4,
      question:
        "Q4｜如果要待在第一線，你會更享受？（← 協調現場、處理突發狀況 ｜ → 在後方整理數據、改善流程）",
      yes: "exitB",
      no: "exitC"
    },
    structure3FieldBack: {
      id: "structure3FieldBack",
      row: 4,
      col: 1,
      question:
        "Q4｜如果要待在第一線，你會更享受？（← 協調現場、處理突發狀況 ｜ → 在後方整理數據、改善流程）",
      yes: "exitB",
      no: "exitC"
    }
  };

  const exitPositions = {
    exitA: { row: 4, col: 5, cell: "A" },
    exitB: { row: 5, col: 5, cell: "B" },
    exitC: { row: 1, col: 5, cell: "C" }
  };

  const stepsToExitByNode = {};

  function computeStepsToExit(nodeId, stack = new Set()) {
    if (Object.prototype.hasOwnProperty.call(stepsToExitByNode, nodeId)) {
      return stepsToExitByNode[nodeId];
    }

    const node = decisionNodes[nodeId];
    if (!node) return null;

    if (stack.has(nodeId)) {
      return null;
    }

    stack.add(nodeId);

    const targets = [node.yes, node.no].filter(Boolean);
    let best = Infinity;

    targets.forEach(targetKey => {
      if (typeof targetKey !== "string") return;
      if (targetKey.startsWith("exit")) {
        best = Math.min(best, 1);
      } else {
        const childSteps = computeStepsToExit(targetKey, stack);
        if (typeof childSteps === "number") {
          best = Math.min(best, 1 + childSteps);
        }
      }
    });

    stack.delete(nodeId);

    const value = best === Infinity ? null : best;
    stepsToExitByNode[nodeId] = value;
    return value;
  }

  Object.keys(decisionNodes).forEach(id => {
    computeStepsToExit(id);
  });

  let currentNodeId = "start";
  let playerPos = { row: decisionNodes.start.row, col: decisionNodes.start.col };
  let playerDot;

  function buildGrid() {
    grid.innerHTML = "";
    mazeMap.forEach((rowArr, rowIdx) => {
      rowArr.forEach((cell, colIdx) => {
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("maze-cell");
        if (cell === "#") cellDiv.classList.add("maze-cell-wall");
        if (cell === "S") cellDiv.classList.add("maze-cell-start");
        if (cell === "A" || cell === "B" || cell === "C") {
          cellDiv.classList.add("maze-cell-exit");
          const key =
            cell === "A" ? "exitA" : cell === "B" ? "exitB" : "exitC";
          cellDiv.dataset.exit = key.replace("exit", "");
        }
        cellDiv.dataset.row = String(rowIdx);
        cellDiv.dataset.col = String(colIdx);
        grid.appendChild(cellDiv);
      });
    });

    playerDot = document.createElement("div");
    playerDot.className = "maze-player-dot";
    playerDot.textContent = "15";
    placePlayer();
    showCurrentQuestion();
  }

  function placePlayer() {
    const selector = `[data-row="${playerPos.row}"][data-col="${playerPos.col}"]`;
    const targetCell = grid.querySelector(selector);
    if (!targetCell) return;

    if (!playerDot.parentElement) {
      targetCell.appendChild(playerDot);
    } else if (playerDot.parentElement !== targetCell) {
      targetCell.appendChild(playerDot);
    }

    // trigger jump animation
    playerDot.classList.remove("jump");
    // force reflow for restarting animation
    // eslint-disable-next-line no-unused-expressions
    void playerDot.offsetWidth;
    playerDot.classList.add("jump");
  }

  function showCurrentQuestion() {
    const node = decisionNodes[currentNodeId];
    if (!node) return;
    const questionHtml = node.question.replace(
      /(Q\d+｜)/,
      "<strong>$1</strong>"
    );

    const remaining = stepsToExitByNode[currentNodeId];
    const extra =
      typeof remaining === "number"
        ? `<div class="maze-result-extra">還有 <strong>${remaining}</strong> 題就到出口</div>`
        : "";

    resultBox.innerHTML = questionHtml + extra;
  }

  function goToNode(nodeId) {
    const node = decisionNodes[nodeId];
    if (!node) return;
    currentNodeId = nodeId;
    playerPos = { row: node.row, col: node.col };
    placePlayer();
    showCurrentQuestion();
  }

  function goToExit(exitId) {
    const exitInfo = exits[exitId];
    const pos = exitPositions[exitId];
    if (!exitInfo || !pos) return;

    currentNodeId = exitId;
    playerPos = { row: pos.row, col: pos.col };
    placePlayer();
    resultBox.innerHTML = `<strong>${exitInfo.label}</strong>｜${
      exitInfo.text
    }<br /><br />建議你可以回到「性格測驗與職業庫」頁面，把這個傾向當作篩選條件，優先看相關職業。`;
  }

  function answer(decision) {
    // decision: "yes" => 左, "no" => 右
    if (currentNodeId.startsWith("exit")) {
      return;
    }
    const node = decisionNodes[currentNodeId];
    if (!node) return;

    const targetKey = decision === "yes" ? node.yes : node.no;
    if (!targetKey) return;

    if (targetKey.startsWith("exit")) {
      goToExit(targetKey);
    } else {
      goToNode(targetKey);
    }
  }

  function reset() {
    currentNodeId = "start";
    playerPos = { row: decisionNodes.start.row, col: decisionNodes.start.col };
    placePlayer();
    showCurrentQuestion();
  }

  buildGrid();

  if (leftBtn && rightBtn) {
    leftBtn.addEventListener("click", () => answer("yes"));
    rightBtn.addEventListener("click", () => answer("no"));
  }

  if (upBtn && downBtn) {
    upBtn.addEventListener("click", () => answer("yes"));
    downBtn.addEventListener("click", () => answer("no"));
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", reset);
  }

  window.addEventListener("keydown", event => {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        answer("yes");
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        answer("no");
        break;
      default:
        break;
    }
  });
}
function setupMbtiLab() {
  const quiz = document.getElementById("mbtiQuiz");
  const submitBtn = document.getElementById("quizSubmit");
  const resultBox = document.getElementById("quizResult");
  const jobsPanel = document.getElementById("jobsResultPanel");
  const jobsGrid = document.getElementById("jobsGrid");
  const jobsFilter = document.getElementById("jobsFilter");

  if (!quiz || !submitBtn || !resultBox) {
    // 沒有測驗區塊時不啟動
    return;
  }

  const quizQuestions = Array.from(
    quiz.querySelectorAll(".quiz-question")
  );
  const totalQuestions = quizQuestions.length;
  const prevBtn = document.getElementById("quizPrev");
  const nextBtn = document.getElementById("quizNext");
  const stepLabel = document.getElementById("quizStepLabel");
  let currentIndex = 0;

  if (quizQuestions.length) {
    quizQuestions.forEach((q, idx) => {
      q.classList.remove("is-active", "is-left", "is-right");
      if (idx === 0) {
        q.classList.add("is-active");
      } else {
        q.classList.add("is-right");
      }

      const inputs = q.querySelectorAll("input[type=radio]");
      inputs.forEach(input => {
        input.addEventListener("change", () => {
          if (currentIndex < totalQuestions - 1) {
            showQuestion(currentIndex + 1, 1);
          }
        });
      });
    });

    if (prevBtn && nextBtn && stepLabel) {
      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
          showQuestion(currentIndex - 1, -1);
        }
      });

      nextBtn.addEventListener("click", () => {
        if (currentIndex < totalQuestions - 1) {
          showQuestion(currentIndex + 1, 1);
        }
      });

      updateStepLabel();
    }
  }

  const mbtiProfiles = {
    INTJ: {
      name: "INTJ｜策略規劃者",
      tags: ["長期規劃", "系統思考", "獨立"],
      summary: "擅長從全局思考路線圖，喜歡把事情規劃得更有效率、更有邏輯。"
    },
    INTP: {
      name: "INTP｜概念解題者",
      tags: ["好奇心", "理論", "創新"],
      summary: "對複雜問題充滿興趣，喜歡拆解原理、發明新點子。"
    },
    ENTJ: {
      name: "ENTJ｜領導統籌者",
      tags: ["目標導向", "組織管理", "果斷"],
      summary: "習慣先定目標再安排資源，享受帶領團隊一起完成任務。"
    },
    ENTP: {
      name: "ENTP｜創意辯論家",
      tags: ["創新", "辯證", "靈活"],
      summary: "喜歡腦力激盪與辯論，在變化快速的環境中特別有活力。"
    },
    INFJ: {
      name: "INFJ｜洞察引導者",
      tags: ["同理心", "願景", "輔導"],
      summary: "擅長理解別人的情緒與故事，重視意義與長期影響。"
    },
    INFP: {
      name: "INFP｜理想實踐者",
      tags: ["價值感", "創作", "溫柔堅定"],
      summary: "內心有一套想守護的價值，願意默默為重要的事情努力。"
    },
    ENFJ: {
      name: "ENFJ｜氣氛帶動者",
      tags: ["溝通", "教導", "激勵"],
      summary: "擅長帶動團隊氣氛與凝聚共識，喜歡陪伴他人成長。"
    },
    ENFP: {
      name: "ENFP｜靈感發電機",
      tags: ["想像力", "人際連結", "多變"],
      summary: "熱情又點子多，喜歡嘗試新事物並把人們連結在一起。"
    },
    ISTJ: {
      name: "ISTJ｜可靠執行者",
      tags: ["穩定", "細節", "責任感"],
      summary: "重視制度與細節，適合需要精準與長期堅持的工作。"
    },
    ISFJ: {
      name: "ISFJ｜溫暖守護者",
      tags: ["照顧", "耐心", "實務"],
      summary: "對身邊人的需要很敏感，願意在後方默默支持。"
    },
    ESTJ: {
      name: "ESTJ｜實務管理者",
      tags: ["效率", "組織", "規劃"],
      summary: "擅長制定流程與分工，喜歡把混亂變得有條理。"
    },
    ESFJ: {
      name: "ESFJ｜熱心協調者",
      tags: ["服務", "合作", "細心"],
      summary: "重視團隊氣氛與關係，常主動照顧每個人的狀態。"
    },
    ISTP: {
      name: "ISTP｜冷靜實作家",
      tags: ["動手做", "問題排除", "彈性"],
      summary: "喜歡直接動手解決問題，對工具、機械或系統很感興趣。"
    },
    ISFP: {
      name: "ISFP｜感受創作者",
      tags: ["美感", "體驗", "溫柔"],
      summary: "對氛圍與感受很敏銳，適合用作品或服務傳遞溫度。"
    },
    ESTP: {
      name: "ESTP｜現場行動派",
      tags: ["臨場反應", "實務操作", "說服力"],
      summary: "在變化的現場特別有精神，擅長讀懂情境並快速做決定。"
    },
    ESFP: {
      name: "ESFP｜活力表演者",
      tags: ["表達力", "人際互動", "享受當下"],
      summary: "喜歡在舞台或人群中發光，帶給大家輕鬆與驚喜。"
    }
  };

  const allJobs = [
    { title: "軟體工程師", field: "tech", mbti: ["INTJ", "INTP", "ISTJ", "ENTJ"], traits: ["程式設計", "解決問題"], blurb: "設計與開發應用程式或系統，讓生活與工作更便利。" },
    { title: "前端工程師", field: "tech", mbti: ["INTP", "INFJ", "ISFP", "ENFP"], traits: ["介面設計", "互動體驗"], blurb: "把設計稿變成可以實際操作的網頁與介面。" },
    { title: "資料科學家", field: "data", mbti: ["INTJ", "INTP", "ENTJ"], traits: ["數據分析", "模型預測"], blurb: "從大量資料中找出規律，協助公司做決策。" },
    { title: "資料分析師", field: "data", mbti: ["ISTJ", "ESTJ", "INFJ"], traits: ["報表整理", "商業洞察"], blurb: "整理公司數據，讓複雜情況變得一目了然。" },
    { title: "UI/UX 設計師", field: "design", mbti: ["INFP", "ISFP", "INFJ", "ENFP"], traits: ["使用者研究", "體驗設計"], blurb: "讓產品看起來舒服好用，兼顧美感與實用。" },
    { title: "平面設計師", field: "design", mbti: ["INFP", "ISFP", "ENFP"], traits: ["視覺設計", "品牌"], blurb: "設計海報、包裝、社群貼文等視覺作品。" },
    { title: "插畫家 / 視覺藝術家", field: "design", mbti: ["INFP", "ISFP", "ENFP"], traits: ["創作", "故事感"], blurb: "用圖像說故事，為書籍、遊戲或品牌創造角色與畫面。" },
    { title: "產品經理 PM", field: "startup", mbti: ["ENTJ", "ENFP", "INFJ", "INTJ"], traits: ["跨部門協調", "需求分析"], blurb: "在工程、設計、商業之間協調，決定產品要做什麼功能。" },
    { title: "專案經理", field: "management", mbti: ["ESTJ", "ENTJ", "ISTJ"], traits: ["時程控管", "資源分配"], blurb: "確保專案在預算與時間內順利完成。" },
    { title: "行銷企劃", field: "business", mbti: ["ENFP", "ENTP", "ESFP"], traits: ["創意發想", "活動企劃"], blurb: "想出讓產品被看見的方式，規劃社群、廣告與活動。" },
    { title: "品牌經營 / 社群小編", field: "business", mbti: ["ENFP", "ESFP", "INFP"], traits: ["內容創作", "互動"], blurb: "在社群平台上經營品牌個性，與粉絲建立關係。" },
    { title: "人資 / 招募專員", field: "management", mbti: ["ENFJ", "ESFJ", "INFJ"], traits: ["面談", "溝通協調"], blurb: "為公司找到合適人才，陪伴員工在組織中成長。" },
    { title: "教師（成人教育與高等教育）", field: "education", mbti: ["INFJ", "ENFJ", "ISFJ"], traits: ["教學設計", "陪伴成長"], blurb: "規劃課程與學習活動，陪學習者一起探索世界。" },
    { title: "輔導老師 / 心理師", field: "education", mbti: ["INFJ", "INFP", "ISFJ"], traits: ["傾聽", "諮商"], blurb: "協助人們理解自己的情緒與壓力，一起找出下一步。" },
    { title: "社工師", field: "public", mbti: ["INFJ", "ENFJ", "ISFJ"], traits: ["資源連結", "倡議"], blurb: "陪伴弱勢族群，整合社會資源協助他們度過難關。" },
    { title: "公共政策研究員", field: "public", mbti: ["INTJ", "INFJ", "ENTP"], traits: ["政策分析", "研究"], blurb: "分析社會議題與政策效果，提出改進建議。" },
    { title: "醫師", field: "health", mbti: ["ESTJ", "ISTJ", "INFJ"], traits: ["醫學專業", "臨床判斷"], blurb: "運用醫學知識診斷與治療病人。" },
    { title: "護理師", field: "health", mbti: ["ISFJ", "ESFJ", "INFJ"], traits: ["照護", "團隊合作"], blurb: "在醫療現場照顧病人，與醫療團隊密切合作。" },
    { title: "藥師", field: "health", mbti: ["ISTJ", "ISFJ"], traits: ["用藥安全", "細心"], blurb: "確保病人正確用藥，提供用藥與健康諮詢。" },
    { title: "研究員 / 科學家", field: "research", mbti: ["INTJ", "INTP", "INFJ"], traits: ["實驗設計", "理論推演"], blurb: "在實驗室或研究機構深入探索某個專業領域。" },
    { title: "資料工程師", field: "data", mbti: ["ISTJ", "INTJ", "ENTJ"], traits: ["系統架構", "資料管線"], blurb: "建立讓資料能被穩定收集與分析的技術基礎。" },
    { title: "工業設計師", field: "design", mbti: ["ISFP", "INFJ", "ENTP"], traits: ["產品外型", "使用者體驗"], blurb: "設計日常用品或硬體產品，結合美感與實用性。" },
    { title: "室內設計師", field: "design", mbti: ["ISFP", "ENFP"], traits: ["空間規劃", "美感"], blurb: "規劃居家或商業空間，創造舒適的生活環境。" },
    { title: "活動企劃 / 展演統籌", field: "service", mbti: ["ENFP", "ESFP", "ESTP"], traits: ["現場執行", "溝通協調"], blurb: "從構想、宣傳到現場執行，負責讓活動順利發生。" },
    { title: "導遊 / 領隊", field: "service", mbti: ["ENFP", "ESFP", "ENFJ"], traits: ["解說", "帶隊"], blurb: "帶領旅客認識各地文化與風景，照顧旅程大小事。" },
    { title: "業務 / 客戶經理", field: "business", mbti: ["ENTP", "ESTP", "ESFJ"], traits: ["談判", "人際互動"], blurb: "了解客戶需求，媒合產品與服務並維繫關係。" },
    { title: "創業者 / 自媒體經營", field: "startup", mbti: ["ENTP", "ENFP", "INTJ"], traits: ["自我管理", "品牌經營"], blurb: "自己設計產品或內容，從零開始建立事業。" },
    { title: "產品設計 / 服務設計", field: "startup", mbti: ["INFJ", "INTJ", "ENFP"], traits: ["旅程設計", "使用者洞察"], blurb: "從整體旅程設計服務，讓使用者感到順暢貼心。" },
    { title: "工程專案現場監工", field: "tech", mbti: ["ESTJ", "ISTP", "ESTP"], traits: ["現場管理", "安全控管"], blurb: "在工程現場協調工班與進度，確保品質與安全。" },
    { title: "電商營運專員", field: "business", mbti: ["ESTJ", "ENFP", "ESFJ"], traits: ["平台操作", "數據觀察"], blurb: "經營網路商店，追蹤銷售數據並調整策略。" },
    { title: "客服專員", field: "service", mbti: ["ISFJ", "ESFJ", "ENFP"], traits: ["問題處理", "溝通"], blurb: "協助顧客解決使用產品時遇到的困難，維護好體驗。" },
    { title: "遊戲企劃", field: "design", mbti: ["ENTP", "ENFP", "INTP"], traits: ["世界觀設定", "系統設計"], blurb: "設計遊戲規則、關卡與故事，讓玩家願意一直玩下去。" },
    { title: "動畫 / 影片製作", field: "design", mbti: ["ISFP", "INFP", "ENFP"], traits: ["剪輯", "分鏡"], blurb: "利用影像講故事，從腳本到後製都參與其中。" },
    { title: "體育教練 / 訓練員", field: "service", mbti: ["ESTP", "ESFP", "ENFJ"], traits: ["現場指導", "激勵"], blurb: "帶領選手或學員訓練，陪他們突破自己的極限。" },
    { title: "品質管理工程師", field: "tech", mbti: ["ISTJ", "ESTJ"], traits: ["檢測流程", "紀律"], blurb: "監控產品品質與流程，確保每個環節都符合標準。" },
    { title: "金融分析師 / 投資研究", field: "business", mbti: ["INTJ", "ISTJ", "ENTJ"], traits: ["數據判讀", "風險評估"], blurb: "研究市場與公司狀況，提出投資建議。" },
    { title: "營養師", field: "health", mbti: ["ISFJ", "INFJ"], traits: ["飲食規劃", "衛教"], blurb: "為不同族群設計健康菜單，推廣正確飲食觀念。" },
    { title: "環境工程師 / 永續顧問", field: "public", mbti: ["INFJ", "INTJ", "ISTJ"], traits: ["環境監測", "永續策略"], blurb: "在產業與環境之間尋找平衡，推動更永續的做法。" }
  ];

  submitBtn.addEventListener("click", () => {
    const formData = new FormData(quiz);
    const answeredQuestions = new Set();
    formData.forEach((_, key) => answeredQuestions.add(key));

    if (answeredQuestions.size < totalQuestions) {
      resultBox.innerHTML = "<p>請先完成所有題目，再幫你整理結果喔。</p>";
      return;
    }

    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    quiz
      .querySelectorAll("input[type=radio]:checked")
      .forEach(input => {
        const value = (input.value || "").toUpperCase();
        if (value && Object.prototype.hasOwnProperty.call(counts, value)) {
          counts[value] += 1;
        }
      });

    const mbtiLetters = [
      counts.E >= counts.I ? "E" : "I",
      counts.S >= counts.N ? "S" : "N",
      counts.T >= counts.F ? "T" : "F",
      counts.J >= counts.P ? "J" : "P"
    ];

    const mbti = mbtiLetters.join("");
    const profile = mbtiProfiles[mbti] || {
      name: `${mbti} 風格探索中`,
      tags: ["彈性多元"],
      summary: "你的選擇呈現出多元混合的特質，可以多做幾次或搭配其他工具一起觀察。"
    };

    const relatedJobs = allJobs.filter(job => job.mbti.includes(mbti)).slice(0, 6);

    const tagsHtml = profile.tags
      .map(tag => `<span class="quiz-tag">${tag}</span>`)
      .join("");

    const jobsHtml =
      relatedJobs.length === 0
        ? "<p>暫時沒有特別指向的職業，建議你多看看下方的「職業探索圖書館」。</p>"
        : `<p>可以優先探索的職業方向：</p>
           <ul>
             ${relatedJobs
               .map(
                 job =>
                   `<li>${job.title}（${fieldLabel(job.field)}）－${job.blurb}</li>`
               )
               .join("")}
           </ul>`;

    resultBox.innerHTML = `
      <div>
        <div class="quiz-result-type">${profile.name}</div>
        <div class="quiz-result-pill">目前測驗結果：${mbti}</div>
        <p>${profile.summary}</p>
        <div class="quiz-tags">${tagsHtml}</div>
        ${jobsHtml}
      </div>
    `;

    if (jobsPanel) {
      jobsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  if (jobsGrid) {
    renderJobsGrid(allJobs, jobsGrid);

    if (jobsFilter) {
      jobsFilter.addEventListener("change", () => {
        const value = jobsFilter.value;
        const filtered =
          value === "all" ? allJobs : allJobs.filter(job => job.field === value);
        renderJobsGrid(filtered, jobsGrid);
      });
    }
  }

  function renderJobsGrid(list, container) {
    if (!list.length) {
      container.innerHTML = "<p>目前沒有符合條件的職業，試試看選擇其他領域。</p>";
      return;
    }

    container.innerHTML = list
      .map(
        job => `
      <article class="job-card">
        <div class="job-field-tag">${fieldLabel(job.field)}</div>
        <h3 class="job-title">${job.title}</h3>
        <p class="job-description">${job.blurb}</p>
        <div class="job-pills">
          ${job.traits.map(t => `<span class="job-pill">${t}</span>`).join("")}
        </div>
      </article>
    `
      )
      .join("");
  }

  function fieldLabel(field) {
    const map = {
      tech: "科技與工程",
      data: "數據與分析",
      design: "設計與創意",
      business: "商業與行銷",
      education: "教育與輔導",
      health: "醫療與照護",
      public: "公共服務與社會議題",
      research: "研究與學術",
      service: "服務與實務現場",
      startup: "創業與產品開發",
      management: "管理與領導"
    };
    return map[field] || "其他";
  }

  function showQuestion(targetIndex, direction) {
    if (
      targetIndex < 0 ||
      targetIndex >= totalQuestions ||
      targetIndex === currentIndex
    ) {
      return;
    }

    const current = quizQuestions[currentIndex];
    const next = quizQuestions[targetIndex];
    if (!current || !next) return;

    current.classList.remove("is-active", "is-left", "is-right");
    current.classList.add(direction > 0 ? "is-left" : "is-right");

    next.classList.remove("is-left", "is-right");
    next.classList.add("is-active");

    currentIndex = targetIndex;
    updateStepLabel();
  }

  function updateStepLabel() {
    if (!stepLabel || !prevBtn || !nextBtn) return;
    stepLabel.textContent = `第 ${currentIndex + 1} / ${totalQuestions} 題`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalQuestions - 1;
  }
}

function setupCareerChatWidget() {
  const body = document.body;
  if (!body) return;

  const existingToggle = document.getElementById("careerChatToggle");
  if (existingToggle) return;

  const WEBHOOK_URL =
    "https://n8n.srv1237100.hstgr.cloud/webhook/website";

  const chatToggle = document.createElement("button");
  chatToggle.id = "careerChatToggle";
  chatToggle.type = "button";
  chatToggle.className = "chat-toggle-btn";
  chatToggle.setAttribute("aria-label", "開啟職涯聊天視窗");
  chatToggle.textContent = "聊聊職涯";

  const overlay = document.createElement("div");
  overlay.id = "careerChatOverlay";
  overlay.className = "chat-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.classList.add("notranslate");
  overlay.innerHTML = `
    <div class="chat-overlay-panel" role="dialog" aria-modal="true" aria-label="職涯規劃聊天視窗">
      <header class="chat-header">
        <div class="chat-header-title">職涯導航小幫手</div>
        <button type="button" class="chat-close-btn" aria-label="關閉聊天視窗">✕</button>
      </header>
      <div class="chat-body">
        <div class="chat-messages" id="careerChatMessages" aria-live="polite"></div>
        <form class="chat-input-row" id="careerChatForm">
          <input
            type="text"
            id="careerChatInput"
            class="chat-input"
            placeholder="可以問：我該怎麼開始規劃職涯？"
            autocomplete="off"
          />
          <button type="submit" class="chat-send-btn">送出</button>
        </form>
      </div>
    </div>
  `;

  body.appendChild(chatToggle);
  body.appendChild(overlay);

  const messagesEl = overlay.querySelector("#careerChatMessages");
  const formEl = overlay.querySelector("#careerChatForm");
  const inputEl = overlay.querySelector("#careerChatInput");
  const closeBtn = overlay.querySelector(".chat-close-btn");

  if (!messagesEl || !formEl || !inputEl || !closeBtn) {
    return;
  }

  let isOpen = false;
  const sessionId = `career-chat-${Date.now().toString(36)}`;
  let pending = false;

  function appendMessage(text, role) {
    const bubble = document.createElement("div");
    bubble.className =
      role === "user" ? "chat-message chat-message-user" : "chat-message chat-message-agent";
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setTyping(isTyping) {
    let typingEl = overlay.querySelector(".chat-typing");
    if (isTyping) {
      if (!typingEl) {
        typingEl = document.createElement("div");
        typingEl.className = "chat-typing";
        typingEl.textContent = "正在思考回覆中…";
        messagesEl.appendChild(typingEl);
      }
    } else if (typingEl) {
      typingEl.remove();
    }
  }

  function openChat() {
    if (isOpen) return;
    isOpen = true;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    body.classList.add("career-chat-open");
    window.setTimeout(() => {
      inputEl.focus();
    }, 50);

    if (!messagesEl.hasChildNodes()) {
      appendMessage(
        "嗨，我是職涯導航小幫手。可以跟我分享你現在的狀態，例如：正在選科系、找實習、或思考轉職，我會陪你一起整理下一步。",
        "agent"
      );
    }
  }

  function closeChat() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    body.classList.remove("career-chat-open");
    chatToggle.focus();
  }

async function sendToBackend(message) {
  pending = true;
  setTyping(true);

  try {
    console.log("🔵 Sending to n8n:", WEBHOOK_URL);
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        sessionId,
        source: "career-navigation-website"
      })
    });
    
    const responseText = await response.text();
    console.log("🟢 Raw response:", responseText);
    
    let replyText = "";
    
    try {
      const data = JSON.parse(responseText);
      
      // 處理 n8n 的 [{"output": "回覆"}] 格式
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        replyText = data[0].output;  // ✅ 只取出純文字回覆
      } 
      // 處理其他可能的格式
      else if (data.output) {
        replyText = data.output;
      } else if (data.reply) {
        replyText = data.reply;
      } else if (data.message) {
        replyText = data.message;
      } else if (data.text) {
        replyText = data.text;
      } else {
        replyText = responseText; // 備用：顯示原始回應
      }
      
    } catch (e) {
      replyText = responseText;
    }
    
    console.log("🟢 Clean reply:", replyText);
    
    setTyping(false);
    appendMessage(replyText, "agent");
    
  } catch (error) {
    console.error("🔴 Error:", error);
    setTyping(false);
    appendMessage("連線發生錯誤，請稍後再試。", "agent");
  } finally {
    pending = false;
  }
}

  chatToggle.addEventListener("click", () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn.addEventListener("click", () => {
    closeChat();
  });

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeChat();
    }
  });

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = (inputEl.value || "").trim();
    if (!value || pending) return;

    appendMessage(value, "user");
    inputEl.value = "";
    sendToBackend(value);
  });
}
