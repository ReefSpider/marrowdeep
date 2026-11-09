# Marrowdeep v43: duels, no DPS on items, more crossbows, richer secret chests

BT (9 Nov). Each change went in on its own branch and was merged into main: `feature/duels`, `ui/no-dps` and `loot/bows-secret`. Co-op needs `marrowdeep-43`; scripts are tagged `?v=43.1`.

## Duels (`duel45.js`, `DUEL` holds the numbers)
- **Challenge:** in co-op, stand within 160 px of a teammate and press **V**. You can also stand still for a second and tap the 決闘 banner. They press V or tap within 10 s to accept. If you both challenge each other at once, the duel starts.
- **Not with foes close:** no foe may be within 250 px.
- **Countdown:** 3 s, during which both heroes are untouchable. Then each side's swings (`hitBoxAll`) and bolts (`updProjs`) are tested against the other hero's box.
- **Hits:** the hit goes to the target's own client (`dh`), which applies it through `hurtPlayer`. Block, parry, roll, i-frames and defense all work as they do against foes.
- **Duel damage:** 35% of the blow, and at most 35% of the target's life per landed hit.
- **No death:**
  - Juggernaut is switched off for duel hits.
  - A lethal hit leaves you at 1 life and you lose (`die` is wrapped).
  - Nothing breaks, and both heroes are healed to full at the end.
  - The draught belt is sealed for the duel and given back afterwards.
- **Ending early:**
  - After 90 s the one with more life left wins; on an exact tie it's a draw.
  - More than 500 px apart for 3 s, leaving, or changing level calls it off.
- **Records:** each player's win/loss record against each name is kept in `localStorage` (`marrowdeep.duels`). The party hears the result (`dn`).
- **Messages:** `dc` challenge · `da` accept · `dh` hit · `de` I lost · `dx` off · `dn` news. The host relays to `m.to`.
- **Tested:** two browsers with a message pump. Challenge, accept, crossed challenges, the count, hits, the draught seal, a loss, records, healing, a second duel and walking apart all passed.

## No DPS except the meter (`hands32.js`)
- Item comparisons no longer list DPS, main-hand DPS or off-hand DPS. Damage, attack rate and the other rows stay.
- The satchel's stat list no longer shows "DPS (sheet)".
- The meter by the arts bar is untouched. On phones it sits top-left and is off by default.
- `sheetDps` is still used internally (playtest report, ring slot choice).

## Crossbows (`loot46.js`)
- **Before:** a weapon drop chose its class evenly from 14, so a crossbow was 1 in 14 weapons, about 3% of all items. BT had the Twin Crossbows Way but had never found one.
- **Now:** crossbows weigh ×3, or ×5 on the Twin Crossbows Way. That makes 21% of weapons and 8% of all items (28% and 11% on the Way). Loot memory still dampens repeats.
- There is no true bow class, only crossbows (Hand Crossbow, Repeater, Arbalest).

## Hollow Garden chests (`loot46.js`)
- **What changed:** every chest in the secret level except the Hollow Reliquary has its rarity weights multiplied by Normal ×0.25, Magic ×1, Rare ×1, Legendary ×3, Unique ×10 and Abyssal ×10. The reliquary keeps its own 98/2 odds.

| Chest odds | Unique | Legendary |
|---|---|---|
| Pilgrim, before | 0.85% | 9.3% |
| Pilgrim, now | 7.6% | 28% |
| Iron Vow, before | 2.2% | 11.6% |
| Iron Vow, now | 17.4% | 26% |
