# Current state

## Handoff

| Field             | Value                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Verified on       | 2 September 2026                                                                               |
| Repository        | `/Users/benjaminspiess/Documents/GitHub/RapidRAW-SCS`                                          |
| Branch            | `scs/compact-ui`                                                                               |
| Fork commit       | `766bdf04` (`Add compact desktop adjustment density`)                                          |
| Upstream remote   | `https://github.com/CyberTimon/RapidRAW.git` named `upstream`                                  |
| Personal remote   | Not configured; GitHub CLI is not installed                                                    |
| Current milestone | F1 — Compact Develop UI                                                                        |
| Next action       | User verifies the new flat workspace raster before navigation or Develop controls are changed. |

## Implemented fork changes

- The root application carries one `density-compact` class.
- The shared Slider component exposes stable density hooks for its container, row, label, value, and
  track.
- The Develop controls toolbar and scrolling content expose compact density hooks.
- Compact CSS places label, slider track, and numeric value on one row; typography, gaps, margins, and
  panel padding are reduced.
- The accepted flat workspace grid is followed by an isolated source-tree density slice: folder and
  album rows are 26 px high with 12 px text, 14 px icons, reduced nesting, and restrained selection
  rounding. No Develop controls changed in this slice.
- A fresh layout-first pass removes the 8 px workspace gutters and card rounding from the source,
  library/editor, adjustment, and bottom-bar regions. The custom macOS title bar is 32 px high.
- No Rust, RAW decoder, GPU pipeline, WGSL shader, adjustment semantics, library behavior, or export
  behavior changed.

## Verification evidence

- `npm install`: completed; npm reported zero known vulnerabilities.
- Touched files pass Prettier.
- `npm run build`: passed; 2,547 modules transformed and the production frontend bundle completed.
- The flat workspace raster passes `npm run build` and `git diff --check` on 3 September 2026.
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
