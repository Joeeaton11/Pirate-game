"""Tortuga plan, third sheet (design review, Nov 2026). Imported at the end of plan_tortuga.py.

- The Ruins of the Old Landing: the first Tortuga settlement, razed by the Spanish in 1635/1638.
- The Wreck of the Bonne Espérance on the reef shoal.
- Two curved harbour moles with a light on each tip (the harbour mouth between them).
- Skull Rock pulled in to the grotto cliffs.
- New places for the empty land: an orchard and windmill, a quarry, a duelling ground, Gibbet Hill.
- Terraces: stone retaining walls round the high ground, with stairs where roads climb.
- Dead-end roads joined up.
"""
import math

# ---- Ruins of the Old Landing: roofless houses on two overgrown streets, a ruined chapel with its
# broken bell tower by the Forgotten Graves, the tumbled town wall and gatehouse, the rotten quay.
EXTRA_BUILDINGS = [
    (None, 'Ruined House', 'ruin', -46, 434, 16, 13, None),
    (None, 'Ruined House', 'ruin', -24, 434, 14, 12, None),
    (None, 'Ruined House', 'ruin', -2, 432, 16, 13, None),
    (None, 'Ruined House', 'ruin', -10, 468, 16, 12, None),
    (None, 'Ruined House', 'ruin', 12, 466, 14, 12, None),
    (None, 'Ruined House', 'ruin', 34, 462, 14, 12, None),
    (None, 'Ruined Chapel', 'ruin', 84, 416, 22, 15, None),
    (None, 'Bell Tower', 'ruin_tower', 100, 413, 7, 7, None),
    (None, 'Gatehouse Ruin', 'ruin_tower', -77, 404, 7, 7, None),
    (None, 'Gatehouse Ruin', 'ruin_tower', -47, 404, 7, 7, None),
    # New places on the empty land.
    (None, 'Windmill', 'windmill', -196, 14, 12, 12, 'S'),
    (None, 'Quarry Hut', 'shed', -186, -204, 14, 10, 'S'),
]

EXTRA_ROADS = [
    ('Old Landing Street', 'ruinlane', 5, [(-66, 450), (-30, 452), (10, 450), (54, 444)]),
    ('Chapel Lane', 'ruinlane', 4, [(10, 450), (40, 432), (72, 426)]),
    ('Mill Track', 'path', 4, [(-232, -58), (-222, -20), (-214, 26), (-196, 26)]),
    ('Quarry Road', 'path', 4, [(-150, -222), (-170, -196), (-186, -196)]),
    ('Duelling Path', 'path', 3, [(-140, 342), (-150, 300), (-160, 262)]),
    ('Gibbet Path', 'path', 3, [(-266, -372), (-246, -384)]),
]
# Dead ends joined up (replacements keep the road's name).
ROAD_REPLACE = {
    'Cache Path': ('Cache Path', 'path', 4, [(330, 252), (322, 292), (322, 334), (304, 333)]),
    "Suzette's Path": ("Suzette's Path", 'path', 4, [(520, -18), (512, 10), (498, 40), (500, 96), (494, 118)]),
    'Rope Bridge': ('Rope Bridge', 'path', 3, [(432, -70), (472, -40), (476, -22)]),
    'Rocher Row': ('Rocher Row', 'lane', 6, [(366, -262), (418, -262)]),
}

EXTRA_ZONES = [
    ('orchard', [(-134, 48), (-56, 48), (-56, 96), (-134, 96)]),
    ('quarry', [(-236, -222), (-198, -222), (-198, -188), (-236, -188)]),
]
EXTRA_PLAZAS = [
    ('Old Landing Square', -40, -20, 454, 466),
    ('Duelling Ground', -176, -144, 236, 262),
]
EXTRA_LABELS = [
    (-10, 402, 'RUINS OF THE OLD LANDING', 'district'), (84, 402, 'Ruined Chapel', 'place'),
    (505, -318, 'Wreck of the Bonne Espérance', 'place'), (-95, 42, 'Old Orchard', 'place'),
    (-205, -6, 'Windmill', 'place'), (-217, -230, 'Quarry', 'place'), (-160, 230, 'Duelling Ground', 'place'),
    (-232, -402, 'Gibbet Hill', 'place'), (-60, -510, 'West Mole', 'place'), (140, -510, 'East Mole', 'place'),
]

# Orchard: fruit trees in rows.
ORCHARD_TREES = [(x, y, 'tree') for x in range(-126, -58, 10) for y in range(56, 94, 12)]

EXTRA_PROPS2 = [
    # Wreck of the Bonne Espérance, hard on the reef shoal.
    ('wreck_ship', 505, -296),
    # Harbour lights on the mole tips.
    ('harbour_light', -58, -472), ('harbour_light', 58, -474),
    # Ruins: rubble, fallen columns, tumbled wall, a dry well, the scavenger's camp, rotten quay.
    ('rubble', -36, 446), ('rubble', 22, 444), ('rubble', -60, 462), ('rubble', 46, 470), ('rubble', 70, 432),
    ('ruin_wall', -96, 398), ('ruin_wall', -40, 398), ('ruin_wall', -20, 400), ('ruin_wall', 10, 402),
    ('dry_well', -30, 460), ('tent', -118, 468), ('campfire', -108, 474), ('crates', -124, 476),
    ('pilings', -60, 496), ('pilings', -20, 500), ('pilings', 6, 494), ('chest', 58, 470), ('chest', -84, 470),
    # Quarry, orchard, windmill, duelling ground, Gibbet Hill.
    ('crane', -200, -214), ('rubble', -228, -196), ('cart', -190, -190), ('rubble', -212, -192),
    ('cart', -60, 100), ('haystack', -140, 100), ('bench', -150, 232), ('bench', -170, 266), ('signpost', -150, 300),
    ('gibbet', -240, -390), ('signpost', -256, -378),
    # Dead ends finished off.
    ('boat', -556, -50), ('bench', 424, -262),
]
SKULL_ROCK_AT = (-466, 374)
EXTRA_DIGS = [
    ('dig_chapel', 'Ruined Chapel', 84, 416, 14, 'E', 40, 'Chalked on the altar stone: "Fourteen paces toward the dawn."'),
]

# ---- Harbour moles: two curved stone arms with the harbour mouth between their lights.
MOLES = [
    [(-214, -476), (-170, -490), (-120, -488), (-58, -472)],
    [(330, -440), (260, -476), (170, -490), (100, -484), (58, -474)],
]
NEW_LANES = [
    ('East Channel', [(-10, -432), (0, -490), (60, -530), (200, -548), (450, -570)]),
    ('West Channel', [(-10, -432), (-20, -495), (-120, -535), (-300, -575)]),
    ('South Anchorage', [(196, 480), (214, 540), (230, 580)]),
]

# ---- Terraces: the high ground gets stone retaining walls on its south faces (the faces the
# camera sees), with stairs wherever a road or path climbs. (cx, cy, rx, ry) ellipses.
TERRACES = [
    (500, -30, 70, 64),     # the High Woods plateau
    (-240, -430, 30, 46),   # Lighthouse Head
    (368, -372, 40, 30),    # the fort's crag
    (-40, 230, 92, 56),     # Blackwood ridge
    (-445, 320, 34, 32),    # grotto cliffs
]
