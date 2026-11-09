# Marrowdeep 骨髄

A gritty late-90s cel-anime action platformer and dungeon crawler, built in three.js. Diablo-style loot, case-reel chests, horror bosses, and 1–4 player co-op.

**Play:** open the GitHub Pages link for this repo (Settings → Pages).

## Co-op (peer to peer)
1. One player presses **Co-op** on the title screen (or pulls the bell rope in the Rope-House) and presses **Host**.
2. They send the 6-letter code, or use **Copy link** and send that.
3. Everyone else opens the same site, presses **Co-op**, types the code and presses **Join** (a link fills the code in for you).
4. The host presses **Begin the descent**.

There's no game server. Players connect directly over WebRTC; PeerJS's free public broker (0.peerjs.com) only introduces them. Everyone must load the same version of the site, so reload after an update. Players behind strict networks (some office and mobile ones) may not be able to connect, because there's no TURN relay.

## Running it locally
Any static file server works, for example `python3 -m http.server`, then open http://localhost:8000. Add `?net=local` to two tabs to test co-op inside one browser without the internet.

## Credits
- Sound effects and music loops are licensed Splice samples, used in this game under the Splice licence. They are not licensed for reuse outside it.
- three.js r128 and PeerJS 1.5.4 are bundled in `lib/` under their MIT licences (`lib/*.LICENSE`).

## For contributors (Claude, Codex)
- Design notes per version are in `claude/` (`claude/README.md` lists them).
- The balance lab runs headless: `node tools/lab/run-lab.js` (see `tools/lab/README.md`).
- Work on a new branch and merge it into `main`. When scripts change, bump every `?v=` tag in `index.html` together and `GAME_VERSION` in `ui30.js`; bump `NET_V` in `net.js` when co-op messages or shared rules change.
