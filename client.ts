// YouTube Extra 1 — Content Script (TypeScript)
// Bundled with: deno bundle --config deno.jsonc client.ts > client.bundle.js

import $ from "npm:jquery@^4.0.0/slim";

const STORAGE_KEY = "ytextra1_data";
const OPTIONS_KEY = "ytextra1_options";
const STYLE_ID = "ytextra1_style";
const HASH = "ytextra1_" + Date.now().toString(12);

const DEFAULTS = {
  scale: 1,
  rotate: 0,
  top: 0,
  left: 0,
  keep: false,
};

const OPTION_DEFAULTS = {
  hide_ui: false,
};

let debug = false;
let options = { ...OPTION_DEFAULTS };
let data = { ...DEFAULTS };

/* ── helpers ──────────────────────────────────────────── */

const dump = (...list: unknown[]) => Array.from(list).forEach(item => console.debug(item));

const VIDEO_SELECTOR = "#ytd-player .html5-video-player .html5-main-video";
const CONTROLS_SELECTOR = "#ytd-player .html5-video-player .ytp-chrome-controls";
const RIGHT_CONTROLS_SELECTOR = `${CONTROLS_SELECTOR} .ytp-right-controls`;

/* ── storage ────────────────────────────────────────────── */

function loadData(): typeof DEFAULTS {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (e) {
    dump("[YTEXTRA1] Failed to load data", e);
  }
  return { ...DEFAULTS };
}

function saveData(d: typeof DEFAULTS): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

async function loadOptions(): Promise<void> {
  try {
    const stored = await chrome.storage.sync.get(OPTIONS_KEY);
    options = { ...OPTION_DEFAULTS, ...(stored[OPTIONS_KEY] || {}) };
  } catch (e) {
    dump("[YTEXTRA1] Failed to load options", e);
  }
}

/* ── style injection ────────────────────────────────────── */

function buildStyleContents(d: typeof DEFAULTS): string[] {
  const rules = [
    `${VIDEO_SELECTOR} { transform: scale(${d.scale}) rotate(${d.rotate}deg); top: ${d.top}px !important; left: ${d.left}px !important; }`,
    `${RIGHT_CONTROLS_SELECTOR} .ytp-button.ytextra1 {}`,
    `${RIGHT_CONTROLS_SELECTOR} .ytp-button.ytextra1:last-of-type { margin-right: 12px; }`,
    `${RIGHT_CONTROLS_SELECTOR} .ytp-button.ytextra1 input { width: 36px; position: relative; color: #fff; background-color: transparent; border: 1px solid #fff; }`,
    `${RIGHT_CONTROLS_SELECTOR} .ytp-button.ytextra1.keep { width: auto; }`,
    `${RIGHT_CONTROLS_SELECTOR} .ytp-button.ytextra1.keep input { width: 18px; height: 18px; vertical-align: middle; }`,
    `${RIGHT_CONTROLS_SELECTOR} .ytp-button.ytextra1 input:focus { outline: none; box-shadow: none; }`,
  ];

  if (options.hide_ui) {
    rules.push(
      `${RIGHT_CONTROLS_SELECTOR} .ytp-autonav-toggle.ytp-button { display: none !important; }`,
      `${RIGHT_CONTROLS_SELECTOR} .ytp-size-button.ytp-button { display: none !important; }`,
      `${RIGHT_CONTROLS_SELECTOR} .ytp-multicam-button.ytp-button { display: none !important; }`,
      `${RIGHT_CONTROLS_SELECTOR} .ytp-subtitles-button.ytp-button { display: none !important; }`,
      `${RIGHT_CONTROLS_SELECTOR} .ytp-miniplayer-button.ytp-button { display: none !important; }`,
      `${RIGHT_CONTROLS_SELECTOR} .ytp-pip-button.ytp-button { display: none !important; }`
    );
  }

  return rules;
}

function createStyle(d: typeof DEFAULTS): void {
  if ($("#" + STYLE_ID).length) return;
  dump("[YTEXTRA1] styleCreated");

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = buildStyleContents(d).join("\n");
  document.head.appendChild(style);
}

function updateStyle(d: typeof DEFAULTS): void {
  dump("[YTEXTRA1] styleUpdated");
  const style = document.getElementById(STYLE_ID);
  if (!style) return;

  const rules = style.sheet.cssRules;
  for (let i = 0; i < rules.length; i++) {
    if (rules[i].selectorText === VIDEO_SELECTOR) {
      rules[i].style.transform = `scale(${d.scale}) rotate(${d.rotate}deg)`;
      rules[i].style.setProperty("top", `${d.top}px`, "important");
      rules[i].style.setProperty("left", `${d.left}px`, "important");
      break;
    }
  }
}

/* ── controls ────────────────────────────────────────────── */

