# Current state

## Handoff

| Field             | Value                                                             |
| ----------------- | ----------------------------------------------------------------- |
| Verified on       | 27 September 2026                                                 |
| Repository        | `/Users/benjaminspiess/Documents/GitHub/RapidRAW-SCS`             |
| Branch            | `scs/compact-ui`                                                  |
| Fork commit       | `HEAD` (merge of upstream `v1.6.4`)                               |
| Upstream remote   | `https://github.com/CyberTimon/RapidRAW.git` named `upstream`     |
| Personal remote   | Not configured; GitHub CLI is not installed                       |
| Current milestone | F5 — Upstream maintenance                                         |
| Next action       | User visually verifies the running v1.6.4 UI and daily workflows. |

## Implemented fork changes

- Official RapidRAW `v1.6.4` is integrated as the first reviewed upstream update. Its revised
  exposure/brightness semantics, RAW highlight and color handling, masonry library layout, navigation
  history, TIFF export, crop changes, and maintenance fixes are retained alongside the SCS compact UI,
  Finalize RAW, Lightroom import, slideshow, folder moves, and video support.
- The start page presents `RapidRAW` as the product and a restrained `modified by Spiess Systems`
  signature beneath it. The accent treatment is code-native, theme-aware, and motion-reduced when
  requested; technical RapidRAW naming and upstream attribution remain unchanged.
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
- The Sources sort action is fixed at the search row's 28 px height and its width is permanently
  reserved. Hover now changes opacity only, eliminating the previous vertical and horizontal jump.
- The stable sort action is visually integrated into the search field as a right-side accessory rather
  than a detached surface block. The clear-search action occupies the same position when text exists.
- The sort button's upstream 36 px utility size is explicitly overridden to match its 28 px reserved
  slot, centering the icon instead of clipping the button's left side.
- The tone-mapper EV slider no longer overrides its track with the panel's identical surface color;
  it now uses the same visible compact track as the other tone controls.
- The obsolete tone-mapper bottom border was removed after grouping; the white-balance heading now
  provides the single separator between those control groups.
- A fresh layout-first pass removes the 8 px workspace gutters and card rounding from the source,
  library/editor, adjustment, and bottom-bar regions. The custom macOS title bar is 32 px high.
- Folder rows can be dragged onto another folder. The backend rejects self/descendant moves and name
  collisions, uses an atomic same-volume rename, updates album image-path prefixes, and rolls the
  filesystem move back if album persistence fails.
- After a successful move, the frontend remaps current/root/pinned/expanded paths, selections,
  ratings, editor state, folder icons, and persisted last-folder settings before refreshing the tree.
- Cross-volume folder moves are intentionally not supported in this first slice; no RAW decoder, GPU
  pipeline, WGSL shader, adjustment semantics, or export behavior changed.
- `Finalize RAW…` is available for a single physical RAW from the editor or thumbnail context menu.
  It reuses RapidRAW's production renderer at JPEG quality 100, writes to a temporary same-folder
  path, validates JPEG format/readability/dimensions, and only then atomically places the final file.
- Finalization transfers rating, color/user tags, embedded metadata, timestamp, album memberships,
  and a `RapidRAW:FinalizedFrom` provenance entry. Baked adjustments are deliberately cleared on the
  JPEG sidecar so that the rendered edit is not applied twice. Album membership is reread and checked.
- The original remains untouched through preparation. Once the JPEG is verified, the explicit choices
  are keep (default), archive, or trash RAW plus associated `.rrdata`/`.rrexif` sidecars. Archive
  collisions abort before moving and partial archive moves are rolled back.
- A same-folder journal records rendering and prepared phases. Automatic restart recovery and virtual
  copy finalization remain F4-S5 debt; virtual copies are rejected rather than handled ambiguously.
- Finalize archive placement uses one persisted central archive root. RAWs and their sidecars are
  routed to `<archive>/<library-root-name>/<relative-source-folder>` while the finalized JPEG remains
  in the working library. The location is selected on first use and can be changed under Settings →
  Data.
- Cross-volume archiving stages copies with temporary names, verifies byte lengths, atomically commits
  archive filenames, and only then removes originals. Existing targets abort before copying.
- Folder context menus offer `Ordner finalisieren…`. The batch recursively inventories physical RAWs,
  confirms the count, then runs each item sequentially through the complete prepare/verify/archive
  transaction. Failures are isolated per RAW and summarized; successful JPEGs remain in place.
- A prepared journal can be resumed when a prior archive step failed, avoiding a false JPEG-collision
  dead end. If the currently edited RAW belongs to the batch, its live adjustments are exported and
  the editor switches to the resulting JPEG after successful archival.
