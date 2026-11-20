"""The authored blueprint for Tortuga, outside the painted town (island-relative world units).
Layers, bottom to top: terrain zones -> water -> roads/plazas -> buildings (+doors) -> trees -> props
-> labels. build_tortuga.py turns this into game data (render + walk map) and a preview image.
Edit this file to change the island; never place things in the game code by hand."""

# ---- Districts / terrain zones (polygons). Base land is 'grass'; beach is a computed coast band.
ZONES = [
    # Blackwood's Hollow: the jungle heart of the island.
    ('jungle', [(-262, 118), (-150, 92), (-30, 104), (100, 112), (200, 140), (258, 180), (246, 262),
                (170, 318), (60, 352), (-60, 356), (-170, 340), (-236, 296), (-270, 210)]),
    # The High Woods on the east cape.
    ('forest', [(386, -150), (470, -168), (548, -100), (575, -20), (572, 70), (528, 140), (468, 176),
                (408, 150), (392, 60), (382, -40)]),
    # Western scrub between Cayonne and the coast.
    ('forest', [(-560, -110), (-470, -190), (-420, -205), (-440, -150), (-470, -80), (-520, -70)]),
    # Coconut palm grove on the south-west shore.
    ('palms', [(-450, 116), (-396, 108), (-352, 136), (-346, 200), (-378, 228), (-450, 222)]),
    # Mangrove swamp round Contrebandiers' Cove (wet, walkable, slow-looking).
    ('swamp', [(-600, -100), (-548, -118), (-506, -96), (-500, -48), (-520, -4), (-575, 0), (-600, -30)]),
    # La Ringot Fields (tilled strips) and the wild sugarcane by the river.
    ('fields', [(250, 196), (330, 196), (330, 294), (250, 294)]),
    ('sugarcane', [(336, 178), (398, 178), (384, 226), (364, 270), (356, 300), (336, 300)]),
    # Rocky ground: the lighthouse headland, the grotto cliffs, the fort's crag.
    ('rock', [(-272, -470), (-245, -505), (-205, -500), (-222, -440), (-246, -410), (-274, -420)]),
    ('rock', [(-470, 300), (-430, 300), (-405, 340), (-440, 370), (-472, 340)]),
    ('rock', [(318, -430), (405, -360), (412, -330), (340, -326), (320, -380)]),
    # The Forgotten Graves.
    ('graveyard', [(58, 428), (112, 428), (112, 458), (58, 458)]),
    # Le Vasseur's walled garden.
    ('garden', [(436, 4), (498, 4), (498, 62), (436, 62)]),
]

# Offshore features (drawn on the sea, not walkable).
SEA_ZONES = [
    ('reef', [(456, -330), (500, -340), (540, -318), (546, -282), (520, -258), (478, -262), (458, -292)]),
]

# Open water inland. Roads that cross a river get a bridge automatically.
LAGOON = {'c': (440, 118), 'r': 30}
RIVERS = [
    {'name': 'Ringot River', 'pts': [(424, 144), (400, 196), (372, 256), (350, 326), (334, 398)], 'w': 10},
    {'name': 'Cayonne Brook', 'pts': [(-162, 46), (-240, 60), (-292, 100), (-360, 106), (-420, 94), (-454, 84)], 'w': 8},
]

