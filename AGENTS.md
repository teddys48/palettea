AGENTS.md — Palettea
1. Project Overview
Palettea is a modern web-based color toolkit for exploring, generating, converting, and managing color palettes.

Tagline: Explore colors. Build harmony.

Product and design direction:
- Modern Minimalist (80%) + restrained Soft Neobrutalism accents (20%)
- Professional, calm, approachable, and playful during color interactions
- Keep the interface neutral so color swatches remain the visual focus
- Build a useful, polished tool rather than a generic dashboard
2. Required Tech Stack
Use this stack unless the user explicitly changes it:
- Runtime / package manager: Bun
- Build tool / dev server: Vite
- UI framework: Svelte 5 (with runes: $state, $derived, $effect)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS v4
- External color service: The Color API — https://www.thecolorapi.com/
- HTTP: Native fetch
- Persistence: LocalStorage
- Testing: Bun test runner (`bun test`); Svelte Testing Library when component tests are needed
- Containerization: Multi-stage Dockerfile (Bun build stage + unprivileged Nginx runtime stage)
Do not add a backend unless a concrete requirement justifies it. The initial app is frontend-only.
Bun conventions
- Use bun for package installation, scripts, and running project tooling.
- Use bun install and maintain the committed bun.lock (or the lockfile format already used by the installed Bun version).
- Do not replace Bun with npm, pnpm, or yarn.
- Use Bun-compatible scripts and verify commands against the actual package.json.
3. Product Roadmap
Development is divided into these phases:
1. Foundation & UI Setup
2. Color Picker & Inspector
3. Color Scheme Generator
4. Color Converter
5. Contrast & Accessibility
6. Palette Management
7. Export & Developer Tools
8. Polish & Production (including Dockerfile)
Work only on the phase requested by the user. Do not implement future phases proactively. Keep the app runnable after every phase.

