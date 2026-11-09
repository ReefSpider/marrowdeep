# Marrowdeep v39–v40: new slots, Might · Finesse · Fortitude, armour families, sets, milestones, team roles

Commits bd0316e (v39), 3491682 and 9e6bd02 (v40) on main. New modules after play38.js: **gear39.js · attr40.js · sets41.js · roles42.js**. Co-op protocol `marrowdeep-40`. Title shows v40. Built from `claude/builds-plan.md` with BT's decisions (9 Nov): attributes from gear only (the Marrow is unchanged), gloves, boots and a second ring, names Might / Finesse / Fortitude.

## v39: slots and families (gear39.js)
- **Worn panel** (4 × 3): weapon down the left; helm, armour, boots; off hand, gloves; amulet, ring, second ring.
- **Rings:** a ring goes to an empty finger first. With both full it replaces the one it improves most; drag onto either to choose.
- **Satchel:** gloves and boots are 2×2.
- **Families:** every armour, helm, gloves and boots base is Light 軽, Medium 中 or Heavy 重.
  - New bases: Leather Jerkin → Shadow Leathers, Hood → Wraith Hood, Scale Hauberk, Black Brigandine, Sallet, Iron Breastplate, Half Plate, Iron Pot, Closed Helm.
  - Gloves: Leather Gloves, Archer's Bracers, Shadow Grips, Mail Mitts, Scale Gauntlets, Iron and Plate Gauntlets.
  - Boots: Soft Boots, Running Boots, Shadow Treads, Mail Chausses, Scale Boots, Sabatons, Plate Sabatons.
  - Heavy pieces have 30% more defense. Plate Cuirass, Blackened Plate, the Great Helm and the Hound Visor became heavy and gained it.
- **Rolling:** a new piece picks its family first (equal odds), then the best base of that family its item level reaches.
- **Uniques:** Hangman's Grip, The Penitent's Wraps, Ilse's Errand, Sabatons of the Last Wall.
- **Hero art:** hoods drawn as hoods; gauntlets on the hand, boots on the feet, coloured by family and rarity.
- **Chests:** the armour kind gives all four armour slots. Slot weights: weapon 32, body 11, helm 9, gloves 8, boots 8, ring 10, amulet 6.

## v40: attributes (attr40.js)
- **Might 力 · Finesse 技 · Fortitude 耐** roll on every slot (+1–3 up to +8–11 by item level). A committed rare kit carries ~70–80 of its attribute.
- **Per point:**
  - **Might:** weapon damage +0.8% × the weapon's Might grade · carries armour weight (2 + Might ÷ 8) · boss stagger +0.5%. (v45: +0.55%.)
  - **Finesse:** attack speed +0.2% · run +0.2% · crit +0.08% · weapon damage +0.8% × its Finesse grade.
  - **Fortitude:** life +1% · defense +0.8% · threat +2%.
- **Weapon grades** (S ×1, A ×0.75, B ×0.5, C ×0.25):

  | Class | Might 力 | Finesse 技 |
  |---|---|---|
  | Hammer | A | – |
  | Mace, axe, cleaver, flail | A | C |
  | Two-handed sword | A | B |
  | Sword, spear, scythe | B | B |
  | Katana | B | A |
  | Sickle | C | A |
  | Dagger, rapier, crossbow | – | S |

  Tooltips show `Scales: 力 Might A · 技 Finesse –`.
- **Weight:** Light 0 / Medium 1 / Heavy 2 per piece. Each point you can't carry costs 2.5% run and 2% attack speed.
- **Satchel:**
  - the three numbers sit under the worn gear, each with a tip saying what it gives and which milestones are reached;
  - a role word and the sets in force show beneath them;
  - comparisons list attribute changes.
- **Unique attribute lines:** Ironheart, Sister's Needle, Bellbreaker, Grave Mother, Penance, Last Wall, Hollow Crown, the new gloves and boots, and the three abyssals.

## Leaning, sets, milestones (sets41.js)
- **Leaning:** a piece rolls its family's stats twice as often and one tier higher; at the top tier, half the time into a band 25% above it. Light and Heavy roll the rest one tier lower.
  - Light leans to Finesse, attack speed, run speed and crit.
  - Medium leans to Might, Finesse, life and crit.
  - Heavy leans to Fortitude, Might, enhanced defense, life and thorns.