# ---- Roads: (name, kind, width, points). 'main' = cart road, 'lane' = village street, 'path' = track.
ROADS = [
    ("King's Road", 'main', 8, [(40, 26), (40, 92), (12, 160), (-20, 206), (-40, 300), (-56, 380), (-70, 440)]),
    ('West Road', 'main', 8, [(-150, -64), (-232, -58), (-300, -36), (-362, -34), (-432, -28), (-500, -36)]),
    ("Smugglers' Track", 'path', 4, [(-500, -36), (-548, -46)]),
    ('Lighthouse Path', 'path', 5, [(-150, -222), (-190, -246), (-250, -300), (-266, -370), (-254, -440), (-228, -462)]),
    ('Cayonne North Lane', 'lane', 6, [(-330, -60), (-330, -162)]),
    ('Cayonne South Lane', 'lane', 6, [(-330, -10), (-330, 128)]),
    ('West Coast Path', 'path', 4, [(-432, -28), (-418, 40), (-404, 110), (-398, 200), (-404, 270), (-410, 324)]),
    ('Hollow Trail', 'path', 4, [(-34, 270), (60, 262), (150, 224), (232, 160)]),
    ('Ringot Bridge Track', 'path', 4, [(330, 250), (420, 236), (470, 196), (494, 140)]),
    ('Rocher Row', 'lane', 6, [(366, -262), (410, -262)]),
    ('East Road', 'main', 8, [(300, -150), (362, -140), (420, -96), (452, -20), (466, 4)]),
    ('Fort Road', 'main', 7, [(362, -140), (366, -230), (364, -326)]),
    ('Shipyard Lane', 'lane', 6, [(420, -96), (444, -138), (444, -176)]),
    ('Watchtower Path', 'path', 4, [(452, -20), (520, -20), (552, 0)]),
    ("Suzette's Path", 'path', 4, [(498, 40), (500, 96), (494, 118)]),
    ('Ringot Road', 'main', 7, [(40, 92), (150, 112), (232, 160), (296, 192)]),
    ('Cache Path', 'path', 4, [(300, 294), (304, 306)]),
    ('Crossroads Road', 'main', 7, [(-40, 300), (-140, 342), (-236, 362), (-330, 382)]),
    ('Turtle Cove Path', 'path', 4, [(-218, 374), (-208, 440)]),
    ('Marked Palm Path', 'path', 4, [(-330, 382), (-350, 390)]),
    ('Grotto Path', 'path', 4, [(-330, 382), (-372, 358), (-410, 324)]),
    ('Wreck Path', 'path', 4, [(-410, 324), (-436, 302)]),
    ('Graves Path', 'path', 4, [(-56, 380), (20, 410), (60, 440)]),
    ('Old Landing Lane', 'lane', 5, [(-70, 440), (-40, 470)]),
    ('Trapper Path', 'path', 4, [(-20, 206), (-4, 214)]),
]

# Plazas (cobbled open ground): (name, l, r, t, b)
PLAZAS = [
    ('Cayonne Square', -362, -300, -60, -10),
    ('Crossroads Green', -256, -216, 348, 376),
    ('Fort Yard', 346, 382, -336, -324),
    ('Rocher Green', 380, 404, -250, -230),
]

