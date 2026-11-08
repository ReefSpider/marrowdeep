# Marrowdeep v31: drop in, drop out

New module **coop31.js** (after ui30.js). Protocol `marrowdeep-31`: everyone needs the new build, because the heartbeat would drop an old client.

## The code is always in reach
- **Pause › Co-op** (the button shows the code: `Co-op J88HEU ›`) has:
  - the invite code with Copy code and Copy link
  - all four places, including anyone reconnecting
  - End co-op for everyone (host) or Leave co-op (guest)
- The host's team list (top left) shows `CODE J88HEU` while there's a free place.
- **Solo, in a level:** Pause › Co-op › **Open to friends** makes the current run co-op right where you stand. Friends join with the code; nothing restarts. A crowd scales foes from the next map, as in v29.
- **Solo, in the Rope-House:** Host opens the usual lobby. **Join a friend** goes to the join screen; **Rejoin XXXXXX** returns to your last descent.

## Joining mid-run
- (v29) The host seats the newcomer and sends the map.
- **Where you arrive:** beside the host, or beside a living teammate if the host is down. You used to arrive at the map's start.
- **The level as it is:** sealed arenas are sealed, opened chests are open, the last chamber's lock matches, and an awake boss is awake. It used to stand frozen in its intro on the newcomer's screen.
- **Between maps:** a newcomer counts as ready, so they don't hold up "Climb on".

## Dropping and coming back
- **Heartbeat:** both sides ping once a second. Twelve seconds of silence counts as a drop, as does the link closing.
- **What a guest sees:** the game holds still on a "Lost the others" screen and retries the same code every few seconds for two minutes, then offers Try again. **Go on alone** works at any point; it keeps you on the same map, and Pause › Co-op rejoins.
- **What the host does:**
  - keeps the dropped player's place (seat, colour, fate debt) for two minutes and shows them as "reconnecting…" to everyone
  - the same tab coming back, even after a reload, gets the same place; if they don't return: "X didn't make it back"
  - a held place doesn't stall chest rolls or Climb on
- **Soft and hard goodbyes:** reloading or closing the tab is a soft goodbye, so the place is kept. Pressing Leave or Quit is a hard goodbye: no hold, as before.
- **Host trouble:**
  - if the host reloads, guests keep knocking
  - a host who hosts again within 20 minutes reuses the same code (from Open to friends or the lobby), so they get back in
- **Lobby:** offers "Last descent XXXXXX · Rejoin" for three hours.
- No free heal for dropping: you come back with the life you had, at least 40%.

## Tested headless (three tabs, local transport)
- **Host opens a solo run:** the host opens a solo Lower City run from pause. B joins from the title and lands beside the host with matching foes. C joins, then leaves on purpose; that place is not held.
- **Silent link:** B's link goes silent. Thirteen seconds later the host holds B's place and B shows Lost the others. B reconnects into the same seat.
- **Reload:** B reloads the page; the host holds the place. B's lobby offers Rejoin, which puts B back in the same seat.
- **Host vanishes:** B retries, gives up, and Go on alone puts B back in the Lower City solo.
- **Lobby:** survives a 16-second wait under the heartbeat, and Begin works.
- **Fit:** Pause › Co-op (solo and a full table) and the reconnect screen fit at 1280×720, 1366×657 and 1920×969.
- **Regression:** all 28 maps load cleanly, and the prologue and story typing are unchanged.

## Not covered
- **Real network:** the PeerJS path wasn't run here (no network in the test box). The reconnect logic is the same, but it should be tried across two machines: pull a cable or toggle Wi-Fi for ~15 s.
- **If the host's game is lost:** the run ends for everyone; the host simulates the world. Guests can rejoin only if the host is still there, or hosts again with the same code from where they stand.
- **Background tabs:** a guest whose tab has been in the background for 5+ minutes may be timed out by browser throttling. They reconnect automatically when they come back.