function throttle(callback: (...args: unknown[]) => void, limit = 100): (...args: unknown[]) => void {
  let waiting = false;
  return function (this: unknown, ...args: unknown[]) {
    if (!waiting) {
      waiting = true;
      callback.apply(this, args);
      setTimeout(() => { waiting = false; }, limit);
    }
  };
}

function injectControls(
  name: string,
  inputOptions: { type?: string; data_key?: string; min?: number; max?: number; step?: number; value?: number; title?: string },
  d: typeof DEFAULTS
): void {
  const id = HASH + "_" + name;

  if ($("#" + id).length) {
    const el = $("#" + id);
    if (inputOptions.type === "checkbox") {
      el.prop("checked", d[inputOptions.data_key as keyof typeof DEFAULTS]);
    } else {
      el.val(d[inputOptions.data_key as keyof typeof DEFAULTS]);
    }
    return;
  }

  const $rightControls = $(RIGHT_CONTROLS_SELECTOR);
  if (!$rightControls.length) return;

  const $container = $("<div/>", { class: "ytp-button ytextra1 " + name });
  const $input = $("<input/>", {
    id: id,
    type: inputOptions.type || "number",
    autocomplete: "off",
    ...inputOptions,
  });

  if (inputOptions.type === "checkbox") {
    $input.prop("checked", d[inputOptions.data_key as keyof typeof DEFAULTS]);
  } else {
    $input.val(d[inputOptions.data_key as keyof typeof DEFAULTS]);
  }

  $input.on("keypress keydown keyup", (e: Event) => e.stopPropagation());
  $input.on("input change", throttle(function (this: HTMLInputElement, e: Event) {
    e.stopPropagation();
    let val: unknown;
    if (inputOptions.type === "checkbox") {
      val = $input.prop("checked");
    } else {
      const raw = $input.val()?.toString().trim() ?? "";
      if (raw === "") {
        val = d[inputOptions.data_key as keyof typeof DEFAULTS];
      } else {
        val = Number(raw);
        if (Number.isNaN(val as number)) {
          val = d[inputOptions.data_key as keyof typeof DEFAULTS];
        } else {
          if (inputOptions.min !== undefined && (val as number) < inputOptions.min) val = inputOptions.min;
          if (inputOptions.max !== undefined && (val as number) > inputOptions.max) val = inputOptions.max;
        }
      }
    }

    d[inputOptions.data_key as keyof typeof DEFAULTS] = val as number;
    saveData(d);
    updateStyle(d);
  }));

  $container.append($input);
  $rightControls.prepend($container);
}

/* ── reset ────────────────────────────────────────────────── */

function resetControls(): void {
  data = loadData();
  if (!data.keep) {
    data = { ...data, scale: 1, rotate: 0, top: 0, left: 0 };
  }
  updateStyle(data);
}

/* ── DOM ready ────────────────────────────────────────────── */

function waitForElement(selector: string, callback: () => void, attempts = 15): void {
  const $el = $(selector);
  if ($el.length) {
    callback();
  } else if (attempts > 0) {
    setTimeout(() => waitForElement(selector, callback, attempts - 1), 800);
  } else {
    dump("[YTEXTRA1] waitForElement exhausted for", selector);
  }
}

function modifyPlayer(d: typeof DEFAULTS): void {
  waitForElement(RIGHT_CONTROLS_SELECTOR, () => {
    injectControls("scale", { data_key: "scale", min: 0, max: 3, step: 0.01, title: "Zoom In & Zoom Out" }, d);
    injectControls("move_top", { data_key: "top", step: 10, title: "Move To TOP & Opposite" }, d);
    injectControls("move_left", { data_key: "left", step: 10, title: "Move To LEFT & Opposite" }, d);
    injectControls("rotate", { data_key: "rotate", min: -360, max: 360, step: 30, title: "Rotate Clockwise & Opposite" }, d);
    injectControls("keep", { type: "checkbox", data_key: "keep", title: "Keep Values" }, d);
  }, 15);
}

/* ── message listener ────────────────────────────────────── */

chrome.runtime.onMessage.addListener((message: { is_debug?: boolean; is_watch?: boolean; type?: string; options?: unknown }) => {
  if ("is_debug" in message) debug = message.is_debug;
  if ("is_watch" in message && message.is_watch) {
    createStyle(data);
    resetControls();
    modifyPlayer(data);
  }
  if (message.type === "options_updated") {
    options = { ...options, ...(message.options as typeof options) };
    createStyle(data);
    updateStyle(data);
  }
});

/* ── init ────────────────────────────────────────────────── */

(async function init(): Promise<void> {
  await loadOptions();
  data = loadData();

  if (window.location.pathname === "/watch") {
    createStyle(data);
    resetControls();
    modifyPlayer(data);
  }
})();
