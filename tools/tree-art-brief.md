# Marrowdeep — art brief: the Marrow 髄 tree

For GPT (Codex for in-code pixel art, ChatGPT images for the painted pieces). The design is in `claude/talents-plan.md`; this brief is self-contained so you don't need to open it. Nothing here changes game rules: draw what's listed, in the style below, and name files as given.

## Style (applies to everything)
- **Same hand as the gameplay art pass** (`tools/GAMEPLAY-ART.md`): pixel art on an integer grid, stepped contours, detail at joints and edges, no smooth vector gradients, no fractional alpha on icon borders.
- **The tree's own palette:**
  - ink `#0e0a0a`;
  - bone `#ece6d8`;
  - ash grey `#8a847e`;
  - blood `#b0141a`;
  - allocated gold `#ffd27a`.
- **Element colours** (use exactly):

| Element | Colour | Element | Colour |
|---|---|---|---|
| Fire 火 | `#ff7a2a` | Holy 聖 | `#ffe6a8` |
| Cold 氷 | `#8fd0ff` | Shadow 影 | `#a070ff` |
| Lightning 雷 | `#fff3a0` | Blood 血 | `#d0352c` |
| Water 水 | `#4aa8ff` | Wind 風 | `#c8e8d8` |
| Poison 毒 | `#8fe050` | Bone 骨 | `#e2d6b8` |

- **Attribute colours:** 力 Might `#e07a52`, 技 Finesse `#7ad0a8`, 耐 Fortitude `#8aa8e0`.
- **Mood:** 1997 Berserk anime and gothic Japanese horror. Ink, bone, old blood. Gritty, not glossy. No text baked into images (the game letters everything itself).
- **Kanji:** the game can draw any kanji as a demonic sigil (`sigils.js`). Where a node has a kanji, leave room for it, or use it as the design's core.
- **Must read on a phone at 852×393 and at 3× zoom on desktop.** Silhouette first, detail second.

## Delivery tracks
- **Track A — in code (Codex):** a new `arttree.js` loaded after `artfx2.js`, in the same pattern as `artgear.js`. Pure rendering, no gameplay state or RNG. It covers frames, icons, lines and effects.
- **Track B — images (ChatGPT image generation):** WebP at quality 82 (as the manga panels were), in `art/tree/` and `art/manga/`. Painted pieces only.
- Every item below says which track it belongs to.

---

## 1. The tree screen (priority 1)

| # | Asset | Track | Spec |
|---|---|---|---|
| 1.1 | **Background: the inside of a ribcage** | B | 2048×2048 WebP, square, centred. Seen from inside a vast chest of bone: ribs curve round the edge like the walls of a cathedral, a dark hollow at the centre where the Heart sits. Very dark (mostly ink), low contrast so nodes sit on top. Two layers so it can parallax: `tree-bg-far.webp` (deep shadow, faint ribs), `tree-bg-near.webp` (closer ribs on transparency). |
| 1.2 | **Three ring guides** | A | Thin inked circles at the inner (Brands), middle (attributes) and outer (elements) radii. Cracked, chalk-like, never a clean vector circle. |
| 1.3 | **Sector dividers** | A | Three spokes splitting the middle ring into 力 / 技 / 耐 thirds, each tinted with its attribute colour at low strength, the kanji as a large faint sigil inside its sector. |
| 1.4 | **Wedge borders** | A | Ten spokes on the outer ring. Each wedge tinted faintly with its element colour, its kanji as a faint sigil at the rim. |
| 1.5 | **The Heart** (centre node) | A + B | A beating heart of black blood inside a cage of small ribs. 64×64 px at 1×, 4-frame slow pulse. Optional painted version (B) for the zoomed-out view. |
| 1.6 | **The Spine** | A | A path of six vertebrae running from the Heart to Paradox: each small node drawn as a vertebra, not a dot. |

