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
    {'name': 'High Woods Falls', 'pts': [(472, -62), (446, -30), (428, -2), (416, 48), (424, 92)], 'w': 5},
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
    ('Fort Road', 'main', 7, [(362, -140), (366, -230), (364, -321)]),
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
    ('South Shore Path', 'path', 4, [(20, 410), (100, 393), (150, 389)]),
    ('Signal Post Spur', 'path', 3, [(-258, -330), (-267, -330)]),
    ('Lookout Spur', 'path', 3, [(500, -20), (500, -29)]),
    ("Smugglers' Trail", 'secret', 3, [(-4, 222), (-80, 262), (-170, 282), (-262, 300), (-340, 312), (-406, 322)]),
]

# Plazas (cobbled open ground): (name, l, r, t, b)
PLAZAS = [
    ('Cayonne Square', -362, -300, -60, -10),
    ('Crossroads Green', -256, -216, 348, 376),
    ('Fort Yard', 346, 384, -336, -320),
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
    ('tortuga_lighthouse_tower', 'Lighthouse', 'landmark', -224, -474, 14, 14, 'S'),
    # East: fort, shipyard, manor, watchtower.
    ('tortuga_fort', 'Fort de Rocher', 'fort', 364, -350, 44, 28, 'S'),
    (None, 'Barracks', 'civic', 394, -330, 10, 16, 'W'),
    (None, 'Gate Tower', 'fort', 354, -317, 6, 6, None),
    (None, 'Gate Tower', 'fort', 374, -317, 6, 6, None),
    (None, 'Lookout', 'shed', 500, -36, 8, 8, 'S'),
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
    # Fort battery facing the harbour.
    ('cannon', 346, -362), ('cannon', 382, -362), ('cannon', 352, -374), ('cannon', 376, -374),
    # Busier docks: crane, cargo, bollards and nets on the town wharf; nets at the jetties.
    ('crane', 160, -297), ('cargo', 118, -296), ('cargo', 205, -296), ('cargo', 40, -299), ('nets', 232, -298), ('nets', -205, -372),
    ('bollard', -40, -305), ('bollard', 0, -305), ('bollard', 60, -305), ('bollard', 120, -297), ('bollard', 180, -297), ('bollard', 240, -297),
    ('nets', 190, 446), ('crates', -190, -372), ('barrels', -234, -380),
    # Market day in Basse-Terre Square.
    ('stall', 10, -92), ('stall', 30, -92), ('stall', 80, -92), ('stall', 100, -92), ('bench', 40, -104), ('bench', 66, -104),
    # Washing lines in Cayonne, the Crossroads and Rocher Row.
    ('washing', -245, -80), ('washing', -449, -48), ('washing', -192, 340), ('washing', 344, -241), ('washing', 344, -271),
    # High Woods: the falls and the lookout.
    ('falls', 446, -30), ('lookout', 500, -36),
]

# ---- Labels: district and landmark names (x, y, text, size)
LABELS = [
    (95, -282, 'BASSE-TERRE (painted town)', 'district'),
    (-330, -142, 'CAYONNE', 'district'), (-20, 250, "BLACKWOOD'S HOLLOW", 'district'),
    (480, -60, 'THE HIGH WOODS', 'district'), (313, 270, 'LA RINGOT FIELDS', 'district'),
    (-236, 320, 'CROSSROADS', 'district'), (-240, -420, 'LIGHTHOUSE HEAD', 'district'),
    (366, -382, 'FORT DE ROCHER', 'district'), (-540, -70, "CONTREBANDIERS' COVE", 'place'),
    (-226, 470, 'Turtle Cove', 'place'), (-548, -60, 'Mangrove Swamp', 'place'), (500, -296, 'Coral Reef Shoal', 'place'),
    (-398, 168, 'Coconut Palm Grove', 'place'), (366, 196, 'Wild Sugarcane', 'place'), (392, -272, 'ROCHER ROW', 'district'),
    (-300, 118, 'Cayonne Brook', 'place'), (-70, 470, 'Old Landing', 'place'), (85, 422, 'Forgotten Graves', 'place'),
    (-430, 270, 'Wreck of the Santa Catalina', 'place'), (452, -48, 'High Woods Falls', 'place'), (515, -48, 'Lookout', 'place'),
    (-200, 296, "Smugglers' Trail (hidden)", 'place'), (-408, 308, "Smugglers' Grotto", 'place'),
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
    ('quest', 'quest_bounty_board', 0, -55), ('quest', 'tortuga_locked_ward', 61, -51),
    ('quest', 'blackfin_tortuga_intro', 196, -294),
    ('landmark', 'Wreck of the Santa Catalina', -452, 290), ("landmark", "Smugglers' Grotto", -416, 318),
    ('landmark', 'The Marked Palm', -354, 394), ('landmark', 'Turtle Cove', -214, 446),
    ('landmark', 'Ruins of the Old Landing', -60, 470), ('landmark', 'The Forgotten Graves', 84, 440),
    ('landmark', "Blackwood's Hollow", -12, 236), ('landmark', "Old Suzette's Still", 496, 132),
    ('landmark', 'The High Woods', 520, -40), ('landmark', 'La Ringot Fields', 290, 230),
    ('landmark', 'The Lighthouse', -224, -486), ("landmark", "Contrebandiers' Cove", -560, -50),
]

