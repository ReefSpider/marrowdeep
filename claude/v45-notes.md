# Marrowdeep v45: fixes from the v44 audit

BT (10 Nov): "Fix all you can", after the audit of v44.2 (`claude/audit-v44.md` in the Project).

Seven branches, all merged into main: `fix/coop-items`, `balance/roles`, `art/webp-manga`, `merge/environment-detail` (Codex's `codex/environment-detail`), `fix/small`, `docs/sync`, then `release/v45`. Co-op needs `marrowdeep-45`; scripts are tagged `?v=45`; the title shows v45.

## Co-op items can't carry code or forged stats (`items.js`, `safe45.js`)
- **The hole:** an item from another player (gift, drop, chest, worn gear) was rebuilt with its name and stats exactly as sent, and the tooltip wrote the name as HTML. A gifted item named `<img src=x onerror=…>` ran script when hovered, and a +99,999% damage stat was accepted.
- **Now `deItem` checks every item**, from saves and from other players:
  - slot and base must be real, rarity 0–5, item level 0–200, quality 50–150;
  - the name and set lose `< > & " \``; the flavour line loses `< >`;
  - unknown stats are dropped, at most 12 stats;
  - each stat is held under twice the largest value the game can roll for it at that item level (`affCap`). 5,616 generated items of every rarity, slot and item level 1–115 round-trip unchanged; the highest real roll is 63% of its cap.
- **The tooltip escapes** the name and flavour line (`escH`).
- **`safe45.js`** wraps `onMsg` last, so it runs first: any `name` in a co-op message is cleaned before the game reads it. The host already cleaned names at hello; this covers a guest whose host isn't playing fair.
- **Tested:** two tabs (`?net=local`): lobby, start, both on the same level, a real gift arrives intact, a forged gift arrives with its name defanged and its damage capped, and hovering it runs nothing.

## Builds rebalance (`attr40.js`, `sets41.js`, `bal34.js`)
Measured with `BAL.roles`, 2 × 400 kits on a fixed dice seed (same kits before and after), as multiples of a balanced rare kit, DPS / effective life:

| Build | Target | v44 | v45 |
|---|---|---|---|
| Killer, Might: great hammer | ×1.4 / ×0.8 | ×1.62–1.67 / ×0.91–0.98 | ×1.50–1.55 / ×0.90–0.97 |
| Killer, Might: great axe | ×1.4 / ×0.8 | ×1.85–1.90 / ×0.93–0.99 | ×1.53–1.60 / ×0.93–0.95 |
| Killer, Might: great mace | ×1.4 / ×0.8 | ×1.75–1.82 / ×0.91–1.01 | ×1.61–1.71 / ×0.91–0.96 |
| Killer, Finesse: twin katanas | ×1.4 / ×0.8 | ×1.30–1.36 / ×0.66–0.71 | ×1.39–1.48 / ×0.63–0.69 |
| Tank, Pilgrim | ×0.7 / ×1.8 | ×0.73 / ×2.06–2.11 | ×0.74 / ×2.06–2.11 |
| Tank, tiers 4 and 10 | ×0.7 / ×1.8 | ×0.72 / ×1.45–1.52 | ×0.73 / ×1.83–1.89 |
| Marksman (on paper, before the range bonus) | ×0.6 melee, ×1.6 at range / ×0.55 | ×1.16–1.35 / ×0.67–0.70 | ×1.22–1.44 / ×0.63–0.70 |

- **Might damage per point** 0.8% → 0.55% × grade (`A_PER.migDmg`, new). Finesse stays 0.8%. Measured by switching parts off: Might damage gave a Might killer about +0.25, and Medium armour (Soldier + its Might and crit leanings) about +0.4.
- **Soldier** (2 medium pieces) +10% → +5% damage; +5% attack speed kept.
- **Twin blades** ×1.5 → ×1.55 damage.
- **Great axes ×0.9, scythes ×0.92** in the class normaliser (`B34.wpers`): by sheet DPS they ran +15% and +11% over the median two-hander, outside v34's ±9%. Lowering only the hammer just moved Might killers onto axes (×1.9).
- **The defense cap is per hero:** 80%, plus 1.25 points per heavy piece (86% in full plate; `SETK.heavyCap`). From tier 4, a plain rare kit already sat at 80% (`mit` 0.80 at monster level 50), so the tank's armour stopped counting and only its extra life did. Pilgrim is unchanged (nobody reaches the cap there).
- **Knobs in one place:** `SETK` in sets41.js (`soldierDmg`, `soldierAs`, `bastion`, `twinDmg`, `twinAs`, `heavyCap`) and `A_PER.migDmg` in attr40.js.
- **About the lab:** role kits take the best of four candidates per slot; the balanced kit takes the first. Part of every role's lead is that, so the targets are best read as the gap between roles. Without a seed, K=12 swings ±30% from run to run; use `node tools/lab/run-lab.js out.json roles 400 1234`.
- **Still above target:** Might killers in Medium ×1.5–1.7 and sturdier than planned (×0.9–0.97 life). The next knobs are Medium's leaning (`LEAN.M` without crit: measured only −0.03) or `A_PER.migDmg`.

## Story panels as WebP (`art/manga`)
- All 99 panels converted from PNG to WebP at quality 82: **77 MB → 5 MB**. The manifest, `story-v2-catalog.json` and `gallery.html` point at the new files.
- Every panel goes through the ink filter in play, and a side-by-side crop shows no visible difference. All 99 load at their original size.
- The 8 `ref-*.png` character sheets aren't used by the game and stay PNG.
- New stills: convert to WebP the same way before adding them.

## Codex's environment detail merged
- `codex/environment-detail` (textured stone, earth, timber, gateways; `artworld.js`, `world.js`, `tools/ENVIRONMENT-ART.md`) merged through `merge/environment-detail`.
- `index.html` conflicted only on its cache tags (`?v=44.1-env1` against main's `44.2`); main's list was kept and everything re-tagged `?v=45`.

## Smaller fixes (`fix/small`)
- **three.js r128 and PeerJS 1.5.4 are in `lib/`** (MIT; licences alongside). The game no longer depends on cdnjs and jsDelivr being up. Google Fonts is the only outside request left.
- **Saves that fail say so once:** "Your progress can't be saved in this browser: its storage is full or blocked." (`store.set`, core.js). Before, a full or blocked storage dropped saves silently.
- **Dead first copies removed:** `placeTraps`, `updTraps`, `drawTraps` (foes.js; traps27.js has the live ones), `dOdo` and `dRook` (bosses2.js; bosses29.js), and `dBrann` (bosses2.js; brann27.js). Every boss drawing runs.
- **Lobby and README** say Co-op / Host / Join, matching the buttons since v30.
- **`.gitignore`**, and a short contributor section in the README (notes, lab, branch-and-merge, version bumps).

## Docs (`docs/sync`)
- `claude/` in the repo now has v32, v34–v45, `builds-plan.md` and `higgsfield-shots.md`, which code comments refer to. Codex can read them there.
- `tools/lab/run-lab.js` takes a mode (`run`, `roles`, `bosses`, `all`), K and a dice seed. (The v44 audit said the runner was missing; it wasn't, it only ran `BAL.run`.)

## Tested headless (release build)
- Boot on desktop 1280×720 and phone 844×390: no page errors, no missing files, no outside scripts.
- All 28 levels load and play with input; tiers 4 and 10 spot-checked.
- Item checks, message checks, save warning, PeerJS from `lib/`, every boss drawing, `BAL.bosses()`, all 99 manga panels.
- Two-tab co-op: lobby, start, real and forged gifts.

## Still open (needs BT or people)
- **Public files:** the Splice `.ogg` samples can be downloaded one by one, and `claude/story/` (the story bible PDFs) and `claude/manga-art-raw-pixel/` (37 MB) are served on the Pages site. Whether to move them is BT's call. A `LICENSE` for the code is also BT's choice.
- **Wrapper layers:** 572 re-assignments over 205 functions; folding the deepest stacks (`calcStats`, `hurtPlayer`, `dmgEnemy`, `loadLevel`) is a bigger, separate job.
- **Real play:** the rebalance wants a playtest. Frame rate on a real phone and co-op across two real networks are still untested.
