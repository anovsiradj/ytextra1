// watch.ts — rebuild bundles when source files change
// Usage: deno run --watch -c deno.jsonc --allow-read --allow-write --allow-run watch.ts

function build(): void {
  try {
    Deno.run({ cmd: ["deno", "bundle", "--config", "deno.jsonc", "client.ts"], stdout: "piped", stderr: "piped" }).status();
    Deno.run({ cmd: ["deno", "bundle", "--config", "deno.jsonc", "options.ts"], stdout: "piped", stderr: "piped" }).status();
    console.log("[watch] Build complete");
  } catch (e) {
    console.error("[watch] Build failed:", e);
  }
}

build();
