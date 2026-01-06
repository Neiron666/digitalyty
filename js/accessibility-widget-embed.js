/* Accessibility Widget – ES6, no storage.
   - Keyboard nav (headings/regions) + focus ring
   - Arrow navigation inside the widget panel
   - High contrast via wrapper (safe text colors)
*/
(() => {
    "use strict";

    if (window.__ACCY_EMBED__) return;
    window.__ACCY_EMBED__ = true;

    const NS = "accy";
    const WRAP_ID = "accy-contrast-wrap";

    /* ---------- GLOBAL CSS ---------- */
    const globalCSS = `
  /* OpenDyslexic (CDN) */
  @font-face{
    font-family:"OpenDyslexic";
    src:url("https://cdn.jsdelivr.net/gh/antijingoist/open-dyslexic/alternatives/OpenDyslexic-Regular.otf") format("opentype");
    font-weight:400; font-style:normal; font-display:swap;
  }

  /* Readable stacks with Hebrew */
  :root.${NS}--readable-font,
  html.${NS}--readable-font,
  body.${NS}--readable-font,
  body.${NS}--readable-font *{
    font-family:"Heebo","Rubik","Noto Sans Hebrew",system-ui,-apple-system,"Segoe UI",Arial,sans-serif !important;
  }
  :root.${NS}--dyslexic,
  html.${NS}--dyslexic,
  body.${NS}--dyslexic,
  body.${NS}--dyslexic *{
    font-family:"OpenDyslexic","Heebo","Rubik","Noto Sans Hebrew",system-ui,Arial,sans-serif !important;
  }

  /* Global focus ring */
  :root.${NS}--focus-outline *:focus{
    outline:3px solid #2ea8ff !important;
    outline-offset:2px;
  }

  /* Underline headings */
  :root.${NS}--underline-headings h1{  border: 2px solid yellow; text-decoration: underline; outline: 2px dashed red; outline-offset: 4px;}
  :root.${NS}--underline-headings h2{  border: 2px solid yellow; text-decoration: underline; outline: 2px dashed red; outline-offset: 4px;}
  :root.${NS}--underline-headings h3{  border: 2px solid yellow; text-decoration: underline; outline: 2px dashed red; outline-offset: 4px;}
  :root.${NS}--underline-headings h4{  border: 2px solid yellow; text-decoration: underline; outline: 2px dashed red; outline-offset: 4px;}
  :root.${NS}--underline-headings h5{  border: 2px solid yellow; text-decoration: underline; outline: 2px dashed red; outline-offset: 4px;}
  :root.${NS}--underline-headings h6{  border: 2px solid yellow; text-decoration: underline; outline: 2px dashed red; outline-offset: 4px;}

  /* Highlight links/buttons */
  :root.${NS}--highlight-links a,
  :root.${NS}--highlight-links button,
  :root.${NS}--highlight-links [role="button"]{
    outline:2px dashed #f00 !important; background:#ff0 !important;
  }

  /* Current target highlight for page keyboard nav */
  .${NS}-nav-current{
    outline:3px solid #2ea8ff !important;
    outline-offset:2px;
    border-radius:6px;
  }

  /* === High contrast using WRAPPER (keeps widget normal) === */
  #${WRAP_ID}.${NS}--contrast-on{
    filter: invert(100%) hue-rotate(180deg) !important;
    background:#000 !important;
  }
  #${WRAP_ID}.${NS}--contrast-on :where(img,video,svg,picture,canvas,iframe){
    filter: invert(100%) hue-rotate(180deg) !important;
  }
  #${WRAP_ID}.${NS}--contrast-on :where(h1,h2,h3,h4,h5,h6,p,span,a,li,label,button,input,select,textarea){
    color:invert(100%) !important;
    background-color:transparent !important;
  }
  `;

    const globalStyle = document.createElement("style");
    globalStyle.textContent = globalCSS;
    document.head.appendChild(globalStyle);

    /* ---------- HOST + SHADOW (WIDGET UI) ---------- */
    const host = document.createElement("div");
    host.id = "accessibility-widget-host";
    host.style.position = "fixed";
    host.style.zIndex = "99999";
    host.style.inset = "80px auto auto 8px"; // top-left
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });

    const uiCSS = `
  .accy{ font-family:inherit; direction:rtl; }
  .accy__fab{
    display:flex;align-items:center;justify-content:center;width:44px;height:44px;
    border-radius:12px;border:1px solid #cfd3d9;background:#000;color:#fff;font-size:20px;
    cursor:pointer;opacity:.55;transition:opacity .2s,transform .2s,background .2s,color .2s;
  }
  .accy__fab:hover,.accy__fab:focus,.accy__fab[aria-expanded="true"]{
    opacity:1;background:#00eaff;color:#001014;outline:none;
  }

  /* BACKDROP */
  .accy__backdrop{
    position:fixed; inset:0; display:none;
    background:rgba(0,0,0,0); /* прозрачный захватчик кликов */
    z-index:1; /* ниже панели, выше страницы */
    touch-action:none;
  }
  .accy__backdrop.show{ display:block; }

  .accy__panel{
    position:absolute;top:52px;left:0;width:420px;max-width:92vw;background:#fff;color:#0b1520;
    border-radius:10px;border:1px solid #d7dee6;box-shadow:0 10px 30px rgba(0,0,0,.2);
    display:none;opacity:0;transform:translateY(-6px);transition:opacity .2s,transform .2s;
    font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif;
    z-index:2; /* выше backdrop */
    /* MOBILE PANEL CONSTRAINTS */
    max-height:70vh; overflow:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain;
  }
  .accy__panel.show{ display:block;opacity:1;transform:translateY(0); }

  .accy__header{
    background:#00eaff;color:#001014;padding:12px 14px;border-radius:10px 10px 0 0;
    display:flex;align-items:center;justify-content:space-between;
    position:sticky; top:0; z-index:3; /* шапка «прилипает» при внутреннем скролле */
  }
  .accy__title{ margin:0;font-size:20px;font-weight:700; }
  .accy__close{ background:transparent;border:0;font-size:28px;line-height:1;color:#001014;cursor:pointer; }

  .accy__list{ list-style:none;margin:0;padding:8px 0;background:#f6f8fb; }
  .accy__item{
    display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;
    padding:10px 12px;background:#fff;border-bottom:1px solid #edf1f6;
  }
  .accy__item:nth-child(even){ background:#fbfdff; }
  .accy__item:first-child{display:flex;flex-wrap:wrap;background:#fbfdff; }
  .accy__icon{ opacity:.9;width:22px;text-align:center; }
  .accy__label{ font-size:15px; }

  .accy__switch{ position:relative;width:44px;height:24px;display:inline-block; }
  .accy__switch input{ opacity:0;width:0;height:0; }
  .accy__slider{ position:absolute;inset:0;background:#c8d0d9;border-radius:30px;transition:background .2s; }
  .accy__slider::before{
    content:"";position:absolute;height:18px;width:18px;top:3px;right:3px;background:#fff;
    border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .2s;
  }
  .accy__switch input:checked + .accy__slider{ background:#00eaff; }
  .accy__switch input:checked + .accy__slider::before{ transform:translateX(-20px); }

  .accy__qty{ display:flex;align-items:center;gap:8px; }
  .accy__btn{ width:34px;height:28px;border-radius:8px;border:1px solid #cfd3d9;background:#fff;cursor:pointer; }
  #accy-font{ min-width:54px;text-align:center;font-variant-numeric:tabular-nums; }

  .accy__select{ display:flex;gap:8px;align-items:center; }
  .accy__select select{ padding:4px 6px;border-radius:8px;border:1px solid #cfd3d9;background:#fff; }

  .accy__footer{
    display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;
    background:#fff;border-top:1px solid #edf1f6;border-radius:0 0 10px 10px;
    position:sticky; bottom:0; /* футер всегда виден при скролле панели */
  }
  .accy__reset{ border:1px solid #e04a4a;background:#fff;color:#e04a4a;border-radius:8px;padding:6px 10px;cursor:pointer; }
  .accy__reset:hover{ background:#ffe8e8; }

  :host([data-focus-outline]) *:focus{ outline:3px solid #2ea8ff !important; outline-offset:2px; }
  .accy__switch.is-focused .accy__slider{ outline:3px solid #2ea8ff; outline-offset:2px; }
  `;

    const styleEl = document.createElement("style");
    styleEl.textContent = uiCSS;

    const wrapper = document.createElement("div");
    wrapper.className = "accy";
    wrapper.innerHTML = `
    <button id="btn" class="accy__fab" aria-label="פתח תפריט נגישות" aria-expanded="false" aria-controls="panel" title="נגישות">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M11 4a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
        <path d="M6.5 21l3.5 -5" />
        <path d="M5 11l7 -2" />
        <path d="M16 21l-4 -7v-5l7 -4" />
      </svg>
    </button>

    <!-- BACKDROP -->
    <div id="backdrop" class="accy__backdrop" aria-hidden="true"></div>

    <aside id="panel" class="accy__panel" role="dialog" aria-modal="true" aria-label="תפריט נגישות">
      <header class="accy__header">
        <h2 class="accy__title">תפריט נגישות</h2>
        <button class="accy__close" aria-label="סגור תפריט" data-close>&times;</button>
      </header>

      <ul class="accy__list">
        <!-- Keyboard nav row -->
        <li class="accy__item">
          <span class="accy__icon">⌨️</span>
          <div class="accy__select" style="grid-column: 2 / span 2;">
            <label for="accy-nav-mode" class="accy__label">ניווט מקלדת (טבעת פוקוס)</label>
            <select id="accy-nav-mode" aria-label="מצב ניווט">
              <option value="headings">ניווט לפי כותרות</option>
              <option value="regions">ניווט לפי אזורים/סקשנים</option>
            </select>
            <label class="accy__switch" title="הפעל ניווט">
              <input type="checkbox" data-action="focus-nav" role="switch" aria-label="הפעל ניווט">
              <span class="accy__slider"></span>
            </label>
          </div>
        </li>

        <!-- Contrast -->
        <li class="accy__item">
          <span class="accy__icon">🌙</span>
          <span class="accy__label">ניגודיות גבוהה</span>
          <label class="accy__switch">
            <input type="checkbox" data-action="contrast" role="switch" aria-label="ניגודיות גבוהה">
            <span class="accy__slider"></span>
          </label>
        </li>

        <!-- Font size -->
        <li class="accy__item">
          <span class="accy__icon">🔤</span>
          <span class="accy__label">הגדלת טקסט</span>
          <div class="accy__qty">
            <button class="accy__btn" data-font="-">–</button>
            <output id="accy-font" aria-live="polite">100%</output>
            <button class="accy__btn" data-font="+">+</button>
          </div>
        </li>

        <!-- Readable font -->
        <li class="accy__item">
          <span class="accy__icon">🅰️</span>
          <span class="accy__label">גופן קריא (System UI)</span>
          <label class="accy__switch">
            <input type="checkbox" data-action="readable-font" role="switch" aria-label="גופן קריא">
            <span class="accy__slider"></span>
          </label>
        </li>

        <!-- OpenDyslexic -->
        <li class="accy__item">
          <span class="accy__icon">📖</span>
          <span class="accy__label">OpenDyslexic</span>
          <label class="accy__switch">
            <input type="checkbox" data-action="dyslexic" role="switch" aria-label="OpenDyslexic">
            <span class="accy__slider"></span>
          </label>
        </li>

        <!-- Underline headings -->
        <li class="accy__item">
          <span class="accy__icon">T</span>
          <span class="accy__label">סימון כותרות</span>
          <label class="accy__switch">
            <input type="checkbox" data-action="underline-headings" role="switch" aria-label="קו תחתון לכותרות">
            <span class="accy__slider"></span>
          </label>
        </li>

        <!-- Highlight links/buttons -->
        <li class="accy__item">
          <span class="accy__icon">🔗</span>
          <span class="accy__label">סימון קישורים ולחצנים</span>
          <label class="accy__switch">
            <input type="checkbox" data-action="highlight-links" role="switch" aria-label="הדגש קישורים">
            <span class="accy__slider"></span>
          </label>
        </li>

        <!-- TTS (screen reader) -->
        <li class="accy__item">
          <span class="accy__icon" aria-hidden="true">🔊</span>
          <span class="accy__label">הקראת טקסט</span>
          <label class="accy__switch">
            <input type="checkbox" data-action="tts" role="switch" aria-label="הקראת טקסט">
            <span class="accy__slider"></span>
          </label>
          <div class="accy__qty" style="grid-column: 1 / span 3; padding-inline-start: 32px; gap:6px;">
            <button class="accy__btn" data-tts="play" aria-label="נגן טקסט">▶</button>
            <button class="accy__btn" data-tts="pause" aria-label="השהה / המשך">⏸</button>
            <button class="accy__btn" data-tts="stop" aria-label="עצור">■</button>
            <label for="accy-tts-rate" class="accy__label" style="margin-inline-start:8px;">מהירות</label>
            <input id="accy-tts-rate" type="range" min="0.6" max="1.8" step="0.1" value="1" aria-label="מהירות הקראה" style="width:120px;">
            <small id="accy-tts-support" style="margin-inline-start:8px;"></small>
          </div>
        </li>

        <!-- Disable animations -->
        <li class="accy__item">
          <span class="accy__icon">💤</span>
          <span class="accy__label">ביטול אנימציות / הבהובים</span>
          <label class="accy__switch">
            <input type="checkbox" data-action="animations" role="switch" aria-label="ביטול אנימציות">
            <span class="accy__slider"></span>
          </label>
        </li>
      </ul>

      <footer class="accy__footer">
        <button class="accy__reset" id="accy-reset">איפוס</button>
        <small>מופעל ע״י <a href="https://digitalyty.co.il" target="_blank" rel="noopener">Digitalyty</a></small>
      </footer>
    </aside>
  `;
    shadow.append(styleEl, wrapper);

    /* ---------- Refs ---------- */
    const btn = shadow.getElementById("btn");
    const panel = shadow.getElementById("panel");
    const backdrop = shadow.getElementById("backdrop"); /* BACKDROP REF */
    const fontOut = shadow.getElementById("accy-font");
    const resetBtn = shadow.getElementById("accy-reset");
    const navModeEl = shadow.getElementById("accy-nav-mode");

    /* ---------- State ---------- */
    let fontSize = 100;
    let navOn = false;
    let navMode = "headings"; // "headings" | "regions"
    let targets = [];
    let navIdx = -1;

    /* ---------- TTS state ---------- */
    let ttsOn = false;
    let ttsRate = 1;
    let ttsUtter = null;
    const ttsSupportEl = shadow.getElementById("accy-tts-support");
    const ttsRateEl = shadow.getElementById("accy-tts-rate");
    const ttsBtns = () => [
        ...panel.querySelectorAll(
            '[data-tts="play"],[data-tts="pause"],[data-tts="stop"]'
        ),
    ];

    /* ---------- Panel open/close ---------- */
    btn.addEventListener("click", togglePanel);
    panel.querySelector("[data-close]").addEventListener("click", closePanel);
    backdrop.addEventListener("click", closePanel); /* BACKDROP closes panel */

    function togglePanel() {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        panel.classList.toggle("show", !expanded);
        backdrop.classList.toggle("show", !expanded); /* BACKDROP toggle */
        if (!expanded) {
            const first = nextFocusables()[0];
            if (first) first.focus();
        }
    }
    function closePanel() {
        btn.setAttribute("aria-expanded", "false");
        panel.classList.remove("show");
        backdrop.classList.remove("show"); /* BACKDROP hide */
        btn.focus();
    }

    /* ---------- Contrast wrapper helpers ---------- */
    function ensureContrastWrap() {
        let wrap = document.getElementById(WRAP_ID);
        if (wrap) return wrap;

        wrap = document.createElement("div");
        wrap.id = WRAP_ID;
        wrap.style.minHeight = "100%";

        const nodesToMove = [];
        for (const node of Array.from(document.body.childNodes)) {
            if (node === host || node === wrap) continue;
            nodesToMove.push(node);
        }
        document.body.insertBefore(wrap, host);
        nodesToMove.forEach((n) => wrap.appendChild(n));
        return wrap;
    }

    /* ---------- Navigation targets (page) ---------- */
    function selectorFor(mode) {
        return mode === "regions"
            ? "main, section, article, aside, nav, header, footer"
            : "h1, h2, h3, h4, h5, h6";
    }
    function collectTargets() {
        const sel = selectorFor(navMode);
        targets = Array.from(document.querySelectorAll(sel)).filter(
            (el) => !host.contains(el)
        );
        targets.forEach((el) => {
            if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
        });
    }
    function clearCurrent() {
        document
            .querySelectorAll(`.${NS}-nav-current`)
            .forEach((el) => el.classList.remove(`${NS}-nav-current`));
    }
    function focusTarget(i) {
        if (!targets.length) return;
        const idx = Math.max(0, Math.min(targets.length - 1, i));
        navIdx = idx;
        const el = targets[navIdx];
        clearCurrent();
        el.classList.add(`${NS}-nav-current`);
        try {
            el.focus({ preventScroll: true });
        } catch {
            el.focus();
        }
        el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    function nearestIndex() {
        if (!targets.length) return -1;
        const pageY = window.scrollY || document.documentElement.scrollTop || 0;
        let idx = targets.findIndex(
            (t) => t.getBoundingClientRect().top + pageY >= pageY + 2
        );
        if (idx === -1) idx = targets.length - 1;
        return idx;
    }

    /* ---------- Global keyboard handler ---------- */
    document.addEventListener("keydown", (e) => {
        const panelOpen = panel.classList.contains("show");

        /* ESC closes when panel open */
        if (panelOpen && e.key === "Escape") {
            e.preventDefault();
            closePanel();
            return;
        }

        // Arrow navigation inside panel
        if (
            panelOpen &&
            shadow.activeElement &&
            panel.contains(shadow.activeElement)
        ) {
            if (handlePanelArrows(e)) return;
            return; // do not fall-through to page nav while in panel
        }

        // Page navigation
        if (!navOn) return;

        const ae = document.activeElement;
        const isField =
            ae &&
            (ae.tagName === "INPUT" ||
                ae.tagName === "TEXTAREA" ||
                ae.isContentEditable);
        if (isField) return;

        if (
            e.key === "ArrowDown" ||
            e.key === "ArrowUp" ||
            e.key === "Home" ||
            e.key === "End"
        ) {
            e.preventDefault();
            if (!targets.length) collectTargets();
            if (navIdx < 0) navIdx = nearestIndex();
            if (e.key === "ArrowDown") focusTarget(navIdx + 1);
            else if (e.key === "ArrowUp") focusTarget(navIdx - 1);
            else if (e.key === "Home") focusTarget(0);
            else if (e.key === "End") focusTarget(targets.length - 1);
        }
    });

    /* ---------- Arrow navigation inside panel ---------- */
    function nextFocusables() {
        return [
            ...panel.querySelectorAll(
                'button, [role="switch"], select, input, a[href], [tabindex]:not([tabindex="-1"])'
            ),
        ].filter(
            (el) =>
                !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
        );
    }
    function handlePanelArrows(e) {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key))
            return false;
        const focusables = nextFocusables();
        if (!focusables.length) return false;

        const i = focusables.indexOf(shadow.activeElement);
        e.preventDefault();
        if (e.key === "ArrowDown")
            focusables[(i + 1) % focusables.length].focus();
        else if (e.key === "ArrowUp")
            focusables[(i - 1 + focusables.length) % focusables.length].focus();
        else if (e.key === "Home") focusables[0].focus();
        else if (e.key === "End") focusables[focusables.length - 1].focus();
        return true;
    }

    /* ---------- Switches & controls ---------- */
    panel.querySelectorAll('input[role="switch"]').forEach((chk) => {
        const action = chk.dataset.action;
        const box = chk.closest(".accy__switch");
        chk.addEventListener("focus", () => box.classList.add("is-focused"));
        chk.addEventListener("blur", () => box.classList.remove("is-focused"));
        chk.addEventListener("change", () => runAction(action, chk.checked));
    });

    navModeEl.addEventListener("change", () => {
        navMode = navModeEl.value;
        if (navOn) {
            collectTargets();
            navIdx = nearestIndex();
            clearCurrent();
            if (navIdx >= 0 && targets[navIdx]) {
                targets[navIdx].classList.add(`${NS}-nav-current`);
            }
        }
    });

    // Font size
    panel.querySelectorAll("[data-font]").forEach((b) => {
        b.addEventListener("click", () => {
            const dir = b.dataset.font;
            fontSize = Math.max(
                70,
                Math.min(200, fontSize + (dir === "+" ? 10 : -10))
            );
            document.documentElement.style.fontSize = `${fontSize}%`;
            fontOut.textContent = `${fontSize}%`;
        });
    });

    /* ---------- TTS controls ---------- */
    if (!("speechSynthesis" in window)) {
        const msg = "הקריאה בקול אינה נתמכת בדפדפן זה";
        if (ttsSupportEl) ttsSupportEl.textContent = msg;
        ttsBtns().forEach((b) => (b.disabled = true));
        const ttsSwitch = panel.querySelector('input[data-action="tts"]');
        if (ttsSwitch) {
            ttsSwitch.disabled = true;
            ttsSwitch.setAttribute("aria-disabled", "true");
        }
    } else {
        if (ttsSupportEl) ttsSupportEl.textContent = "";
        ttsRateEl?.addEventListener("input", () => {
            ttsRate = Number(ttsRateEl.value) || 1;
            if (ttsUtter) ttsUtter.rate = ttsRate;
        });
        ttsBtns().forEach((b) =>
            b.addEventListener("click", () =>
                handleTTS(b.getAttribute("data-tts"))
            )
        );
    }

    // Full reset
    resetBtn.addEventListener("click", () => {
        document.documentElement.style.fontSize = "";
        fontSize = 100;
        fontOut.textContent = "100%";

        panel
            .querySelectorAll('input[role="switch"]')
            .forEach((i) => (i.checked = false));

        document.documentElement.classList.remove(
            `${NS}--readable-font`,
            `${NS}--dyslexic`,
            `${NS}--focus-outline`,
            `${NS}--underline-headings`,
            `${NS}--highlight-links`
        );
        document.body.classList.remove(
            `${NS}--readable-font`,
            `${NS}--dyslexic`
        );

        const wrap = document.getElementById(WRAP_ID);
        if (wrap) wrap.classList.remove(`${NS}--contrast-on`);

        disableAnimations(false);

        navOn = false;
        targets = [];
        navIdx = -1;
        clearCurrent();
        host.removeAttribute("data-focus-outline");

        // stop TTS
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            ttsUtter = null;
            ttsOn = false;
        }
    });

    /* ---------- Actions ---------- */
    function runAction(action, on) {
        switch (action) {
            case "focus-nav":
                document.documentElement.classList.toggle(
                    `${NS}--focus-outline`,
                    on
                );
                host.toggleAttribute("data-focus-outline", on);
                navOn = on;
                if (on) {
                    collectTargets();
                    navIdx = nearestIndex();
                    clearCurrent();
                    if (navIdx >= 0 && targets[navIdx]) {
                        targets[navIdx].classList.add(`${NS}-nav-current`);
                    }
                } else {
                    clearCurrent();
                    navIdx = -1;
                }
                break;

            case "contrast": {
                const wrap = ensureContrastWrap();
                wrap.classList.toggle(`${NS}--contrast-on`, on);
                break;
            }

            case "readable-font":
                document.documentElement.classList.toggle(
                    `${NS}--readable-font`,
                    on
                );
                document.body.classList.toggle(`${NS}--readable-font`, on);
                break;

            case "dyslexic":
                document.documentElement.classList.toggle(
                    `${NS}--dyslexic`,
                    on
                );
                document.body.classList.toggle(`${NS}--dyslexic`, on);
                break;

            case "underline-headings":
                document.documentElement.classList.toggle(
                    `${NS}--underline-headings`,
                    on
                );
                break;

            case "highlight-links":
                document.documentElement.classList.toggle(
                    `${NS}--highlight-links`,
                    on
                );
                break;

            case "animations":
                disableAnimations(on);
                break;

            /* TTS (screen reader) */
            case "tts":
                ttsOn = on && "speechSynthesis" in window;
                if (!ttsOn && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    ttsUtter = null;
                }
                ttsBtns().forEach((b) => (b.disabled = !ttsOn));
                ttsRateEl && (ttsRateEl.disabled = !ttsOn);
                break;
        }
    }

    /* ---------- TTS helpers ---------- */
    function textToRead() {
        const sel = window.getSelection && String(window.getSelection()).trim();
        if (sel && sel.length > 1) return sel;

        const main =
            document.querySelector("main, article, [role='main']") ||
            document.body;
        let txt = (main.innerText || "").replace(/\s+\n/g, "\n").trim();
        if (txt.length > 4000) txt = txt.slice(0, 4000);
        return txt;
    }

    function pickLang() {
        const html = document.documentElement;
        const heGuess =
            html.getAttribute("lang")?.toLowerCase().includes("he") ||
            html.dir === "rtl" ||
            /[\u0590-\u05FF]/.test(document.body?.innerText || "");
        return heGuess ? "he-IL" : html.lang || "en-US";
    }

    function handleTTS(cmd) {
        if (!ttsOn || !("speechSynthesis" in window)) return;

        const synth = window.speechSynthesis;

        if (cmd === "stop") {
            synth.cancel();
            ttsUtter = null;
            return;
        }

        if (cmd === "pause") {
            if (synth.speaking && !synth.paused) synth.pause();
            else if (synth.paused) synth.resume();
            return;
        }

        if (cmd === "play") {
            synth.cancel();

            const txt = textToRead();
            if (!txt) return;

            const utter = new SpeechSynthesisUtterance(txt);
            utter.rate = ttsRate;
            utter.lang = pickLang();

            const trySetVoice = () => {
                const voices = synth.getVoices() || [];
                const best =
                    voices.find((v) =>
                        v.lang
                            ?.toLowerCase()
                            .startsWith(utter.lang.toLowerCase())
                    ) ||
                    voices.find((v) =>
                        v.lang?.toLowerCase().startsWith("he")
                    ) ||
                    voices.find((v) => v.default) ||
                    voices[0];
                if (best) utter.voice = best;
            };
            trySetVoice();
            synth.onvoiceschanged = trySetVoice;

            ttsUtter = utter;
            try {
                synth.speak(utter);
            } catch {}
            return;
        }
    }

    function disableAnimations(on) {
        const id = "accy-disable-animations";
        let style = document.getElementById(id);
        if (on && !style) {
            style = document.createElement("style");
            style.id = id;
            style.textContent =
                "*{animation:none !important;transition:none !important;scroll-behavior:auto !important}";
            document.head.appendChild(style);
        } else if (!on && style) {
            style.remove();
        }

        const host = document.getElementById("accessibility-widget-host");

        const toggleMedia = (playState) => {
            const media = Array.from(
                document.querySelectorAll("video, audio")
            ).filter((el) => !host || !host.contains(el));

            for (const el of media) {
                if (playState === "pause") {
                    if (!el.paused && !el.dataset.accyWasPlaying) {
                        el.dataset.accyWasPlaying = "1";
                    }
                    try {
                        el.pause();
                    } catch {}
                } else {
                    if (el.dataset.accyWasPlaying === "1") {
                        delete el.dataset.accyWasPlaying;
                        try {
                            el.play();
                        } catch {}
                    }
                }
            }

            const animHosts = Array.from(document.querySelectorAll("*")).filter(
                (el) => !host || !host.contains(el)
            );
            for (const el of animHosts) {
                const hasPause = typeof el.pause === "function";
                const hasPlay = typeof el.play === "function";
                if (!hasPause && !hasPlay) continue;

                if (playState === "pause" && hasPause) {
                    if (!el.dataset.accyWasPlaying)
                        el.dataset.accyWasPlaying = "1";
                    try {
                        el.pause();
                    } catch {}
                } else if (playState === "play" && hasPlay) {
                    if (el.dataset.accyWasPlaying === "1") {
                        delete el.dataset.accyWasPlaying;
                        try {
                            el.play();
                        } catch {}
                    }
                }
            }
        };

        if (on) toggleMedia("pause");
        else toggleMedia("play");
    }
})();