# ---- Buildings: (id or None, label, kind, cx, cy, w, h, door side N/S/E/W or None)
# Doors sit at the middle of the door side. id = a game building (enterable); None = a home.
BUILDINGS = [
    # Cayonne, the west village.
    ('tortuga_counting_house', 'Counting House', 'civic', -345, -72, 24, 18, 'S'),
    ('tortuga_apothecary', 'Apothecary', 'shop', -316, -72, 22, 17, 'S'),
    ('tortuga_almshouse', 'Almshouse', 'civic', -345, 3, 20, 18, 'N'),
    ('tortuga_tailor', 'Tailor', 'shop', -316, 3, 22, 17, 'N'),
    ('tortuga_vendue_house', 'Vendue House', 'market', -396, -52, 26, 20, 'S'),
    ('tortuga_powder_magazine', 'Powder Magazine', 'warehouse', -400, -6, 30, 22, 'N'),
    ('tortuga_gunsmith', 'Gunsmith', 'shop', -310, -110, 22, 17, 'W'),
    ('tortuga_gaol', 'The Gaol', 'civic', -352, -128, 30, 22, 'E'),
    ('tortuga_ropewalk', 'The Ropewalk', 'warehouse', -330, -174, 72, 14, 'S'),
    ('tortuga_tobacco_warehouse', 'Tobacco Warehouse', 'warehouse', -354, 32, 30, 22, 'E'),
    ('tortuga_netmenders_shed', "Netmender's Shed", 'warehouse', -306, 40, 30, 22, 'W'),
    ('tortuga_lucky_draw', 'The Lucky Draw', 'tavern', -352, 72, 26, 19, 'E'),
    # Lighthouse headland.
    ('tortuga_west_point', 'West Point Shack', 'home', -238, -262, 20, 16, 'E'),
    ('tortuga_signal_post', 'Signal Post', 'civic', -278, -330, 14, 12, 'E'),
    (None, 'Lighthouse', 'landmark', -224, -474, 14, 14, 'S'),
    # East: fort, shipyard, manor, watchtower.
    ('tortuga_fort', 'Fort de Rocher', 'fort', 364, -350, 44, 28, 'S'),
    ('tortuga_shipyard', 'The Shipyard', 'warehouse', 468, -176, 30, 22, 'W'),
    ('tortuga_shipwrights_slip', "Shipwright's Slip", 'warehouse', 464, -138, 24, 18, 'W'),
    ('tortuga_le_vasseur_residence', "Le Vasseur's Residence", 'manor', 466, 26, 30, 22, 'N'),
    ('tortuga_old_watchtower', 'Old Watchtower', 'civic', 562, 0, 14, 14, 'W'),
    # Inland and south.
    ('tortuga_trapper_camp', "Trapper's Camp", 'home', 8, 214, 20, 16, 'W'),
    ('tortuga_smuggler_cache', "Smuggler's Cache", 'warehouse', 304, 318, 26, 20, 'N'),
    ('tortuga_ruins', 'El Fuerte Viejo', 'ruin', -96, 430, 34, 26, 'E'),
    ('tortuga_old_landing_dock', 'Old Landing Dock', 'warehouse', -40, 480, 22, 12, 'N'),
    ('tortuga_wayside_tavern', 'Wayside Tavern', 'tavern', -240, 390, 26, 19, 'N'),
    ('tortuga_crossroads_shop', 'Crossroads Shop', 'shop', -236, 336, 22, 17, 'S'),
    (None, "Suzette's Still", 'shed', 508, 118, 18, 14, 'W'),
    (None, 'Ringot Farmhouse', 'home', 300, 174, 24, 18, 'S'),
    # Homes: Cayonne and the West Road.
    (None, 'Cottage', 'home', -200, -80, 18, 16, 'S'),
    (None, 'Cottage', 'home', -228, -80, 18, 16, 'S'),
    (None, 'Cottage', 'home', -262, -70, 18, 16, 'S'),
    (None, 'Cottage', 'home', -206, -38, 18, 16, 'N'),
    (None, 'Cottage', 'home', -244, -36, 18, 16, 'N'),
    (None, 'Cottage', 'home', -280, -20, 18, 16, 'N'),
    (None, 'Cottage', 'home', -436, -50, 18, 16, 'S'),
    (None, 'Cottage', 'home', -462, -48, 18, 16, 'S'),
    (None, 'Cottage', 'home', -444, -8, 18, 16, 'N'),
    (None, 'Cottage', 'home', -306, -140, 18, 16, 'W'),
    (None, 'Cottage', 'home', -354, -98, 18, 16, 'E'),
    (None, 'Cottage', 'home', -306, 70, 18, 16, 'W'),
    # Homes: Crossroads hamlet and the King's Road.
    (None, 'Cottage', 'home', -206, 340, 18, 16, 'S'),
    (None, 'Cottage', 'home', -178, 334, 18, 16, 'S'),
    (None, 'Cottage', 'home', -292, 392, 18, 16, 'N'),
    (None, 'Cottage', 'home', -122, 356, 18, 16, 'N'),
    (None, 'Cottage', 'home', 62, 60, 18, 16, 'W'),
    (None, 'Cottage', 'home', 18, 74, 18, 16, 'E'),
    # Homes: Rocher Row, the residential quarter on the fort road north-east of the harbour.
    (None, 'Cottage', 'home', 344, -196, 18, 16, 'E'),
    (None, 'Cottage', 'home', 344, -226, 18, 16, 'E'),
    (None, 'Cottage', 'home', 344, -256, 18, 16, 'E'),
    (None, 'Cottage', 'home', 344, -286, 18, 16, 'E'),
    (None, 'Cottage', 'home', 388, -200, 18, 16, 'W'),
    (None, 'Cottage', 'home', 388, -280, 18, 16, 'S'),
    (None, 'Cottage', 'home', 416, -244, 18, 16, 'W'),
    # Fishing huts at Turtle Cove.
    (None, 'Fishing Hut', 'shed', -196, 422, 16, 12, 'W'),
    (None, 'Fishing Hut', 'shed', -226, 434, 16, 12, 'E'),
    # Homes: east road.
    (None, 'Cottage', 'home', 340, -120, 18, 16, 'N'),
    (None, 'Cottage', 'home', 396, -136, 18, 16, 'S'),
    (None, 'Cottage', 'home', 404, -88, 18, 16, 'N'),
    (None, 'Cottage', 'home', 348, -170, 18, 16, 'E'),
    (None, 'Cottage', 'home', 196, 120, 18, 16, 'S'),
    (None, 'Cottage', 'home', 244, 184, 18, 16, 'N'),
]

