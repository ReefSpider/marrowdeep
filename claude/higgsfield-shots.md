# Marrowdeep — Higgsfield shot list for the manga cutscenes

Every cutscene panel has an id. Generate a still for an id, attach it in a session (file named exactly `<id>.png` / `.jpg` / `.webp`), and it gets added to `art/manga/` and `art/manga/manifest.json`. The game then uses it instead of the in-engine drawing. (v45: panels are stored as WebP, quality 82; convert new stills before adding them.)

**What happens to your image:** the game crops it to the panel's shape (centred), shrinks it to the game's pixel grid and inks it into 1-bit dithered black-and-white, keeping only strong reds. So your stills become pixel-art manga that matches everything else. Consequences:
- Bold, high-contrast compositions with big shapes survive; fine detail and soft gradients get lost.
- Colour doesn't matter except red: anything you want to stay red must be a strong, saturated red. Generating in black-and-white with red accents gives the most predictable result.
- Faces read best in close-up or as silhouettes; small faces in wide shots turn into a few pixels.
- Generate a little wider than the ratio listed; the edges get cropped.

**Disclosure:** stills generated with Higgsfield are AI-generated content that players see, so they belong on Steam's AI disclosure form.

## Style prompt (prepend to every shot)
> Black and white seinen manga panel, heavy black ink, high contrast, dramatic chiaroscuro, coarse screentone shading, gothic dark fantasy, medieval besieged city, Japanese horror atmosphere, one blood-red accent colour only, no other colours, no text, no speech bubbles, no lettering, no border.

## Characters (keep consistent: use Higgsfield's character reference / Soul ID with these)
- **The sellsword** — man in his late twenties, gaunt, short dark hair, stubble, a scar through one eyebrow, tired hard eyes; ragged dark hooded cloak over battered mail; a plain longsword. Never smiles.
- **Ilse** — his sister, nineteen, thin and pale, long straight dark hair, a dark wool shawl over a plain dress, clever stubborn eyes; ill (a consumptive cough); always near a small candle.
- **Count Varhollow** — man in his fifties, tall, gaunt, careful face, rich dark robes; wears a hollow iron crown with a dark opening in it that seems to breathe; later a vast red eye-wound in the sky answers him.
- **Agathe (the Weeping Mother)** — very old hooded midwife, deep wrinkles, gentle sad eyes, carries a bundle of swaddling cloth; ghostly.
- **The Choir of Teeth** — a ring of seven pale chorister faces with open mouths full of teeth, no eyes, bound together.
- **The Tithe-Collector** — tall gaunt tax-collector in a long coat, an iron cage on his back full of reaching hands, ledgers chained to his belt.
- **Saint Aurel (Saint Without Skin)** — a martyr woman with arms held out, a gold mask with red tear tracks nailed over her face; dignified, exhausted, not gory.

## Priority (biggest impact first)
1. `op-3-candle` · 2. `op-4-eyes` · 3. `e-4-embrace` · 4. `e-3-light` · 5. `b4-3-arms` · 6. `b1-2-agathe` · 7. `op-6-count` · 8. `b5-2-face` · 9. `a3-4-ilse` · 10. `op-2-window` · 11. `a1-1-fall` · 12. `e-1-dawn`

## The shots
Ratio = shape to generate (21:9 for very wide panels, 16:9 or 2:1 for wide ones, 1:1 square, 4:5 tall).

### Opening — the ninetieth night
| id | ratio | prompt (after the style prompt) | the text over it |
|---|---|---|---|
| op-1-wall | 21:9 | Wide night shot of a huge crenellated city wall with burning braziers, a full moon, and below it an endless army of undead soldiers in rows, faint red glow on the horizon | The ninetieth night of the siege. |
| op-2-window | 16:9 | A small window in a dark stone house at night, a single lit candle on the sill, a thin girl with long dark hair seen in silhouette beside it, rooftops beyond | One house still keeps a window lit. |
| op-3-candle | 16:9 | Close-up of two hands: a girl's thin pale hand pressing a small lit candle stub into a man's battered gauntleted hand, candlelight on both | "Bring it back lit." |
| op-4-eyes | 1:1 | Extreme close-up of the sellsword's eyes under dark hair, hard and tired, a faint red glint in one eye | "By dawn." |
| op-5-crow | 21:9 | A large crow on a stone windowsill with a small rolled letter tied to its leg sealed with red wax, moon behind | The crows watched you go. |
| op-6-count | 21:9 | Count Varhollow on the wall raising a hollow iron crown above his head with both hands, a vast red eye opening in the clouds above him | The Count has done arithmetic for nine nights. |
| op-7-wall | 21:9 | *(optional — currently a real shot of the level)* The sellsword alone on the wall at night with a borrowed sword, the army below | Tonight you would settle for dawn. |

### Act I — the fall and the Marrowdeep
| id | ratio | prompt | text |
|---|---|---|---|
| a1-1-fall | 21:9 | A man falling headfirst through darkness among tumbling blocks of a collapsing wall, speed lines, a tiny candle stub in his fist | You fell. |
| a1-2-eye | 16:9 | A colossal red eye-shaped wound split open across a black sky, tiny falling human figures beneath it | Something above counted the falling. |
| a1-3-stub | 16:9 | Close-up of an unlit, half-melted candle stub clutched in a dirty fist, darkness around | You held on to the candle. |
| a1-5-bones | 16:9 | A man's hand pushing up from a vast heap of skulls and bones in an ossuary, an unlit candle stub beside it | You woke among the Bone Kings' dead. |
| a1-6-up | 16:9 | The sellsword seen from behind and below, standing at the bottom of a deep shaft, looking up at a far small circle of light | Up. |

