"""Marrowdeep mood-board key images, drawn at the game's pixel scale.
320x136 (about 21:9), ordered (Bayer) dithering, one locked palette per region.
Saved at 1x (for the engine) and 4x nearest-neighbour (for the board)."""
from PIL import Image, ImageDraw
import math, random, json, sys, os

W, H = 320, 136
B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
OUT = sys.argv[1] if len(sys.argv) > 1 else 'img'


def hx(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


class S:
    def __init__(s, pal, seed):
        s.pal = pal
        s.P = {k: hx(v) for k, v in pal.items()}
        s.im = Image.new('RGB', (W, H), s.P[next(iter(pal))])
        s.d = ImageDraw.Draw(s.im)
        s.R = random.Random(seed)
        s.seed = seed

    def c(s, k):
        return s.P[k] if isinstance(k, str) else k

    def px(s, x, y, k):
        x, y = int(x), int(y)
        if 0 <= x < W and 0 <= y < H:
            s.im.putpixel((x, y), s.c(k))

    def on(s, x, y, t):  # dither test: True with probability ~t
        return t * 16 > B4[int(y) % 4][int(x) % 4] + .5

    def grad(s, y0, y1, stops):
        for y in range(y0, y1):
            f = (y - y0) / max(1, y1 - y0 - 1) * (len(stops) - 1)
            i = min(int(f), len(stops) - 2)
            t = f - i
            for x in range(W):
                s.px(x, y, stops[i + 1] if s.on(x, y, t) else stops[i])

    def noise(s, scale, octs=3, seed=0):
        rr = random.Random(s.seed * 97 + seed)
        n = W // 2 + 4
        layers = []
        for o in range(octs):
            pts = [rr.random() for _ in range(n)]
            layers.append(pts)

        def f(x):
            v, a, tot = 0, 1, 0
            for o, pts in enumerate(layers):
                fx = x / scale * (2 ** o)
                i = int(fx) % (n - 1)
                t = fx - int(fx)
                t = (1 - math.cos(t * math.pi)) / 2
                v += a * (pts[i] * (1 - t) + pts[i + 1] * t)
                tot += a
                a *= .5
            return v / tot
        return f

    def ridge(s, base, amp, scale, k, seed=0, octs=3, to=H):
        f = s.noise(scale, octs, seed)
        ys = []
        for x in range(W):
            y = int(base - amp * (f(x) - .5) * 2)
            ys.append(y)
            s.d.line([(x, y), (x, to)], fill=s.c(k))
        return ys

    def fog(s, y0, y1, k, dens, seed=0, wav=23):
        for y in range(max(0, y0), min(H, y1)):
            t = dens * math.sin(math.pi * (y - y0) / max(1, (y1 - y0)))
            for x in range(W):
                tt = t * (.65 + .35 * math.sin(x / wav + seed + y / 9))
                if s.on(x, y, tt):
                    s.px(x, y, k)

    def wound(s, cx, cy, w, h, halo=1.0):
        """The red eye-wound: an almond slit with a dithered halo."""
        for y in range(int(cy - h * 3 * halo), int(cy + h * 3 * halo) + 1):
            for x in range(int(cx - w * 1.6), int(cx + w * 1.6) + 1):
                dx, dy = (x - cx) / (w * 1.5), (y - cy) / (h * 3 * halo)
                r = dx * dx + dy * dy
                if r < 1 and s.on(x, y, (1 - r) * .45):
                    s.px(x, y, 'dred')
        for x in range(int(cx - w), int(cx + w) + 1):
            hh = h * (1 - ((x - cx) / w) ** 2)
            s.d.line([(x, cy - hh), (x, cy + hh)], fill=s.c('red'))
            if abs(x - cx) < w * .7:
                s.px(x, cy, 'dred')
        ph = max(1, int(h * .8))
        s.d.line([(cx, cy - ph), (cx, cy + ph)], fill=s.c('dred'))

    def snow(s, n, k, y0=0, y1=H):
        for _ in range(n):
            s.px(s.R.randrange(W), s.R.randrange(y0, y1), k)

    def crow(s, x, y, k):
        s.d.rectangle([x, y, x + 3, y + 2], fill=s.c(k))
        s.px(x + 4, y, k); s.px(x + 4, y + 1, k); s.px(x - 1, y + 2, k)
        s.px(x + 1, y + 3, k); s.px(x + 2, y + 3, k)

    def figure(s, x, y, body, face, h=9, smile=None):
        s.d.rectangle([x - 1, y - h + 3, x + 1, y], fill=s.c(body))
        s.d.rectangle([x - 2, y - h + 4, x + 2, y - 2], fill=s.c(body))
        s.d.rectangle([x - 1, y - h, x + 1, y - h + 2], fill=s.c(face))
        if smile:
            s.px(x - 1, y - h + 2, smile); s.px(x, y - h + 2, smile); s.px(x + 1, y - h + 2, smile)

    def save(s, name):
        s.im.save(f'{OUT}/{name}@1x.png')
        s.im.resize((W * 4, H * 4), Image.NEAREST).save(f'{OUT}/{name}.png')


# ---------- palettes (locked, 6-9 colours each) ----------
PAL = {
 'i1-grasslands': {'mist': '#e6e3d4', 'bone': '#f3eee2', 'sky2': '#d5d0b9', 'gold': '#d2bd82', 'straw': '#a69357',
                   'gg': '#7f8b6f', 'gg2': '#55614f', 'shadow': '#2b302b', 'red': '#b0141a', 'dred': '#d9b8a8'},
 'i2-swamp':      {'b2': '#2a1c30', 'bruise': '#4a2f4f', 'moss': '#3e5a2c', 'sick': '#6f8a3a', 'pale': '#a9b46c',
                   'water': '#141a16', 'black': '#0b0d0a', 'red': '#b0141a', 'dred': '#5a2034'},
 'i3-desert':     {'salt': '#ebe4d2', 'haze': '#d8cdb0', 'sand': '#c4ad80', 'ochre': '#957548', 'ash': '#6b6460',
                   'glass': '#86a8a0', 'char': '#2a211c', 'red': '#b0141a', 'dred': '#cfa58e'},
 'i4-mountains':  {'dslate': '#454d55', 'slate': '#7b848b', 'fog': '#b8bdc0', 'snow': '#e7e9e7', 'rock': '#2a2e34',
                   'black': '#121418', 'flag': '#b08a4a', 'red': '#b0141a', 'dred': '#7a4048'},
 'i5-fort':       {'night': '#1f232c', 'night2': '#2c3240', 'stone': '#8a8580', 'dstone': '#4a4642', 'snow': '#eceae4',
                   'ember': '#d0782a', 'black': '#0e0a0a', 'red': '#b0141a', 'dred': '#5a0a0e'},
 'ii1-villages':  {'night': '#1a141c', 'plum': '#4a2c38', 'dusk2': '#b8704a', 'dusk': '#e2a65c', 'straw': '#d4b25a',
                   'wheat': '#8a6a32', 'cloth': '#ebdfc4', 'black': '#0e0a0a', 'red': '#b0141a', 'dred': '#6a1a22'},
 'ii2-slums':     {'black': '#100e0c', 'sewer': '#2e3424', 'mud': '#4a3a28', 'brown': '#5a4636', 'rot': '#6a6a32',
                   'grey': '#a8a294', 'cream': '#d8cfae', 'red': '#b0141a', 'dred': '#4a1214'},
 'ii3-oldcity':   {'black': '#0e0e12', 'sky': '#1a1e2a', 'sky2': '#2a3040', 'slate': '#3e4450', 'stone': '#9a9488',
                   'plaster': '#cfc6b2', 'torch': '#e0b060', 'red': '#b0141a', 'dred': '#3a1418'},
 'ii4-royal':     {'black': '#0a0606', 'wine': '#5a1420', 'dgold': '#6e5420', 'gold': '#b8913a', 'candle': '#e8d4a0',
                   'white': '#ece6d8', 'red': '#b0141a', 'dred': '#6a0a10'},
 'ii5-bridge':    {'black': '#0e0a0a', 'dstone': '#3a3a40', 'stone': '#6e6a68', 'sky2': '#5a0a0e', 'red': '#b0141a',
                   'torch': '#e09040', 'paper': '#ece6d8', 'dred': '#8a1016'},
}
# 'dred' in the pale Act I palettes is the Wound's halo tint, not a second red.


def grasslands():
    s = S(PAL['i1-grasslands'], 11)
    s.grad(0, 84, ['bone', 'mist', 'sky2'])
    s.d.ellipse([206, 18, 234, 46], fill=s.c('bone'))                 # white sun
    s.fog(8, 60, 'mist', .55, 1, 31)
    s.wound(60, 70, 7, 1.2, .6)                                        # the one red thing: tiny, far away
    s.ridge(72, 5, 60, 'gg', 1)
    s.fog(58, 84, 'mist', .7, 2)
    ys = s.ridge(90, 9, 70, 'gold', 2)
    for x in range(W):                                                 # dew-dark shading on the field
        for y in range(ys[x], 112):
            if s.on(x, y, (y - ys[x]) / 40): s.px(x, y, 'straw')
    for i, x in enumerate([78, 92, 104, 117]):                         # standing stones
        h = [17, 22, 15, 19][i]
        b = ys[x] + 1
        s.d.rectangle([x, b - h, x + 6, b], fill=s.c('gg2'))
        s.d.rectangle([x + 1, b - h - 1, x + 5, b - h], fill=s.c('gg2'))
        s.d.line([(x + 6, b - h + 2), (x + 6, b)], fill=s.c('shadow'))
        if i != 2: s.crow(x + 1, b - h - 4, 'shadow')                   # crows that don't fly
    for x in [150, 171, 186, 203]:                                     # sheep lying, untouched
        y = ys[x] + 8 + (x % 5)
        s.d.ellipse([x, y, x + 8, y + 4], fill=s.c('bone'))
        s.d.rectangle([x + 7, y, x + 9, y + 2], fill=s.c('gg2'))
    s.ridge(116, 3, 40, 'straw', 3)
    for x in range(0, W, 1):                                           # long grass, all leaning one way: wind
        for _ in range(2):
            h = s.R.randint(5, 16); b = s.R.randint(118, 136)
            k = s.R.choice(['straw', 'gold', 'gg2', 'gg'])
            s.d.line([(x, b), (x + h // 4, b - h)], fill=s.c(k))
    sx, sb = 262, 118                                                  # the scarecrow, facing you
    s.d.line([(sx, sb), (sx, sb - 46)], fill=s.c('shadow'), width=2)
    s.d.line([(sx - 15, sb - 34), (sx + 15, sb - 36)], fill=s.c('shadow'), width=2)
    s.d.polygon([(sx - 7, sb - 33), (sx + 7, sb - 34), (sx + 9, sb - 12), (sx - 9, sb - 12)], fill=s.c('gg2'))
    s.d.ellipse([sx - 5, sb - 47, sx + 5, sb - 37], fill=s.c('straw'))
    s.d.polygon([(sx - 9, sb - 45), (sx + 9, sb - 45), (sx, sb - 55)], fill=s.c('shadow'))
    s.px(sx - 2, sb - 42, 'shadow'); s.px(sx + 2, sb - 42, 'shadow')
    for i in range(-3, 4): s.px(sx + i, sb - 39, 'shadow')              # stitched smile
    for i in range(6): s.d.line([(sx - 15 + i, sb - 34), (sx - 17 + i, sb - 26 + i % 3)], fill=s.c('straw'))
    s.crow(sx + 10, sb - 40, 'shadow')
    s.save('i1-grasslands')


def swamp():
    s = S(PAL['i2-swamp'], 22)
    s.grad(0, 82, ['b2', 'bruise', 'moss'])
    s.wound(250, 46, 10, 1.8, .6)
    s.fog(30, 70, 'bruise', .5, 2)
    ys = s.ridge(76, 6, 30, 'b2', 1, 4)
    for x in range(0, W, 7):                                           # dead treeline
        if s.R.random() < .6:
            h = s.R.randint(8, 22); s.d.line([(x, ys[x]), (x, ys[x] - h)], fill=s.c('b2'))
            s.d.line([(x, ys[x] - h + 4), (x + 3, ys[x] - h)], fill=s.c('b2'))
    s.fog(60, 92, 'moss', .55, 4, 17)
    s.d.rectangle([0, 88, W, H], fill=s.c('water'))
    for y in range(88, H, 3):                                          # still black water
        for x in range(s.R.randrange(6), W, s.R.randint(9, 22)):
            s.d.line([(x, y), (x + s.R.randint(2, 6), y)], fill=s.c('b2'))
    for hx_ in [60, 108]:                                              # stilt huts
        s.d.rectangle([hx_, 60, hx_ + 24, 72], fill=s.c('b2'))
        s.d.polygon([(hx_ - 4, 61), (hx_ + 12, 50), (hx_ + 28, 61)], fill=s.c('black'))
        s.d.rectangle([hx_ + 9, 64, hx_ + 13, 68], fill=s.c('sick'))
        for st in range(hx_ + 2, hx_ + 24, 7):
            s.d.line([(st, 72), (st, 92)], fill=s.c('black'))
            s.px(st, 80, 'b2'); s.px(st, 84, 'b2')                     # leeches
        s.d.line([(hx_ + 12, 72), (hx_ + 12, 94)], fill=s.c('black'))
    bx, by = 222, 92                                                   # the drowned chapel bell, half sunk
    s.d.chord([bx - 16, by - 22, bx + 16, by + 18], 180, 360, fill=s.c('moss'))
    s.d.rectangle([bx - 16, by - 2, bx + 16, by], fill=s.c('moss'))
    s.d.rectangle([bx - 3, by - 26, bx + 3, by - 21], fill=s.c('moss'))
    s.d.arc([bx - 16, by - 22, bx + 16, by + 18], 180, 360, fill=s.c('b2'))
    s.d.rectangle([bx - 19, by - 3, bx + 19, by], fill=s.c('b2'))
    s.d.line([(bx - 3, by - 26), (bx - 3, by - 40)], fill=s.c('black')); s.d.line([(bx + 3, by - 26), (bx + 3, by - 40)], fill=s.c('black'))
    for y in range(by - 20, by):
        for x in range(bx - 14, bx + 6):
            if s.on(x, y, .25): s.px(x, y, 'sick')
    for y in range(by, by + 6):
        for x in range(bx - 18, bx + 19):
            if s.on(x, y, .5): s.px(x, y, 'water')
    for (fx, fy) in [(150, 104), (186, 118), (88, 124)]:               # bog bodies, faces up
        s.d.ellipse([fx - 3, fy, fx + 22, fy + 5], fill=s.c('moss'))
        s.d.ellipse([fx - 4, fy - 1, fx + 4, fy + 4], fill=s.c('pale'))
        s.px(fx - 2, fy + 1, 'black'); s.px(fx + 1, fy + 1, 'black'); s.px(fx - 1, fy + 3, 'black')
    for (hx2, hy) in [(130, 112), (282, 108)]:                         # hands from the water
        s.d.line([(hx2, hy), (hx2 + 1, hy - 12)], fill=s.c('pale'), width=2)
        for f in range(-2, 3): s.d.line([(hx2 + f, hy - 12), (hx2 + f * 2, hy - 17)], fill=s.c('pale'))
    for (wx, wy) in [(176, 70), (40, 96), (300, 84)]:                  # marsh lanterns
        for y in range(wy - 7, wy + 8):
            for x in range(wx - 7, wx + 8):
                r = ((x - wx) ** 2 + (y - wy) ** 2) / 49
                if r < 1 and s.on(x, y, (1 - r) * .7): s.px(x, y, 'sick')
        s.d.rectangle([wx - 1, wy - 1, wx + 1, wy + 1], fill=s.c('pale'))
        for y in range(wy + 10, wy + 22, 2): s.px(wx + (y % 3) - 1, y, 'sick')
    for tx, lean in [(10, 1), (300, -1)]:                              # dead trees, hanging moss
        s.d.polygon([(tx - 4, H), (tx + 4, H), (tx + 3 + lean * 6, 0), (tx - 3 + lean * 6, 0)], fill=s.c('black'))
        for by2 in [14, 30, 44]:
            ex = tx + lean * 6 + (32 if lean > 0 else -32) * (1 if by2 != 30 else .7)
            s.d.line([(tx + lean * 5, by2), (ex, by2 - 6)], fill=s.c('black'), width=2)
            for mx in range(int(min(tx, ex)), int(max(tx, ex)), 2):
                L = s.R.randint(4, 22)
                s.d.line([(mx, by2 - 4), (mx, by2 - 4 + L)], fill=s.c(s.R.choice(['moss', 'moss', 'sick'])))
    s.save('i2-swamp')


def desert():
    s = S(PAL['i3-desert'], 33)
    s.grad(0, 92, ['haze', 'salt', 'salt', 'haze'])
    s.wound(176, 30, 18, 3.2, .8)
    for vx, vy in [(120, 22), (140, 16), (98, 30)]:                    # vultures circling
        s.d.line([(vx - 4, vy - 2), (vx, vy), (vx + 4, vy - 2)], fill=s.c('char'))
    s.ridge(80, 4, 70, 'haze', 1)
    s.ridge(86, 5, 50, 'sand', 2)
    s.fog(70, 96, 'haze', .5, 2)
    tx = 72                                                            # half-buried siege tower, leaning
    pts = [(tx, 92), (tx + 26, 92), (tx + 32, 34), (tx + 14, 30)]
    s.d.polygon(pts, fill=s.c('char'))
    for i in range(6):
        y = 86 - i * 9
        s.d.line([(tx + 4 + i, y), (tx + 25 + i * .8, y - 1)], fill=s.c('ash'))
    s.d.polygon([(tx + 14, 30), (tx + 20, 24), (tx + 24, 32)], fill=s.c('char'))
    for i, gx in enumerate(range(196, 262, 11)):                       # ribs of a granary
        h = 34 - abs(i - 3) * 3
        s.d.arc([gx - 2, 92 - h, gx + 22, 92 + h], 180, 270, fill=s.c('char'), width=2)
    ys = s.ridge(104, 7, 55, 'sand', 3)
    for x in range(W):                                                 # dune shading by slope
        sl = ys[min(W - 1, x + 1)] - ys[x]
        for y in range(ys[x], H):
            if sl > 0 and s.on(x, y, .55): s.px(x, y, 'ochre')
            elif s.on(x, y, (y - ys[x]) / 120): s.px(x, y, 'ochre')
    for gx, gy, gw in [(40, 118, 18), (150, 126, 26), (270, 114, 14)]: # glass where the fire was hottest
        s.d.ellipse([gx, gy, gx + gw, gy + 4], fill=s.c('glass'))
        s.px(gx + gw // 3, gy + 1, 'salt'); s.px(gx + gw // 3 + 1, gy + 1, 'salt')
    for bx in [110, 128, 210, 236]:                                    # the bones of the war
        by = s.R.randint(120, 132)
        s.d.line([(bx, by), (bx + 6, by - 1)], fill=s.c('salt'))
    s.d.ellipse([224, 124, 230, 129], fill=s.c('salt')); s.px(226, 126, 'char'); s.px(228, 126, 'char')
    s.d.line([(300, 132), (306, 112)], fill=s.c('char'), width=2)       # a buried banner pole
    s.d.polygon([(306, 112), (316, 116), (305, 119)], fill=s.c('ash'))
    for y in range(40, H):                                             # sand blowing across
        for x in range(W):
            if (x + y * 2) % 23 < 2 and s.on(x, y, .35): s.px(x, y, 'haze')
    s.save('i3-desert')


def mountains():
    s = S(PAL['i4-mountains'], 44)
    s.grad(0, H, ['dslate', 'slate', 'fog', 'fog'])
    s.fog(6, 44, 'slate', .6, 3)
    s.wound(150, 22, 26, 4.5, .9)
    for layer, (base, col, cap, seed) in enumerate([(70, 'slate', 'snow', 1), (84, 'dslate', 'fog', 2)]):
        f = s.noise(28 - layer * 8, 3, seed)
        for x in range(W):                                             # jagged ranges
            v = f(x); y = int(base - (v - .3) * (64 - layer * 20))
            s.d.line([(x, y), (x, H)], fill=s.c(col))
            for k in range(int(max(0, (60 - y) / 6)) + (1 if layer == 0 and y < 46 else 0)):
                if s.on(x, y + k, .8): s.px(x, y + k, cap)
        s.fog(base - 6, base + 30, 'fog', .4, 5 + layer, 13)
    mx, my = 214, 30                                                   # a monastery gone quiet, on the ridge
    s.d.rectangle([mx - 9, my, mx + 9, my + 9], fill=s.c('rock'))
    s.d.polygon([(mx - 13, my), (mx, my - 6), (mx + 13, my)], fill=s.c('black'))
    s.d.rectangle([mx - 3, my - 12, mx + 3, my - 6], fill=s.c('rock'))
    s.d.polygon([(mx - 6, my - 12), (mx, my - 17), (mx + 6, my - 12)], fill=s.c('black'))
    s.fog(70, 112, 'fog', .55, 5, 13)
    lc = [(0, 0), (52, 0), (60, 14), (56, 26), (70, 38), (66, 50), (84, 58), (92, 64), (86, 76), (98, 96), (90, 112), (100, H), (0, H)]
    rc = [(W, 4), (262, 8), (256, 22), (266, 34), (246, 46), (252, 58), (230, 66), (238, 82), (226, 100), (236, 118), (228, H), (W, H)]
    s.d.polygon(lc, fill=s.c('rock')); s.d.polygon(rc, fill=s.c('rock'))
    s.d.line(lc[1:10], fill=s.c('dslate')); s.d.line(rc[1:10], fill=s.c('dslate'))
    for (a, b, y) in [(40, 72, 38), (60, 92, 64), (2, 30, 58), (226, 258, 66), (246, 276, 46), (270, 318, 92)]:
        s.d.rectangle([a, y, b, y + 1], fill=s.c('snow'))              # snowed ledges
    gx = 24                                                            # a cliff shrine
    s.d.line([(gx, 58), (gx, 46)], fill=s.c('black'), width=2); s.d.line([(gx + 11, 58), (gx + 11, 46)], fill=s.c('black'), width=2)
    s.d.line([(gx - 3, 45), (gx + 14, 45)], fill=s.c('black'), width=2); s.d.line([(gx - 1, 49), (gx + 12, 49)], fill=s.c('black'))
    s.d.rectangle([gx + 3, 54, gx + 8, 57], fill=s.c('flag'))
    for x in range(92, 231):                                           # the rope bridge
        t = (x - 92) / 138
        y = 64 + 13 * math.sin(t * math.pi)
        s.px(x, y, 'black'); s.px(x, y - 7, 'black')
        if x % 4 == 0:
            s.d.line([(x, y), (x, y + 1)], fill=s.c('rock'))
            if x % 12 == 0: s.d.line([(x, y - 7), (x, y)], fill=s.c('black'))
        if 150 < x < 158: s.px(x, y + 1, 'fog')                        # a missing plank
    for i in range(1, 12):                                             # prayer flags, out across the drop
        t = i / 12
        fx = 60 + 166 * t; fy = 26 + 14 * math.sin(t * math.pi)
        s.d.polygon([(fx, fy), (fx + 4, fy), (fx + 2, fy + 5)], fill=s.c('flag' if i % 2 else 'snow'))
    for x in range(60, 226): s.px(x, 26 + 14 * math.sin((x - 60) / 166 * math.pi), 'black')
    s.fog(86, H + 30, 'fog', .97, 7, 19)                               # the floor below is a guess
    s.fog(100, H + 40, 'snow', .55, 8, 11)
    for i in range(4):                                                 # falling rock
        rx, ry = s.R.randint(232, 250), s.R.randint(70, 100)
        s.d.rectangle([rx, ry, rx + 1, ry + 1], fill=s.c('black'))
        s.d.line([(rx, ry - 2), (rx, ry - 6)], fill=s.c('slate'))
    hx_, hy = 74, 63                                                   # the hooded man at the bridgehead
    s.d.polygon([(hx_ - 3, hy), (hx_ + 3, hy), (hx_ + 2, hy - 9), (hx_, hy - 12), (hx_ - 2, hy - 9)], fill=s.c('black'))
    s.snow(260, 'snow')
    s.save('i4-mountains')

def fort():
    s = S(PAL['i5-fort'], 55)
    s.grad(0, 90, ['black', 'night', 'night2'])
    s.wound(190, 32, 42, 7, 1.2)
    s.ridge(84, 10, 40, 'night', 1)
    s.d.rectangle([28, 64, 300, 112], fill=s.c('dstone'))              # curtain wall
    for x in range(28, 300, 8): s.d.rectangle([x, 58, x + 4, 64], fill=s.c('dstone'))
    s.d.rectangle([60, 36, 96, 112], fill=s.c('stone'))                # gatehouse
    for x in range(60, 96, 8): s.d.rectangle([x, 30, x + 4, 36], fill=s.c('stone'))
    s.d.rectangle([236, 26, 270, 112], fill=s.c('stone'))              # keep
    for x in range(236, 270, 8): s.d.rectangle([x, 20, x + 4, 26], fill=s.c('stone'))
    for y in range(26, 112, 5):                                        # coursed stone
        for x in range(28, 300):
            if (x + (y // 5) * 6) % 13 == 0 or y % 5 == 0:
                if s.on(x, y, .5) and s.im.getpixel((x, y)) != s.P['night2']:
                    cur = s.im.getpixel((x, y))
                    s.px(x, y, 'dstone' if cur == s.P['stone'] else 'night2')
    s.d.chord([68, 86, 88, 120], 180, 360, fill=s.c('black')); s.d.rectangle([68, 103, 88, 112], fill=s.c('black'))
    s.d.rectangle([250, 44, 255, 52], fill=s.c('ember'))               # one lit window
    for bx in [120, 170, 210]:                                         # ballistae
        s.d.line([(bx - 7, 54), (bx, 50), (bx + 7, 54)], fill=s.c('black'), width=1)
        s.d.line([(bx, 50), (bx + 3, 58)], fill=s.c('black'), width=2)
    for fx in [104, 150, 226, 286]:                                    # braziers
        for y in range(48, 62):
            for x in range(fx - 7, fx + 8):
                r = ((x - fx) ** 2 + (y - 55) ** 2) / 49
                if r < 1 and s.on(x, y, (1 - r) * .6): s.px(x, y, 'ember')
        s.d.rectangle([fx - 1, 54, fx + 1, 57], fill=s.c('red'))
    for x in range(28, 300):                                           # snow on the tops
        for y0 in (58, 30, 20):
            p = s.im.getpixel((x, y0))
            if p in (s.P['dstone'], s.P['stone']): s.px(x, y0, 'snow')
    s.d.rectangle([0, 112, W, H], fill=s.c('snow'))
    for x in range(W):
        for y in range(112, 118):
            if s.on(x, y, 1 - (y - 112) / 6): s.px(x, y, 'stone')
    hx_, hy = 150, 132                                                 # the hooded man, looking up at it
    s.d.polygon([(hx_ - 4, hy), (hx_ + 4, hy), (hx_ + 3, hy - 12), (hx_, hy - 16), (hx_ - 3, hy - 12)], fill=s.c('black'))
    s.d.line([(hx_ + 4, hy - 9), (hx_ + 9, hy - 1)], fill=s.c('dstone'))
    s.snow(420, 'snow', 0, 112)
    s.save('i5-fort')


def villages():
    s = S(PAL['ii1-villages'], 66)
    s.grad(0, 86, ['night', 'plum', 'dusk2', 'dusk'])
    s.wound(262, 22, 30, 5.5, 1)
    s.d.rectangle([0, 58, W, 76], fill=s.c('night'))                   # the city wall behind
    for x in range(0, W, 7): s.d.rectangle([x, 54, x + 3, 58], fill=s.c('night'))
    for tx in [30, 120, 210, 290]:
        s.d.rectangle([tx - 7, 40, tx + 7, 76], fill=s.c('night'))
        s.d.polygon([(tx - 3, 42), (tx + 3, 42), (tx + 3, 58), (tx, 55), (tx - 3, 58)], fill=s.c('black'))  # black banner
    s.d.rectangle([0, 76, W, H], fill=s.c('wheat'))
    doors = []
    for i, x in enumerate(range(6, 314, 31)):                          # cottages
        h = 14 + (i % 3) * 3
        s.d.rectangle([x, 92 - h, x + 24, 92], fill=s.c('plum'))
        s.d.polygon([(x - 3, 92 - h), (x + 12, 92 - h - 11), (x + 27, 92 - h)], fill=s.c('night'))
        s.d.rectangle([x + 3, 92 - h + 4, x + 7, 92 - h + 7], fill=s.c('dusk'))
        doors.append((x + 14, 92))
    for i, (dx, dy) in enumerate(doors):                               # every tenth door
        s.d.rectangle([dx, dy - 8, dx + 5, dy], fill=s.c('night'))
        if i == 6:
            s.d.line([(dx, dy - 8), (dx + 5, dy)], fill=s.c('red'), width=1); s.d.line([(dx + 5, dy - 8), (dx, dy)], fill=s.c('red'))
    for a, b in [(0, 60), (60, 130), (190, 250), (250, 320)]:          # bunting
        for x in range(a, b):
            t = (x - a) / (b - a); y = 64 + 7 * math.sin(t * math.pi)
            s.px(x, y, 'cloth')
            if (x - a) % 5 == 0:
                s.d.polygon([(x, y), (x + 3, y), (x + 1, y + 3)], fill=s.c('cloth' if (x // 5) % 2 else 'straw'))
    mx = 160                                                           # the maypole
    s.d.line([(mx, 112), (mx, 46)], fill=s.c('straw'), width=2)
    s.d.ellipse([mx - 4, 42, mx + 4, 48], fill=s.c('cloth'))
    for i, ex in enumerate([118, 132, 146, 174, 188, 202]):
        s.d.line([(mx, 48), (ex, 108)], fill=s.c(['cloth', 'straw', 'dusk'][i % 3]))
    for i, fx in enumerate([116, 130, 145, 176, 190, 204, 96, 226]):   # townsfolk: stopped, all facing you
        s.figure(fx, 112 + (i % 2) * 2, 'plum' if i % 2 else 'night', 'cloth', 10, 'night')
    s.d.rectangle([0, 112, W, H], fill=s.c('wheat'))
    for x in range(W):                                                 # wheat
        for _ in range(2):
            h = s.R.randint(4, 14); b = s.R.randint(116, 136)
            s.d.line([(x, b), (x, b - h)], fill=s.c(s.R.choice(['straw', 'straw', 'wheat', 'dusk2'])))
            s.px(x, b - h, 'straw')
    for i, fx in enumerate([116, 130, 145, 176, 190, 204, 96, 226]):
        s.figure(fx, 112 + (i % 2) * 2, 'plum' if i % 2 else 'night', 'cloth', 10, 'night')
    s.save('ii1-villages')


def slums():
    s = S(PAL['ii2-slums'], 77)
    s.grad(0, 114, ['black', 'sewer', 'black'])
    s.wound(156, 10, 12, 2.2, .7)
    for x0, x1, top in [(126, 140, 40), (140, 158, 34), (158, 172, 44), (172, 186, 38)]:  # the far end of the alley
        s.d.rectangle([x0, top, x1 - 1, 114], fill=s.c('mud'))
        s.d.polygon([(x0 - 1, top), ((x0 + x1) // 2, top - 6), (x1, top)], fill=s.c('black'))
        s.d.rectangle([x0 + 4, top + 8, x0 + 7, top + 12], fill=s.c('rot'))
    s.fog(40, 114, 'sewer', .6, 2)
    s.d.polygon([(0, 0), (118, 0), (126, 30), (110, 44), (122, 70), (112, 114), (0, 114)], fill=s.c('brown'))  # leaning houses
    s.d.polygon([(W, 0), (186, 0), (178, 26), (196, 40), (184, 76), (198, 114), (W, 114)], fill=s.c('mud'))
    for y in range(0, 114):                                            # rotten beams
        for x in range(W):
            p = s.im.getpixel((x, y))
            if p in (s.P['brown'],) and (y % 18 == 0 or (x * 7 + y // 18 * 11) % 41 == 0): s.px(x, y, 'black')
            elif p == s.P['mud'] and x > 178 and (y % 18 == 0 or (x * 7 + y // 18 * 11) % 41 == 0): s.px(x, y, 'black')
    for x in range(W):                                                 # damp creeping up the walls
        for y in range(80, 114):
            p = s.im.getpixel((x, y))
            if p in (s.P['brown'], s.P['mud']) and s.on(x, y, (y - 80) / 50): s.px(x, y, 'rot')
    for wx, wy in [(20, 14), (60, 22), (90, 50), (30, 70), (220, 30), (260, 12), (280, 60), (214, 84)]:
        s.d.rectangle([wx, wy, wx + 9, wy + 7], fill=s.c('black'))
        s.d.line([(wx, wy + 8), (wx + 9, wy + 8)], fill=s.c('rot'))
    for ly, a, b in [(24, 120, 186), (46, 112, 196), (68, 116, 190)]:  # laundry across the alley
        for x in range(a, b):
            y = ly + 6 * math.sin((x - a) / (b - a) * math.pi); s.px(x, y, 'grey')
            if (x - a) % 13 == 4:
                w_ = s.R.randint(5, 9); h_ = s.R.randint(7, 13)
                s.d.rectangle([x, y, x + w_, y + h_], fill=s.c(s.R.choice(['grey', 'cream', 'rot'])))
    lx, ly2 = 182, 88                                                  # a tithe-lantern
    for y in range(ly2 - 14, ly2 + 15):
        for x in range(lx - 14, lx + 15):
            r = ((x - lx) ** 2 + (y - ly2) ** 2) / 196
            if r < 1 and s.on(x, y, (1 - r) * .7): s.px(x, y, 'dred')
    s.d.line([(lx, 80), (196, 76)], fill=s.c('black'))
    s.d.rectangle([lx - 2, ly2 - 3, lx + 2, ly2 + 3], fill=s.c('red'))
    s.d.rectangle([0, 114, W, H], fill=s.c('mud'))
    s.d.polygon([(132, 114), (182, 114), (230, H), (90, H)], fill=s.c('sewer'))  # the open sewer
    for y in range(116, H, 3):
        for x in range(100, 230, s.R.randint(7, 15)):
            if s.R.random() < .6: s.d.line([(x, y), (x + 3, y)], fill=s.c('rot'))
    for rx in [28, 44, 52, 240, 262]:                                  # rats
        s.d.rectangle([rx, 110, rx + 4, 113], fill=s.c('black'))
        s.px(rx + 5, 111, 'black'); s.d.line([(rx, 113), (rx - 4, 114)], fill=s.c('black'))
    s.d.ellipse([60, 98, 80, 116], fill=s.c('rot'))                    # a bloated beggar
    s.d.ellipse([65, 90, 75, 100], fill=s.c('cream'))
    s.px(68, 94, 'black'); s.px(72, 94, 'black')
    s.d.ellipse([268, 108, 296, 120], fill=s.c('brown'))               # a heap, crawling
    for _ in range(40): s.px(s.R.randint(270, 294), s.R.randint(108, 118), 'cream')
    for y in range(H):                                                 # close, airless
        for x in range(W):
            r = ((x - 160) / 170) ** 2 + ((y - 70) / 76) ** 2
            if r > .8 and s.on(x, y, (r - .8) * 1.4): s.px(x, y, 'black')
    s.save('ii2-slums')

def oldcity():
    s = S(PAL['ii3-oldcity'], 88)
    s.grad(0, 90, ['black', 'sky', 'sky2'])
    s.wound(70, 22, 22, 4, .8)
    cx = 168                                                           # cathedral spire
    s.d.polygon([(cx - 4, 0), (cx + 4, 0), (cx + 8, 30), (cx - 8, 30)], fill=s.c('slate'))
    s.d.line([(cx, 0), (cx, 3)], fill=s.c('stone'))
    s.d.rectangle([cx - 22, 30, cx + 22, 92], fill=s.c('slate'))
    s.d.polygon([(cx - 26, 34), (cx, 18), (cx + 26, 34)], fill=s.c('slate'))
    s.d.ellipse([cx - 8, 40, cx + 8, 56], fill=s.c('torch'))
    s.d.line([(cx - 8, 48), (cx + 8, 48)], fill=s.c('slate')); s.d.line([(cx, 40), (cx, 56)], fill=s.c('slate'))
    for x0, x1, top in [(0, 60, 44), (60, 120, 52), (210, 262, 48), (262, 320, 40)]:  # timber facades
        s.d.rectangle([x0, top, x1 - 2, 100], fill=s.c('plaster'))
        s.d.polygon([(x0 - 2, top), ((x0 + x1) // 2, top - 16), (x1, top)], fill=s.c('slate'))
        for bx in range(x0, x1, 12): s.d.line([(bx, top), (bx, 100)], fill=s.c('black'))
        s.d.line([(x0, top + 18), (x1 - 2, top + 18)], fill=s.c('black'))
        for wx in range(x0 + 4, x1 - 8, 12):
            s.d.rectangle([wx, top + 6, wx + 4, top + 12], fill=s.c('torch' if (wx // 12) % 3 else 'black'))
    for px_ in [24, 236]:                                              # Cassian's portrait, on every wall
        s.d.rectangle([px_, 72, px_ + 14, 90], fill=s.c('torch'))
        s.d.rectangle([px_ + 2, 74, px_ + 12, 88], fill=s.c('slate'))
        s.d.ellipse([px_ + 4, 76, px_ + 10, 84], fill=s.c('plaster'))
        s.px(px_ + 6, 79, 'black'); s.px(px_ + 8, 79, 'black')
        s.d.rectangle([px_ + 3, 84, px_ + 11, 88], fill=s.c('black'))
    for sx_, sy_ in [(62, 62), (122, 66), (208, 60)]:                  # shop signs
        s.d.line([(sx_, sy_), (sx_ + 10, sy_)], fill=s.c('black'))
        s.d.rectangle([sx_ + 3, sy_ + 2, sx_ + 11, sy_ + 9], fill=s.c('stone'))
        s.px(sx_ + 7, sy_ + 5, 'black')
    s.d.rectangle([0, 100, W, H], fill=s.c('slate'))
    for y in range(100, H):                                            # cobbles
        for x in range(W):
            if (x + (y // 3) * 3) % 6 == 0 or y % 3 == 0: s.px(x, y, 'sky2')
            elif s.on(x, y, .15): s.px(x, y, 'stone')
    for ax in [80, 120, 214]:                                          # market stalls
        s.d.rectangle([ax, 94, ax + 24, 108], fill=s.c('black'))
        for i in range(0, 28, 4):
            s.d.polygon([(ax - 2 + i, 88), (ax + 2 + i, 88), (ax + 3 + i, 95), (ax - 1 + i, 95)], fill=s.c('plaster' if i % 8 else 'stone'))
    for y in range(90, 136):                                           # warm torchlight pooled on the square
        for x in range(100, 240):
            r = ((x - 168) / 70) ** 2 + ((y - 112) / 22) ** 2
            if r < 1 and s.on(x, y, (1 - r) * .35): s.px(x, y, 'torch')
    s.d.line([(290, 136), (290, 92)], fill=s.c('black'), width=2)     # a tithe-lantern on a post
    s.d.rectangle([287, 90, 293, 96], fill=s.c('red'))
    s.figure(268, 126, 'black', 'stone', 14)                           # the watch, too still
    s.d.line([(272, 126), (272, 104)], fill=s.c('black')); s.d.polygon([(270, 104), (275, 106), (272, 100)], fill=s.c('stone'))
    s.save('ii3-oldcity')


def royal():
    s = S(PAL['ii4-royal'], 99)
    s.d.rectangle([0, 0, W, 96], fill=s.c('wine'))
    for y in range(0, 96):                                             # damask
        for x in range(W):
            if ((x // 8 + y // 8) % 2 == 0) and (x % 8 in (3, 4)) and (y % 8 in (2, 5)): s.px(x, y, 'dgold')
    s.d.rectangle([0, 0, W, 8], fill=s.c('black'))
    for fx in [26, 120, 214]:                                          # portraits that bleed
        s.d.rectangle([fx, 18, fx + 40, 64], fill=s.c('gold'))
        s.d.rectangle([fx + 3, 21, fx + 37, 61], fill=s.c('black'))
        s.d.ellipse([fx + 11, 26, fx + 29, 48], fill=s.c('white'))
        s.d.rectangle([fx + 9, 48, fx + 31, 61], fill=s.c('dgold'))
        for ex in (fx + 15, fx + 24):
            s.d.rectangle([ex, 34, ex + 1, 35], fill=s.c('black'))
            s.d.line([(ex, 36), (ex + (ex % 2), 74 + (ex % 9))], fill=s.c('red'))
    cx = 160                                                           # chandelier
    s.d.line([(cx, 0), (cx, 10)], fill=s.c('dgold'))
    s.d.arc([cx - 30, 4, cx + 30, 18], 0, 180, fill=s.c('gold'), width=2)
    for x in range(cx - 28, cx + 29, 8):
        s.d.line([(x, 11), (x, 14)], fill=s.c('candle')); s.px(x, 10, 'red')
    s.d.rectangle([0, 96, W, H], fill=s.c('black'))
    for y in range(96, H):                                             # floor in perspective
        for x in range(W):
            u = (x - 160) * 30 / (y - 80); v = 400 / (y - 80)
            if (int(u // 8) + int(v)) % 2 == 0 and s.on(x, y, .5): s.px(x, y, 'dgold')
    for dx_, dy_, pose in [(80, 92, 1), (118, 86, -1), (204, 90, 1), (244, 84, -1)]:  # dancers on strings
        s.d.line([(dx_ - 4, dy_ - 22), (dx_ + 4, dy_ - 22)], fill=s.c('black'))
        for sx_ in (dx_ - 6, dx_, dx_ + 6): s.d.line([(sx_, 0), (sx_, dy_ - 18)], fill=s.c('candle'))
        s.d.polygon([(dx_ - 5, dy_), (dx_ + 5, dy_), (dx_ + 2, dy_ - 14), (dx_ - 2, dy_ - 14)], fill=s.c('black'))
        s.d.ellipse([dx_ - 2, dy_ - 19, dx_ + 2, dy_ - 14], fill=s.c('white'))
        s.d.line([(dx_ - 2, dy_ - 12), (dx_ - 6, dy_ - 18)], fill=s.c('black'))
        s.d.line([(dx_ + 2, dy_ - 12), (dx_ + 6, dy_ - 18 + pose * 4)], fill=s.c('black'))
        s.d.line([(dx_ - 1, dy_), (dx_ - 3 * pose, dy_ + 7)], fill=s.c('black'))
        s.d.line([(dx_ + 1, dy_), (dx_ + 2, dy_ + 7)], fill=s.c('black'))
    s.figure(296, 100, 'black', 'white', 22)                           # a servant with black eyes
    s.px(295, 80, 'black'); s.px(297, 80, 'black')
    s.d.rectangle([292, 82, 300, 100], fill=s.c('black'))
    s.d.polygon([(20, 112), (300, 112), (316, 136), (4, 136)], fill=s.c('wine'))  # the feast gone to rot
    s.d.line([(20, 112), (300, 112)], fill=s.c('dgold'))
    for i, x in enumerate(range(30, 296, 22)):
        s.d.ellipse([x, 108, x + 14, 116], fill=s.c(['dgold', 'wine', 'black'][i % 3]))
        s.d.ellipse([x + 2, 109, x + 12, 114], fill=s.c(['gold', 'dred', 'dgold'][i % 3]))
        if i % 2:
            s.d.line([(x + 18, 112), (x + 18, 102)], fill=s.c('candle')); s.px(x + 18, 101, 'red')
    for _ in range(80): s.px(s.R.randint(24, 296), s.R.randint(106, 118), 'white')  # maggots
    for y in range(H):                                                 # vignette
        for x in range(W):
            r = ((x - 160) / 175) ** 2 + ((y - 68) / 80) ** 2
            if r > .7 and s.on(x, y, (r - .7) * 1.6): s.px(x, y, 'black')
    s.save('ii4-royal')


def bridge():
    s = S(PAL['ii5-bridge'], 101)
    s.grad(0, 84, ['black', 'sky2', 'red', 'red'])
    s.wound(160, 18, 60, 9, .9)
    for tx, h in [(110, 34), (130, 46), (190, 50), (212, 30), (160, 24)]:  # palace beyond
        s.d.rectangle([tx - 6, 84 - h, tx + 6, 84], fill=s.c('black'))
        s.d.polygon([(tx - 8, 84 - h), (tx, 84 - h - 12), (tx + 8, 84 - h)], fill=s.c('black'))
    s.d.rectangle([90, 64, 230, 84], fill=s.c('black'))
    s.d.rectangle([140, 52, 180, 84], fill=s.c('black'))               # the gatehouse
    for i, (pkx, sz) in enumerate([(148, 2), (160, 3), (172, 2)]):     # the gate of pikes
        s.d.line([(pkx, 52), (pkx, 30)], fill=s.c('black'))
        s.d.ellipse([pkx - sz, 30 - sz * 2, pkx + sz, 30], fill=s.c('black'))
    s.d.rectangle([0, 84, W, H], fill=s.c('black'))
    vx, vy = 160, 80                                                   # bridge, converging on the gate
    s.d.polygon([(150, 80), (170, 80), (290, H), (30, H)], fill=s.c('dstone'))
    for y in range(81, H):
        t = (y - 80) / (H - 80)
        for x in range(int(150 - 120 * t), int(170 + 120 * t)):
            if (y * y) % 7 == 0 or s.on(x, y, .12): s.px(x, y, 'stone')
    for side in (-1, 1):                                               # statues, then torches
        for k in range(6):
            t = .12 + k * .17
            x = 160 + side * (10 + 128 * t); y = 80 + (H - 80) * t
            hgt = 6 + 30 * t
            s.d.rectangle([x - hgt * .12, y - hgt, x + hgt * .12, y], fill=s.c('black'))
            s.d.line([(x, y - hgt), (x + side * hgt * .3, y - hgt * 1.3)], fill=s.c('black'), width=max(1, int(t * 2)))
            if k % 2:
                tx_ = x + side * hgt * .35
                for yy in range(int(y - hgt * .8 - 6), int(y - hgt * .8 + 7)):
                    for xx in range(int(tx_ - 6), int(tx_ + 7)):
                        r = ((xx - tx_) ** 2 + (yy - (y - hgt * .8)) ** 2) / 36
                        if r < 1 and s.on(xx, yy, (1 - r) * .7): s.px(xx, yy, 'torch')
    hx_, hy = 146, 126                                                 # Tomas's horse and a broken candle
    s.d.rectangle([hx_, hy, hx_ + 10, hy + 4], fill=s.c('paper'))
    s.d.line([(hx_ + 1, hy + 4), (hx_ + 1, hy + 7)], fill=s.c('paper')); s.d.line([(hx_ + 9, hy + 4), (hx_ + 9, hy + 7)], fill=s.c('paper'))
    s.d.rectangle([hx_ + 9, hy - 4, hx_ + 13, hy], fill=s.c('paper')); s.px(hx_ + 11, hy - 3, 'black')
    s.d.rectangle([168, 130, 176, 132], fill=s.c('paper')); s.d.rectangle([178, 129, 181, 132], fill=s.c('paper'))
    s.save('ii5-bridge')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for f in (grasslands, swamp, desert, mountains, fort, villages, slums, oldcity, royal, bridge):
        f()
    json.dump(PAL, open(f'{OUT}/palettes.json', 'w'), indent=1)
    print('ok')
