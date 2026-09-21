# LCL — Local Compute Lab

LCL is a bilingual, public, static-first decision workbench for building a private local AI lab across NVIDIA, AMD, and Apple. It connects open-weight model requirements to device memory, runtime evidence, local market observations, and a transparent three-node recommendation.

The site does not create accounts, send scenario data to a backend, track purchases, or use affiliate links. “Private” describes the local/offline operating conditions of the recommended models—not access to the website.

## Local contract

Node.js 22 or newer is required.

```sh
npm ci
npm run run:local
npm run validate
npm run stop:local
```

`run:local` uses `127.0.0.1:4173`. `stop:local` only terminates a listener whose working directory belongs to this checkout; it refuses to stop foreign processes.

## Product routes

- `/:locale` — decision-first home (`tr` or `en`)
- `/:locale/build` — five-step Workbench and three-ecosystem package
- `/:locale/models` — model-to-device compatibility
- `/:locale/devices` — device and market profiles
- `/:locale/benchmarks` — evidence-backed benchmark runs
- `/:locale/compare` — up to four devices and three packages
- `/:locale/learn` — bilingual concept cards and browser-local spaced repetition
- `/:locale/changes` — snapshot and source-status ledger
- `/:locale/methodology` — scoring, memory, market, and fail-closed rules

Versioned scenario parameters share Workbench inputs, not a frozen result or catalog version. The accepted catalog is used again when calculating; record the snapshot ID separately when documenting a decision. Scenario persistence is opt-in. Learning progress and theme preference use browser storage, with an in-memory fallback when storage is unavailable.

## Portfolio and learning context

The shared navigation follows the aserdargun.com learning system: CTX and SEC inform local requirements; LCL and CLD are parallel deployment choices; DCL is their shared deployment-comparison lab. WFM and SWI are parallel research directions. These are navigation links, not automatic scenario transfers or runtime integrations.

The learning cards and methodology describe the implemented heuristic, including its limits: noise affects ranking; infrastructure is recorded but excluded from cost and score; catalog memory values use GiB; dated reference and stale prices can inform estimates. Source statuses refer to the accepted snapshot, not a live source check. Concept references are separate from catalog evidence.

## Static data contract

- `/data/v1/catalog.json`
- `/manifest.json`
- `/changes.json`

Versioned copies of the manifest and change feed also live beside the catalog under `/data/v1`.

`npm run refresh:data` builds a candidate from the curated `src/data/catalog-seed.ts` in a staging directory, validates cross-references, applies the 35% price anomaly guard, creates a deterministic SHA-256 manifest, and replaces the public snapshot with rollback on failure. This command does not fetch or reverify sources. The application reads the accepted `public/data/v1/catalog.json`, so the UI and downloadable contract use the same guarded data.

Only curated publisher/manufacturer sources and recommendation-eligible publisher or reproducibly converted artifacts are admitted. Compatibility uses `verified`, `fits`, `constrained`, `unsupported`, and `unknown`; `verified` is reserved for an exact model/artifact/runtime/device measurement.

## Market boundaries

Türkiye and Germany observations disclose VAT. US observations exclude sales tax. LCL never substitutes converted prices for local observations and does not mix tax bases into a single “cheapest” ranking.

## Automation status

The data refresh workflow is deliberately manual-only. The intended 05:30 Europe/Istanbul daily cadence and Sunday full refresh are documented in the workflow but no schedule is enabled. Publishing, commits, pushes, Azure configuration, and DNS remain outside the local implementation contract.
