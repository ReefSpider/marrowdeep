# Marrowdeep v30: the UI pass

Everything from the v29 UI audit (`claude/ui-audit-v29.md`). New module **ui30.js**, loaded after music2.js and before boot.js. Small text edits in altar, borrowed, combat28, meta, net, retreat, satchel, shop, story, tengu, ui and ways. Co-op protocol unchanged (`marrowdeep-29`); nothing here is synced.

## Bugs
- **Kanji under card titles stacked into a column.** `#cardTitle span{display:block}` (and rules like it) beat the sigil wrapper `.sgl`. `.sgl` is now `inline-block!important`.
- **The map table ran off the right edge.** It used the koan column (flex column, wrap, max-height), which wraps sideways. Now a 4-wide grid of compact tier buttons (kanji, name, "Lv 20–30" or "Locked"); the explanation and unlock rule are in tooltips. "Hold this tier" is a checkbox.
- **The Tengu's empty state.** Before you pick: "Pick an item" (disabled) and no reel. After: "Insure · 2,502" or "Insured". Reel cells read "25% Rare · back" instead of "−25% Rare".

## Pause menu
- Main: Resume · Satchel · Journal › · Map · Settings · Leave ›. Co-op's button sits in main when it shows.
- Journal: Story · Codex · Powers · Way. Leave: I'm stuck · Abandon run · Quit to title.
- Esc in a sub-view goes back to the main view; Esc in the main view resumes.
- Other modules still build their buttons inside `#pause .col` on each `openPause`; ui30 puts everything back in `.col` before calling them, then files each control into its view.
- The playtest report is hidden unless playtest tools are on: **F8** toggles them (or `?debug` in the address).

## Settings
- One screen, from the title and from the pause menu. Tabs: Sound & display (music, sound, demonic sigils, big-win effects, jump scares) and Controls (every key).
- The title's 16 control hints are gone; one short line remains (move, jump, strike, roll, pause), plus Settings and the version (`Marrowdeep v30`) bottom right.

## Nothing scrolls at 16:9
Re-measured at 1280×720, 1366×657 and 1920×969 (see the audit page).
- **Codex:** a list on the left, one entry on the right. Lists turn pages (‹ 1/3 ›, mouse wheel) instead of scrolling. Lore shows written entries only, with "N still unwritten" underneath. Damage types: "How types work" first, then the ten types and the S/A/B/F combinations with their headings.
- **Merchant:** three wares in a row (Box 245 · 2 left, Draught 50, Sell), Back beside them. Next box price and stock rules are in tooltips.
- **Selling:** one line above the satchel ("Selling · click an item · you carry N", Done); the tabs hide while selling.
- **Gallows Wheel:** the machine on the left; message, purse, bets (2×2), payouts and Back on the right.
- **Weapon rack:** one row per peg: number, what's on it, Wear, Save.
- **Satchel:** tighter spacing, the message line floats, the hint is one line.
- **Altar and Tengu** pick from the satchel's own grid (same tabs, same drag), so there's one item picker everywhere.

## Typing only for story
- Cards type themselves out only for letters, Ilse, stones, prologue and act cards (`story` flag, or a long body on a card that isn't a utility card). The map table, rack, merchant, door, powers, abandon and co-op cards appear at once with buttons ready.
- Card buttons named Back or Not yet get an Esc badge, and Esc presses them.

## Copy
- One word for leaving: **Back** (was Close, Leave, Walk away, Stay a while, Not yet on the door, Done on the rack and map table).
- New character (was A new descent / A new sellsword) · Co-op · Host · Quit to title · Abandon run · Story · Powers · Way · Offer · Insure · N.
- Stone answers keep their sentence; the power is a small chip (忍 Endure) instead of "borrowed power of this kind, for this run".
- Keys are small badges after the word on every button.

## The Rope-House
- **Names:** each station's name (and a short what-it's-for line) floats above it as you come within about 150 px, brightening as you get close; the one you can use glows. Stations near you get a soft warm light.
- **Ilse's tour:** on the first visit, five lines as captions (bed, stash, rack, map table, door), each lighting its station's name. It pauses while a menu is open.
- **Stations open as they matter:** the Hungry Altar, the Gallows Wheel and Kurohana appear after the first campaign clear (`META.clears` or `META.cleared`). The first visit after they open, Ilse says one line about each (`META.cabSeen`). Characters who have already cleared see them as before.
- The interaction prompt is larger, with the key in a box.

## Tested headless
- All screens at three window sizes: nothing scrolls, nothing sits off the stage.
- Keyboard: Esc closes the map table and rack, opens pause from play, backs out of Journal and Settings, closes sell back to the merchant, closes the merchant.
- Buttons: tier pick, hold toggle, rack save, merchant draught purchase, sell mode.
- All 28 maps load with no errors; the prologue still opens with the manga and the Kesh card (typed); letters and Ilse type, utility cards don't.
- Tour plays through on a new character; altar/wheel/Tengu hidden before a clear and named after.

## Not done
- Controller support and key rebinding (the Controls tab lists keys; it doesn't change them).
- The chest odds row still shows exact Abyssal odds; the seal roll still has a toast repeating the panel.
- HUD text sizes (act line, skill-point hint) are unchanged.
- Real-screen check: headless runs at a few fps, so the tour timing and label fades want a look on a real machine.
