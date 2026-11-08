# Marrowdeep v25 and v26

## v25: fixes from BT's notes on v24 (fixes25.js plus small edits)
- **Scarecrows and bridge foes couldn't be hit.** Foes swapped in for the Wall-Born kept the "hidden in the stone" flag. Anything hidden that isn't a Wall-Born is now woken.
- **The scarecrow is a crow-post.** It never moves and does no damage, but it keeps sending crows (up to 4) until you cut it down. Its eyes turn red when it faces you.
- **Crows flap** whenever they're off the ground.
- **No chains or pendulums outdoors**, which covers the farm and the bridge. Outdoors there's at most one Blood Arena per level.
- **Daylight levels:** the hero's and foes' lights are turned down, so nobody glows in the sun.
- **The red flash at the top of the screen is gone.** It was the "wound" sky event.
- **The map** shows only the road you've walked; the rest stays dark.
- **The prologue can't be skipped** by ending the run and going home. The door starts at Kesh until it has been finished.
- **The Lantern Zealot** stands its ground and throws slowly, only forward.
- **Red Tether** goes where the mouse points, and still catches an iron ring near that line.
- **Chests:** grey chests open instantly, and any reel can be skipped with E, Enter, Space or Esc. Stat-roll odds are up (High 18, Max 3.8, Abyssal .12; base ×1.15 to ×1.25).
- **The Marrow** opens as soon as every Brand skill is learned. The Marrow XP penalty only starts after a campaign clear.
- Co-op protocol `marrowdeep-25`.

## v26: new music for every region, act and boss (music2.js)
38 loops from Splice, licensed royalty-free under BT's account, are in `audio/mx_*.ogg` (8.4 MB). `tools/music_proc.py` rebuilds them from the WAVs. It normalises loudness, makes the long textures loop seamlessly with a 3-second crossfade, and trims the one-shots.

How it plays:
- Each region has four parts:
  - **pad:** a texture that runs the whole time you're there.
  - **theme:** tonal loops played one at a time for 25–60 s, then a silence of 8–24 s, so nothing just repeats.
  - **perc:** drums for arenas and bosses.
  - **sting:** a horn, bell or hit now and then, and when a fight starts.
- **Drums are retimed** to the theme's tempo. Themes start on the drum's next bar, so the two never drift apart.
- **The synth choir** stays underneath as glue in Acts I and II, at about a third of its old level. Its drums are off there.
- Files load per level, and the next level's set is fetched in the background.

| Where | Pad | Themes | Fights |
|---|---|---|---|
| Title | iron strings | cello | none |
| Kesh (prologue) | iron strings | cello; war drums all the time | war drums, horns |
| Quiet Fields | low wind, a faint chase cue | fiddle, cello, lute | shaman drum |
| Rushmere Fen | bowed texture (retuned to D), wind | cello, chase cue | frame drum |
| Ashes | wind | duduk, cello | frame drum |
| Weeping Pass | eerie bells, wind | fiddle in the snow, cello | shaman drum |
| Last Light | iron strings | cello; bell drums all the time | bell drums, war horn |
| Harvest Villages | low industrial menace | music box, fiddle | bell drums, bells |
| Lower City | industrial, menace | the music box detuned | predator drums |
| Old City | tortured strings | merry-go-round organ, a slower music box | predator drums, bells |
| Royal Houses | disturbing bow | death's-lullaby harp, court strings | war drums |
| Palace Bridge | anxious bass, chase cue | court strings | war drums, braaam |
| Act III | tortured strings and bass, both slowed to D | the old choir, at full level | the old drums |

**Bosses:**
- Odo and Merrow: war mallets with strings.
- Sisters: frame drum with cello.
- Preacher: frame drum with duduk.
- Piet: bell drums, strings, a horn.
- Brann and Rook: war drums with dungeon stabs, a horn.
- Tithe-Collector: predator drums with the detuned music box.
- Choir: predator drums with the organ.
- Gideon: predator drums with stabs and a braaam.
- Phase three of any boss: a hit, and the drums come up.

**Act changes:** each act has its own instruments. Kesh is war, Act I is the cello and folk instruments of the March in D minor, Act II is the court and the city's music box and organ, detuned the lower you go, and Act III goes back to the choir of the Pit.

**Tested headless:** every region, arena and boss set loads and plays, the drums lock to the theme's tempo, and the level changes switch sets. Loudness against the synth was measured and balanced; the throat drone is ducked in arenas. All 28 maps and the prologue flow pass with music2 loaded.

**Not done:** the Rope-House keeps the old calm synth. The Splice download still needs the built-in browser on BT's computer, because the workspace can't reach S3.