- The thumbnail context menu can start a slideshow for the current selection. It queues any missing
  edited 1280 px previews, decodes every selected preview before presentation, then enters native
  fullscreen. Arrow keys navigate, Space pauses or resumes the four-second loop, and Escape exits;
  filename, position, pointer controls, and a cancellable preparation state remain available.
- The Albums section context menu can import normal collections and collection sets from a Lightroom
  `.lrcat`. The catalog is opened read-only, Smart Collections are reported and skipped, and a summary
  is confirmed before the imported hierarchy replaces only its own prior import group. Missing root
  folders trigger directory relinking; those old-to-new mappings persist in RapidRAW settings. Missing
  individual image references remain in the imported albums for later recovery instead of being lost.
- Imported Lightroom groups expose a follow-up relink action. After a successful import, resolved
  Lightroom roots can optionally be registered as normal library folders, and an album whose every
  file is currently unreachable reports the disconnected-or-moved-folder condition explicitly.
- Imported Lightroom groups can migrate historical collection references from RAWs to same-folder,
  same-stem JPEGs. RapidRAW provenance is accepted as definitive; otherwise the JPEG must be at least
  24 hours newer. Ambiguous and missing pairs remain untouched, the RAW is never deleted, a timestamped
  `albums.json` backup is written before applying, and JPEG-preferred grouping is enabled afterward.
- MP4, MOV, and M4V files are now first-class library items with an explicit `is_video` media flag.
  Folder and album views show a dedicated video tile; double-click or `Video abspielen` opens a native
  fullscreen HTML5 player with macOS WebKit controls and Escape-to-close. Videos are excluded from
  thumbnail generation, image grouping, Develop, slideshow, adjustment copy/paste, and image export.
  Playback therefore uses codecs supported by the installed macOS WebKit; FFmpeg transcoding and
  generated poster frames are intentionally not part of this first slice.
- Direct playback uses Tauri's asset protocol for files under the user's home folder and mounted
  volumes. The scope is limited to those user-selected media locations rather than exposing arbitrary
  system paths.

## Verification evidence

- Upstream `v1.6.4` merge: `npm run build` passed (2,547 modules), Rust 1.98 offline `cargo check`
  passed, both focused Finalize RAW tests passed, and the native application compiled and launched.
  `git diff --check` passed. An old hot-reload instance briefly wrote its stale in-memory album tree
  during the merge; it was stopped and the complete 2,992,526-byte pre-update `albums.json` restored.
  The finished v1.6.4 app reread that file without changing its checksum. Pre-update settings and
  albums remain copied to
  `/private/tmp/rapidraw-scs-pre-v1.6.4-20260926`, and Git branch
  `backup/pre-upstream-v1.6.4-20260926` preserves the complete pre-merge source state.
- `npm install`: completed; npm reported zero known vulnerabilities.
- Touched files pass Prettier.
- `npm run build`: passed; 2,547 modules transformed and the production frontend bundle completed.
- Folder move slice: `npm run build` passed (2,547 modules), Rust 1.98 `cargo check --offline` passed,
  and `git diff --check` passed on 4 September 2026.
- Finalize RAW slice: production frontend build and Rust 1.98 `cargo check --offline` pass. Destructive
  choices still require user verification on a disposable RAF copy before daily use.
- `cargo test --offline finalize_processing::tests::counts_nested_album_memberships` passes and
  covers recursive album-membership verification.
- Folder batch verification adds recursive RAW discovery coverage; both focused finalize-processing
  Rust tests and the production frontend build pass.
- Compact Develop controls now fit a right panel near its collapse threshold: label/value columns and
  the tone-mapper switch use narrower bounded widths while slider tracks consume the remaining width.
  The production frontend build and `git diff --check` pass for this responsive-width correction.
- The selected-image slideshow production frontend build passes with 2,548 transformed modules.
  Repository typecheck still reports only the documented upstream baseline failures and no error in
  the new slideshow component or state.
- The Lightroom import slice compiles with Rust 1.98 and its production frontend build passes. It was
  schema-checked against `Lightroom 5 Catalog.lrcat` (37 sets, 238 normal collections, 31,031 static
  memberships); native end-to-end import remains for user verification.
- The Lightroom relink follow-up passes the production frontend build and Rust 1.98 offline
  `cargo check`. The repository typecheck still reports only the documented upstream baseline errors,
  with no new error at the touched Lightroom or album-navigation lines.
- The historical Lightroom JPEG migration passes the production frontend build, Rust 1.98 offline
  `cargo check`, both focused Finalize RAW tests, and `git diff --check`.

## Added dependency provenance

- `rusqlite 0.40.2` and `libsqlite3-sys` are MIT-licensed; the enabled `bundled` feature embeds SQLite,
  which is public domain. They are used only to read Lightroom SQLite catalogs without requiring a
  platform-installed CLI. Source and license: <https://docs.rs/crate/rusqlite/0.40.2>.
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