# ---- Props: (kind, x, y). Signposts at junctions, wells in squares, cargo by warehouses.
PROPS = [
    ('signpost', 48, 96), ('signpost', -32, 296), ('signpost', 370, -134), ('signpost', 428, -90),
    ('signpost', -214, 354), ('signpost', -322, 374), ('signpost', -50, 386), ('signpost', -156, -70),
    ('well', -331, -34), ('well', -236, 362), ('well', 322, 186), ('well', 392, -240),
    ('crates', -386, -6), ('barrels', -386, 6), ('crates', -322, 40), ('barrels', -368, 32),
    ('crates', 458, -186), ('barrels', 458, -174), ('crates', 494, -150), ('barrels', 316, 318),
    ('crates', -52, 482), ('barrels', -140, 420),
    ('cart', -300, -18), ('cart', 280, 196), ('bench', -350, -18), ('bench', -312, -52),
    ('lamp', -300, -60), ('lamp', -362, -60), ('lamp', -300, -10), ('lamp', -362, -10),
    ('lamp', 346, -324), ('lamp', 382, -324), ('cannon', 338, -352), ('cannon', 390, -352),
    ('grave', 66, 436), ('grave', 78, 436), ('grave', 90, 436), ('grave', 102, 436),
    ('grave', 66, 450), ('grave', 78, 450), ('grave', 90, 450), ('grave', 102, 450),
    ('boat', -232, 450), ('boat', -24, 490), ('signpost', 334, 246), ('signpost', -404, 110), ('signpost', -24, 214),
    ('cave', -416, 318), ('wreck', -452, 290), ('marked_palm', -354, 394), ('campfire', -2, 228),
    ('still', 486, 128),
]

# ---- Labels: district and landmark names (x, y, text, size)
LABELS = [
    (75, -10, 'BASSE-TERRE (painted town)', 'district'),
    (-330, -142, 'CAYONNE', 'district'), (-20, 250, "BLACKWOOD'S HOLLOW", 'district'),
    (480, -60, 'THE HIGH WOODS', 'district'), (313, 270, 'LA RINGOT FIELDS', 'district'),
    (-236, 320, 'CROSSROADS', 'district'), (-240, -420, 'LIGHTHOUSE HEAD', 'district'),
    (366, -382, 'FORT DE ROCHER', 'district'), (-540, -70, "CONTREBANDIERS' COVE", 'place'),
    (-226, 470, 'Turtle Cove', 'place'), (-548, -60, 'Mangrove Swamp', 'place'), (500, -296, 'Coral Reef Shoal', 'place'),
    (-398, 168, 'Coconut Palm Grove', 'place'), (366, 196, 'Wild Sugarcane', 'place'), (392, -272, 'ROCHER ROW', 'district'),
    (-300, 118, 'Cayonne Brook', 'place'), (-70, 470, 'Old Landing', 'place'), (85, 422, 'Forgotten Graves', 'place'),
    (-430, 270, 'Wreck of the Santa Catalina', 'place'), (-408, 308, "Smugglers' Grotto", 'place'),
    (-352, 408, 'The Marked Palm', 'place'), (440, 118, 'Lagoon', 'place'), (500, 140, "Old Suzette's Still", 'place'),
]

# ---- Points of interest: the game's own Tortuga sites (treasure, resources, quest stages) plus
# the named landmarks. (kind, id, x, y). Builder moves any that land in the sea, in water or on a
# building to the nearest open ground and reports it.
POIS = [
    ('treasure', 'site_fragment_tortuga', -403, 403), ('treasure', 'site_buried_doubloons', -403, 76),
    ('treasure', 'site_rusty_compass', -461, -173),
    ('resource', 'node_tortuga_fish', -100, -288), ('resource', 'node_tortuga_timber_1', 599, 23),
    ('resource', 'node_tortuga_timber_2', 472, 115),
    ('quest', 'quest_bounty_board', 0, -55), ('quest', 'tortuga_locked_ward', 55, -55),
    ('quest', 'blackfin_tortuga_intro', 196, -294),
    ('landmark', 'Wreck of the Santa Catalina', -452, 290), ("landmark", "Smugglers' Grotto", -416, 318),
    ('landmark', 'The Marked Palm', -354, 394), ('landmark', 'Turtle Cove', -214, 446),
    ('landmark', 'Ruins of the Old Landing', -60, 470), ('landmark', 'The Forgotten Graves', 84, 440),
    ('landmark', "Blackwood's Hollow", -12, 236), ('landmark', "Old Suzette's Still", 496, 132),
    ('landmark', 'The High Woods', 520, -40), ('landmark', 'La Ringot Fields', 290, 230),
    ('landmark', 'The Lighthouse', -224, -486), ("landmark", "Contrebandiers' Cove", -560, -50),
]
