// YouTube Extra 1 — Options Page (TypeScript)
// Bundled with: deno bundle --config deno.jsonc options.ts > options.bundle.js

import $ from "npm:jquery@^4.0.0/slim";

const STORAGE_KEY = "ytextra1_options";

const DEFAULTS = {
  scale: 1,
  rotate: 0,
  top: 0,
  left: 0,
  keep: true,
  hide_ui: false,
};

/** Load saved options and populate the form. */
async function loadOptions(): Promise<void> {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  const opts = { ...DEFAULTS, ...(stored[STORAGE_KEY] || {}) };

  $("#opt-scale").val(opts.scale);
  $("#opt-scale-val").text(opts.scale.toFixed(2));
  $("#opt-rotate").val(opts.rotate);
  $("#opt-rotate-val").text(opts.rotate + "°");
  $("#opt-top").val(opts.top);
  $("#opt-left").val(opts.left);
  $("#opt-keep").prop("checked", opts.keep);
  $("#opt-hide-ui").prop("checked", opts.hide_ui);
}

/** Read current form values and return as an options object. */
function readForm(): Record<string, unknown> {
  return {
    scale: parseFloat($("#opt-scale").val()?.toString() ?? "1"),
    rotate: parseInt($("#opt-rotate").val()?.toString() ?? "0", 10),
    top: parseInt($("#opt-top").val()?.toString() ?? "0", 10) || 0,
    left: parseInt($("#opt-left").val()?.toString() ?? "0", 10) || 0,
    keep: $("#opt-keep").prop("checked") as boolean,
    hide_ui: $("#opt-hide-ui").prop("checked") as boolean,
  };
}

/** Save options to chrome.storage.sync. */
async function saveOptions(e: Event): Promise<void> {
  e.preventDefault();
  const opts = readForm();
  await chrome.storage.sync.set({ [STORAGE_KEY]: opts });

  const status = $("#status");
  status.prop("hidden", false);
  setTimeout(() => { status.prop("hidden", true); }, 2000);

  // Notify the content script to apply new settings immediately
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "options_updated", options: opts });
    }
  });
}

/** Reset form to defaults. */
function resetOptions(): void {
  $("#opt-scale").val(DEFAULTS.scale);
  $("#opt-scale-val").text(DEFAULTS.scale.toFixed(2));
  $("#opt-rotate").val(DEFAULTS.rotate);
  $("#opt-rotate-val").text(DEFAULTS.rotate + "°");
  $("#opt-top").val(DEFAULTS.top);
  $("#opt-left").val(DEFAULTS.left);
  $("#opt-keep").prop("checked", DEFAULTS.keep);
  $("#opt-hide-ui").prop("checked", DEFAULTS.hide_ui);
}

// Bind events
$(() => {
  loadOptions();
  $("#options-form").on("submit", saveOptions);
  $("#btn-reset").on("click", resetOptions);

  // Update range display values live
  $("#opt-scale").on("input", (e: Event) => {
    const target = e.target as HTMLInputElement;
    $("#opt-scale-val").text(parseFloat(target.value).toFixed(2));
  });
  $("#opt-rotate").on("input", (e: Event) => {
    const target = e.target as HTMLInputElement;
    $("#opt-rotate-val").text(target.value + "°");
  });
});
