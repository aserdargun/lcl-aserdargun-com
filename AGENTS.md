# LCL working contract

- Build the source-backed decision workbench for a private local AI lab, matching open-weight model requirements to NVIDIA, AMD, and Apple devices.
- Keep decision truth in `src/domain` and `public/data/v1`; do not introduce a backend, accounts, scenario telemetry, or affiliate links. Compatibility states (`verified`, `fits`, `constrained`, `unsupported`, `unknown`) and the 35% price anomaly guard are non-negotiable.
- Catalog entries, scoring, device profiles, and market observations are decision inputs. `/changes`, `/manifest.json`, and refresh audit rows are observer outputs that never feed back into recommendations.
- Catalog, manifest, changes, and versioned Workbench scenario schema versions are explicit. Zod validates at every data boundary; update affected versions when semantics change.
- Refresh:data is fail-closed. Every accepted snapshot is hashed (SHA-256) and stamped; the last-known-good snapshot is preserved on source or schema failure. Reject ad-hoc edits to `public/data/v1` outside the refresh workflow.
- Keep Turkish and English controls, labels, and explanations equivalent across every route. Mark model assumptions, units (GiB, tokens/s, TOPS), and tax basis (TR/DE VAT, US ex-tax) explicitly.
- `src/data/horizon.ts` mirrors public application identities from the canonical manifest in the sibling `aserdargun-com` repo (`../aserdargun-com/data/living-system.json`). Run `npm run sync:portfolio` to regenerate the committed `src/data/portfolio.lock.json` after an upstream identity change; `src/data/horizon.sync.test.ts` fails on drift. `blurb` is local copy and is never locked.
- Verify `npm run validate` and review `git diff --check` before handoff.
- Local work only unless the user authorizes external publication. Preserve unrelated work, in-flight scenarios, and the public snapshot.
