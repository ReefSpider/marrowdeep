# Marrowdeep manga artwork handoff

This folder contains the user's finished raw pixel manga artwork for later integration. The artwork is staged here so this commit does not change the game's active cutscenes.

## Contents

- 39 PNG files named exactly by `story.js` panel ID.
- `manifest.json`: JSON array of the 39 image filenames.
- `gallery.html`: local review gallery; open from a static server or browser.
- `prompts.json`: final reproduction specifications and continuity rules.
- `ART-DIRECTION.md`: user-approved direction and corrected continuity.
- `SHA256SUMS.txt`: checksums for the source PNGs.

## Integration work

1. Inspect current `story.js`, `manga.js`, and `art/manga/manifest.json` before editing. The reviewed loader resolves image stems to panel IDs, centre-crops images, reduces them to the game's pixel grid, and applies its ink/dither/red filter.
2. Copy these 39 PNGs from `claude/manga-art-raw-pixel/` into `art/manga/`, retaining the filenames. If a destination already exists, compare it before replacing it.
3. Merge these filenames into the active manifest, preserving unrelated existing entries. The active manifest is an array of filenames, not an object mapping IDs to paths. Do not list the gallery, notes, prompts, or checksums.
4. Preserve live gameplay panels. This pack intentionally excludes `op-7-wall`, boss-fall panels `b1-1` through `b5-1`, and the live act/level shots.
5. Preview all story scenes through the real renderer. In particular inspect slanted crop edges, caption/speech overlap, close-up readability, and whether a second ink/dither pass introduces noise. The generated image ratios follow actual panel framing where possible and differ from some ratios in the initial shot list.
6. Keep narration and dialogue in the engine; do not bake them into the images. The red block lettering `ILSE` in the ledger is an intentional exception depicting the entry itself.

## User decisions to preserve

- Raw, visibly coarse pixel art; black and bone-white with selective blood-red. The user rejected the first clean, polished illustration.
- Sellsword: deep hood hides almost all of his face. The user rejected a portrait resembling Guts from Berserk. Do not restore that rejected face.
- Agathe sequence: exactly ONE swaddled baby in her arms and in the cradle. `b1-3-cradle` and `b1-4-rise` share the same cradle composition; the latter adds rising lights.
- Choir: exactly SEVEN faces in both open-mouth and closed-mouth panels.
- Ending: two candles in `e-3-light` and `e-5-window`.

## Validation already performed

All 39 PNGs decode successfully and have distinct SHA-256 hashes. The staged manifest exactly matches the PNG filenames. The corrected stills were visually inspected. In-engine crop, overlay, and final dither validation has not yet been performed.

Generated with the built-in image generation tool, not Higgsfield. Preserve the game's AI-generated-art disclosure when preparing a store submission.
