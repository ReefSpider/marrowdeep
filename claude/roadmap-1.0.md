# Marrowdeep — road to 1.0

Scope decision (BT, 2026-11-05): **1.0 is everything as it is** — all 11 tiers, co-op, the Rope-House, altar, Ways, slots. Nothing is cut; everything gets polished.

Last updated: v54 (18 Nov 2026). Version notes for each release are in `claude/vNN-notes.md`.

## Done since v17
- **Playtest loop running:** friends' reports drove v34–v44 (scaling, levelling, loot variety, chest kinds, falls, late-game difficulty, Act II, boss guard/openings).
- **Builds:** gloves, boots, a second ring; Might · Finesse · Fortitude; armour families, sets, milestones; team roles (v39–v40), rebalanced in v45.
- **UI pass (v30):** nothing scrolls, one item picker, one word for leaving (Back), typing only on story cards, Rope-House names and Ilse's tour, a Settings tab.
- **Shipping basics, part:** version number on the title (v30); scripts cache-busted per release (v41.1).
- **Co-op:** duels (v43, tested across two browsers); exit vote (v37); co-op items and names checked on arrival (v45).
- **Tooling:** DPS meter, telemetry and the balance lab (v32); seeded lab runs (v45).
- **Hosting:** three.js and PeerJS self-hosted (v45); story panels as WebP (77 → 5 MB, v45).

## Done since v45
- **The Marrow tree, stages 1–3** (v46–v48): 273 of 300 nodes.
- **The cold open** (v49).
- **Set pieces** (v50): the first three bosses rebuilt on their own ground; a director and a far plane in the first three regions; foe reactions to damage types, regional leanings, element shrines, officers; a slow-motion beat on heavy blows. The audit behind it is `claude/audit-v50-steam.md`.
- **Act II's bosses and the stake** (v51): Brann, the Tithe-Collector, the Choir, Rook and Gideon each on a stage with moving parts that can be turned on them; a push-your-luck stake on every boss chest (solo).
- **Grander bosses and a logic sweep** (v52): nine hero-sized bosses drawn 1.35–1.6× larger; Rook moved from the Royal Houses to the Palace Bridge; officers only among soldiers, set pieces only under open sky, Brann back in period.
- **The end of Act I** (v53): Merrow (countermand his orders, the avalanche) and Piet (ladders, the three-cut chain, the ram) on their own ground.
- **The Crowspire** (v54): the endgame. An endless tower from the Rope-House at any level; 10× tougher every 10 floors; one Crow's Hoard per climb whose odds grow with the floor (a grey coffer at 1, 50/50 abyssal at 1000), lost if you fall.

## Next, in order

### 1. Playtest round on v45 (BT)
- Everyone reloads (co-op needs `marrowdeep-53`), presses **Clear** in the playtest report, plays, and sends it.
- Questions: do v44's boss openings make fights feel read rather than rushed? Do the builds feel different (tank holding the room deep, killers equal)? Anything that suddenly feels unfair after the Might change?

### 2. Things Claude can build next
- **Set pieces, the rest (from the v50 audit):** Act III's three bosses and the finale on their own ground; the stake in co-op; directors and far planes for the other seven regions; plan section 5's Gift routes and boss tree answers.
- **Fonts into the repo** (they load from Google Fonts; a desktop build has to start offline).
- **A desktop build with Steamworks** (Electron or Tauri; achievements, cloud saves).
- **Controller support:** gamepad play, plus menus navigable by controller and keyboard.
- **Settings & accessibility:** key rebinding (the Controls tab lists keys but can't change them), screen shake and flash toggles, colour-blind rarity markers (shape or letter as well as colour), text size.
- **Shipping basics, the rest:** in-game changelog, credits screen, loading screen, automatic save backup slot, known-issues list (GitHub Issues).
- **Code health:** fold the deepest wrapper stacks (`calcStats`, `hurtPlayer`, `dmgEnemy`, `loadLevel`) into single functions with named hooks, one system at a time, with the 28-level sweep and `BAL.roles()` after each.
- **Balance from data:** tune from the v45 reports.
- **Polish all 11 tiers:** each deep tier's identity beyond bigger numbers.

### 3. Things Claude can't do (need people)
- **Art pass:** one artist, one style guide — hero, five bosses, title screen, UI frames. Even a small commission of key assets helps.
- **Sound pass:** a sound designer to mix everything to one loudness and give each enemy a distinct attack tell. (Current SFX are synthesized or licensed Splice samples.)
- **Real-device testing:** a mid-range laptop and a phone, holding 60 fps in the worst horde and boss fights; co-op across two real networks over PeerJS.
- **Presentation:** a short trailer, an itch.io page with real screenshots and a one-line pitch, a Discord or feedback form.
- **Decisions for BT:** whether the Splice samples, story bible PDFs and raw manga art stay publicly downloadable; a licence for the code.

## Known issues
- Hanged foes can spawn inside stalactites in cave rooms (cosmetic).
- Co-op over two real networks hasn't been tested (local two-tab and two-browser only). Players behind strict networks may not connect (no TURN relay).
