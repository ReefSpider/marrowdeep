# Marrowdeep v33: the phone version

New module **mobile.js** (after lab32.js, before boot.js), a mobile boot script at the top of index.html, **manifest.webmanifest** and home-screen icons (`art/icon-180/192/512.png`). Small edits in core.js, ui.js, manga.js, ui30.js. Co-op protocol unchanged (`marrowdeep-31`). Title shows v33.

Feedback (BT, 9 Nov): on a phone the buttons covered most of the screen, the game didn't fill the screen, and there was no proper stick. Goal: play like an iOS game.

## When it switches on
- Any touch-first device (`pointer: coarse`). `?touch=1` forces it on a desktop for testing, `?touch=0` turns it off; the choice is remembered (`marrowdeep.touch`).
- Desktop is unchanged (checked: same 480-wide view, no touch layer, no errors).

## Fills the screen
- The view widens to the phone's own shape: `W` is read from `window.MDW` (480–640 px of world, 586 on an iPhone 15). The world shows more to the sides instead of black bars. Levels narrower than the view sit in the middle (`camClampX`).
- The post shader's screen size follows `W` (was hard-coded 480×270).
- Edge to edge, no page padding; the HUD and controls stay inside the safe area (notch, home bar). Phones render at 1.5× pixel ratio (the art is 2× of 480, so nothing is lost and the GPU does ~45% less work).
- Portrait shows a "Turn your phone sideways" screen and pauses a solo game.
- Home screen: manifest (`display: fullscreen`, landscape) and Apple web-app tags. On iPhone Safari a one-time card on the title explains Share → Add to Home Screen, which is how iOS gives a web game the full screen. Android/iPad request real full screen on the first touch.
- The screen stays awake while playing (Wake Lock). Leaving the app pauses a solo game and suspends audio; the next touch resumes it.

## Controls
- **Floating analog stick** on the left 44% of the screen: it appears under the thumb and follows it if it runs past the edge. Settings can fix it in place.
  - Left/right move; a clear push down = S (drop through with Jump, plunge with Strike); a clear push up = climb. Diagonals never drop you by accident.
  - The stick also **aims** (snapped to eight directions): swings and bolts follow it, and Red Tether goes where it points.
  - **Aim assist** (on by default): with the stick at rest you turn to the nearest foe. Tested: a ghoul behind the hero is turned to and hit; with the keyboard it isn't.
- **Right thumb**: Jump in the corner, Strike (big) beside it, Roll and Drink above Jump, the four arts in an arc over Strike with their cooldowns and ready glow (mirrored from the HUD), Off hand beyond Strike. Hold Strike to keep swinging; hold Jump to jump higher. Off hand only shows with something in it, arts only once learned, Drink shows the count.
- **Context button** (gold pill): appears when there is something to open, take, talk to, rest at, or descend through, with the action written on it ("Take Widowmaker's Halberd", "Open the stash"). A kneeling boss turns it red: "Finish it".
- **Look** button when standing on items: opens the item with Take and Equip. The desktop's big underfoot tooltips are hidden on phones.
- **Top corner**: pause, map, satchel icons, and a glowing 技 badge when there are skill points (opens the skill tree).
- Every press sends a real key event, so every module behaves exactly as with a keyboard.
- Haptics: a light tick on presses (Android vibrate; iOS 18 Safari's switch-input tick). Settings › Touch: Aim assist, Fixed stick, Left-handed (mirrors the layout), Haptics, Button size.

## Menus by touch
- Menus use a height-based scale so 16:9 layouts keep their proportions, with tighter headings and padding. Pause is a two-column grid; Settings has Sound / Display / Touch side by side; the satchel grid sizes itself to the screen height and the seal pocket moves under the worn gear; the chest result splits into two columns. Measured at 852×392: pause, settings, satchel, chest, merchant, map, Ways, co-op fit; stash, altar and Tengu scroll a little.
- **Items**: tap an item to open a sheet with its tooltip, the comparison, and buttons for what you can do there: Wear / Off hand / Drop in the satchel, Take off for worn gear, Sell when selling, To the stash / To the satchel at the stash, Choose at the altar and Tengu. Drag still moves items.
- **Skills**: the first tap shows what a skill does, the second learns it.
- Tooltips stay up after a tap and go away on the next touch.
- The satchel gets a close button. Manga pages: tap for the next page, a Skip button.
- Keyboard hints are hidden on phones; key words in lessons and hints become touch words (the prologue's chalk marks teach the stick, Strike, Roll, Drink and the gold button).
- The DPS meter is off by default on phones (it can be turned on in Settings).

## Tested (headless Chrome, iPhone 15 landscape 852×393 with touch, plus 667×375 and 1180×820)
- Stick moves the hero; Strike held swings; Jump, Roll, Drink, Hemorrhage, Off hand, pause, satchel, map and skill badge all reach their screens; left-handed layout; portrait screen.
- Satchel tap → sheet → Wear; skill tree arm-then-learn; chest by touch through to Take; floor item Look.
- Every screen captured at phone size; no script errors.

## Not tested / open
- A real iPhone: feel of the stick and button sizes, 60 fps in the worst hordes, haptics, the home-screen install, the notch side.
- Co-op on phones (the lobby and chest rolls are buttons, so they should work).
- Text fields (character rename, co-op code) with the iOS keyboard open.
