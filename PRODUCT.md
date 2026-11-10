# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Frontend developers building, configuring, and maintaining web design systems and UI component libraries.
- UI/UX designers exploring color harmonies, verifying contrast compliance, and creating digital palette tokens.
- Full-stack web engineers needing instant color format conversions (HEX, RGB, HSL, HSV, CMYK) and code-ready copy/paste exports (Tailwind CSS v4, CSS custom properties, SVG swatches).

## Product Purpose

Palettea is an all-in-one web color toolkit that makes exploring, generating, converting, testing, and exporting color palettes fast, reliable, and enjoyable. Success means a developer or designer can move from a rough color concept to an accessible, production-ready design token set in seconds without leaving the browser, creating an account, or waiting on backend roundtrips.

## Positioning

Unlike cloud palette tools locked behind accounts and paywalls, or fragmented single-purpose calculators, Palettea is a 100% client-side, zero-backend workspace combining instant local mathematical color calculations, automated WCAG 2.2 accessibility verification, and live integration with The Color API for color naming and harmony schemes.

## Operating Context

- Used in web development and design workflows alongside code editors (VS Code), design tools (Figma), and browser devtools.
- Operates entirely in modern desktop and mobile browsers with offline-first client-side persistence.
- Evaluated on precision: color conversion round-trips, strict WCAG luminance contrast math, and code export syntax accuracy.

## Capabilities and Constraints

- **Color Picker & Inspector**: Synchronized HTML5 native picker and HEX input, real-time color naming and cross-space representation (HEX, RGB, HSL, HSV, CMYK, CIE XYZ) via The Color API `/id`.
- **Harmonious Scheme Generator**: Algorithmic schemes via The Color API `/scheme` (Complementary, Analogous, Triadic, Split Complementary, Monochrome, Quad/Tetradic) with configurable size (2-10 swatches) and guarded `Space` key randomization.
- **Client-Side Color Converter**: Zero-latency mathematical conversions across HEX, RGB, HSL, HSV, and CMYK with CSS functional syntax and raw numeric support.
- **WCAG 2.2 Accessibility Checker**: Mathematical relative luminance contrast calculation against 5 criteria (Normal Text AA/AAA, Large Text AA/AAA, UI Components AA) with live context preview canvas and intelligent contrast repair suggestions.
- **Palette & Collection Management**: Offline-first `localStorage` persistence (versioned `palettea:*` namespace), CRUD operations, collection categorization, search, and sorting.
- **Export Engine**: Code generation for Tailwind CSS v4 `@theme`, Tailwind v3 config, CSS `:root` variables, utility classes, SVG swatches, JSON, and semantic design tokens.
- **Hard Constraints**: No backend server, no database, no authentication or user accounts. All state is strictly local.

## Brand Commitments

- **Name**: Palettea
- **Tagline**: "Explore colors. Build harmony."
- **Aesthetic Direction**: Modern Minimalist (80%) + restrained Soft Neobrutalism (20%). Clean, neutral canvas where swatches remain the visual focal point, elevated by subtle tactile borders, intentional contrast, and playful interaction feedback.
- **Iconography**: Tree-shaken Lucide icons; no emoji in user interface controls.
- **Tone**: Professional, precise, approachable, and calm.

## Evidence on Hand

- Fully functional codebase in Svelte 5 (runes) and Tailwind CSS v4 at `/home/teddy/code/palettea`.
- Comprehensive test suite with 185 unit and integration tests passing across 17 suites (`bun test`).
- Production build passing via Vite (`bun run build`) with multi-stage Docker containerization (`oven/bun` builder + `nginx-unprivileged` runner).
- Public Color API endpoints (`/id`, `/scheme`) requiring no authentication.

## Product Principles

1. **Zero-Latency Client-Side Foundation**: Mathematical conversions, contrast validation, and storage happen instantly in the browser without network latency; external API calls enrich naming and harmony schemes without blocking essential tools.
2. **Production-Ready Code Outputs**: Every export must be directly usable in modern frontend projects (Tailwind v4 `@theme`, CSS custom properties, semantic tokens, clean SVG) without requiring manual reformatting.
3. **Accessibility as a First-Class Citizen**: Contrast compliance (WCAG 2.2) is not an afterthought but integrated directly into swatch overlays, generators, and testing canvases with actionable fixes.
4. **Frictionless Utility**: No logins, paywalls, or backend dependency. The app opens immediately ready to work, respects user data locally, and functions reliably offline.

## Accessibility & Inclusion

- Conformance with WCAG 2.2 AA standards across all application controls and color evaluation tooling.
- Full keyboard operability (tab order, modal focus trapping and restoration, guarded hotkeys).
- High contrast and screen-reader announcements for copy-to-clipboard interactions and status changes.
- Dual light and dark theme support respecting system `prefers-color-scheme` with manual toggle.