# ---- Docks outside the painted town (the town's own piers come from its walk map).
# (name, kind, deck width, points). The first point must sit on land; the builder checks it.
# These also become the game's walkable boardwalks (src/data/harbor.ts reads them).
DOCKS = [
    # North-west: the careening wharf along the lighthouse headland, and the West Pier into the bay.
    ('Careening Wharf', 'quay', 8, [(-252, -322), (-247, -432)]),
    ('West Pier', 'pier', 7, [(-248, -378), (-184, -378)]),
    ('West Pier Head', 'pier', 7, [(-184, -402), (-184, -354)]),
    ('Lighthouse Steps', 'jetty', 5, [(-222, -484), (-202, -498)]),
    # South: the South Jetty off the graves' cove, with its two heads.
    ('South Jetty', 'pier', 7, [(150, 390), (179, 450)]),
    ('South Jetty East Head', 'pier', 6, [(179, 450), (208, 468)]),
    ('South Jetty South Head', 'pier', 6, [(179, 450), (166, 504)]),
    # Small landings round the coast.
    ('Old Landing Jetty', 'jetty', 5, [(-40, 486), (-36, 516)]),
    ('Turtle Cove Jetty', 'jetty', 5, [(-212, 444), (-208, 474)]),
    ("Shipyard Slipway", 'slip', 10, [(470, -188), (494, -220)]),
]
# The offshore rubble breakwater sheltering the harbour mouth (not walkable).
BREAKWATER = [(-273, -555), (46, -447), (351, -505)]
# Boats tied up at the docks (x, y, heading degrees) — outlines only.
MOORED = [(-176, -414, 90), (-200, -366, 0), (196, 476, 30), (158, 506, -80), (-28, 520, 80), (-200, 480, 85)]

# ---- Height: hills as (x, y, peak height in metres, radius x, radius y). Summed into a height
# field for contour lines; coast where the land is high becomes cliff.
HILLS = [
    (500, -30, 42, 110, 120),     # the High Woods hill
    (-240, -430, 26, 40, 80),     # Lighthouse Head
    (368, -372, 30, 50, 40),      # the fort's crag
    (-40, 230, 22, 170, 110),     # Blackwood ridge
    (-445, 320, 26, 55, 55),      # grotto cliffs
    (90, 440, 12, 45, 30),        # the graves' knoll
    (-560, -60, 6, 50, 60),       # swamp hummock
    (-330, -30, 6, 90, 70),       # Cayonne rise
]

# ---- Districts: seeds for the district map (Voronoi, clipped to the island). Basse-Terre is the
# painted town itself. (name, x, y, revealed at start?)
DISTRICTS = [
    ('Basse-Terre', 75, -200, True),
    ('Cayonne', -330, -40, False), ('Lighthouse Head', -240, -400, False),
    ("Contrebandiers' Cove", -545, -50, False), ('Palm Shore', -410, 180, False),
    ('Crossroads', -240, 370, False), ("Blackwood's Hollow", -20, 230, False),
    ('Southern Shore', 40, 450, False), ('La Ringot', 320, 240, False), ('The High Woods', 495, 10, False),
    ('Rocher Row', 372, -230, False), ('Fort de Rocher', 366, -372, False), ('King\'s Meadows', 120, 80, False),
]

# ---- Shipping lanes for the Black Pearl round the breakwater: (name, points).
LANES = [
    ('East Channel', [(-10, -432), (150, -444), (300, -458), (382, -482), (450, -570)]),
    ('West Channel', [(-10, -432), (-120, -478), (-200, -524), (-300, -575)]),
    ('South Anchorage', [(196, 480), (214, 540), (230, 580)]),
]

# ---- Townsfolk walking routes outside the painted town (there and back along the roads).
WALKS = [
    [(-150, -64), (-232, -58), (-300, -36), (-362, -34), (-432, -28)],
    [(-330, -40), (-330, -150), (-330, -40), (-330, 112)],
    [(40, 30), (40, 92), (12, 160), (-20, 206), (-40, 300), (-56, 380)],
    [(40, 92), (150, 112), (232, 160), (296, 192)],
    [(-40, 300), (-140, 342), (-236, 362), (-330, 382)],
    [(300, -150), (362, -140), (366, -230), (364, -326)],
    [(362, -140), (420, -96), (452, -20), (466, 4)],
]

# ---- Street names inside the painted town (label point and angle; the streets themselves are the
# town's open ground, drawn from its walk map).
TOWN_STREETS = [
    ('Quayside', 100, -199, 0), ('Rue du Commerce', 150, -123, 0), ('Chapel Street', 40, -49, 0),
    ('South Lane', -20, 23, 0), ('Basse-Terre Square', 52, -96, 0),
    ('Harbour Steps', 67, -170, 90), ("Coopers' Alley", -80, -100, 90), ('Church Row', 211, -80, 90),
]

