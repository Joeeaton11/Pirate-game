"""Tortuga plan, second sheet: things to do and the life of the island (island-relative units).
Imported at the end of plan_tortuga.py. Points that land in the sea, on a road or in a building are
moved by build_tortuga.py to the nearest free ground (and reported)."""

# ---- Fishing spots (become gatherable fish nodes): (id, x, y, where)
FISHING = [
    ('node_tortuga_fish_ringot', 352, 266, 'Ringot riverbank'),
    ('node_tortuga_fish_lagoon', 412, 128, 'lagoon shore'),
    ('node_tortuga_fish_brook', -300, 108, 'Cayonne Brook'),
    ('node_tortuga_fish_falls', 430, -8, 'falls pool'),
    ('node_tortuga_fish_cove', -530, -86, 'mangrove channel'),
]

# ---- Dig spots: buried treasure paced out from a landmark. (id, landmark, lx, ly, paces, dir, gold, clue)
DIG_SPOTS = [
    ('dig_marked_palm', 'The Marked Palm', -354, 394, 16, 'E', 40, 'Carved in the bark: "XVI paces to the sunrise."'),
    ('dig_watchtower', 'Old Watchtower', 562, 0, 22, 'S', 35, 'Scratched on the door: "From my foot, xxii paces south."'),
    ('dig_graves', 'Forgotten Graves', 85, 443, 30, 'W', 30, 'A headstone reads: "Thirty steps toward the setting sun, I rest my purse."'),
    ('dig_lighthouse', 'Lighthouse', -224, -474, 30, 'S', 45, 'Painted on the lamp-room wall: "30 S."'),
    ('dig_wreck', 'Wreck of the Santa Catalina', -445, 284, 18, 'N', 50, 'On a plank: "Eighteen north, where the cook hid his share."'),
    ('dig_lagoon', 'Lagoon', 440, 118, 40, 'N', 30, 'Knife-cut in a palm: "40 paces from the water, toward the pole star."'),
]
DIRS = {'N': (0, -1), 'S': (0, 1), 'E': (1, 0), 'W': (-1, 0)}

# ---- Hidden collectibles: one carved skull tucked away in each district. (district, x, y)
COLLECTIBLES = [
    ('Basse-Terre', 286, -58), ('Cayonne', -374, -142), ('Lighthouse Head', -266, -468),
    ("Contrebandiers' Cove", -584, -22), ('Palm Shore', -442, 212), ('Crossroads', -262, 412),
    ("Blackwood's Hollow", -150, 200), ('Southern Shore', 124, 466), ('La Ringot', 344, 296),
    ('The High Woods', 556, 62), ('Rocher Row', 426, -292), ('Fort de Rocher', 330, -398),
    ("King's Meadows", 200, 40),
]

# ---- Viewpoints: climb up and the districts around are drawn on your map. (name, x, y, districts)
VIEWPOINTS = [
    ('The Lookout', 500, -40, ['The High Woods', 'La Ringot', 'Rocher Row']),
    ('Lighthouse gallery', -224, -466, ['Lighthouse Head', "Contrebandiers' Cove", 'Cayonne']),
    ('Old Watchtower', 556, 0, ['The High Woods', 'Fort de Rocher', 'La Ringot']),
    ('Blackwood Knoll', -40, 236, ["Blackwood's Hollow", 'Crossroads', 'Southern Shore', "King's Meadows"]),
    ('Fort ramparts', 364, -366, ['Fort de Rocher', 'Rocher Row', 'Basse-Terre']),
]

# ---- Notice boards: one per district, listing that district's errands. (district, x, y)
NOTICE_BOARDS = [
    ('Cayonne', -304, -56), ('Crossroads', -252, 350), ('Rocher Row', 402, -248), ('La Ringot', 332, 186),
    ('The High Woods', 458, -28), ('Southern Shore', 26, 402), ("King's Meadows", 50, 100), ('Basse-Terre', 60, -104),
    ('Lighthouse Head', -256, -330), ('Palm Shore', -410, 100), ("Blackwood's Hollow", -12, 212), ('Fort de Rocher', 344, -316),
]

