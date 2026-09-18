# YouTube Extra 1

Allows you to move, rotate, zoom video in YouTube.

<div lang="id-ID">
ini adalah ekstensi google chrome yang menambahkan kontrol lain pada player youtube,
yang memungkinkan untuk melakukan move,rotate,zoom pada video.
</div>

<div lang="en-US">
this is a google chrome extension that adding more controls on youtube player,
that allows you to move, rotate, zoom the video.
</div>

## Features

- **Zoom** — slider to scale the video from 0.1× to 3×
- **Rotate** — rotate the video in 30° increments from -360° to 360°
- **Move** — offset the video vertically and horizontally
- **Keep Values** — persist transform settings across page navigations
- **Hide YouTube UI** — opt-in hiding of autoplay, theater mode, subtitles, and other buttons (disabled by default to comply with YouTube ToS)

## Settings

Open the extension options page to configure defaults and toggle UI hiding:

```
chrome-extension://<id>/options.html
```

Settings are stored in `chrome.storage.sync` and synced across devices.

## Build

This project uses **Deno** as the build tool and package manager.

### Prerequisites

- [Deno](https://deno.land/) installed

### Build commands

```bash
# Bundle client.ts (with jQuery) → dist/client.bundle.js
deno bundle --config deno.jsonc client.ts > dist/client.bundle.js

# Bundle options.ts (with jQuery) → dist/options.bundle.js
deno bundle --config deno.jsonc options.ts > dist/options.bundle.js

# Type-check all TypeScript files
deno check client.ts options.ts mod.ts

# Format
deno fmt

# Lint
deno lint
```

### Development

```bash
# Build all bundles
deno task build

# Watch for changes and rebuild
deno task watch

# Or build individually
deno task build:client
deno task build:options
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the project root directory

## Project Structure

```
ytextra1/
├── client.ts           # Content script source (TypeScript + jQuery)
├── options.ts          # Options page source (TypeScript + jQuery)
├── worker.js           # Service worker (MV3)
├── options.html        # Options page HTML
├── options.css         # Options page styles
├── manifest.json       # Chrome extension manifest (MV3)
├── deno.jsonc          # Deno configuration
├── import_map.json     # Deno import map
├── mod.ts              # Deno build entry point
├── dist/
│   ├── client.bundle.js    # Bundled client (jQuery + client.ts)
│   └── options.bundle.js   # Bundled options (jQuery + options.ts)
├── icons/              # Extension icons (16/32/48/96/128)
└── screenshots/        # Extension screenshots
```

### Tree Shaking

Deno's bundler automatically tree-shakes unused jQuery code. Only the jQuery APIs used by each file are included in the bundle.

## License

[ISC](./LICENSE)
