# Current state

## Handoff

| Field             | Value                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Verified on       | 2 September 2026                                                                                                  |
| Repository        | `/Users/benjaminspiess/Documents/GitHub/RapidRAW-SCS`                                                             |
| Branch            | `scs/compact-ui`                                                                                                  |
| Fork commit       | Current `scs/compact-ui` branch HEAD; includes the SCS-style Develop density refinement                           |
| Upstream remote   | `https://github.com/CyberTimon/RapidRAW.git` named `upstream`                                                     |
| Personal remote   | Not configured; GitHub CLI is not installed                                                                       |
| Current milestone | F1 — Compact Develop UI                                                                                           |
| Next action       | User visually verifies the SCS-style Basic overview; then histogram and specialized Develop controls are refined. |

## Implemented fork changes

- The root application carries one `density-compact` class.
- The shared Slider component exposes stable density hooks for its container, row, label, value, and
  track.
- The Develop controls toolbar and scrolling content expose compact density hooks.
- Compact CSS places label, slider track, and numeric value on one row; typography, gaps, margins, and
  panel padding are reduced.
- The Basic section is now a single Lightroom-style overview: tone mapper, white balance, tone,
  clarity, dehaze, vibrance, and saturation remain visible together in a tight vertical stack.
- White balance and vibrance/saturation no longer repeat in the global Color section; clarity and
  dehaze no longer repeat in global Details. Their local-mask variants remain available.
- Develop section cards, headers, toolbar actions, numeric fields, and slider thumbs use a sharper
  SCS/Vercel-like hairline treatment with smaller typography and substantially reduced rounding.
- The desktop workspace shell is compact too: outer gutters, panel gaps, library/source headers,
  panel switchers, bottom actions, borders, corner radii, and toolbar hit areas use a denser rhythm.
- The Lightroom-informed layout uses a narrower 260 px default source panel, a wider 400 px default
  adjustment panel, a flat compact title bar, edge-to-edge workspace regions, denser folder rows, and
  longer slider tracks with smaller label/value columns and thumbs. Existing typical saved widths
  migrate on restart, and the right tool tabs move from a width-consuming rail to a horizontal row.
- The Standard/AgX selector uses a static segmented control; the fragile animated indicator was
  removed after it clipped and overflowed at the compact right-panel width.
- No Rust, RAW decoder, GPU pipeline, WGSL shader, adjustment semantics, library behavior, or export
  behavior changed.

## Verification evidence

- `npm install`: completed; npm reported zero known vulnerabilities.
- Touched files pass Prettier.
- `npm run build`: passed; 2,547 modules transformed and the production frontend bundle completed.
- The SCS-style Develop density refinement also passes `npm run build` (2,547 modules transformed)
  and `git diff --check` on 2 September 2026.
- Native dependencies compiled with Rust `1.98-aarch64-apple-darwin` after the first-run ONNX download.
- The first native build retriggered itself during that download and produced an empty temporary
  `jxl-encoder` object; a single-job retry completed compilation. Visual application acceptance remains
  with the user.

## Upstream baseline limitations

- The cloned upstream revision does not currently pass its declared `npm run typecheck` gate; errors
  span pre-existing curves, culling, panels, hooks, stores, and other modules.
- The cloned upstream revision does not currently pass its declared `npm run lint` gate; it reports
  hundreds of pre-existing errors, primarily explicit `any` usage.
- The repository-wide Prettier check also reports existing untouched formatting differences.
- These failures were not introduced or expanded into the compact-UI slice. Report them separately
  until upstream resolves them or a deliberately scoped baseline-cleanup decision is made.

## How to run

```bash
cd /Users/benjaminspiess/Documents/GitHub/RapidRAW-SCS
RUSTUP_TOOLCHAIN=1.98-aarch64-apple-darwin npm start
```

If a clean first build downloads ONNX Runtime and triggers a simultaneous rebuild, stop it after the
download and rerun with:

```bash
RUSTUP_TOOLCHAIN=1.98-aarch64-apple-darwin CARGO_BUILD_JOBS=1 npm start
```

## Creating the personal GitHub remote

Create a fork of `CyberTimon/RapidRAW` in Benjamin's GitHub account, then run:

```bash
git remote add origin <personal-fork-url>
git push -u origin scs/compact-ui
```

Do not rename or replace `upstream`.
