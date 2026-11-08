# Marrowdeep v24: the new story, Acts I and II

Built from `claude/story/Story Bible & Storyboard v2.pdf` and `claude/story/Region Moods & Pre-Art Notes.pdf`. The mood boards are in `art/moodboard/`.

## Decisions taken (BT, 8 Nov)
- The old five acts become **Act III** for now: Ossuary → Mother → Kiln → Saint → Breach → Count, the finale. The Drowned Chapel and the Debtors' Warren leave the campaign, because their bosses (the Choir and the Collector) now live in the city.
- The prologue is built, and **the pact is shown**, so the story plays as a tragedy.
- Bosses go where the mood boards put them: Region Moods settings, with the bible's bosses and beats.
- **Ilse is alive (Option B).** Acts I and II keep the pikes ambiguous.

## Campaign (campaign.js)
Prologue: the Walls of Kesh → Act I: Quiet Fields / Ser Odo · Rushmere Fen / Three Sisters · Ashes of Kesh / Lantern Preacher · Weeping Pass / Captain Merrow · Last Light / Piet → Act II: Harvest Villages / General Brann · Lower City / Tithe-Collector · Old City / Choir of Teeth · Royal Houses / Marshal Rook · Palace Bridge / Ser Gideon → the fall → Act III → Finale.

That makes 28 maps including the Rope-House (11 before). Each new region is one level plus a boss arena.
- `open:1` levels are outdoors: sky behind them, several rows of rooms, and the deep's room kinds (a world.js change).
- `dep()` puts depth back on the old 0–10 scale. Gold, prices, waves, traps, elite chance and boss damage use it.
- Pilgrim monster level is `1 + dep×2`, so it still ends around 21.
- Old saves are moved to the matching place (`migrateIdx`, journey.js). For example, a save in the Debtors' Warren goes to the Lower City. Saves now carry `camp:24`.
- Co-op protocol bumped to `marrowdeep-24`.

## Regions (regions.js)
Each region has a backdrop painted in code at the game's pixel scale with ordered dithering, taken from the mood boards. It also gets ground baked to match, set dressing, weather in front of the world, and one mechanic:
- **Fields:** crows and scarecrows.
- **Fen:** hands grab you when you wade. Roll free.
- **Ashes:** sandstorms cut what you can see and push you.
- **Pass:** fog banks hide the drops, and rockfall comes with a shadow first.
- **Villages:** folk stop and watch you, a tithe mark sits on the tenth door, and bells ring at the wrong time.
- **Old city:** his portrait is on the walls and its eyes follow you.
- **Royal houses:** portraits bleed.
- **Bridge:** the gate of pikes and Tomas's horse.

Through Act I the Wound sits on the horizon and grows region by region. The generator's stock wraiths, brutes and Wall-Born become local foes (`REMAP`).

## Foes
- **foes_march.js (Act I):** scarecrow (moves only while you aren't looking), crow flocks, bounty rider (unhorsed at half life), fen hag, bog drowner, marsh lantern, leech (roll to throw it off), salt wraith, buried soldier, vulture, harpy, goat-skulled hermit, Hollowed footman (never flinches, marches in step) and pikeman (braces against rolls), lantern zealot.
- **foes_city.js (Act II):** villager (friendly until you're close), cutpurse (steals crowns; kill it to get them back), rat king and rats, bloated beggar, plague doctor, Hollowed guard, tithe-taker (chain drag), curfew bellman (stop the bell or two guards come), gargoyle, siege engineer, masked noble, string-dancer, black-eyed servant, Knight of the Hand.
- All wind-ups use the existing glint states, so interrupts work. Codex entries are added for all of them.

## Bosses (bosses2.js)
- **Odo:** charges, hounds, lance and net. Unhorsed at half life.
- **Three Sisters:** one shared life bar. They swap pools. At ⅔ and ⅓ the sister who is out dies, and the others take her gift.
- **Preacher:** oil, fire along the floor, and a congregation that halves his damage while two or more pray.
- **Merrow:** a squad. While any of his men stand he can't be staggered and takes less damage.
- **Piet:** a guard that turns light blows and answers them, a roll behind you, a shield bash and a three-cut chain.
- **Brann:** a barrage on marked ground, a creeping barrage, mines and sappers.
- **Rook:** cavalry charges, then on foot after he's unhorsed.
- **Gideon:** the bridge narrows; his sunder breaks sections. Beaten, he drops the torch and the bridge goes up. That leads into Act III.

## Prologue (kesh.js)
- The tutorial walk is unchanged, now set on the walls of Kesh. The defenders are men of Kesh, and their kills don't fill the Codex.
- Cassian fights beside you. He can't die and calls out lines.
- At the end: the King's order, your refusal, and Cassian burning the granaries. Then the betrayal pages, then Act I.

## Story (story2.js)
- About 60 panels with the bible's ids, so a still dropped into `art/manga/<id>.png` replaces the drawing.
- Pages: opening, prologue (the frame, 7 pages), Act I, five Act I bosses, Act II, five Act II bosses, and the fall.
- The "keep" panels use the old stills' ids: crow, letter, ledger, cage, choir and fall.
- Barks follow the act.
- Act III reuses the old "You fell" pages (captions updated). The Kiln and the Breach keep their intros as level scenes.

## Map (journey.js)
The whole road: Kesh, the March, Hollowmere on its hill, the bridge, the fall, and the climb back up under the palace.

## Tested headless
- All 28 maps generate and pass the reachability check.
- All 10 Act I/II bosses were simulated to death through all three phases, with no errors.
- Every new foe was soaked against the player for 20 s and then killed.
- All 15 new story scenes were played and screenshotted.
- The flow prologue → cut → frame pages → Fields → Act I pages works.
- Old-save migration was checked.
- A two-tab local co-op run went through the fields, the fen and the lower city with matching foe counts and no errors.

## Not done yet / known gaps
- **Story drawings are code-drawn placeholders.** Generate stills from the bible's prompts with the style header. SpriteCook and Blueprint Studio didn't load in this session either.
- **Region art is code-drawn.** The Region Moods plan (prove the swamp in-engine with generated tiles and parallax, then the rest) still applies once image tools load.
- **Act III still tells the old story in places:** the Count's pages, the old codex lines and sister-era captions. The Sold Gaol, the Royal Crypt (Dead King) and the Throne Room (King Cassian) are the next build.
- **Act II unease from sound** isn't in: detuned music and wrong-way shadows.
- **Halden's look** doesn't change with the story: no white surcoat in the prologue, and no dedicated hood.
- **Co-op got a smoke test only.** Foes acting on a remote hero no longer push that hero locally (`meHere`).
- **Balance is unplaytested.** Boss life uses the old act multipliers spread over the new order (`BOSS_HP_MUL`).
