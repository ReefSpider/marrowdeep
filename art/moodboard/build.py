"""Builds moodboards.html (self-contained) from the region data below.
Usage: python3 build.py <manga stills dir>"""
import base64, json, html, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
STILLS = sys.argv[1] if len(sys.argv) > 1 else '../art/manga'
PAL = json.load(open(f'{HERE}/img/palettes.json'))


def uri(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()


def e(s):
    return html.escape(s, quote=True)


STYLE_HEADER = ('Pixel-art environment key art for a side-on 2D platformer, very wide 21:9 backdrop, chunky square '
                'pixels at low resolution (about 320x136 upscaled), ordered dithering for gradients and fog, '
                'seinen dark fantasy, medieval kingdom, Japanese horror mood. Strictly limited palette: {pal}. '
                'No text, no letters, no UI, no border, no foreground hero.')

# Palette names a viewer reads, per token
NAMES = {
 'i1-grasslands': {'mist': 'mist', 'bone': 'bone white', 'sky2': 'white sky', 'gold': 'pale gold', 'straw': 'straw',
                   'gg': 'grey-green', 'gg2': 'deep grey-green', 'shadow': 'shadow', 'red': 'the one red thing', 'dred': 'Wound haze'},
 'i2-swamp': {'b2': 'deep bruise', 'bruise': 'bruise purple', 'moss': 'moss', 'sick': 'sickly green', 'pale': 'bog pale',
              'water': 'black water', 'black': 'black', 'red': 'blood', 'dred': 'Wound haze'},
 'i3-desert': {'salt': 'salt white', 'haze': 'heat haze', 'sand': 'sand', 'ochre': 'ochre', 'ash': 'ash',
               'glass': 'fire glass', 'char': 'char', 'red': 'the Wound', 'dred': 'Wound haze'},
 'i4-mountains': {'dslate': 'dark slate', 'slate': 'slate', 'fog': 'fog', 'snow': 'snow', 'rock': 'wet rock',
                  'black': 'black', 'flag': 'prayer flag', 'red': 'the Wound', 'dred': 'Wound haze'},
 'i5-fort': {'night': 'night', 'night2': 'storm night', 'stone': 'fort stone', 'dstone': 'dark stone', 'snow': 'snow',
             'ember': 'brazier', 'black': 'black', 'red': 'fire / Wound', 'dred': 'Wound haze'},
 'ii1-villages': {'night': 'night', 'plum': 'dusk plum', 'dusk2': 'low sun', 'dusk': 'festival amber', 'straw': 'straw',
                  'wheat': 'wheat', 'cloth': 'bunting', 'black': 'banner black', 'red': 'tithe mark', 'dred': 'Wound haze'},
 'ii2-slums': {'black': 'black', 'sewer': 'sewer', 'mud': 'mud', 'brown': 'rot timber', 'rot': 'damp rot',
               'grey': 'laundry grey', 'cream': 'maggot', 'red': 'tithe-lantern', 'dred': 'lantern glow'},
 'ii3-oldcity': {'black': 'black', 'sky': 'night', 'sky2': 'night haze', 'slate': 'slate roof', 'stone': 'stone',
                 'plaster': 'plaster', 'torch': 'torchlight', 'red': 'tithe-lantern', 'dred': 'Wound haze'},
 'ii4-royal': {'black': 'black', 'wine': 'rot wine', 'dgold': 'old gilt', 'gold': 'gilt', 'candle': 'candle',
               'white': 'mask white', 'red': 'bleeding red', 'dred': 'dried red'},
 'ii5-bridge': {'black': 'black', 'dstone': 'bridge stone', 'stone': 'pale stone', 'sky2': 'red-black sky', 'red': 'red sky',
                'torch': 'torch', 'paper': 'paper', 'dred': 'Wound haze'},
}

ACTS = [
 {'id': 'act-1', 'num': 'Act I', 'kanji': '帰路', 'kana': 'kiro · the way home', 'name': 'The Road Home',
  'look': 'Cold and grey-green under a white sky: rain, fog, mud. The red Wound sits faint on the horizon and grows as he gets closer to home.',
  'letter': '"He comes to the house now. The children ask for you. Come home."',
  'through': 'The Wound is the one red thing in every Act I board. It is a smudge on the grasslands horizon and fills the sky over the border fort, so the player can read the distance home off the sky.',
  'regions': [
   {'key': 'i1-grasslands', 'name': 'Grasslands', 'feel': 'Too quiet',
    'scene': 'Dawn meadows, dew, long grass moving, standing stones, a white sun through mist. Beautiful, and wrong.',
    'tells': ["Crows that don't fly when you pass", 'Scarecrows that face you a frame later', 'Sheep lying in the grass, untouched', 'No birdsong, just wind'],
    'foes': 'Scarecrows · crows · bounty riders · warhounds',
    'boss': 'Ser Odo Gallowmark, the Hound-Warden', 'bossnote': 'mounted charges, hounds in waves, nets',
    'beat': 'The royal warrant: “The Kingslayer. Alive or dead.” The act opens here: the crow finds him with Ilse’s letter.',
    'stills': [('op-5-crow', 'a1-02-crow'), ('a2-3-letter', 'a1-03-letter')],
    'prompt': 'Dawn meadow of long pale-gold grass bent by wind, a low white sun through mist, a ring of standing stones on a rise with crows perched and not flying, sheep lying still in the grass, a scarecrow in the foreground turned to face the viewer, a tiny red eye-shaped wound in the sky on the far horizon. Beautiful and too quiet.'},
   {'key': 'i2-swamp', 'name': 'Swamp', 'feel': 'Horror',
    'scene': 'Black water, hanging moss, stilt huts, bog bodies half-sunk with faces up, leeches on everything, a drowned chapel bell. Flooded floors slow you and hands grab from the water.',
    'tells': ['Bog bodies face up, eyes open', 'Marsh Lanterns drift toward the deep pools', 'Hands break the surface where you wade', 'The chapel bell is half under the water'],
    'foes': 'Fen Hags · Bog Drowners · Marsh Lanterns · leech swarms',
    'boss': 'The Three Sisters of the Fen', 'bossnote': 'one shared life bar, they swap places through the water, kill order matters',
    'beat': 'They read his fate: “You’ll come home to a gate of pikes.”',
    'stills': [('a2-2-bell', 'drowned bell, reference')],
    'prompt': 'Black still swamp water at dusk under a bruise-purple sky, dead trees with long hanging moss framing both sides, stilt huts with one dim window, pale bog bodies floating face up, two pale hands reaching out of the water, a drowned chapel bell half-sunk, three green will-o-wisp lanterns, a small red eye-shaped wound low in the sky through the moss.'},
   {'key': 'i3-desert', 'name': 'Desert', 'feel': "What's left of Kesh",
    'scene': 'The land the brothers burned in the prologue: salted earth, sand over the bones of the war, half-buried siege towers, the ribs of granaries, glass where the fire was hottest. The player walks through their own war crime.',
    'tells': ['Granary ribs from the night Cassian burned them', 'Glass pools where the fire was hottest', 'Siege towers leaning out of the sand', 'Sandstorms cut visibility; sand slides off ledges'],
    'foes': 'Salt wraiths (Kesh’s dead) · buried soldiers rising · vultures · sand-dragged corpses',
    'boss': 'The Lantern Preacher', 'bossnote': 'throws oil, sets the floor alight, his congregation shields him',
    'beat': 'A new faith in the new King; the second letter: “They took the tithe in our street. One in ten.”',
    'stills': [],
    'prompt': 'Salt-white desert under a hazy glaring sky, a half-buried wooden siege tower leaning out of the dunes, the curved charred ribs of a burned granary half-sunk in sand, flat pools of fused green glass on the sand, scattered bones and a skull, a broken banner pole, vultures circling, sand blowing across, a red eye-shaped wound in the sky, larger than before.'},
   {'key': 'i4-mountains', 'name': 'Mountains', 'feel': 'Steep, gloomy, fog',
    'scene': 'Fog banks hide the drops, so the floor below is a guess. Rope bridges, cliff shrines, prayer flags, snow, falling rock, a monastery gone quiet.',
    'tells': ['Fog where the floor should be', 'A missing plank on the rope bridge', 'Prayer flags still moving over a silent monastery', 'Rock falls before you hear it'],
    'foes': 'Harpies or mountain eagles · goat-skulled hermits · Hollowed patrols',
    'boss': 'Captain Merrow, the First Hollowed', 'bossnote': 'shield-wall squad that moves as one, no stagger until his men fall',
    'beat': 'His own old soldiers, with black eyes. The third crow comes with no letter, only blood on its leg.',
    'stills': [],
    'prompt': 'Two dark sheer cliffs facing each other across a chasm filled with thick white fog that hides the bottom, a sagging rope bridge with a missing plank between them, a line of faded prayer flags strung across the drop, a small shrine gate on a snowy ledge, a quiet monastery on the far ridge, snow falling, a red eye-shaped wound glowing through cloud, now large.'},
   {'key': 'i5-fort', 'name': 'The Last Light', 'feel': 'The border fort',
    'scene': 'A border fort at the top of the pass: stone walls, ballistae, snow. It closes the act on the story beat.',
    'tells': ['Braziers lit on the wall, nobody on it', 'One window lit in the keep', 'The Wound fills the sky over home'],
    'foes': 'Hollowed Footmen · Hollowed Pikemen · archers',
    'boss': 'Piet, the Shield-Bearer', 'bossnote': 'Halden’s own fighting style mirrored: parries, rolls, a tower shield',
    'beat': '“The King took your wife into the palace. She doesn’t come to the window any more.”',
    'stills': [],
    'prompt': 'Night, a stone border fort at the top of a snowy mountain pass with a gatehouse and keep, ballistae on the walls, braziers burning, one lit window in the keep, heavy snowfall, a small hooded figure standing in the snow looking up at it, a huge red eye-shaped wound across the night sky.'},
  ]},
 {'id': 'act-2', 'num': 'Act II', 'kanji': '闇', 'kana': 'yami · darkness', 'name': 'Hollowmere in Darkness',
  'look': 'Night city: torchlight, black banners, red only from the sky and the tithe-lanterns.',
  'letter': 'Act II never jump-scares. It never lets the player relax.',
  'through': 'Most of Act II’s unease comes from design and sound, not art: townsfolk stop working and watch you pass; faces repeat and smiles are slightly too wide; bells ring at the wrong times; the ambient music is detuned a few cents; shadows point the wrong way; Cassian’s portrait is on every wall and its eyes track you; friendly villagers stay friendly until you’re close.',
  'regions': [
   {'key': 'ii1-villages', 'name': 'Villages outside the gates', 'feel': 'The festival',
    'scene': 'Harvest festival, bunting, a maypole, everyone smiling. Then a tithe mark on every tenth door.',
    'tells': ['Everyone stops dancing to watch you', 'The tithe mark on every tenth door', 'Black banners on the sealed walls behind'],
    'foes': 'Corrupted villagers with pitchforks, sickles and flails: idle until you get close',
    'boss': 'General Brann the Mortar', 'bossnote': 'bombardments on marked ground, engineers lay mines',
    'beat': 'The city has sealed itself in. “He’d have my daughters if I opened that gate.”',
    'stills': [],
    'prompt': 'Harvest festival at dusk outside sealed city walls hung with black banners, a row of cottages with strings of bunting, a maypole with ribbons in the centre, villagers standing perfectly still around it all facing the viewer with wide smiles, a wheat field in the foreground, one cottage door marked with a red cross, a red eye-shaped wound in the sky over the walls.'},
   {'key': 'ii2-slums', 'name': 'Slums inside the walls', 'feel': 'Rot',
    'scene': 'Mud, rot, maggots, rats, hanging laundry, open sewers.',
    'tells': ['Cutpurses steal crowns and run', 'Bloated beggars that burst', 'A tithe-lantern over every tithed door'],
    'foes': 'Cutpurses · maggot swarms · rat kings · bloated beggars · Plague Doctors with rot clouds',
    'boss': 'The Tithe-Collector', 'bossnote': 'the existing fight; Debt Anchors stay',
    'beat': 'One soul in ten. His household: two names already paid.',
    'stills': [('a3-2-ledger', 'b07-2-ledger'), ('b3-2-cage', 'b07-4-cage')],
    'prompt': 'A narrow slum alley at night between leaning rotten timber houses, washing lines strung across with grey laundry, an open sewer channel down the middle, rats along the walls, a bloated beggar slumped by a doorway, a heap crawling with maggots, one red tithe-lantern hanging over a door, a slit of night sky above with a small red eye-shaped wound.'},
   {'key': 'ii3-oldcity', 'name': 'The old city', 'feel': 'Too normal',
    'scene': 'Shops, a market square, signs, a cathedral spire. It’s the most normal-looking place in the game, which is the point.',
    'tells': ['Cassian’s portrait on every wall, eyes tracking you', 'The watch standing too still', 'Warm windows, nobody in them'],
    'foes': 'Hollowed city watch · Tithe-Takers (chain grapples that drag you) · Curfew Bellmen (ring for reinforcements) · rooftop gargoyles',
    'boss': 'The Choir of Teeth', 'bossnote': 'the existing fight; the Hymn phase now sings the coronation hymn',
    'beat': 'The cathedral where Cassian was crowned. “…long live the King, long live the King…”',
    'stills': [('b2-2-mouths', 'b08-2-mouths'), ('b2-4-shut', 'b08-3-shut')],
    'prompt': 'A medieval market square at night that looks completely ordinary: timber-framed shops with warm lit windows, hanging shop signs, striped market stalls, a cathedral with a tall spire and a glowing rose window, cobbles, framed portraits of a young king on two walls, a lone city guard with a halberd standing too still, a red tithe-lantern on a post.'},
   {'key': 'ii4-royal', 'name': 'Royal houses', 'feel': 'The most hellish',
    'scene': 'A feast gone to rot, nobles in masks, portraits that bleed, servants with black eyes, a ballroom of dancers on strings. The devil’s touch is strongest near the throne.',
    'tells': ['Portraits that bleed from the eyes', 'Dancers on strings, feet off the floor', 'Servants with black eyes', 'The feast crawling'],
    'foes': 'Masked nobles · black-eyed servants · string-dancers · Knights of the Hand',
    'boss': 'Marshal Oswin Rook', 'bossnote': 'cavalry charges across the ground, then on foot when unhorsed',
    'beat': 'The confession: “I saw him leave the King’s chamber.”',
    'stills': [],
    'prompt': 'A grand ballroom of dark wine-red damask walls, gilt-framed portraits of pale masked faces bleeding red from the eyes, a gold chandelier, masked dancers hanging from thin strings like marionettes with their feet off the floor, a long feast table of rotting food crawling with maggots and lit candles, a servant with black eyes standing by the wall, heavy black vignette.'},
   {'key': 'ii5-bridge', 'name': 'The palace bridge', 'feel': 'The gate of pikes',
    'scene': 'The gate of pikes and Ser Gideon. The act’s fifth region and its ending.',
    'tells': ['Three small shapes on pikes, too far to make out', 'A wooden horse on the cobbles', 'A broken candle'],
    'foes': 'Hollowed Guards and Halberdiers · Knights of the Hand',
    'boss': 'Ser Gideon Vale, the King’s Hand', 'bossnote': 'a narrowing bridge, sections fall, ends in the scripted fall',
    'beat': '“The King sends his regards.” The bridge goes up and Halden falls into the Marrowdeep.',
    'stills': [('a1-1-fall', 'a2-07-fall')],
    'prompt': 'A long stone bridge in one-point perspective leading to a black palace gatehouse, three small dark shapes on tall pikes above the gate too far away to make out, black statues lining the bridge, torches burning, a blood-red sky with a vast red eye-shaped wound, a small carved wooden toy horse and a broken candle on the cobbles in the foreground.'},
  ]},
]

DECISIONS = [
 ('Regions and bosses', 'The Region Moods notes replace the bible’s Act I settings (Gallows Road, Black Camp, Saint Edda’s Ashes) with grasslands, desert and mountains. These boards keep every boss and beat from the bible and place them where they fit best. Ser Odo moves to the grasslands, the Lantern Preacher to Kesh and Merrow to the mountains. In Act II, Brann takes the villages and Rook takes the royal houses. Rook is the loosest fit.'),
 ('Play order', 'Grasslands come before the swamp, as in the Region Moods notes, so the Three Sisters become boss 2.'),
 ('Royal houses', 'Drawn as inside the walls, up the hill toward the palace, as the notes propose. Still open.'),
 ('Desert as Kesh', 'Drawn as the burned ruins of Kesh. Still open.'),
]


def palette_html(key):
    out = []
    for tok, hexv in PAL[key].items():
        nm = NAMES[key].get(tok, tok)
        out.append(f'<button class="chip" type="button" data-hex="{hexv}" aria-label="Copy {e(nm)} {hexv}">'
                   f'<span class="sw" style="background:{hexv}"></span><span class="cn">{e(nm)}</span>'
                   f'<span class="hx">{hexv}</span></button>')
    return ''.join(out)


def region_html(act, i, r):
    pal = ', '.join(f'{NAMES[r["key"]].get(t, t)} {h}' for t, h in PAL[r['key']].items())
    prompt = STYLE_HEADER.format(pal=pal) + ' ' + r['prompt']
    stills = ''
    if r['stills']:
        figs = ''.join(f'<figure><img src="{uri(f"{STILLS}/{s}.png")}" alt="Existing still {e(s)}" loading="lazy">'
                       f'<figcaption>{e(s)} <span>→ {e(n)}</span></figcaption></figure>' for s, n in r['stills'])
        stills = f'<div class="blk"><h4>Existing stills it keeps</h4><div class="stills">{figs}</div></div>'
    tells = ''.join(f'<li>{e(t)}</li>' for t in r['tells'])
    pid = f'p-{r["key"]}'
    return f'''
<article class="region" id="{r['key']}">
  <div class="plate"><img src="{uri(f'{HERE}/img/{r["key"]}@1x.png')}" alt="Key image: {e(r['name'])}, {e(r['feel'])}" width="320" height="136"></div>
  <header class="rhead">
    <span class="rno">{act['num']} · {i}</span>
    <h3>{e(r['name'])}</h3>
    <p class="feel">{e(r['feel'])}</p>
  </header>
  <div class="cols">
    <div class="col">
      <p class="scene">{e(r['scene'])}</p>
      <div class="blk"><h4>The tells</h4><ul>{tells}</ul></div>
      <div class="blk"><h4>Foes</h4><p>{e(r['foes'])}</p></div>
      <div class="blk boss"><h4>Boss</h4><p><strong>{e(r['boss'])}</strong>: {e(r['bossnote'])}</p><p class="beat">{e(r['beat'])}</p></div>
    </div>
    <div class="col">
      <div class="blk"><h4>Palette <span class="hint">tap to copy</span></h4><div class="chips">{palette_html(r['key'])}</div></div>
      {stills}
      <details class="blk prompt"><summary>Generation prompt</summary>
        <p id="{pid}" class="ptext">{e(prompt)}</p>
        <button class="copy" type="button" data-target="{pid}">Copy prompt</button>
      </details>
    </div>
  </div>
</article>'''


def act_html(a):
    regions = ''.join(region_html(a, i + 1, r) for i, r in enumerate(a['regions']))
    nav = ''.join(f'<a href="#{r["key"]}"><img src="{uri(f"{HERE}/img/{r["key"]}@1x.png")}" alt=""><span>{i + 1}. {e(r["name"])}</span></a>'
                  for i, r in enumerate(a['regions']))
    return f'''
<section class="act" id="{a['id']}">
  <div class="acthead">
    <div class="kanji" lang="ja">{a['kanji']}</div>
    <div class="actcopy">
      <p class="eyebrow">{a['num']} · <span lang="ja">{a['kana']}</span></p>
      <h2>{e(a['name'])}</h2>
      <p class="look">{e(a['look'])}</p>
      <blockquote>{e(a['letter'])}</blockquote>
      <p class="through">{e(a['through'])}</p>
    </div>
  </div>
  <nav class="strip" aria-label="{a['num']} regions">{nav}</nav>
  {regions}
</section>'''


decisions = ''.join(f'<div><dt>{e(t)}</dt><dd>{e(d)}</dd></div>' for t, d in DECISIONS)
body = ''.join(act_html(a) for a in ACTS)

page = f'''<title>Marrowdeep Mood Boards</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=DotGothic16&display=swap">
<style>
/* Layout: a manga tankobon in ink. Black gutters, paper captions, each region a full-bleed panel then its notes. Red is kept for the Wound only. */
:root {{
  --ink: #0e0a0a; --gutter: #171212; --panel: #1f1918; --rule: #3a302d;
  --paper: #ece6d8; --muted: #a79d8f; --red: #b0141a; --redlit: #e0343a;
  --display: "Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", Georgia, serif;
  --body: "Zen Kaku Gothic New", "Hiragino Sans", "Segoe UI", system-ui, sans-serif;
  --pixel: "DotGothic16", ui-monospace, "SFMono-Regular", Menlo, monospace;
  color-scheme: dark;
}}
* {{ box-sizing: border-box; }}
body {{ background: var(--ink); color: var(--paper); font-family: var(--body); font-size: 15px; line-height: 1.6; }}
.wrap {{ max-width: 1120px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 40px 72px; }}
h1, h2, h3 {{ font-family: var(--display); text-wrap: balance; margin: 0; }}
a {{ color: inherit; }}
:focus-visible {{ outline: 2px solid var(--redlit); outline-offset: 2px; }}

.mast {{ display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: end; border-bottom: 1px solid var(--rule); padding-bottom: 28px; }}
.mast .eyebrow {{ margin: 0 0 10px; }}
.mast h1 {{ font-size: clamp(34px, 6vw, 64px); font-weight: 800; line-height: 1.05; letter-spacing: -.01em; }}
.mast h1 em {{ font-style: normal; color: var(--red); }}
.mast .lede {{ max-width: 62ch; color: var(--muted); margin: 14px 0 0; }}
.mast .src {{ font-family: var(--pixel); font-size: 12px; color: var(--muted); text-align: right; line-height: 1.8; }}
.eyebrow {{ font-family: var(--pixel); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }}

.decide {{ margin: 28px 0 0; background: var(--gutter); border: 1px solid var(--rule); padding: 18px 20px; }}
.decide h2 {{ font-size: 18px; margin-bottom: 10px; }}
.decide dl {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 28px; margin: 0; }}
.decide dt {{ font-weight: 700; font-size: 13px; }}
.decide dd {{ margin: 2px 0 0; color: var(--muted); font-size: 13.5px; }}

.act {{ margin-top: 72px; }}
.acthead {{ display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 28px; align-items: start; }}
.kanji {{ font-family: var(--display); font-weight: 800; font-size: clamp(64px, 11vw, 132px); line-height: .9; writing-mode: vertical-rl; color: var(--paper); border-right: 3px solid var(--red); padding-right: 14px; }}
.acthead h2 {{ font-size: clamp(28px, 4.4vw, 46px); font-weight: 700; margin: 6px 0 10px; }}
.look {{ font-size: 17px; max-width: 60ch; margin: 0; }}
blockquote {{ margin: 16px 0; padding: 10px 14px; background: var(--paper); color: var(--ink); font-family: var(--display); font-weight: 700; font-size: 17px; max-width: 52ch; }}
.through {{ color: var(--muted); max-width: 66ch; margin: 0; font-size: 14px; }}

.strip {{ display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; margin: 28px 0 8px; background: var(--ink); }}
.strip a {{ display: grid; gap: 6px; text-decoration: none; font-size: 12px; color: var(--muted); }}
.strip img {{ width: 100%; aspect-ratio: 320/136; image-rendering: pixelated; display: block; border: 1px solid var(--rule); }}
.strip a:hover img {{ border-color: var(--paper); }}
.strip a:hover span {{ color: var(--paper); }}

.region {{ margin-top: 44px; background: var(--gutter); border: 1px solid var(--rule); }}
.plate {{ background: #000; padding: 6px; border-bottom: 1px solid var(--rule); }}
.plate img {{ display: block; width: 100%; max-width: 100%; height: auto; aspect-ratio: 320/136; image-rendering: pixelated; }}
.rhead {{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 18px; padding: 18px 22px 0; }}
.rno {{ font-family: var(--pixel); font-size: 12px; color: var(--muted); letter-spacing: .08em; }}
.rhead h3 {{ font-size: clamp(24px, 3.2vw, 32px); font-weight: 700; }}
.feel {{ margin: 0; font-family: var(--display); font-size: 18px; color: var(--muted); }}
.feel::before {{ content: "「"; }} .feel::after {{ content: "」"; }}
.cols {{ display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 28px; padding: 14px 22px 24px; }}
.col {{ display: grid; gap: 18px; align-content: start; min-width: 0; }}
.scene {{ margin: 0; font-size: 15.5px; max-width: 60ch; }}
.blk h4 {{ margin: 0 0 6px; font-family: var(--pixel); font-weight: 400; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }}
.blk p {{ margin: 0; }}
.blk ul {{ margin: 0; padding-left: 18px; display: grid; gap: 2px; }}
.boss strong {{ font-weight: 700; }}
.beat {{ margin-top: 8px !important; padding-left: 10px; border-left: 2px solid var(--rule); color: var(--muted); font-style: italic; }}
.hint {{ text-transform: none; letter-spacing: 0; color: var(--rule); margin-left: 6px; }}

.chips {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; }}
.chip {{ display: grid; grid-template-columns: 26px minmax(0, 1fr) auto; align-items: center; gap: 8px; background: var(--panel); border: 1px solid var(--rule); color: var(--paper); padding: 4px 8px 4px 4px; font: inherit; font-size: 12.5px; text-align: left; cursor: pointer; }}
.chip:hover {{ border-color: var(--muted); }}
.chip.done {{ border-color: var(--paper); }}
.sw {{ width: 26px; height: 22px; border: 1px solid rgba(236,230,216,.18); }}
.cn {{ overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
.hx {{ font-family: var(--pixel); font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums; }}

.stills {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }}
.stills figure {{ margin: 0; }}
.stills img {{ width: 100%; display: block; image-rendering: pixelated; border: 1px solid var(--rule); background: #000; }}
.stills figcaption {{ font-family: var(--pixel); font-size: 11px; color: var(--muted); margin-top: 4px; }}
.stills figcaption span {{ color: var(--paper); }}

.prompt summary {{ cursor: pointer; font-family: var(--pixel); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }}
.prompt summary:hover {{ color: var(--paper); }}
.ptext {{ margin: 10px 0 !important; font-size: 13px; color: var(--muted); background: var(--ink); padding: 10px 12px; border: 1px solid var(--rule); }}
.copy {{ font: inherit; font-size: 13px; background: var(--paper); color: var(--ink); border: 0; padding: 6px 12px; cursor: pointer; font-weight: 700; }}
.copy:hover {{ background: #fff; }}

.next {{ margin-top: 72px; border-top: 1px solid var(--rule); padding-top: 24px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }}
.next h3 {{ font-size: 18px; margin-bottom: 6px; }}
.next p {{ margin: 0; color: var(--muted); font-size: 14px; }}
.toast {{ position: fixed; left: 50%; bottom: calc(18px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); background: var(--paper); color: var(--ink); padding: 6px 14px; font-weight: 700; font-size: 13px; opacity: 0; transition: opacity .2s; pointer-events: none; }}
.toast.on {{ opacity: 1; }}

@media (max-width: 760px) {{
  .mast {{ grid-template-columns: 1fr; }} .mast .src {{ text-align: left; }}
  .decide dl, .cols, .next {{ grid-template-columns: 1fr; }}
  .strip {{ grid-template-columns: repeat(5, minmax(120px, 1fr)); overflow-x: auto; }}
  .acthead {{ gap: 16px; }}
  .rhead, .cols {{ padding-left: 14px; padding-right: 14px; }}
}}
@media (prefers-reduced-motion: reduce) {{ .toast {{ transition: none; }} }}
</style>

<div class="wrap">
  <header class="mast">
    <div>
      <p class="eyebrow">Marrowdeep · mood boards · Acts I and II</p>
      <h1>The road home,<br>and the city that <em>watches</em>.</h1>
      <p class="lede">One key image per region, drawn in code at the game’s own pixel scale (320 × 136, dithered), each with a locked palette. Each region also has its feeling, foes and boss, the stills it keeps, and a generation prompt that turns the sketch into finished key art. The point is to agree the feel before any shippable art is made.</p>
    </div>
    <div class="src">Story Bible &amp; Storyboard v2<br>Region Moods &amp; Pre-Art Notes<br>8 Nov 2026</div>
  </header>

  <section class="decide" aria-labelledby="dec">
    <h2 id="dec">Choices made to draw these, for you to confirm</h2>
    <dl>{decisions}</dl>
  </section>

  {body}

  <section class="next" aria-label="Next steps">
    <div><h3>Lock the palettes</h3><p>Each board’s chips are the proposed 6–8 colour palette for that region, plus the Wound red. Change any chip before tiles and parallax layers are made from it.</p></div>
    <div><h3>Prove the swamp in-engine</h3><p>Build the swamp end to end (backdrop layers, tiles, two foes) and look at it running before generating the other regions.</p></div>
    <div><h3>Then generate</h3><p>Run each prompt in SpriteCook or Blueprint Studio once their tools load in a session, keeping the palette hexes in the prompt. Save as <code>art/moodboard/&lt;region&gt;.png</code>.</p></div>
  </section>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script>
(function () {{
  var toast = document.getElementById('toast'), t;
  function say(msg) {{ toast.textContent = msg; toast.classList.add('on'); clearTimeout(t); t = setTimeout(function () {{ toast.classList.remove('on'); }}, 1400); }}
  function copy(text, el, msg) {{
    function fallback() {{
      var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      say('Selected. Press Ctrl+C or Cmd+C to copy.');
    }}
    try {{ navigator.clipboard.writeText(text).then(function () {{ say(msg); }}, fallback); }} catch (e) {{ fallback(); }}
  }}
  document.addEventListener('click', function (ev) {{
    var chip = ev.target.closest('.chip');
    if (chip) {{ copy(chip.dataset.hex, chip.querySelector('.hx'), 'Copied ' + chip.dataset.hex); chip.classList.add('done'); return; }}
    var b = ev.target.closest('.copy');
    if (b) {{ var p = document.getElementById(b.dataset.target); copy(p.textContent, p, 'Prompt copied'); }}
  }});
}})();
</script>
'''
open(f'{HERE}/moodboards.html', 'w').write(page)
print('wrote', len(page) // 1024, 'KB')
