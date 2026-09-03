# Roadmap

Status values: `Not started`, `In progress`, `User verification`, `Complete`, `Blocked`.

## F0 — Fork baseline

**Objective:** Establish a reproducible thin fork with a safe upstream relationship.

| Slice | Acceptance                                                                                | Status                           |
| ----- | ----------------------------------------------------------------------------------------- | -------------------------------- |
| F0-S1 | Local repository exists separately from PhotoHub; official RapidRAW is remote `upstream`. | Complete                         |
| F0-S2 | Fork mission, rules, roadmap, and current-state handoff exist in-repository.              | Complete                         |
| F0-S3 | Personal GitHub fork is configured as `origin`; push and pull workflow is documented.     | Blocked — GitHub CLI unavailable |
| F0-S4 | Known-good native baseline starts with Rust 1.98 and opens on Apple Silicon.              | User verification                |

## F1 — Compact Develop UI

**Objective:** Make the editor substantially more information-dense without changing processing.

| Slice | Acceptance                                                                                          | Status            |
| ----- | --------------------------------------------------------------------------------------------------- | ----------------- |
| F1-S1 | Basic shared sliders render label, track, and value in one compact row.                             | User verification |
| F1-S2 | Compact spacing is centralized and isolated under a root density class.                             | Complete          |
| F1-S3 | Histogram, section headers, toolbars, panels, and remaining controls use a coherent compact rhythm. | In progress       |
| F1-S4 | Comfortable/Compact/Dense selection persists across restart; Compact is the SCS default.            | Not started       |
| F1-S5 | Wide panels optionally show suitable adjustment groups in two columns without harming usability.    | Not started       |
| F1-S6 | Keyboard, touch targets, narrow layouts, and existing editor interactions regressions are checked.  | Not started       |

**Exit:** Benjamin accepts density and daily Develop usability on the normal desktop window size.

## F2 — Personal Fuji acceptance

**Objective:** Establish that RapidRAW is reliable for Benjamin's actual Fujifilm workflow.

| Slice | Acceptance                                                                                | Status      |
| ----- | ----------------------------------------------------------------------------------------- | ----------- |
| F2-S1 | Private RAF corpus is inventoried without committing originals.                           | Not started |
| F2-S2 | Open, switch, zoom, pan, and adjustment persistence pass across representative RAF files. | Not started |
| F2-S3 | Crop/rotate, masks, copy/paste, restart, and export are exercised.                        | Not started |
| F2-S4 | Editor/export color and detail are compared for representative difficult scenes.          | Not started |
| F2-S5 | A larger RAF folder is tested for bounded memory and responsive culling.                  | Not started |

**Exit:** No workflow-blocking Fuji defect remains unexplained or untracked.

## F3 — Finalize RAW design

**Objective:** Specify the exact safe asset-replacement behavior before destructive code exists.

| Slice | Acceptance                                                                                                  | Status      |
| ----- | ----------------------------------------------------------------------------------------------------------- | ----------- |
| F3-S1 | RapidRAW library identity, album membership, rating/tag storage, sidecars, and watcher behavior are mapped. | Not started |
| F3-S2 | Final filename, collision, metadata, sidecar, archive, and trash policies are approved.                     | Not started |
| F3-S3 | A journaled state machine and recovery behavior are documented and tested at domain level.                  | Not started |
| F3-S4 | UX makes retention the default and destructive completion unmistakably explicit.                            | Not started |

## F4 — Finalize RAW implementation

**Objective:** Deliver the end-to-end personal workflow inside RapidRAW-SCS.

| Slice | Acceptance                                                                                       | Status      |
| ----- | ------------------------------------------------------------------------------------------------ | ----------- |
| F4-S1 | Export to a temporary JPEG and validation complete without modifying the RAW.                    | Not started |
| F4-S2 | JPEG registration and relationship transfer are atomic or deterministically recoverable.         | Not started |
| F4-S3 | Ratings, labels, tags, albums, metadata, and approved sidecar state are verified after transfer. | Not started |
| F4-S4 | Keep, archive, and trash choices work; failure before verification always preserves the RAW.     | Not started |
| F4-S5 | Restart/interruption, collision, disk-full, corrupt-export, and partial-transfer tests pass.     | Not started |

**Exit:** Benjamin can replace an edited RAW in his working library with a verified JPEG confidently.

## F5 — Upstream maintenance

**Objective:** Make the fork inexpensive to keep current.

| Slice | Acceptance                                                                            | Status      |
| ----- | ------------------------------------------------------------------------------------- | ----------- |
| F5-S1 | A repeatable upstream update checklist and known-good revision policy are documented. | Not started |
| F5-S2 | Compact and Finalize RAW regression checks run before accepting an upstream release.  | Not started |
| F5-S3 | First upstream update is integrated without broad conflict resolution.                | Not started |

## Deferred

- Changes to RAW decoding, X-Trans demosaic, WGSL processing, or color science require a concrete defect
  reproduced on the Fuji acceptance corpus.
- Commercial product planning is deferred while the project is a personal tool.