# ---- Guard and smuggler patrols: (who, points). Guards by day, smugglers by night.
PATROLS = [
    ('guards', [(364, -321), (366, -230), (362, -140), (300, -150)]),
    ('guards', [(-150, -64), (-232, -58), (-300, -36)]),
    ('guards', [(-40, -300), (240, -300)]),
    ('smugglers', [(-406, 322), (-340, 312), (-262, 300), (-170, 282), (-80, 262), (-4, 222)]),
    ('smugglers', [(-500, -36), (-548, -46), (-560, -80)]),
]

# ---- Random event spots on the roads: (kind, x, y)
EVENTS = [
    ('pickpocket', -320, -20), ('stuck cart', 150, 112), ('drunk sailor', -214, 384), ('lost goat', 100, 92),
    ('runaway barrel', 40, 60), ('injured parrot', -20, 300), ('quarrelling fishwives', -232, -58),
    ('lost child', 362, -200), ('fallen tree', 12, 160), ('travelling pedlar', -140, 342),
]

# ---- Smugglers' tunnels (underground): (name, points). Trapdoors at each end.
TUNNELS = [
    ("Grotto run", [(-416, 318), (-340, 352), (-240, 386)]),
    ("Cache to the mill", [(304, 318), (270, 270), (232, 222)]),
    ("Old town drain", [(-146, 6), (-200, -20), (-300, -26)]),
]

# ---- Shortcuts: rope ladders and gaps you can squeeze through. (kind, points)
SHORTCUTS = [
    ('rope', [(452, -30), (472, -60)]),
    ('rope', [(-250, -300), (-236, -270)]),
    ('gap', [(-262, 300), (-262, 318)]),
    ('gap', [(232, 160), (250, 140)]),
    ('climb', [(-372, 358), (-392, 340)]),
]

# ---- Hazards: (kind, x, y, r). The swamp zone is mud by itself.
HAZARDS = [
    ('wasps', -120, 300, 10), ('wasps', 530, 60, 10),
    ('rockfall', -460, 330, 14), ('rockfall', 400, -384, 12),
    ('tide', -214, 462, 18), ('tide', 190, 470, 16),
]

# ---- Allotments, pens and runs (farmland zones; pens and runs are fenced).
LIFE_ZONES = [
    ('allotment', [(-290, -120), (-266, -120), (-266, -100), (-290, -100)]),
    ('allotment', [(418, -210), (440, -210), (440, -192), (418, -192)]),
    ('allotment', [(-470, -76), (-450, -76), (-450, -62), (-470, -62)]),
    ('pen', [(150, 40), (176, 40), (176, 54), (150, 54)]),       # chicken run at the farm
    ('pen', [(312, 150), (332, 150), (332, 164), (312, 164)]),   # pigs at Ringot farm
    ('pen', [(60, 112), (84, 112), (84, 130), (60, 130)]),       # goat pen, King's Meadows
]

# ---- Hand-placed props on top of the automatic ones round each building.
EXTRA_PROPS = [
    ('scarecrow', 290, 236), ('scarecrow', 306, 270), ('beehive', 120, 52), ('beehive', 126, 52), ('beehive', 132, 52),
    ('lobster_pot', -188, -360), ('lobster_pot', -178, -390), ('lobster_pot', 186, 440), ('lobster_pot', -204, 452),
    ('lobster_pot', -34, 480), ('rowboat', -250, 456), ('rowboat', -176, 466), ('rowboat', 220, 460), ('rowboat', -560, -10),
    ('anchor', -244, -340), ('anchor', 160, 384), ('anchor', -440, 300), ('flag', 364, -364), ('flag', 562, -8),
    ('chest', -438, 292), ('campfire', -536, -60), ('campfire', -412, 336), ('fishing_rack', -236, 420),
    ('fishing_rack', 196, 440), ('fishing_rack', -470, 120), ('statue', 452, 50), ('flowerpot', 470, 40),
    ('flowerpot', 482, 40), ('cannonballs', 352, -340), ('cannonballs', 378, -340), ('cannon', 556, 12),
    ('signal_fire', -232, -484), ('stool', 352, 258), ('stool', 412, 136), ('stool', -300, 112), ('stool', 432, -4),
    ('bench', -230, 366), ('bench', -330, -14), ('bench', 76, 452), ('bench', -236, -470), ('bench', 392, -232),
    ('wheelbarrow', 166, 78), ('wheelbarrow', 470, -146), ('water_butt', 152, 60), ('kennel', 128, 60),
    ('rubble', -114, 420), ('rubble', -80, 444), ('rubble', -110, 446),
]