- **Sets** (armour, helm, gloves, boots of one family):

  | | 2 pieces | 4 pieces |
  |---|---|---|
  | Light | **Hunter:** +15% run, rolls 20% further | **Shadow:** the swing after a roll always crits |
  | Medium | **Soldier:** +10% damage, +5% attack speed (v45: +5% damage) | **Veteran:** draughts heal 35% more and give −25% damage taken for 3 s |
  | Heavy | **Bastion:** −10% damage taken, threat ×2 | **Juggernaut:** no knockback; once a minute a killing blow leaves 1 life |

- **Milestones:**

  | | 25 | 50 | 100 |
  |---|---|---|---|
  | Might | Heavy Hand: light blows always flinch | Breaker: crits stagger bosses twice as hard | Earthsplitter: two-handed slams send a ground wave |
  | Finesse | Light Feet: rolls −30% grit | Quickstep: rolling through a blow gives +20% attack speed for 2 s | Flurry: every 5th hit strikes twice |
  | Fortitude | Iron Skin: the first hit after 5 s untouched is halved | Stand Firm: no knockback or flinch while attacking | Bulwark: allies within 120 px take 10% less |

- **Two blades:** two one-handed melee weapons hit 50% harder (v45: 55%) and swing 20% faster. Before, holding attack alternated hands, so two blades were barely better than one, and a Finesse killer fell far behind a hammer.

## Team roles (roles42.js)
- **Threat (co-op):**
  - A foe within 60 px of a tank locks on to them for 3 s (bosses 2 s), and the lock holds while the tank stays close. A tank is a hero whose highest attribute is Fortitude (at least 10), or who wears Bastion.
  - Otherwise foes pick by distance ÷ threat.
  - Locked foes wear a small red mark.
  - Tested in two tabs: both screens agree on the lock.
- **Ranged:**
  - Crossbow damage ×0.75, because crossbows sit outside the class band and Finesse S ran away.
  - Bolts gain up to +40% the further they fly (+2% per 10 px past 60).
  - From Bloodied on, ordinary foes more than 120 px from their target move 4% faster per tier.
- **Roles shown:**
  - the role word in the satchel: Tank / Killer / Marksman / Balanced;
  - each teammate's leading attribute kanji in the co-op team panel;
  - the playtest report records each visit's role and attributes.
- **Gear budget:** the new slots and Fortitude raised survivability, so foes and bosses hit 60% harder, and ordinary foes above Pilgrim gain 3% life per tier (was 1%).

## Measured (lab `BAL.roles()`, 40–50 kits, against a rare kit with a two-handed sword)
| Role kit | DPS | Effective life | Target |
|---|---|---|---|
| Tank (heavy, Fortitude, mace) | ×0.63–0.79 | ×1.46–1.95 (plus Bastion −10%) | ×0.7 / ×1.8 |
| Killer, Might (medium, great hammer) | ×1.43–1.80 | ×0.9–1.03 | ×1.4 / ×0.8 |
| Killer, Finesse (light, two katanas) | ×1.15–1.41 | ×0.59–0.76 | ×1.4 / ×0.8 |
| Marksman (light, two crossbows) | ×1.07–1.31 on paper, up to +40% at range | ×0.65–0.71 | ×1.6 at range / ×0.55 |

Rare kit after v40:

| Tier | Seconds to kill a ghoul | Ghoul hits to die | Boss fights (pure swinging) |
|---|---|---|---|
| Pilgrim | 0.7 | 18.7 | 9–17 s |
| Mourning | 0.8 | 11.6 | 19–38 s |
| Marrow's End | 1.3 | 6.7 | 44–66 s |

## Tested headless
- All 28 maps and every boss on Pilgrim and Marrow's End, no errors.
- Hold-to-attack alternation.
- Old saves load with empty gloves, boots and second ring.
- Ring placement and comparison.
- Every perk fired: Flurry, Earthsplitter, Juggernaut, Quickstep, Iron Skin, Breaker.
- Two-tab co-op: start, chest kinds, the exit vote, the tank lock.
- Satchel at 1280×720 and on a phone (852×393).

## Open
- **Rarity spread rose** with more slots for uniques to fill: unique kit ×1.6–2.9, abyssal ×2.5–3.7 a rare (v34: ×1.5–1.9 / ×2.3–2.6). Next knobs: `BUD.edU`, `BUD.edA`.
- **Balance needs a real run:** the tank lock radius (60 px) and threat weights, the marksman's real damage at range, overload penalties early on.
- **Not done:** a tether line for locked foes (a mark is drawn instead); gloves and boots on the manga drawings and Ways cards.