### The Weeping Mother
| id | ratio | prompt | text |
|---|---|---|---|
| b1-2-agathe | 21:9 | Agathe the old hooded midwife, ghostly, holding a swaddled bundle, looking at the viewer with a sad knowing smile | "I pulled you into the world." |
| b1-3-cradle | 21:9 | A handmade wooden cradle full of swaddled bundles in a dark crypt, faint light | "Your sister never made a sound." |
| b1-4-rise | 21:9 | Small soft points of light rising out of the cradle into the dark like fireflies | Let them go, Agathe. |

### Act II — the Drowned
| id | ratio | prompt | text |
|---|---|---|---|
| a2-2-bell | 16:9 | A great chapel bell hanging underwater in black water, chains rising into darkness, ripples of sound spreading from it | Only you heard it. |
| a2-3-letter | 16:9 | A handwritten letter on rough paper held open, red wax seal, a crow's foot at the edge of frame | "The cough is worse." |

### Choir of Teeth
| id | ratio | prompt | text |
|---|---|---|---|
| b2-2-mouths | 16:9 | A wall of pale eyeless faces singing with mouths full of teeth, in rows like a choir | "…and the lamp shall not go out…" |
| b2-3-eyes | 16:9 | Close-up of the sellsword's eyes, a single tear running down, singing quietly | "…not while someone waits." |
| b2-4-shut | 16:9 | The same choir of faces with all mouths closed, peaceful, dust settling | Silence is also a note. |

### Act III — the Debt
| id | ratio | prompt | text |
|---|---|---|---|
| a3-2-ledger | 21:9 | An enormous open ledger on a stone lectern, columns of handwritten names, candle beside it | The Tithe: one soul in ten. |
| a3-3-father | 21:9 | Close-up of a ledger page, one name underlined | Your father. |
| a3-4-ilse | 21:9 | Close-up of a ledger page, a freshly written name in wet blood-red ink glistening | Under his name, the ink still wet: ILSE. |

### The Tithe-Collector
| id | ratio | prompt | text |
|---|---|---|---|
| b3-2-cage | 16:9 | An iron cage door swinging open, gaunt debtors climbing out holding out coins in their palms | The debtors climb out, still holding out their coins. |
| b3-3-struck | 16:9 | A man's hand striking a red name out of a ledger with a quill, ink splattering | "Paid." |

### Act IV — the Kiln
| id | ratio | prompt | text |
|---|---|---|---|
| a4-2-letter | 16:9 | A letter in shaky handwriting by the light of a nearly melted candle, red sky through a window | "The sky has been red for nine days." |
| a4-3-stub | 16:9 | Close-up of the unlit candle stub on a stone floor, a single drop of blood on the wax | Your stub still won't light. |

### Saint Without Skin
| id | ratio | prompt | text |
|---|---|---|---|
| b4-2-mask | 21:9 | A gold mask with red tear tracks falling away from a face, the face beneath in shadow | Underneath, only a tired woman. |
| b4-3-arms | 21:9 | Saint Aurel slowly lowering her outstretched arms, nails falling from her hands, soft light behind her, relief on her face | "You climb well, for a dead man." |
| b4-4-ghost | 21:9 | The sellsword seen from behind, translucent and pale like a ghost, ash drifting through him, light above | "You died on the wall, child." |

### Act V and the Finale
| id | ratio | prompt | text |
|---|---|---|---|
| a5-2-sky | 16:9 | Ash falling upward into a red sky split by a giant eye-wound | Ash falls upward now. |
| a5-3-window | 16:9 | The same window as the opening, the candle burnt almost to nothing, the girl asleep with her head on the sill | "It's almost burnt down." |
| a6-2-count | 4:5 | Count Varhollow standing among rows of kneeling undead soldiers on a battlefield, crown on his head, waiting | A man is waiting for you with a crown on his head. |

### Count Varhollow
| id | ratio | prompt | text |
|---|---|---|---|
| b5-2-face | 16:9 | Close-up of Count Varhollow's face, half in shadow, a crack running through the iron crown and down his face, red light in the crack | "I did the arithmetic. It balanced." |
| b5-3-crown | 16:9 | A broken hollow iron crown lying in the mud of a battlefield, drops of red around it | "I forgot to count myself." |

### Ending — dawn
| id | ratio | prompt | text |
|---|---|---|---|
| e-1-dawn | 21:9 | A grey ordinary dawn over a medieval city skyline, sun rays, crows flying | Dawn came up grey over Hollowmere. |
| e-2-door | 16:9 | A house door opening, warm light spilling out, a thin girl in a shawl in the doorway holding a candle | She had kept the candle lit for a hundred and four nights. |
| e-3-light | 16:9 | Close-up: the girl's candle lighting the man's unlit stub, two hands, two flames | She lit it from hers. |
| e-4-embrace | 4:5 | A brother and sister embracing in a lit doorway, seen as silhouettes against the light, their long shadows on the floor | She knew you anyway. |
| e-5-window | 4:5 | Two lit candles side by side on a windowsill at dawn, a crow beside them | Two candles in the window. |

The boss "fall" panels (b1-1, b2-1, b3-1, b4-1, b5-1) and each act's first panel are real shots of the level as you play it, and they look right already. A still for those ids would replace the live shot, which isn't recommended.