Refer to PROJECT_STATUS.md for current phase, progress, decisions, and next steps.
4. Engineering Principles
- Prefer simple, readable, maintainable solutions over premature abstraction.
- Use TypeScript types; avoid any. If unavoidable, explain and isolate it.
- Use idiomatic Svelte and keep components focused.
- Separate API access, business logic, and presentation.
- Avoid duplicating color conversion or validation logic.
- Do not add dependencies without a clear need.
- Do not silently change established dependencies, architecture, or product behavior.
- Do not leave unused components, dead code, or placeholder implementations presented as complete.
- Handle loading, error, empty, and success states for asynchronous operations.
- Validate user input before making API requests.
- Use semantic HTML and keyboard-operable controls.
5. Suggested Architecture
Adapt this structure to actual project needs. Do not create every directory before it is needed.
src/
├── lib/
│   ├── components/
│   │   ├── layout/
│   │   ├── color/
│   │   ├── scheme/
│   │   ├── converter/
│   │   ├── contrast/
│   │   ├── palette/
│   │   ├── collection/
│   │   ├── export/
│   │   ├── workspace/
│   │   └── ui/
│   ├── services/
│   │   ├── color-api.ts
│   │   ├── palette-service.ts
│   │   ├── storage-service.ts
│   │   └── export/
│   ├── utils/
│   │   ├── color-utils.ts
│   │   ├── contrast-utils.ts
│   │   ├── filename-utils.ts
│   │   ├── export-utils.ts
│   │   ├── theme.ts
│   │   └── clipboard.ts
│   ├── types/
│   └── stores/
├── App.svelte
└── main.ts
Architecture notes:
- Keep The Color API client in a dedicated service module.
- Put reusable color math, validation, and formatting in utilities.
- Keep feature-specific logic close to the feature.
- Avoid generic abstractions until real use cases justify them.
- Follow existing repository conventions if already established.
6. The Color API Guidelines
- Use official documentation: https://www.thecolorapi.com/
- Keep endpoint construction and response handling inside the API service.
- Validate and normalize color input before requests.
- Handle network errors, non-success HTTP responses, and unexpected payloads.
- Prevent stale responses from overwriting newer results when requests race.
- Debounce API-driven text input where appropriate.
- Cache repeated requests when useful and maintainable.
- Do not assume the API always returns complete or valid data.
- The planned public endpoints do not currently require an API key; verify current documentation if requirements change.
- Do not treat API-provided contrast data alone as a complete WCAG compliance evaluation.
7. UI/UX Design System
Visual direction
- Modern Minimalist + restrained Soft Neobrutalism
- Generous whitespace and clear visual hierarchy
- Neutral surfaces; colorful swatches provide visual interest
- Avoid excessive gradients, glassmorphism, decorative animations, and dashboard clutter
- Do not turn every section into a card
- Use bold borders or offset shadows sparingly for playful emphasis
Suggested design tokens
:root {
  --background: #FAF9F6;
  --surface: #FFFFFF;
  --foreground: #191919;
  --muted: #6B6B66;
  --border: #E5E5E0;
  --accent: #7C83FD;
}
These values are starting points, not immutable requirements. Centralize tokens and implement dark mode intentionally rather than mechanically inverting colors.
Typography
- Prefer Geist or Inter.
- Maintain a clear type hierarchy.
- Ensure HEX, RGB, HSL, HSV, and CMYK values remain readable and easy to copy.
Components and interaction
- Color swatches must be large enough to inspect.
- Provide one-click copy for color values when relevant, with visible feedback.
- Keep buttons, inputs, dropdowns, dialogs, and tooltips consistent.
- Use Lucide icons consistently; do not use emoji as interface icons.
- Respect prefers-reduced-motion.
- Provide keyboard navigation and visible focus states.
- Ensure text placed on swatches meets contrast requirements.
- Responsive behavior must be intentional on mobile, tablet, and desktop.
- Space may generate a palette when that feature exists; ignore the shortcut while focus is in an input, textarea, select, or editable element, or when a modal dialog is open.
- Do not rely on color alone to communicate statuses.
8. Code Style
- Use idiomatic Svelte components and TypeScript.
- For a new Svelte 5 project, prefer runes where appropriate; do not mix legacy and runes mode inconsistently within a component.
- Use descriptive names; avoid cryptic abbreviations.
- Follow configured formatter and linter.
- Prefer derived values over effects when possible.
- Ensure reactive dependencies are correct.
- Use stable keys in each blocks.
- Keep component props and events typed.
- Avoid suppressing lint or TypeScript errors without explaining why.
9. Testing & Validation
For each phase:
1. Inspect the repository, package.json, scripts, and current git status first.
2. Implement only the requested scope.
3. Add or update tests for meaningful logic and interactions.
4. Run available checks (typecheck, lint, tests).
5. Run a production build when feasible.
6. Report exactly which commands ran and their results.
Use Bun commands, for example (only if corresponding scripts exist):
bun run check
bun run test
bun run build
Do not claim tests passed if they were not executed. Report environment limitations and command failures accurately.
10. Git & Change Safety
- Inspect git status and relevant diffs before editing.
- Do not overwrite unrelated user changes.
- Do not reset, clean, rebase, force-push, or discard user work unless explicitly asked.
- Do not create commits unless requested.
- Keep changes focused.
- Do not modify secrets, .env files, or deployment settings unnecessarily.
11. Docker Guidelines
- Maintain a production-oriented, multi-stage Dockerfile when Docker is in scope (Phase 8).
- Use a Bun image for dependency installation and build stages (`oven/bun:1.2-alpine`).
- Use a small, unprivileged web server image (`nginxinc/nginx-unprivileged:1.27-alpine`) to serve the compiled static Vite output in production.
- Use .dockerignore to exclude .git, node_modules, build output, local environment files, and other unnecessary files.
- Do not bake secrets into image layers or frontend build arguments.
- Run containers as a non-root user (e.g. UID 101 `nginx`).
- Document the build and run commands in README when Docker is implemented.
- Do not run Docker or Podman commands unless the user explicitly asks.
12. Explicit Restrictions
- Do not modify databases or database schemas unless the user explicitly authorizes it.
- Do not run Docker or Podman commands unless the user explicitly asks.
- Do not install, remove, or upgrade dependencies without explaining why; ask before substantial dependency changes.
- Do not implement multiple phases in one pass unless explicitly requested.
- Do not add authentication; user accounts are outside current scope.
- Do not invent features outside the agreed roadmap.
- Do not add AI features unless requested.
13. Definition of Done
A phase is complete when:
- Its agreed requirements are implemented.
- Loading, error, empty, and success states are handled where relevant.
- Responsive and accessibility basics are addressed.
- Relevant tests, checks, and build have been run when available.
- No known regression or unrelated modification is introduced.
- PROJECT_STATUS.md is updated with completed work, validation, and next steps.
- The agent summarizes changed files, decisions, and remaining limitations.
