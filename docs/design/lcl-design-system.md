# LCL design system

## Accepted reference

The approved visual reference is the sibling atlas screen at
`/Users/aserdargun/Documents/ChatGPT/llm-aserdargun-com/docs/design/layered-atlas-home-reference.png`.
The user explicitly opted out of a new image-generation pass during planning, so LCL extends that existing visual language rather than introducing a new art direction.

## Product-specific direction

- Preserve the atlas typography, dark/light theme behavior, fine rules, uppercase mono chrome, editorial serif headings, and TR/EN navigation behavior.
- Make the buying decision the first viewport: an open two-column workbench intro leading directly into the five-step flow.
- Use three persistent ecosystem rails—NVIDIA blue, AMD amber, Apple silver—only where they encode ownership or comparison. They are not decorative gradients.
- Keep the layout open and ledger-like. Panels and borders must organize evidence or interaction; avoid nested card grids.
- On mobile, the three result columns become an accessible ecosystem tablist with one visible panel at a time.

## Tokens

- Canvas: `#06101d`; deep canvas: `#040b14`; surface: `#0a1725`; raised surface: `#0d1c2b`.
- Ink: `#f3f1ea`; muted: `#9daaba`; strong muted: `#c5ccd4`.
- Action/NVIDIA: `#547cff`; AMD: `#e4a04f`; Apple: `#c4ccd6`; success: `#63c6a2`; danger: `#e77878`.
- Rules: translucent blue-gray, one CSS pixel; corners: 4–8 px only for controls and focused evidence blocks.
- Content type: Georgia/Times editorial serif; interface type: IBM Plex Mono; supporting sans: Manrope.
- App shell: `min(1380px, 100% - 64px)` desktop and `100% - 32px` mobile.

## Primary-screen inventory

- Header: LCL brand, Workbench, Models, Devices, Benchmarks, Compare, Changes, Methodology, locale, theme, mobile menu.
- First viewport: title “Hangi laboratuvarı almalıyım?”, one explanatory paragraph, primary “Laboratuvarı oluştur” control, snapshot freshness, three ecosystem measurement rails, and the start of step 1.
- Workbench: step indicator, market and budget, workload priorities, constraints, owned equipment, infrastructure, and live summary.
- Result: one NVIDIA, AMD, and Apple column; acquisition cost, fit, memory headroom, evidence state, alternative, phased purchase plan, and share control.
- Downstream: source-backed model/device ledgers, benchmark cohort browser, four-device and three-package comparisons, changes ledger, and methodology.

## Allowed above-the-fold copy

- `LCL / Local Compute Lab`
- `Workbench`, `Models`, `Devices`, `Benchmarks`, `Compare`, `Changes`, `Methodology`
- `Hangi laboratuvarı almalıyım?`
- `Bütçenize, iş yükünüze ve mevcut ekipmanınıza göre NVIDIA + AMD + Apple yerel AI laboratuvarı kurun.`
- `Laboratuvarı oluştur`
- `Son doğrulanan snapshot`
- `NVIDIA`, `AMD`, `APPLE`
- `Pazar ve bütçe`

English copy is a direct semantic translation of this list, not an additional content layer.

## Interaction contract

All five steps remain keyboard reachable, forward/back actions preserve state, result changes are real local calculations, shared URLs restore a versioned scenario, and local persistence is opt-in. External links are visibly identified as source or purchase references. Motion is limited to progress, selected-state, and result-reveal transitions and must respect reduced-motion preferences.
