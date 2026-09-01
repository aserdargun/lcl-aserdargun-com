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
- `/:locale/changes` — snapshot and source-status ledger
- `/:locale/methodology` — scoring, memory, market, and fail-closed rules

Versioned scenario parameters make Workbench results shareable. Browser persistence is opt-in only.

## Static data contract

- `/data/v1/catalog.json`
- `/manifest.json`
- `/changes.json`

Versioned copies of the manifest and change feed also live beside the catalog under `/data/v1`.

`npm run refresh:data` builds a candidate in a staging directory, validates all cross-references, applies the 35% price anomaly guard, creates a deterministic SHA-256 manifest, and atomically replaces the public snapshot. A failure leaves the last-known-good snapshot in place.

Only curated publisher/manufacturer sources and recommendation-eligible publisher or reproducibly converted artifacts are admitted. Compatibility uses `verified`, `fits`, `constrained`, `unsupported`, and `unknown`; `verified` is reserved for an exact model/artifact/runtime/device measurement.

## Market boundaries

Türkiye and Germany observations disclose VAT. US observations exclude sales tax. LCL never substitutes converted prices for local observations and does not mix tax bases into a single “cheapest” ranking.

## Automation status

The data refresh workflow is deliberately manual-only. The intended 05:30 Europe/Istanbul daily cadence and Sunday full refresh are documented in the workflow but no schedule is enabled. Publishing, commits, pushes, Azure configuration, and DNS remain outside the local implementation contract.