## 2. Node frames and states (priority 1)
Every frame needs **five states:**
- **locked:** unreachable, ash grey, dim;
- **reachable:** bone outline;
- **allocated:** gold fill and outline, faint glow ring of stepped pixels;
- **preview:** on the hovered path, pulsing outline;
- **refusable:** a fork whose other half is taken, with a red crack across it.

| # | Frame | Size (1× px) | Look |
|---|---|---|---|
| 2.1 | Small node | 10×10 | A bone bead. Element ring version takes a 1-px rim in the wedge colour. |
| 2.2 | Notable | 24×24 | A round seal of bone with an iron rim; the icon sits inside 18×18. |
| 2.3 | Keystone | 40×40 | A large seal, like a temple stamp, with a thick rim of bone and three nails; the icon inside 30×30. |
| 2.4 | Brand | 32×32 | An iron brand head (the branding iron's face), glowing at the edges; the Brand's kanji inside. |
| 2.5 | Fork | 20×20 | A plate hung off the Brand by a short chain. Carries a tiny role tag in the corner (力, 技 or 耐 in its attribute colour). |
| 2.6 | Attunement (wedge entry) | 24×24 | A notable frame cracked open, with the element pouring out of the crack. |
| 2.7 | Bridge notable | 24×24 | Split down the middle: left half in one element's colour, right half in its neighbour's. When allocated with both neighbours it lights fully. |
| 2.8 | Sigil socket | 24×24 | An empty eye socket in bone (phase 1: always empty, greyed). Phase 2: a version with a gem-like sigil seated in it. |
| 2.9 | Paradox (Spine keystone) | 48×48 | Unique: a seal broken in two and rejoined with gold (kintsugi), half light, half dark. |

## 3. Connections (priority 1, track A)
- **Line states:** unallocated (thin ash line, broken like old ink), allocated (gold, 2 px, slow crawl of light along it), path preview (bone, dashed, marching).
- **Fork link:** a short chain, not a line.
- **Bridge glow:** when both neighbouring wedges are allocated up to the bridge, the bridge line shows both colours braided.

## 4. Node icons (priority 2, track A)
- **Size:** 18×18 for notables and bridges, 30×30 for keystones, 14×14 for forks.
- **Fallback:** if an icon isn't done, the node shows its kanji sigil, so these can land in batches.
- **Each icon** is a small inked picture of the effect, in the node's colour (element, attribute, or bone for neutral).

### 4.1 Brands (9) and forks (18)

| Brand | Kanji | Fork A (tag) | Fork B (tag) |
|---|---|---|---|
| Hemorrhage: a lance of your own blood | 血 | Crimson Pact (技): three lances | Heart-Spike (力): one heavy staggering lance |
| The Hound: rage form, black iron | 獣 | Black Iron (耐): armoured hound | Red Maw (力): bleeding jaws |
| **Grave Slam (new)**: leap and crash, crater | 墓 | Ossuary Crash (力): bone splinters from the crater | Gale Crash (技): foes thrown into the air |
| Iaidō: sheathed draw cut | 居 | Thunder Draw (技): lightning wounds | Long Draw (力): a wide crescent cut |
| Shade Step: a shade copies your attack | 影 | Marking Shade (技): shade leaves a mark | Decoy (耐): foes turn to the shade |
| Thousand Cuts: phantom blades fall | 千 | Rain of Needles (技): ten thin green needles | Six Executioners (力): six heavy swords |
| Funeral Bell: everything stunned | 鐘 | Toll for Me (耐): foes turn to you | Drowning Bell (技): the toll throws water |
| Last Breath: refuse death once | 息 | Martyr's Breath (耐): allies healed | Vengeful Shade (力): a burning ghost |
| **Clarity, reworked as Stillness**: a ward forms when you stand still | 澄 | Frozen Stillness (耐): ward breaks into frost | Hallowed Stillness (力): ward breaks into a light pillar |

### 4.2 Attribute notables (18) and keystones (3)

| 力 Might | 技 Finesse | 耐 Fortitude |
|---|---|---|
| Headsman 首斬: an executioner's axe over a red mark | Flowing Steel 流刃: a blade trailing a ribbon | Chain Warden 鎖番: a chain dragging a foe in |
| Siegebreaker 攻城: a hammer cracking a shield | Deadeye 鷹目: a hawk's eye behind a bolt | Shieldwall 盾壁: a shield with figures behind it |
| Iron Grip 鉄握: a gauntlet on a great hilt | Twin Fangs 双牙: two crossed short blades | Undying 不死身: a heart still beating in a skull |
| Undertow of Iron 重力: a slam pulling dust inward | Second Wind 再息: breath curling from a mouth | Stone Skin 石肌: a hand turning to stone |
| Unbowed 不屈: a kneeling figure rising | Cutpurse 掏摸: a hand lifting a coin purse | Long Watch 長番: a lantern on a long pole |
| Bloodletter's Due 血税: a coin dripping blood | Featherfall 羽落: a feather over a drop | Pilgrim's Draught 巡礼酒: a gourd flask with light |
| **Keystone: Colossus 巨像**: a giant in plate, two-handed sword planted | **Keystone: Paper Tiger 紙虎**: an origami tiger, edges sharp, torn at the side | **Keystone: Martyr 殉教**: a figure taking arrows meant for those behind |

### 4.3 Element wedges: 10 Attunements, 30 notables, 10 keystones

| Element | Notables | Keystone |
|---|---|---|
| Fire | Wildfire 野火 (flames racing along the ground) · Pyre Walker 炎歩 (a foot in flames, unburned) · Cinder Heart 燼心 (a heart of embers bursting) | **Funeral Pyre 荼毘**: a pyre with a body, one huge flame |
| Cold | Deep Winter 深冬 (a snowflake with two arms) · Hoarfrost 霜鎧 (frost on armour) · Glacial Shards 氷片 (shards flying outward) | **Permafrost 永久凍土**: a crowned giant locked in ice |
| Lightning | Forked Path 分岐 (a bolt splitting twice) · Grit Siphon 気吸 (a bolt feeding a fist) · Static Skin 静電 (sparks off skin) | **Storm Conduit 雷導**: a rod storing a coiled bolt |
| Water | **Tidebreak 波砕 (a wave rolling along the floor, breaking over feet)** · Undertow 引潮 (water pulling inward) · Rising Tide 満潮 (a rising line of waves) | **Deluge 大洪水**: a drowned city, only roofs showing |
| Wind | Cyclone 旋風 (a spinning body) · Eye of the Storm 台風の目 (calm eye, wind around) · Downdraft 下降気流 (an arrow of wind slamming down) | **Tempest 嵐神**: bodies hanging in the air |
| Poison | Virulence 猛毒 (eight drops) · Contagion 伝染 (a cloud passing between two heads) · Slow Decay 衰弱 (a withering arm) | **Necrosis 壊死**: a rotting hand, stacks without end |
| Holy | Litany 連祷 (three strokes of light) · Sanctuary 聖域 (a circle of light on the ground) · Zealot's Fire 狂信 (a pillar jumping to a second pillar) | **Inquisitor 異端審問**: a crowned head under a burning halo |
| Shadow | Long Shadow 長影 (a mark stretching to a second foe) · Unseen 隠形 (an eye closing) · Bloomreaper 花刈 (a sickle in a blood flower) | **Night Has Teeth 夜牙**: a crescent moon with fangs |
| Blood | Open Veins 開脈 (a wrist with two cuts) · Sanguine Shell 血殻 (a shell of blood round a body) · Gusher 噴血 (a fountain from a wound) | **Blood Price 血代**: scales with blood on one pan |
| Bone | Spur 骨棘 (a shard passing through two foes) · Bone Plate 骨鎧 (three plates of bone) · Brittle Frame 脆骨 (a cracked skeleton) | **Ossuary 納骨堂**: a skeleton rising from a bone pile |

Each wedge's **Attunement** icon is the element's kanji pouring out of a cracked seal (one design, ten colours).

### 4.4 Bridges (10)
Each one is two elements meeting. The three marked "new" are combos that don't exist yet.

| Bridge | Name | Icon |
|---|---|---|
| Shadow · Poison | Nightshade 夜顔 | a night flower releasing a purple-green cloud |
| Poison · Wind | Pestilence 疫病 | a cloud blown far |
| Wind · Shock | Squall Line 雷線 | lightning lifting a body |
| Shock · Holy | Wrath of Heaven 天怒 | a lightning pillar with a halo |
| Holy · Cold | **Pale Light 白光 (new)** | light striking a frozen figure |
| Cold · Water | Glacier 氷河 | a wave frozen mid-crash |
| Water · Bone | **Drowned Bones 沈骨 (new)** | bones sinking in water, held fast |
| Bone · Blood | Marrowmonger 髄商 | a split bone dripping |
| Blood · Fire | Scald 熱傷 | boiling blood spitting flame |
| Fire · Shadow | **Black Flame 黒炎 (new)** | a purple fire |

### 4.5 Small-node glyphs (20, 8×8 inside the bead)
Damage · Life · Defense · Attack speed · Crit · Life steal · Regen · Run speed · Magic find · Gold find · Threat · Grit regen · Boss stagger · Carry weight · Draught healing · Crossbow damage · Penetration · Status duration · Status strength · Element damage (takes the wedge colour).

## 5. New effects in play (priority 1 for the starred, 2 for the rest; track A)
These go in `arttree.js` or `artfx.js`, the same way the ten element impacts were done: animated pixel effects, capped counts, deterministic, no combat RNG.

**Brands**
- **★ Grave Slam (new art).** It needs:
  - the hero's leap and crash poses (2 poses);
  - a crater on landing;
  - a dust ring;
  - the Ossuary variant (bone splinters jut up);
  - the Gale variant (wind spiral lifts foes).
- **★ Stillness ward** (reworked Clarity):
  - a thin circle of inked bone forming round the hero over 1 s;
  - its break, plain;
  - Frozen variant: a frost burst;
  - Hallowed variant: a light pillar.
- Heart-Spike: one thick lance with a stagger flash.
- Black Iron Hound: a heavier plate variant of the Hound form.
- Red Maw: blood off the Hound's blows.
- Thunder Draw: delayed cuts open as lightning.
- Long Draw: a charge glint and a wider crescent.
- Marking Shade: a purple mark from the shade.
- Decoy: foes' red lock-marks turn to the shade.
- Rain of Needles: ten thin blades.
- Six Executioners: six heavy swords.
- Toll for Me: the red lock-marks snap to the hero.
- Drowning Bell: a water ring on the toll.
- Martyr's Breath: a heal wave to allies.
- Vengeful Shade: the shade on fire.

**Element notables and keystones**
- **★ Tidebreak:** a wave running along the floor about 6 tiles, foam at the crest, bigger over standing water.
- **★ Bone Thrall** (Ossuary keystone): a new small ally creature. It needs:
  - a skeleton made of splinters, about the size of a ghoul, bone-white with a faint gold eye;
  - poses: rise from the ground, idle, walk, swing, crumble.
- **★ Sanguine Shell:** a red shield bar over the life bar, and a thin blood film round the hero.
- **★ Bone Plate:** up to three bone pips on the hero, which shatter when hit.
- Undertow: water rushing inward.
- Wildfire: wider fire spread (re-use fire tiles).
- Pyre Walker: the hero lit but not burning.
- Cinder Heart: a small ember blast.
- Funeral Pyre: a delayed full-burn detonation with a big flare.
- Permafrost: a boss freeze, briefly encased.
- Storm Conduit: charge sparks stored on foes, then one big chain bolt on a crit.
- Tempest: foes held in the air, spinning slowly.
- Necrosis: rot pips that keep counting past five (show a number).
- Sanctuary: hallowed ground circle.
- Night Has Teeth: an instant bloom at 25% life.
- Unseen: the hero turns half-transparent and ink-smoked.

**The three new combos**
- **★ Pale Light:** a light shaft that shatters a frozen foe white.
- **★ Drowned Bones:** a foe sunk to the knees in black water, bones jutting from it.
- **★ Black Flame:** purple fire that spreads the mark.

Each new combo also needs its combo popup kanji (白光 · 沈骨 · 黒炎) in the existing popup style.

## 6. Level objects (priority 2, track A)
- **Element shrine:** a small stone altar with a sigil bowl, in ten colour variants, lit when used.
- **Oil and straw ground** (farm): dark slick patches and straw tufts that burn.
- **Updraft vent** (bridge, the Breach): a grate with rising ash.
- **Bone pile** (the Ossuary): a heap of bones on the floor.
- **Gift routes:**
  - claw-marked climbing walls (Grave Claw);
  - a wing-shaped ash marker at double-jump gaps (Ash Wings);
  - the existing iron rings, with a brighter glint (Red Tether).

## 7. Gift moments (priority 2, track B)
One manga panel each, in the existing panel style (1-bit ink, dithered tones, one blood-red accent, no text, 16:9). Same settings as `claude/manga-art-handoff.md`.
- `gift-wings`: the sellsword rising on a burst of grave ash, a fallen boss below.
- `gift-claw`: a hand of black bone gripping a sheer wall.
- `gift-tether`: a chain of blood thrown up into the dark, catching an iron ring.

## 8. UI pieces (priority 1, track A)
- **Satchel tab icon** for the tree: a small ribcage, 16×16.
- **Phone corner badge:** 髄, glowing when points are unspent. It replaces the 技 skill badge.
- **Node tooltip layout:** name, kanji sigil, tag, effect lines, and "Fork: takes the place of X". Keystones get a gold border and a red "Costs:" line.
- **Path cost tag:** a small bone plate near the cursor reading "7 points".
- **Refund mark:** a red slash on hover in the Rope-House.
- **Search bar:** an inked strip at the top; matching nodes ring in gold.
- **Zoom controls** for phone: + and − bone buttons and a "centre on the Heart" button.
- **"The Marrow has changed" card:** a single notice for existing characters, with a small drawing of the ribcage.

## 9. Audio (for Splice, not GPT; listed so nothing is missed)
- **Node sounds:** allocate a small node (bone tick), a notable (bell tap), a keystone (deep gong and a heartbeat), a refund (bone scrape).
- **Bridge light-up:** two tones meeting.
- **Tree screen loop:** a low heartbeat bed.
- **New-art sounds:** Grave Slam impact, Tidebreak wave, Bone Thrall rise and crumble, Stillness ward form and break, and the three new combos.

## 10. How to check it
- Add the tree to `tools/art-review.html`: every node frame in all five states, every icon, every effect, with a zoom slider. This is the same workshop the gameplay art pass used.
- **Screenshots at phone size (852×393) and desktop (1280×720):**
  - the tree fully zoomed out;
  - one wedge zoomed in;
  - a path preview across a bridge.
- Generated images are AI content players see. Tick the AI disclosure on Steam, as for the manga panels.

## Totals
| Group | Count |
|---|---|
| Painted images (track B) | 2 background layers + 3 Gift panels |
| Node frames | 9 kinds × 5 states |
| Node icons | 9 Brands + 18 forks + 21 attribute + 50 element + 10 bridges + 1 Paradox = 109 |
| Small-node glyphs | 20 |
| Effects | about 35 (8 starred first) |
| New creature | 1 (Bone Thrall, 5 poses) |
| Hero poses | 2 (Grave Slam) |
| Level objects | 5 kinds (shrine in 10 colours) |
| UI pieces | 8 |