# ---- Boundaries: fences round cottage yards (behind and to the sides; front open), hedges round
# the fields, stone walls round the graveyard, the manor garden and the fort. Gaps are cut wherever
# a road or path meets them, so every gate lines up with the way in.
FORT_WALLS = (334, -376, 402, -318)   # l, t, r, b — clipped to the coast; gate where the Fort Road enters
HEDGED = ['fields', 'sugarcane']
WALLED = ['graveyard', 'garden']

# ---- Wildlife zones: (kind, polygon). The game puts crabs on beaches and gulls on the docks.
WILDLIFE = [
    ('crabs', [(-240, 430), (-190, 420), (-170, 450), (-230, 470)]),
    ('crabs', [(-470, 200), (-440, 200), (-445, 300), (-470, 290)]),
    ('crabs', [(-560, -80), (-520, -110), (-500, -60), (-560, -20)]),
    ('gulls', [(-260, -440), (-170, -430), (-170, -340), (-260, -330)]),
    ('gulls', [(-60, -420), (280, -420), (280, -290), (-60, -290)]),
    ('gulls', [(140, 380), (220, 380), (220, 480), (140, 480)]),
    ('parrots', [(-200, 140), (180, 150), (200, 300), (-180, 320)]),
    ('goats', [(470, -110), (560, -60), (540, 20), (460, -20)]),
    ('goats', [(-262, -480), (-215, -500), (-240, -400), (-270, -410)]),
    ('turtles', [(-245, 440), (-180, 430), (-190, 468), (-240, 470)]),
]

# ---- Gathering spots: (resource, id, x, y). Walk through to gather (cooldown per spot).
GATHER = [
    ('fish', 'node_tortuga_fish_westpier', -184, -400), ('fish', 'node_tortuga_fish_southjetty', 196, 462),
    ('fish', 'node_tortuga_fish_turtlecove', -210, 468), ('fish', 'node_tortuga_fish_oldlanding', -38, 506),
    ('timber', 'node_tortuga_timber_highwoods', 520, -90), ('timber', 'node_tortuga_timber_hollow', -110, 236),
    ('coconut', 'node_tortuga_coconut_grove', -396, 150), ('coconut', 'node_tortuga_coconut_grove2', -372, 196),
    ('sugarcane', 'node_tortuga_cane_ringot', 366, 236),
]

# ---- District errands: one local per district who wants something gathered. (id, district,
# person, sprite key, x, y, resource, amount, gold, line)
ERRANDS = [
    ('errand_cayonne', 'Cayonne', 'Widow Marchand', 'tortuga_amb_lass', -318, -24, 'fish', 3, 25, "Three fish for the almshouse pot, and I'll see you paid."),
    ('errand_lighthouse', 'Lighthouse Head', 'Keeper Hollis', 'tortuga_amb_sailor', -250, -350, 'timber', 2, 20, 'The lamp-house shutters are rotten. Bring me timber.'),
    ('errand_cove', "Contrebandiers' Cove", 'Mud-Boots Lefèvre', 'patron_tortuga_drunk', -528, -40, 'coconut', 2, 15, "Coconuts, mate. Don't ask what for."),
    ('errand_palmshore', 'Palm Shore', 'Little Anouk', 'tortuga_amb_browser', -392, 120, 'fish', 2, 15, 'Gran says the cove fish are best. Can you catch some?'),
    ('errand_crossroads', 'Crossroads', 'Innkeeper Duval', 'tortuga_amb_cook', -214, 380, 'sugarcane', 3, 30, 'No cane, no rum. No rum, no customers.'),
    ('errand_hollow', "Blackwood's Hollow", 'Old Trapper Brac', 'tortuga_amb_deckhand', -14, 240, 'timber', 3, 25, 'Need wood for the smoke-hut before the rains.'),
    ('errand_south', 'Southern Shore', 'Sexton Morne', 'patron_tortuga_mystic', 40, 420, 'coconut', 1, 10, 'One coconut for the dead. Old custom. Ask no more.'),
    ('errand_ringot', 'La Ringot', 'Farmer Rosalie', 'tortuga_amb_galley', 288, 206, 'fish', 4, 30, 'Fish guts make the cane grow. Truly.'),
    ('errand_highwoods', 'The High Woods', "Suzette's Nephew", 'tortuga_amb_apprentice', 488, 100, 'sugarcane', 2, 25, "Auntie's still is dry. Cane, if you've any."),
    ('errand_rocher', 'Rocher Row', 'Madame Coquille', 'tortuga_amb_sailmaker', 372, -244, 'timber', 2, 20, 'My shutters blew off in the gale. Timber, love.'),
    ('errand_fort', 'Fort de Rocher', 'Sergeant Brisac', 'patron_tortuga_rival', 360, -300, 'fish', 5, 40, 'The garrison eats like sharks. Fish. Lots.'),
    ('errand_meadows', "King's Meadows", 'Shepherd Tomas', 'tortuga_amb_clerk', 90, 112, 'coconut', 3, 25, 'The goats are off their feed. Coconuts help.'),
]
