# Marrowdeep v41: the late game bites

BT (9 Nov): "make it a bit harder, especially the later levels … much much harder to level and enemies after level 50. just to test it out because im still cruzing at level 40."

All of it lives in `hard43.js` (loaded after roles42.js). The `HARD` object holds every number. **`?hard=0`** in the address turns the file off, for side-by-side comparison. Co-op needs `marrowdeep-41`.

## Foes (by monster level)
| Monster level | 30 | 40 | 50 | 60 | 76 | 100 |
|---|---|---|---|---|---|---|
| Life | ×1 | ×1.2 | ×1.4 | ×1.9 | ×2.7 | ×3.9 |
| Damage | ×1 | ×1.25 | ×1.5 | ×1.75 | ×2.15 | ×2.75 |

- **Ordinary foes:** life +2% per level from 30 to 50, then +5% per level. Damage +2.5% per level throughout.
- **Bosses:** three quarters of the damage step-up and the square root of the life step-up (×2 life at 100). Full damage two-shot geared heroes on Marrow's End.

## Levels
- Above level 40, each level costs 6% more than the one before, on top of the old curve. Above level 50 the extra rises to 10% per level, capped at ×20 in total.
- Extra cost per level: ×1.8 at 50, ×2.9 at 55, ×4.6 at 60, ×12 at 70, ×20 from 72.
- Slower kills slow levelling further.
- The Marrow's 8% growth after a campaign clear still applies on top.

## Lab (BAL.run, K=16; player 2 above monster level), before → after
| Monster level | Unique kit: ghoul kill time | Unique kit: ghoul hits to die | Rare kit: ghoul hits to die |
|---|---|---|---|
| 40 | 0.37 → 0.39 s | 21 → 15 | 15.8 → 12.9 |
| 50 | 0.45 → 0.52 s | 18 → 11.5 | 13.8 → 9.8 |
| 60 | 0.34 → 0.84 s | 15 → 8.7 | 12.4 → 6.3 |
| 80 | 0.55 → 1.85 s | 10.9 → 5.5 | 9.6 → 3.6 |
| 100 | 0.94 → 3.6 s | 8.4 → 3.2 | 6.2 → 2.4 |

Bosses (full damage step-up, before the change to three quarters), before → after:

| Tier | Hits to die | Unique kit fight time |
|---|---|---|
| Iron Vow | 8.5 → 6.3 | 14 → 15 s |
| Karma | 7.3 → 4.1 | 18 → 24 s |
| Netherdeep | 5.6 → 2.5 | 24 → 42 s |
| Marrow's End | 4.6 → 1.7 | 32 → 53 s |

The three-quarters change lifts boss hits to die by roughly 20–30% from these figures.

## Knobs if it's too much or too little
- `HARD.hp.b`, `HARD.dmg.b`: the per-level rate past 50.
- `HARD.hp.a`, `HARD.dmg.a`: the rate from 30 to 50.
- `HARD.xp.a`, `HARD.xp.b`, `HARD.xp.cap`: the levelling curve.
- `HARD.bossDmg`, `HARD.bossHpPow`: bosses.
- The playtest report records `hard` (life, damage and XP multipliers) for each visit.

## ChatGPT's gameplay art merged (9 Nov)
- **What:** the Codex branch `codex/gameplay-art-proof` (PR #1) was merged through the new branch `merge/gameplay-art` into main as e38aaac. PR #1 now shows as merged.
- **What it adds:** in-game art only, drawn in code with no image files:
  - pixel weapons for every weapon class, shared between the hand and the satchel icon (artgear.js replaces `drawWeapon`);
  - redrawn ghouls, hounds, salt wraiths and other foes, and bosses;
  - family-aware icons for all v39 armour, helm, glove and boot bases;
  - per-element weapon accents and swing trails (e.g. Shadow is purple), and directional hit effects, in place of the old rarity glow on weapons.
- **Files:** `assetdraw.js`, `artgear.js`, `artmobs.js`, `artbosses.js`, `artfx.js` and `artworld.js`, plus small hooks in actors.js, enemies2.js, foes_march.js, hero.js, items.js and ui.js.
- **No gameplay changes:** no stats, balance or co-op protocol changed, and the v41 numbers check out the same after the merge.
- **Workshop:** `tools/art-review.html` shows every drawing. ChatGPT's notes are in `tools/GAMEPLAY-ART.md`.
- **Checked after the merge:** all 56 levels load and play with no page errors.
- **Not merged:** `feature/pixel-art-detail-animation` is an old v13–v22 copy with no shared history. Its manga panels are already in main.

## Cache-busting (aea637a, branch `fix/cache-bust`)
- **Why:** right after the art merge, BT's Shadow weapon still showed the old drawing. The merged build renders it with the new art; the browser was running files it had cached. GitHub Pages lets browsers cache each file for about 10 minutes, so a fresh release could mix with cached older files.
- **Fix:** every game `<script>` in index.html now carries `?v=41.1`.
- **Every release:** bump that tag across index.html, for example `sed -i 's/?v=41.1/?v=42/g' index.html`.
