# RapidRAW-SCS Engineering Guide

## Mission

RapidRAW-SCS is Benjamin Spiess's personal, single-application photography workflow. It is a thin,
maintainable fork of RapidRAW, not a second RAW engine and not a continuation of PhotoHub's custom
rendering research.

The product goal is:

- keep RapidRAW's existing RAW, GPU, editing, masking, export, and library capabilities;
- provide a substantially denser desktop UI with more controls visible at once; and
- add a safe `Finalize RAW` workflow that exports an edited RAW to JPEG, transfers the logical
  relationships of the RAW to the JPEG, verifies the result, and only then optionally archives or
  removes the RAW.

Personal usefulness and reliability take precedence over market differentiation. One application is
a hard requirement.

## Primary documents

Read these before making product or architectural changes:

1. `docs/00-goal.md`
2. `docs/01-roadmap.md`
3. `docs/02-current-state.md`

Update `docs/02-current-state.md` after every completed slice or newly discovered blocker. Update the
roadmap when scope or priorities change. Do not reconstruct history from chat when the handoff answers
the question.

## Upstream strategy

The official RapidRAW repository is the Git remote named `upstream`. A personal GitHub fork, when
created, must be named `origin`.

- Keep the fork thin and regularly merge or rebase reviewed upstream releases.
- Pin a known-good upstream revision for daily use; do not chase every upstream commit.
- Put SCS-specific behavior behind small components, root-level density classes, feature flags, or
  isolated Rust commands.
- Avoid broad rewrites of `src/App.tsx`, central stores, RAW decoding, WGSL shaders, and rendering.
- Prefer contributing generally useful fixes upstream when practical.
- Never force-push shared branches or discard local/user changes.

Before accepting an upstream update, verify the compact UI, Fuji RAF workflow, sidecar compatibility,
export fidelity, and `Finalize RAW` safety.

## Product priorities

1. Stable daily editing of Benjamin's Fujifilm RAF files.
2. Compact, information-dense desktop Develop UI.
3. Safe and recoverable RAW-to-JPEG finalization.
4. Preservation of ratings, tags, albums/collections, metadata, and edit provenance.
5. Straightforward upstream maintenance.

Do not build speculative commercial features, a second catalog, or a replacement RAW engine unless a
measured limitation of RapidRAW blocks the personal workflow and the decision is explicitly approved.

## Finalize RAW safety contract

Originals are user-owned. Never delete or overwrite a RAW as an implicit side effect.

The workflow must be ordered and recoverable:

1. Render to a temporary delivery file.
2. Validate format, dimensions, readability, and requested metadata.
3. Atomically place/register the JPEG.
4. Transfer ratings, labels, tags, albums, and other approved relationships.
5. Verify the JPEG and transferred relationships from persisted state.
6. Offer RAW retention, archive, or trash as an explicit final choice.
7. Record enough state to resume or repair an interrupted operation.

Default to retaining the RAW. Permanent deletion requires separate explicit confirmation and must not
occur if any earlier step failed.

## UI principles

- Desktop-first and information-dense.
- Preserve keyboard accessibility and practical pointer hit targets.
- Use shared components and density variables rather than scattered one-off overrides.
- Keep Comfortable/Compact/Dense behavior structurally possible even when Compact is the fork default.
- Minimize empty space, oversized cards, decorative animation, and unnecessary scrolling.
- Do not change image-processing semantics as part of a visual-density slice.

## Engineering workflow

For each slice:

1. Inspect the current-state handoff and relevant upstream code.
2. State a short plan and assumptions.
3. Implement the smallest isolated change that is visibly testable.
4. Format only touched files.
5. Run the narrowest relevant checks, then the production frontend build.
6. Run the native app for user-visible UI changes when practical.
7. Commit a small coherent slice.
8. Update `docs/02-current-state.md` with evidence and remaining debt.

RapidRAW upstream currently has pre-existing TypeScript and ESLint failures. Do not claim those gates
are green and do not expand a scoped change into hundreds of unrelated fixes. Ensure touched files are
formatted, the production build passes, and report baseline failures separately.

## Toolchain

RapidRAW currently declares Rust 1.98. On this Mac, start development with:

```bash
RUSTUP_TOOLCHAIN=1.98-aarch64-apple-darwin npm start
```

The first native build downloads and compiles substantial RAW, GPU, export, and AI dependencies.
Subsequent builds are incremental.

## Licensing and provenance

RapidRAW is an AGPL-3.0 project. Preserve upstream copyright and license notices. Before adding a new
dependency, model, model weight, dataset, fixture, or copied implementation, record its provenance and
license and assess redistribution and commercial-use constraints. Do not claim legal certainty.
