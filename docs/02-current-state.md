# Current state

## Handoff

| Field             | Value                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Verified on       | 3 September 2026                                                                           |
| Repository        | `/Users/benjaminspiess/Documents/GitHub/RapidRAW-SCS`                                      |
| Branch            | `scs/compact-ui`                                                                           |
| Fork commit       | `766bdf04` (`Add compact desktop adjustment density`)                                      |
| Upstream remote   | `https://github.com/CyberTimon/RapidRAW.git` named `upstream`                              |
| Personal remote   | Not configured; GitHub CLI is not installed                                                |
| Current milestone | F1 — Compact Develop UI                                                                    |
| Next action       | User verifies the Lightroom-style grouping of the primary controls inside the Basic panel. |

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
- A second source-tree pass reduces rows to 22 px, text to 11 px, icons to 12 px, and also compacts the
  previously untouched Sources header, search field, section caps, content padding, and nesting.
- User feedback led to a focused third pass on tree rhythm only: folder and album rows are fixed at
  18 px with no vertical padding, 10 px text, and 11 px icons.
- The first isolated Develop pass replaces the large round shared-slider thumb with a crisp 6 x 12 px
  marker on a 2 px track. Slider rows are 20 px high with 11 px labels and 10 px monospaced values;
  the larger invisible interaction target and all adjustment semantics remain unchanged.
- Visual verification exposed that the upstream thumb utility still won and the narrow label column
  truncated names. The correction enforces a 4 x 8 px marker on a 1 px track, uses 16 px rows and a
  112 px label column, and replaces the oversized tone-mapper card with a compact 120 px segmented row.
- The global primary controls now live together in Basic, grouped as white balance, tone, presence,
  and dynamics. Their previous global copies are removed from Color and Details, while mask-local
  white-balance, color, and presence controls remain in their original sections.
- A follow-up density pass reduces primary slider rows to 14 px, Basic's internal group separators to
  14 px, collapsible section headers to 28 px, and the default analysis visualization from 220 px to
  180 px. Compact toolbar icons and section padding were reduced in the same shared density layer.
- Compact slider rows use the full remaining panel width in label-value-track order; the track now
  stretches to the right content edge instead of reserving an unused trailing column.
- Explicit typography hooks reduce the Develop title to 13 px and collapsible section titles to 12 px;
  their header rows are 28 px and 24 px respectively.
- The Dense fit pass constrains the analysis view to 96–140 px, uses 12 px visual slider rows with
  explicit 12 px text line boxes, and reduces Develop and section headers to 22 px and 18 px. This is
  intentionally optimized for fitting the complete global Basic control set without scrolling.
- Utility-layer overrides were found to be retaining upstream text line-height and spacing. The
  corrected Dense rules explicitly win those conflicts, restore a readable 14 px slider rhythm, and
  reduce Basic's low-value heading to an accessible 10 px disclosure strip.
- Visual verification showed sufficient space below the complete Basic panel, so slider rows and
  internal group headings were relaxed to 16 px with clearer separator spacing while preserving the
  no-scroll fit.
- A second visual pass uses a 20 px Lightroom-like control rhythm and 18 px group headings. The Basic
  disclosure remains minimal, so the added readability uses the recovered heading space rather than
  reintroducing scrolling.
- Sources, Library, and Adjustments now share a 14 px semibold workspace-title scale. This places all
  three between the former oversized navigation headings and the overly small Develop heading, with
  explicit hooks that are not overridden by upstream typography utilities.
- Library and Develop toolbar actions now share 28 px buttons with 14 px icons. Library display and
  action groups are reduced to 32 px high, replacing the mixed 48–56 px upstream control sizes.
- The tone-mapper EV slider no longer overrides its track with the panel's identical surface color;
  it now uses the same visible compact track as the other tone controls.
- The obsolete tone-mapper bottom border was removed after grouping; the white-balance heading now
  provides the single separator between those control groups.
- A fresh layout-first pass removes the 8 px workspace gutters and card rounding from the source,
  library/editor, adjustment, and bottom-bar regions. The custom macOS title bar is 32 px high.
- No Rust, RAW decoder, GPU pipeline, WGSL shader, adjustment semantics, library behavior, or export
  behavior changed.

## Verification evidence

- `npm install`: completed; npm reported zero known vulnerabilities.
- Touched files pass Prettier.
- `npm run build`: passed; 2,547 modules transformed and the production frontend bundle completed.
- The flat workspace raster passes `npm run build` and `git diff --check` on 3 September 2026.
- The compact section-header and analysis-height pass passes `npm run build` and `git diff --check`.
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
