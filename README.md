# Palettea

> **Explore colors. Build harmony.**

Palettea is a modern, responsive web-based color toolkit engineered for designers and frontend developers. It provides an all-in-one suite to explore, generate, convert, inspect, evaluate contrast, manage, and export color palettes with zero backend dependencies.

Designed with **Modern Minimalist (80%) + Soft Neobrutalism (20%)** aesthetics, Palettea maintains a neutral, clean canvas with tactile feedback so your colors remain the focal point.

---

## Features

### 1. Color Picker & Inspector (Phase 2)
- Synchronized dual-input interface with native HTML5 color picker and validated HEX input.
- Real-time color identification using [The Color API](https://www.thecolorapi.com/) `/id` endpoint.
- Displays color names and representations across **HEX, RGB, HSL, HSV, CMYK, and CIE XYZ**.
- In-memory request caching and `AbortController` request cancellation to prevent race conditions.
- Contrast-aware swatch overlay and one-click copy with immediate feedback.

### 2. Color Scheme Generator (Phase 3)
- Generates harmonious palettes using The Color API `/scheme` endpoint.
- Supports 6 core harmony modes: **Complementary, Analogous, Triadic, Analogous-Complementary (Split), Monochrome, and Quad / Tetradic**.
- Configurable palette size (2 to 10 colors).
- Global keyboard shortcut: Press `Space` to randomize base color (strictly guarded when focusing inputs or open modals).
- Direct bidirectional handoff to Color Inspector and Palette Management.

### 3. Color Converter (Phase 4)
- 100% client-side, zero-latency mathematical color conversion engine.
- Real-time bidirectional synchronization between **HEX (#RRGGBB), RGB (0-255), HSL (0-360°, 0-100%, 0-100%), HSV (0-360°, 0-100%, 0-100%), and CMYK (0-100%)**.
- Robust input parser supporting raw numbers and CSS function notation (e.g. `rgb(...)`, `hsl(...)`).
- Live format toggle between raw numeric values and formatted CSS syntax.

### 4. Contrast & Accessibility Checker (Phase 5)
- WCAG 2.2 contrast ratio calculation using standard relative luminance formulas.
- Independent verification against 5 criteria: **Normal Text AA (4.5:1), Large Text AA (3.0:1), Normal Text AAA (7.0:1), Large Text AAA (4.5:1), and UI Components AA (3.0:1)**.
- Live context preview canvas with real-time typography, UI buttons, and card demonstrations.
- Smart color improvement suggestions that preserve hue and saturation while reaching target contrast.
- One-click foreground/background color swapping and curated high-contrast presets.

### 5. Palette & Collections Management (Phase 6)
- Offline-first LocalStorage persistence with schema versioning (`v1`) and data integrity guards.
- Comprehensive palette CRUD: create, edit title/description, add/remove colors, and reorder swatches.
- Collections organization: group palettes into named collections (deleting a collection safely unassigns palettes rather than deleting them).
- Real-time search across palette names, descriptions, color names, and HEX codes.
- Multi-criteria filtering (All, Unassigned, Collection tabs) and sorting (Updated, Created, Name A-Z, Name Z-A).

### 6. Export & Developer Tools (Phase 7)
- **CSS Custom Properties**: Generates `:root { --color-... }` variables with customizable prefix, selector, and disambiguated names.
- **CSS Utility Classes**: Generates `.color-...` and `.color-...-background` utilities.
- **Tailwind CSS Configurations**: Supports modern Tailwind v4 CSS `@theme` as well as Tailwind v3 ESM (`.js`), TypeScript (`.ts`), and CommonJS (`.cjs`).
- **Valid JSON Palette**: Parseable JSON palette object with complete color space representations.
- **Vector SVG Export**: Standalone vector SVG with horizontal/vertical layouts, contrast-aware swatch typography, and safe XML escaping.
- **Semantic Token Generator**: Maps palette colors to semantic design roles (`primary`, `secondary`, `accent`, `surface`, etc.).
- **Color Code Generator**: Live format inspection for individual colors.
- Safe client-side file download with filename normalization.

### 7. Polish & Production Readiness (Phase 8)
- WCAG 2.2 AA accessibility: keyboard navigation, visible focus rings, modal focus trapping and restoration, and screen-reader announcements.
- Dark and light theme engine with system media query detection and safe LocalStorage fallback.
- Multi-stage Docker containerization with non-root unprivileged Nginx serving static assets on port `8080`.
- Complete test coverage with 185 passing unit and integration tests.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime & Package Manager** | [Bun](https://bun.sh/) (v1.2+) |
| **Framework** | [Svelte 5](https://svelte.dev/) (using Runes: `$state`, `$derived`, `$effect`) |
| **Build Tool & Dev Server** | [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons** | [Lucide Svelte](https://lucide.dev/) (Tree-shaken) |
| **External API** | [The Color API](https://www.thecolorapi.com/) (Endpoints: `/id`, `/scheme`) |
| **Persistence** | Browser `localStorage` (Namespaced: `palettea:*`) |
| **Testing** | Bun Test Runner (`bun test`) |
| **Containerization** | Multi-stage Docker (Bun builder + unprivileged Nginx runner) |

---

## Requirements

- **Bun**: v1.0.0 or later (v1.2+ recommended)
- **Modern Browser**: Chrome/Edge (88+), Firefox (84+), Safari (14+), or any browser supporting ES2022+

---

## Getting Started

### 1. Installation

Clone the repository and install dependencies using Bun:

```bash
git clone https://github.com/username/palettea.git
cd palettea
bun install
```

### 2. Development Server

Start Vite in development mode:

```bash
bun run dev
```

Open your browser at `http://localhost:5173`.

### 3. Static Validation & Tests

```bash
# Run TypeScript and Svelte diagnostics
bun run check

# Run unit and integration tests (185 tests)
bun run test

# Run tests in watch mode
bun test --watch
```

### 4. Production Build

Compile the application into static production assets:

```bash
bun run build
```

The optimized build artifacts are output to the `dist/` directory.

To preview the production build locally:

```bash
bun run preview
```

---

## Docker Production Setup

Palettea includes a multi-stage production `Dockerfile` and `nginx.conf`:
- **Builder Stage**: Uses `oven/bun:1.2-alpine` to install dependencies via `bun.lock` and compile static assets.
- **Runtime Stage**: Uses `nginxinc/nginx-unprivileged:1.27-alpine` running as a non-root user (`nginx`, UID 101) listening on unprivileged port `8080`.
- **SPA Fallback**: Configured with `try_files $uri $uri/ /index.html;` to properly handle client-side routing.
- **Security & Performance**: Employs HTTP security headers (nosniff, SAMEORIGIN, strict referrer policy) and Gzip compression.

### Build and Run with Docker

```bash
# 1. Build the production Docker image
docker build -t palettea:latest .

# 2. Run the container on port 8080
docker run -d -p 8080:8080 --name palettea-app palettea:latest

# 3. Access the application in your browser
http://localhost:8080
```

To stop and remove the container:

```bash
docker stop palettea-app && docker rm palettea-app
```

---

## Project Structure

```
palettea/
├── dist/                          # Compiled production output
├── public/                        # Static assets (SVG logo, favicon)
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── collection/        # Collection manager modal
│   │   │   ├── color/             # Color picker & inspector
│   │   │   ├── contrast/          # Contrast & accessibility checker
│   │   │   ├── converter/         # Color conversion interface
│   │   │   ├── export/            # Export tools, SVG, CSS, token generators
│   │   │   ├── layout/            # Navbar, Footer
│   │   │   ├── palette/           # Palette card, manager, detail modal
│   │   │   ├── scheme/            # Harmony scheme generator & controls
│   │   │   ├── ui/                # Badge, Button, Modal, ConfirmDialog, ThemeToggle
│   │   │   └── workspace/         # WorkspaceHero, ColorSwatchPreview
│   │   ├── services/
│   │   │   ├── export/            # CSS, Tailwind, JSON, SVG, token export services
│   │   │   ├── color-api.ts       # The Color API integration client
│   │   │   ├── palette-service.ts # Palette business logic & search/sort
│   │   │   └── storage-service.ts # LocalStorage persistence engine
│   │   ├── stores/
│   │   │   └── palette-store.svelte.ts # Svelte 5 reactive runes store
│   │   ├── types/                 # TypeScript interfaces and domain models
│   │   └── utils/                 # Math, converters, contrast, filename, theme utils
│   ├── app.css                    # Tailwind CSS v4 & custom design tokens
│   ├── App.svelte                 # Main application layout shell
│   └── main.ts                    # Application entry point
├── Dockerfile                     # Multi-stage production container build
├── nginx.conf                     # Production Nginx configuration (SPA + security)
├── .dockerignore                  # Docker build exclusions
├── bun.lock                       # Pinned Bun lockfile
├── package.json                   # Project scripts and dependencies
├── tsconfig.json                  # TypeScript compiler options
└── vite.config.ts                 # Vite bundler configuration
```

---

## The Color API Integration

Palettea integrates with [The Color API](https://www.thecolorapi.com/):
- **`/id`**: Retrieves canonical color naming and color model approximations.
- **`/scheme`**: Generates color harmonies based on seed color, mode, and count.

### Client-side Protections:
- **Input Validation**: HEX strings are validated and normalized before network requests.
- **In-Memory Caching**: Responses are cached locally to minimize redundant network calls.
- **Race Condition Prevention**: In-flight requests are cancelled using `AbortController` when inputs change rapidly.
- **Graceful Error Handling**: Non-2xx responses, network timeouts, or malformed payloads display informative, accessible error messages with retry actions.

---

## Accessibility & Keyboard Shortcuts

- **Space**: Randomizes base color in Scheme Generator (inactive when typing in inputs or when modal dialogs are open).
- **Tab / Shift+Tab**: Cycles through interactive elements with visible focus rings. Modal dialogs enforce strict focus trapping.
- **Escape**: Closes active modals and popovers, restoring focus to the triggering element.
- **Enter / Space**: Activates buttons, swatch inspectors, and palette cards.
- **Skip to Content**: First Tab press reveals a "Skip to main content" link (WCAG 2.2 AA SC 2.4.1).
- **Contrast**: Evaluates contrast against WCAG AA and AAA thresholds with color-independent visual indicators.

---

## Known Limitations

- **Browser Storage Quota**: Palettes and collections are stored in client-side `localStorage`. Typical browser limits are 5MB-10MB.
- **API Availability**: Palette generation and identification require an internet connection to reach The Color API. However, format conversions, contrast calculations, and exports operate 100% offline.
- **Frontend Only**: Palettea is a client-side web application without user authentication or cloud synchronization.

---

## License

MIT
