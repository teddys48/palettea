---
name: Palettea
description: Explore colors. Build harmony.
colors:
  primary: "#4F46E5"
  primary-hover: "#4338CA"
  accent-dark: "#6366F1"
  background: "#FAF9F6"
  surface: "#FFFFFF"
  surface-hover: "#F4F3EE"
  foreground: "#18181B"
  muted: "#64748B"
  muted-foreground: "#52525B"
  border: "#E4E4E7"
  border-strong: "#18181B"
typography:
  display:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0em"
  body:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System: Palettea

## Overview

**Creative North Star: "The Tactile Color Laboratory"**

Palettea blends modern minimalist utility (80%) with restrained soft neobrutalist tactile accents (20%). It treats color not as decorative wallpaper, but as living experimental material. Surfaces remain quiet, neutral, and unembellished so that active palettes and swatches command the visitor's focus without competing interface noise.

Tactile confidence manifests through crisp 1px borders, subtle solid 2px offset drop shadows (`2px 2px 0px #18181B`), and physical click depressions. Rather than excessive gradients, blurs, or floaty drop shadows, every interactive control feels grounded and mechanical, like high-precision lab hardware.

**Key Characteristics:**
- **Neutral Canvas, Vivid Content:** Clean warm white (#FAF9F6) and deep slate (#18181B) backdrops let swatches lead.
- **Tactile Feedback:** 2px offset block shadows on buttons and cards that depress by 1px on click.
- **Strict Monospace Data:** Code values (HEX, RGB, HSL, ratios) always render in JetBrains Mono for instant scanning.
- **WCAG 2.2 Compliant:** Swatch labels and overlays dynamically calculate contrast to guarantee readability.

## Colors

The palette is intentionally restrained: neutral canvas tones create a calm environment where the primary indigo accent (#4F46E5) highlights actions without drowning out user-generated palettes.

### Primary
- **Electric Iris** (#4F46E5): Used for primary action buttons, focused rings, active tab indicators, and key interactive highlights.
- **Electric Iris Hover** (#4338CA): Subtle darkening applied on hover states for primary controls.

### Neutral
- **Warm Alabaster** (#FAF9F6): Light mode base page background. Soft and easy on the eyes during prolonged palette work.
- **Pure Surface** (#FFFFFF): Card, modal, and tool panels in light mode.
- **Surface Hover** (#F4F3EE): Subtle hover state on list rows and secondary interactive surfaces.
- **Zinc Ink** (#18181B): High-contrast text, primary icon strokes, and neobrutalist solid border lines.
- **Slate Muted** (#64748B): Secondary descriptions, helper text, and inactive iconography.
- **Border Mist** (#E4E4E7): Default structural partition lines and container edges.

### Named Rules
**The Swatch Hero Rule.** Interface chrome must never use saturated decorative background colors. The accent color is reserved strictly for interactive affordances and key status indicators. Color swatches are the sole heroes of the viewport.

## Typography

**Display Font:** Geist, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
**Body Font:** Geist, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
**Label/Mono Font:** JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace

**Character:** Technical elegance paired with strict legible data formatting. Geist provides neutral, modern geometric clarity for headings and labels, while JetBrains Mono ensures color codes and ratios align predictably.

### Hierarchy
- **Display** (Bold 700, 2.25rem / 36px, line-height 1.2, letter-spacing -0.02em): Product hero headlines and workspace titles.
- **Headline** (SemiBold 600, 1.5rem / 24px, line-height 1.3, letter-spacing -0.01em): Tool section headers and major dialog titles.
- **Title** (SemiBold 600, 1.125rem / 18px, line-height 1.4): Card group headers and modal subsection titles.
- **Body** (Regular 400, 0.875rem / 14px, line-height 1.5): Tool instructions, descriptions, and standard UI copy.
- **Label** (Medium 500, 0.75rem / 12px, line-height 1.4, JetBrains Mono): Color hex values, RGB triplets, contrast scores, and metadata badges.

### Named Rules
**The Code Integrity Rule.** Every color value (HEX, RGB, HSL, HSV, CMYK), contrast ratio, and WCAG rating must strictly render in JetBrains Mono. Numbers must never shift width across state changes.

## Layout

Palettea uses a single-page responsive workspace centered on a max-width 1280px (`max-w-7xl`) container with 16px (`px-4`) mobile padding scaling to 32px (`px-8`) on desktop. 

- **Grid System:** Flexible auto-fill and auto-fit CSS grid layouts (`gap-4` to `gap-6`). Color swatches dynamically adjust between horizontal flex bands on mobile and stacked vertical strips on wider viewports.
- **Rhythm:** Spacing follows an 8px grid (8px, 16px, 24px, 32px, 48px). Component internal padding defaults to 16px (`p-4`) or 24px (`p-6`).

## Elevation & Depth

Palettea rejects diffuse blurred drop shadows in favor of crisp, structural neobrutalist tonal layering and solid offset block shadows.

### Shadow Vocabulary
- **Neo Brutal Default** (`box-shadow: 2px 2px 0px #18181B`): Standard depth applied to primary buttons, interactive cards, and tool swatches at rest.
- **Neo Brutal Large** (`box-shadow: 3px 3px 0px #18181B`): Elevated modals, active dropdown menus, and focal card surfaces.

### Named Rules
**The Tactile Click Rule.** Interactive elements with offset shadows must physically translate `translate(-1px, -1px)` on hover and `translate(1px, 1px)` on active press, reducing the perceived shadow depth to simulate physical tactile engagement.

## Shapes

- **Corner Radius:** Controlled geometry with consistent rounded corners:
  - Small elements (inputs, badges, small buttons): 8px (`rounded-lg`).
  - Large elements (tool cards, preview canvases, modal dialogs): 12px (`rounded-xl`).
  - Pills / Badges: Full radius (`rounded-full`).
- **Border Treatment:** Consistent 1px solid border (`border border-border`) separating every surface from the canvas.

## Components

### Buttons
- **Shape:** 8px radius (`rounded-lg`).
- **Primary:** Electric Iris background (#4F46E5), white text, 1px solid border (#18181B), `shadow-neo` (2px 2px 0px).
- **Secondary:** Surface background (#FFFFFF), foreground text (#18181B), 1px border (#E4E4E7), `shadow-neo`.
- **Hover / Focus:** Translates `translate(-1px, -1px)` on hover; translates `translate(1px, 1px)` on active click. Focus-visible shows a 2px offset ring in accent iris.
- **Ghost:** Transparent background, no shadow, subtle hover background fill (#F4F3EE).

### Chips & Badges
- **Style:** Compact monospace label (12px), `rounded-full` or `rounded-md`, 1px solid border.
- **Variants:** Default (surface neutral), Accent (light indigo tint with saturated iris text), Neutral (zinc tint).

### Cards / Containers
- **Corner Style:** 12px radius (`rounded-xl`).
- **Background:** Crisp surface fill (#FFFFFF in light mode, #18181B in dark mode).
- **Border:** 1px solid border (`#E4E4E7` in light mode, `#2C2C32` in dark mode).
- **Internal Padding:** 16px (`p-4`) on mobile, 24px (`p-6`) on desktop.

### Inputs / Fields
- **Style:** 8px radius (`rounded-lg`), surface background, 1px border (`#E4E4E7`), JetBrains Mono for hex/color inputs.
- **Focus:** 2px ring in accent iris with 2px offset (`ring-2 ring-accent ring-offset-2`).

## Do's and Don'ts

### Do:
- **Do** maintain high contrast between text overlays and active color swatches using relative luminance calculations.
- **Do** preserve the tactile 2px offset shadow and 1px physical translation on interactive buttons.
- **Do** format all color codes and numerical outputs in JetBrains Mono with quick-copy affordances.
- **Do** ensure dark mode uses intentional zinc/slate tones rather than pure inverted blacks.

### Don't:
- **Don't** use diffuse fuzzy drop shadows, frosted glassmorphism, or decorative colored gradients on chrome surfaces.
- **Don't** use emoji as user interface icons; use tree-shaken Lucide icons exclusively.
- **Don't** let decorative accents overpower color swatches on screen.
- **Don't** trigger destructive palette deletions without explicit confirmation dialogs.
