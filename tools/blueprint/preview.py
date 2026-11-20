"""Draw the blueprint to a PNG (for review in chat)."""
from PIL import Image, ImageDraw, ImageFont
from palette import PAL
def hexc(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def draw(path, coast, beach, zones, water, P, town_rects, town_bldgs, doors, trees, door_point, scale=1.6, bridges=None, sea_zones=(), pois=()):
    X0, Y0, W, H = -620, -540, 1240, 1080
    im = Image.new('RGB', (int(W * scale), int(H * scale)), hexc(PAL['sea']))
    d = ImageDraw.Draw(im)
    T = lambda x, y: ((x - X0) * scale, (y - Y0) * scale)
    def poly(g, col):
        gs = [g] if g.geom_type == 'Polygon' else list(getattr(g, 'geoms', []))
        for p in gs:
            if p.geom_type != 'Polygon' or p.is_empty: continue
            d.polygon([T(*c) for c in p.exterior.coords], fill=hexc(col))
            for h in p.interiors: d.polygon([T(*c) for c in h.coords], fill=hexc(PAL['grass']))
    for t, g in sea_zones: poly(g, PAL[t])
    poly(coast, PAL['grass']); poly(beach, PAL['beach'])
    for t, g in zones: poly(g, PAL[t])
    poly(water, PAL['water'])
    for name, k, w, pts in P.ROADS:  # dark edging under every road
        d.line([T(*p) for p in pts], fill=(120, 92, 62), width=max(3, int((w + 1.6) * scale)), joint='curve')
    for name, k, w, pts in P.ROADS:
        d.line([T(*p) for p in pts], fill=hexc(PAL[k]), width=max(2, int(w * scale)), joint='curve')
        for p in pts: r = w * scale / 2; d.ellipse([T(*p)[0] - r, T(*p)[1] - r, T(*p)[0] + r, T(*p)[1] + r], fill=hexc(PAL[k]))
    if bridges is not None: poly(bridges, PAL['bridge'])
    for _, l, r, t, b in P.PLAZAS: d.rectangle([T(l, t), T(r, b)], fill=hexc(PAL['plaza']))
    for k, col in (('street', 'street'), ('wood', 'wood'), ('water', 'townwater'), ('garden', 'towngarden'), ('sand', 'beach')):
        for l, r, t, b in town_rects[k]: d.rectangle([T(l, t), T(r, b)], fill=hexc(PAL[col]))
    for l, r, t, b in town_bldgs: d.rectangle([T(l, t), T(r, b)], fill=hexc(PAL['b_town']), outline=hexc(PAL['outline']))
    for _, x, y in doors: d.rectangle([T(x - 2, y - 1.5), T(x + 2, y + 1.5)], fill=hexc(PAL['door']))
    for x, y, k in trees:
        r = {'jungle': 4, 'tree': 5, 'palm': 3.5, 'rock': 4, 'mangrove': 3.5}[k] * scale
        cx, cy = T(x, y); d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=hexc(PAL['t_' + k]))
    try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 11)
    except Exception: f = None
    for b in P.BUILDINGS:
        _, label, kind, cx, cy, w, h, side = b
        d.rectangle([T(cx - w / 2, cy - h / 2), T(cx + w / 2, cy + h / 2)], fill=hexc(PAL['b_' + kind]), outline=hexc(PAL['outline']), width=2)
        dp = door_point(b)
        if dp: d.rectangle([T(dp[0] - 2.5, dp[1] - 2.5), T(dp[0] + 2.5, dp[1] + 2.5)], fill=hexc(PAL['door']))
    for k, x, y in P.PROPS:
        cx, cy = T(x, y); d.rectangle([cx - 2, cy - 2, cx + 2, cy + 2], fill=(60, 40, 20))
    for k, pid, x, y in pois:
        cx, cy = T(x, y); r = 6
        if k == 'quest': d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=hexc(PAL['poi_quest']), outline=(255, 255, 255), width=2)
        else: d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=hexc(PAL['poi_' + k]), outline=(40, 30, 20))
    for x, y, t, s in P.LABELS:
        fz = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15 if s == 'district' else 11) if f else None
        cx, cy = T(x, y); tw = d.textlength(t, font=fz)
        d.text((cx - tw / 2 + 1, cy + 1), t, fill=(255, 255, 255), font=fz); d.text((cx - tw / 2, cy), t, fill=hexc(PAL['label']), font=fz)
    # legend
    items = [('Grass', 'grass'), ('Beach', 'beach'), ('Jungle', 'jungle'), ('Woods', 'forest'), ('Fields', 'fields'),
             ('Rock', 'rock'), ('Swamp', 'swamp'), ('Palm grove', 'palms'), ('Sugarcane', 'sugarcane'), ('Reef', 'reef'),
             ('Water', 'water'), ('Bridge', 'bridge'), ('Road', 'main'), ('Square / street', 'plaza'), ('Pier / wharf', 'wood'),
             ('Shop', 'b_shop'), ('Tavern', 'b_tavern'), ('Civic', 'b_civic'), ('Warehouse', 'b_warehouse'), ('Home', 'b_home'),
             ('Town building', 'b_town'), ('Door (enter)', 'door'), ('Treasure / landmark', 'poi_treasure'),
             ('Resource', 'poi_resource'), ('Quest', 'poi_quest')]
    fl = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13) if f else None
    lx, ly = 14, im.height - 16 - 20 * len(items)
    d.rectangle([lx - 8, ly - 30, lx + 170, im.height - 8], fill=(250, 245, 230), outline=(60, 40, 20), width=2)
    d.text((lx, ly - 24), 'TORTUGA BLUEPRINT', fill=(30, 40, 70), font=fl)
    for i, (n, k) in enumerate(items):
        y = ly + i * 20
        d.rectangle([lx, y, lx + 18, y + 14], fill=hexc(PAL[k]), outline=(60, 40, 20))
        d.text((lx + 26, y), n, fill=(40, 30, 20), font=fl)
    im.save(path)
