# Marrowdeep — plan: attributes, armour families and team roles

Status: **built in v39–v40 (9 Nov); rebalanced in v45 (10 Nov).** What shipped, with the numbers the lab settled on: `claude/v39-v40-notes.md` and `claude/v45-notes.md`. Where the build differs from this plan it says so below.

## What BT asked for
- Builds that trade one thing for another: go tanky and give up damage, or go all-out damage and be fragile.
- A speed/precision attribute as well as Strength, so a co-op team can build what it needs. BT doesn't like the word "Agility".
- Item types with leanings: **leather** is fast and nimble and rolls better speed and attack-speed stats.
- **Clear and easy**, like the current stats.
- **No lock-in.** Anyone can use anything; committing to a role is rewarded.
- Roles that play differently:
  - a **tank** can stand in it, and foes stick to them;
  - a **killer** hacks and slashes;
  - **ranged** must move well, and their damage backs that up.

## Decisions (BT, 9 Nov)
1. **Attribute points come from gear only.** Levels after the campaign stay Marrow points, as before; no attribute screen.
2. **Add gloves and boots, and a second ring.**
3. **Names:** Might 力 · Finesse 技 · Fortitude 耐.
4. **Ranged isn't one-shot.** Deeper tiers ask more movement skill of ranged builds, and their damage is high enough to justify it.
5. **Threat:** when a tank gets close, foes stick to them for a while.

## Principles
1. **Three attributes, no more.** Each one has a single plain sentence for what it does.
2. **Nothing is required.** No attribute requirements on items. Heavy armour slows you unless you're strong; that's a cost, not a lock.
3. **Commitment pays in steps you can see.** Each attribute has three milestones with named perks; matching armour pieces give set bonuses.
4. **Every number has a home.** The existing stats stay (life, defense, attack speed, crit…). Attributes feed them, and the character sheet says by how much.
5. **Respec is cheap.** Changing role is changing clothes. A loadout peg holds each build.

## 1. The three attributes
| | Might 力 | Finesse 技 | Fortitude 耐 |
|---|---|---|---|
| One line | Hit harder with heavy weapons; wear heavy armour without slowing | Swing and move faster; light weapons and crossbows hit harder and crit more | Take more punishment; foes come for you and stay |
| Each point | damage with Might weapons (by grade) · carries armour weight · stagger damage on bosses | attack speed · run speed · crit chance · damage with Finesse weapons (by grade) | life · defense · threat |
| Milestone 25 | **Heavy Hand**: light blows always flinch ordinary foes | **Light Feet**: rolls cost 30% less grit | **Iron Skin**: the first hit after 5 s untouched is halved |
| Milestone 50 | **Breaker**: crits stagger bosses twice as hard | **Quickstep**: a roll through an attack gives +20% attack speed for 2 s | **Stand Firm**: you can't be knocked back or flinched while attacking |
| Milestone 100 | **Earthsplitter**: two-handed slams send a ground wave | **Flurry**: every 5th hit strikes twice | **Bulwark**: allies within 120 px take 10% less while you stand |

**Where the points come from (decision 1):** gear only. +Might, +Finesse and +Fortitude roll on every slot (+1–3 up to +8–11 by item level), and armour families lean toward their attribute (section 3).

**As built (per point):**
- **Weapon damage:** Finesse +0.8% × the weapon's grade; Might +0.55% × grade (v45, was 0.8%: Might killers ran ×1.6–1.9 a balanced kit).
- **Finesse:** +0.2% attack speed, +0.2% run, +0.08% crit.
- **Fortitude:** +1% life, +0.8% defense, +2% threat.
- **Might:** carries 2 + Might ÷ 8 weight; +0.5% boss stagger.

## 2. Weapon scaling grades
Every weapon class gets a grade for Might and Finesse (S/A/B/C/–), shown in the tooltip as `Scales: 力 Might A · 技 Finesse C`. A weapon gets a damage bonus from your attributes by its grades. Any weapon works in any build; a matching build makes it shine.

| Class | 力 | 技 | | Class | 力 | 技 |
|---|---|---|---|---|---|---|
| Great hammer, hammer | A (built; S ran away in the lab) | – | | Dagger, rapier | – | S |
| Mace, great mace | A | C | | Sickle | C | A |
| Great axe, axe, cleaver | A | C | | Katana, nodachi | B | A |
| Flail | A | C | | Crossbows | – | S (and range) |
| Two-handed sword | A | B | | Sword | B | B |
| Scythe | B | B | | Spear, halberd | B | B |

**Ways tie in:**
- Giant's Grip is the Might Way: two two-handers in heavy armour need Might to carry.
- Twin Crossbows and Battō are Finesse Ways.
- Kaeshi is the Fortitude Way.

## 3. New slots and armour families
**Slots (decision 2):** gloves, boots and a second ring join the six there before.
- Equipped gear: weapon, off hand, armour, helm, gloves, boots, ring ×2, amulet.
- Gloves and boots are 2×2 in the satchel.
- Both draw on the hero: gauntlets on the hands, boots on the feet.
- Chests (v38 kinds): the armour kind gives body, helm, gloves or boots; the jewellery kind gives rings or amulets.

**Families:** every armour, helm, gloves and boots base is Light, Medium or Heavy.

