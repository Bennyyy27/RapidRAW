# Product goal

## Outcome

RapidRAW-SCS should be the one application Benjamin uses to organize, develop, and finalize photos.
It should retain RapidRAW's capable GPU-accelerated editor while feeling denser, faster to scan, and
better suited to a desktop professional workflow.

## Core user journey

1. Open a folder or album containing RAW and rendered images.
2. Cull and organize photographs with ratings, labels, tags, and albums.
3. Develop Fujifilm RAF files with immediate visual feedback.
4. See the important adjustment controls without excessive scrolling or empty space.
5. Finalize an edited RAW to JPEG in one guided operation.
6. Preserve the RAW's approved logical relationships on the JPEG.
7. Keep, archive, or explicitly trash the RAW after successful verification.

## Success criteria

- One application covers the workflow; PhotoHub is not required alongside it.
- Existing RapidRAW rendering behavior and performance are not regressed by UI customization.
- Compact mode visibly fits materially more controls than upstream at the same window size.
- Benjamin's Fuji RAF corpus opens, edits, zooms, pans, persists, and exports reliably.
- Finalization cannot lose the original or silently orphan albums, ratings, tags, or sidecars.
- Upstream releases remain adoptable without repeatedly rewriting the fork.

## Non-goals for now

- Building another RAW decoder, demosaic algorithm, or GPU pixel pipeline.
- Matching PhotoHub's former architecture for its own sake.
- Operating two applications as the intended workflow.
- Broad product-market positioning or speculative enterprise features.
- Rebranding every upstream screen before daily workflow gaps are validated.
