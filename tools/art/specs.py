"""Which code-drawn look each Tortuga building gets (see houses.py)."""
SIGNS = {'tortuga_counting_house': 'coin', 'tortuga_apothecary': 'bottle', 'tortuga_tailor': 'scissors', 'tortuga_vendue_house': 'hammer',
         'tortuga_powder_magazine': 'keg', 'tortuga_gunsmith': 'pistol', 'tortuga_tobacco_warehouse': 'leaf', 'tortuga_netmenders_shed': 'fish',
         'tortuga_lucky_draw': 'tankard', 'tortuga_wayside_tavern': 'tankard', 'tortuga_crossroads_shop': 'bread', 'tortuga_shipyard': 'anchor',
         'tortuga_shipwrights_slip': 'anchor', 'tortuga_boatbuilder': 'boat', 'tortuga_sugar_mill': 'cane', 'tortuga_smuggler_cache': 'skull'}
WALL_CYCLE = ['plaster', 'plaster_white', 'plaster', 'plaster_ochre', 'plaster_white']
ROOF_CYCLE = ['tile', 'tile_orange', 'tile', 'thatch', 'tile']
SHUT = ['#3f6f8f', '#3f6f8f', '#5f8a4a', '#3f6f8f', '#8e3b2a']


def spec_for(b, n):
    """b = plan building tuple, n = a running index for variety."""
    bid, label, kind, cx, cy, w, h, side = b
    s = dict(w=w, d=h, kind=kind, door=(side == 'S'), seed=n + 7)
    if bid in SIGNS: s['sign'] = SIGNS[bid]
    if bid == 'tortuga_lighthouse_tower': return dict(w=w, d=h, shape='lighthouse')
    if bid == 'tortuga_ruins': return dict(w=w, d=h, shape='ruin')
    if bid in ('tortuga_old_watchtower', 'tortuga_signal_post') or label in ('Gate Tower', 'Lookout'):
        return dict(w=w, d=h, shape='tower', flag='#c0392b' if label != 'Lookout' else None,
                    wall='planks' if label == 'Lookout' else 'stone', height=8 if label == 'Gate Tower' else 14, door=label != 'Gate Tower')
    if kind == 'tavern':
        s.update(storeys=2, wall='timber', roof='tile_dark', lanterns=True, shutters='#8e3b2a', chimney=True, base_props=[('L', 'barrel'), ('R', 'barrel')], lit=True, porch=True, flowers=True)
    elif kind == 'shop':
        s.update(storeys=2 if w >= 20 else 1, massing='gable' if w <= 22 else 'hip', wall=['timber', 'plaster_ochre', 'timber'][n % 3], roof='tile', flowers=True, awning=[('#5f8a4a', '#f1ead8'), ('#b4523a', '#f1ead8'), ('#3f6f8f', '#f1ead8')][n % 3])
    elif kind == 'market':
        s.update(wall='timber', roof='tile_orange', awning=('#c9a227', '#8e3b2a'), base_props=[('L', 'crate'), ('R', 'barrel')])
    elif kind == 'civic':
        s.update(wall='stone', roof='slate', storeys=2 if w >= 20 else 1, bars=(bid == 'tortuga_gaol'), chimney=True, massing='gable' if w <= 20 else 'hip', porch=w > 20)
    elif kind == 'warehouse':
        s.update(wall=['planks', 'planks_grey', 'planks'][n % 3], roof='plank', big_door=(side == 'S' or w >= 24), base_props=[('R', 'crate')])
        if bid == 'tortuga_powder_magazine': s.update(wall='stone_dark', roof='slate', big_door=False, base_props=[('L', 'barrel'), ('R', 'barrel')])
    elif kind == 'fort':
        s.update(wall='stone', roof='flat', crenel=True, flag='#1f3b5c', bars=True)
    elif kind == 'manor':
        s.update(storeys=2, wall='plaster_rose', roof='slate_green', columns=True, shutters='#2f5d5a', chimney=True, flowers=True, porch=True)
    elif kind == 'mill':
        s.update(wall='stone', roof='tile_orange', chimney_tall=True, wheel=True, big_door=True)
    elif kind == 'shed':
        s.update(wall=['planks', 'planks_grey'][n % 2], roof='thatch' if n % 2 else 'plank', base_props=[('R', 'barrel')], massing='gable')
        if label == 'Barn': s.update(wall='planks_red', roof='plank', big_door=True, base_props=[])
    else:  # homes, cottages, wings, huts
        s.update(wall=WALL_CYCLE[n % 5] if n % 3 else 'timber', roof=ROOF_CYCLE[(n // 2) % 5], shutters=SHUT[(n * 3) % 5], chimney=(label != 'Wing'),
                 massing='gable' if (n % 2 == 0 or label == 'Wing') else 'hip', flowers=(n % 2 == 1), timber_gable=(n % 3 == 0))
        if bid in ('tortuga_farmstead',) or label == 'Ringot Farmhouse': s.update(storeys=2, wall='plaster_white', roof='tile')
        if bid in ('tortuga_charcoal_burner', 'tortuga_hermit_hut', 'tortuga_trapper_camp', 'tortuga_west_point') or label == 'Fishing Hut':
            s.update(wall='planks', roof='thatch', shutters=None)
        if label == 'Wing': s.update(door=False)
    return s