| | Light (leather, cloth) | Medium (mail, brigandine) | Heavy (plate) |
|---|---|---|---|
| Defense | ×0.7 | ×1 | ×1.3 |
| Weight | 0 | 1 per piece | 2 per piece (slows you unless Might carries it) |
| Leaning stats | Finesse, attack speed, run speed, crit | Might, Finesse, life, crit | Fortitude, Might, defense %, life, thorns |
| Leaning means | these stats are twice as likely and roll one tier higher (top tier: half the time a band 25% above) | same, for its stats | same, for its stats |
| Off stats | one tier lower | normal | one tier lower |
| Defense cap | 80% | 80% | +1.25 points per heavy piece, 86% in full plate (v45: from tier 4 a plain rare kit already sat at 80%, so a tank's armour stopped counting) |
| Set of 2 | **Hunter**: +15% run speed, rolls 20% further | **Soldier**: +5% damage, +5% attack speed (v45, was +10% damage; +10% life made killers too tanky in v40) | **Bastion**: −10% damage taken, threat ×2 |
| Set of 4 | **Shadow**: the first swing after a roll always crits | **Veteran**: draughts heal 35% more and harden you, −25% damage taken for 3 s (built; the belt size stays 4) | **Juggernaut**: immune to knockback; once a minute a killing blow leaves you at 1 life |

**Bases:**
- **Light:** Quilted Gambeson · Leather Jerkin · Studded Leathers · Hunter's Coat · Shadow Leathers; Hood · Leather Cap · Ranger's Cowl · Shadow Cowl · Wraith Hood; Leather Gloves · Archer's Bracers · Shadow Grips; Soft Boots · Running Boots · Shadow Treads.
- **Medium:** Ring Mail · Brigandine · Scale Hauberk · Black Brigandine; Kettle Hat · Barbute · Bascinet · Sallet · Visored Sallet; Mail Mitts · Scale Gauntlets; Mail Chausses · Scale Boots.
- **Heavy:** Iron Breastplate · Half Plate · Plate Cuirass · Blackened Plate; Iron Pot · Closed Helm · Great Helm · Hound Visor; Iron and Plate Gauntlets; Sabatons · Plate Sabatons.

## 4. Team roles in co-op
- **Threat (decision 5):** a foe within 60 px of a tank **locks on to them for 3 seconds** (bosses 2 s), and the lock holds while the tank stays close. A tank is a hero whose highest attribute is Fortitude (at least 10), or who wears Bastion. Otherwise foes choose by distance ÷ threat, where threat = 1 + 2% per Fortitude point (×2 for Bastion). A tank in front draws the room; a crossbowman at the back is left alone unless something gets past. Built: a small red mark over locked foes, not a tether line.
- **Ranged (decision 4):** not one-shot. Light builds have low defense, and deeper tiers press harder on them: from Bloodied on, ordinary foes far from their target close in faster (+4% speed per tier). Bolts gain up to +40% the further they fly.
- **Killers hack and slash:** Might/Finesse melee gets the damage, the Light Feet and Quickstep mobility, and the life steal to stay in. They take hits but can't stand in a boss's pattern like a tank.
- **The team panel** shows each teammate's leading attribute as its kanji.

## 5. Clear and easy
- **Character sheet** (satchel):
  - the three numbers under the worn gear;
  - a tip on each: what it gives now, and which milestones are reached;
  - the role word and the sets in force beneath them.
- **Tooltips:**
  - weapons show their grades on one line;
  - armour shows its family and weight, and the set with progress ("Heavy set 3/4") and both bonuses.
- **Comparison** lists Might, Finesse and Fortitude changes with the other stats.
- **Role word** (from the leading attribute): Tank / Killer / Marksman / Balanced. A description, not a class.

## 6. Existing characters
- Every armour and helm already owned gets its family from its base. Its stats stay as rolled.
- Gloves, boots and the second ring start empty.

## 7. Balance targets (acceptance criteria for the lab)
Equal gear rarity and level, compared to a rare kit with a two-handed sword. Measured results: `claude/v39-v40-notes.md` (v40) and `claude/v45-notes.md` (v45, seeded, 2×400 kits).

| Build | DPS in melee | DPS at range | Effective life | Boss blows to die |
|---|---|---|---|---|
| Balanced | ×1.0 | – | ×1.0 | 3–4 |
| Tank (Fortitude, heavy) | ×0.7 | – | ×1.8 | 5–6 |
| Killer (Might or Finesse melee) | ×1.4 | – | ×0.8 | 3 |
| Marksman (Finesse, crossbows, light) | ×0.6 | ×1.6 | ×0.55 | 2–3 |

`BAL.roles()` in lab32.js checks every balance change against this table (`node tools/lab/run-lab.js out.json roles 400`). Note the role kits pick the best of four candidates per slot, and the balanced kit takes the first, so part of every role's lead is the lab's own setup.

## Also built (not in the original plan)
- **Two blades:** two one-handed melee weapons hit 55% harder (v45, was 50%) and swing 20% faster, so a Finesse killer keeps up with a two-hander.
- **Crossbows** ×0.75 damage, with bolts gaining up to +40% the further they fly.
- **Gear budget:** foes and bosses hit 60% harder to balance the three new slots, and ordinary foes gain 3% life per tier above Pilgrim.
- **Class band (v45):** great axes ×0.9 and scythes ×0.92 in the class normaliser (`B34.wpers`), which put them back inside v34's ±9% band by sheet DPS.
