import { ResourceId } from './resources';
import { BuildingSpriteId } from './worldSprites';

export type BuildingType =
  | 'tavern'
  | 'beach'
  | 'manor'
  | 'college'
  | 'shrine'
  | 'shop'
  | 'market'
  | 'fort'
  | 'chapel'
  | 'warehouse'
  | 'customs'
  | 'smithy'
  | 'ruins'
  | 'gaol'
  | 'watchtower';

export interface Building {
  id: string;
  islandId: string;
  name: string;
  type: BuildingType;
  emoji: string;
  // Real building art (see src/data/worldSprites.ts BUILDING_SPRITES) to render instead of the
  // emoji, where a genuine match exists — Tortuga Cove only for now, everywhere else still emoji.
  spriteId?: BuildingSpriteId;
  offset: { x: number; y: number }; // relative to the island's center, in world units
  npcName: string;
  npcEmoji: string;
  dialogue: string;
  recruit?: {
    templateId: string;
    level: number;
    cost: number;
  };
  itemsForSale?: string[]; // item ids, priced from ITEMS
  treasuresForSale?: string[]; // Treasure Codex item ids, priced from their own `price` field
  buysResources?: boolean; // if true, shows a Sell Resources section priced from RESOURCES
  sellsUpgrades?: boolean; // if true, shows a Ship Upgrades section priced from SHIP_UPGRADES
  // Theft: buy this resource honestly here too, or steal it for free at a heat cost.
  stealResourceId?: ResourceId;
  stealYield?: { min: number; max: number };
  stealDetectionChance?: number; // 0-1, chance of a bigger heat spike; default 0.4
  stealCooldownMinutes?: number; // default 30
}

// Was 45 — more than double a building's own visual radius (22), so walking anywhere near a
// building on the way to somewhere else would yank you inside it. 26 keeps entry to "you're
// basically at the door" while still comfortably bigger than the 44-native sprite's half-width.
export const ENTER_RADIUS = 26;

export const BUILDINGS: Building[] = [
  {
    id: 'tortuga_tavern',
    islandId: 'tortuga_cove',
    name: 'The Salty Parrot',
    type: 'tavern',
    emoji: '🍻',
    spriteId: 'tavern',
    // Full-town rebuild 2026-08-07 (item 52): every Tortuga building repositioned around the new
    // horseshoe bay (see islands.ts). This one sits in the tavern district, right by the busiest
    // stretch of the quay.
    offset: { x: 73, y: -89 },
    npcName: 'Old Tom',
    npcEmoji: '🧔',
    dialogue: "Buy a round and I'll sign on, no questions asked.",
    recruit: { templateId: 'cabin_hand', level: 2, cost: 15 },
  },
  {
    id: 'tortuga_shop',
    islandId: 'tortuga_cove',
    name: 'Harbor Trading Post',
    type: 'shop',
    emoji: '🏪',
    spriteId: 'trading_co',
    // Full-town rebuild 2026-08-07 (item 52): tavern-district neighbor to the Salty Parrot.
    offset: { x: 144, y: -99 },
    npcName: 'Merchant Wren',
    npcEmoji: '🧑‍💼',
    dialogue: "I know a sharpshooter looking for steady work, if you've got the coin.",
    recruit: { templateId: 'dockside_sharpshooter', level: 3, cost: 30 },
    itemsForSale: ['rum_ration', 'grapeshot_charge', 'ships_biscuit', 'treasure_map'],
    buysResources: true,
  },
  {
    id: 'cow_island_camp',
    islandId: 'cow_island',
    name: 'Cow Island Beach Camp',
    type: 'beach',
    emoji: '🏖️',
    offset: { x: 0, y: 200 },
    npcName: 'Barefoot Nia',
    npcEmoji: '🧍‍♀️',
    dialogue: 'Been living off crabs and cannon fire. I could use a real crew.',
    recruit: { templateId: 'powder_monkey', level: 4, cost: 35 },
  },
  {
    id: 'new_providence_tavern',
    islandId: 'new_providence',
    name: 'The Cracked Hull',
    type: 'tavern',
    emoji: '🍺',
    // Nudged clear of the residential avenue a second time (2026-08-04) — the first item-40 pass
    // only checked distance-to-endpoint against its own connecting street, not perpendicular
    // distance to every street LINE, so it was still only 10 units clear of the x=-280..360
    // avenue it runs alongside. Re-checked programmatically against every segment. See GAME_DESIGN.md.
    offset: { x: -193, y: 144 },
    npcName: 'Bruiser Mags',
    npcEmoji: '🥊',
    dialogue: "Bought me one drink too many and now I owe you a favor, apparently.",
    recruit: { templateId: 'tavern_brawler', level: 5, cost: 60 },
  },
  {
    // Nassau's harbor was too shallow for Royal Navy warships but perfect for careening — beaching
    // a sloop and tipping it on its side to scrape the hull — which is exactly what kept the
    // pirate republic's fleet seaworthy with no formal shipyard.
    id: 'new_providence_careening_yard',
    islandId: 'new_providence',
    name: 'The Careening Yard',
    type: 'smithy',
    emoji: '🛠️',
    offset: { x: -380, y: -60 },
    npcName: 'Shipwright Odalys',
    npcEmoji: '👷',
    dialogue: "Tip her on her side, scrape the barnacles, patch the planks. No fleet without it.",
    recruit: { templateId: 'gun_deck_veteran', level: 6, cost: 75 },
  },
  {
    id: 'roatan_den',
    islandId: 'roatan',
    name: "Smuggler's Den",
    type: 'shop',
    emoji: '🕳️',
    offset: { x: 160, y: 140 },
    npcName: 'Quiet Sef',
    npcEmoji: '🥷',
    dialogue: "I don't ask where the gold's from. You shouldn't ask where I've been.",
    recruit: { templateId: 'gun_deck_veteran', level: 8, cost: 130 },
    itemsForSale: ['forged_papers', 'rum_ration'],
    treasuresForSale: ['smugglers_lucky_coin'],
    buysResources: true,
    sellsUpgrades: true,
  },
  {
    id: 'port_royal_college',
    islandId: 'port_royal',
    name: 'Sunken Naval College',
    type: 'college',
    emoji: '🎓',
    offset: { x: -120, y: -160 },
    npcName: 'Professor Halloway',
    npcEmoji: '🧑‍🏫',
    dialogue: 'Top of my class in gunnery theory. Practical experience, admittedly, lacking.',
    recruit: { templateId: 'master_gunner', level: 10, cost: 220 },
  },
  {
    id: 'port_royal_manor',
    islandId: 'port_royal',
    name: 'Widow Ashworth Manor',
    type: 'manor',
    emoji: '🏚️',
    offset: { x: 140, y: 180 },
    npcName: 'Lady Ashworth',
    npcEmoji: '👩',
    dialogue: "My late husband's fortune is spent. His cutlass, however, is still quite sharp.",
    recruit: { templateId: 'boarding_captain', level: 9, cost: 180 },
  },
  {
    id: 'ile_sainte_marie_shrine',
    islandId: 'ile_sainte_marie',
    name: 'Sunken Shrine',
    type: 'shrine',
    emoji: '⛩️',
    offset: { x: 0, y: -220 },
    npcName: 'The Fathomless Monk',
    npcEmoji: '🧘',
    dialogue: 'The deep offers strength to those willing to pay its price.',
    recruit: { templateId: 'kraken_bound_captain', level: 15, cost: 400 },
  },
  {
    id: 'tortuga_fishmonger',
    islandId: 'tortuga_cove',
    name: "The Fishmonger's Stall",
    type: 'market',
    emoji: '🐟',
    spriteId: 'fishmonger',
    // Full-town rebuild 2026-08-07 (item 52): the east side of the bay, past the chapel, near
    // the working docks.
    offset: { x: 297, y: -199 },
    npcName: 'Old Dinah',
    npcEmoji: '🧓',
    dialogue: "Freshest catch on the wharf. Buy it fair, or don't let me catch you taking it.",
    stealResourceId: 'fish',
    stealYield: { min: 3, max: 6 },
    stealDetectionChance: 0.35,
    stealCooldownMinutes: 20,
  },
  {
    id: 'new_providence_distillery',
    islandId: 'new_providence',
    name: 'The Distillery',
    type: 'market',
    emoji: '🥃',
    // Nudged clear a second time (2026-08-04) — see The Cracked Hull's comment above for why
    // the item-40 pass under-corrected this one too. See GAME_DESIGN.md.
    offset: { x: 350, y: 78 },
    npcName: 'Brix',
    npcEmoji: '🧑‍🌾',
    dialogue: "Rum's the only honest currency left in this republic. Mind you pay for it.",
    stealResourceId: 'rum',
    stealYield: { min: 3, max: 5 },
    stealDetectionChance: 0.4,
    stealCooldownMinutes: 25,
  },
  {
    id: 'roatan_timber_yard',
    islandId: 'roatan',
    name: 'The Timber Yard',
    type: 'market',
    emoji: '🪵',
    offset: { x: 300, y: -300 },
    npcName: 'Foreman Cutter',
    npcEmoji: '🧑‍🔧',
    dialogue: "Every plank here is spoken for. Buy it proper, or take it and answer to the yard dogs.",
    stealResourceId: 'timber',
    stealYield: { min: 3, max: 6 },
    stealDetectionChance: 0.4,
    stealCooldownMinutes: 25,
  },
  {
    id: 'port_royal_armoury',
    islandId: 'port_royal',
    name: 'The Armoury',
    type: 'market',
    emoji: '💥',
    offset: { x: 300, y: 300 },
    npcName: 'Sergeant Vane',
    npcEmoji: '💂',
    dialogue: "Crown powder, under crown lock. I'd think twice before helping yourself.",
    stealResourceId: 'gunpowder',
    stealYield: { min: 2, max: 4 },
    stealDetectionChance: 0.5,
    stealCooldownMinutes: 30,
  },
  {
    id: 'tortuga_fort',
    islandId: 'tortuga_cove',
    name: 'Fort de Rocher',
    type: 'fort',
    emoji: '🏰',
    spriteId: 'fort',
    // Full-town rebuild 2026-08-07 (item 52): moved onto the east headland guarding the harbor
    // mouth — "sat on high ground overlooking both the town and the sea approach," per the brief.
    offset: { x: 265, y: -290 },
    npcName: 'Sergeant Duclos',
    npcEmoji: '💂',
    dialogue:
      "Forty guns and one bad ladder between us and the Spanish. Mind where you step — Le Vasseur pulls it up at dusk, invited or not.",
    recruit: { templateId: 'musketeer_marksman', level: 4, cost: 40 },
  },
  {
    id: 'tortuga_chapel',
    islandId: 'tortuga_cove',
    name: 'Chapelle Notre-Dame',
    type: 'chapel',
    emoji: '⛪',
    spriteId: 'chapel',
    // Full-town rebuild 2026-08-07 (item 52): east side of the bay, between the tavern district
    // and Fort de Rocher's headland.
    offset: { x: 260, y: -151 },
    npcName: 'Brother Aldric',
    npcEmoji: '🙏',
    dialogue: "Even outlaws want forgiveness sometimes. I keep the door open and ask no questions about the cargo.",
    recruit: { templateId: 'cursed_bosun', level: 3, cost: 35 },
  },
  {
    id: 'tortuga_warehouse',
    islandId: 'tortuga_cove',
    name: "Smugglers' Warehouse",
    type: 'warehouse',
    emoji: '📦',
    spriteId: 'smugglers_den',
    // Full-town rebuild 2026-08-07 (item 52): tucked in a nook on the west side of the bay,
    // behind the Cooper's Yard and Sailmaker's Loft — contraband storage, out of sight of the
    // main quay.
    offset: { x: -193, y: -172 },
    npcName: 'Big Pella',
    npcEmoji: '🧔‍♂️',
    dialogue: "Crates in, crates out, no manifest ever matches. You look like you can keep your mouth shut — that's worth good coin here.",
    recruit: { templateId: 'deckhand_swordsman', level: 3, cost: 25 },
  },
  {
    id: 'tortuga_west_point',
    islandId: 'tortuga_cove',
    name: 'West Point Shack',
    type: 'beach',
    emoji: '🛖',
    offset: { x: -380, y: 20 },
    npcName: 'Old Man Hollis',
    npcEmoji: '🧓',
    dialogue: "Retired from the account, as they say. Out here the wind's quieter and nobody remembers my face.",
    recruit: { templateId: 'duelist_first_mate', level: 4, cost: 45 },
  },
  {
    id: 'tortuga_customs',
    islandId: 'tortuga_cove',
    name: 'The Customs House',
    type: 'customs',
    emoji: '🏛️',
    // Full-town rebuild 2026-08-07 (item 52): right by the Harbourmaster's Office at the
    // sheltered bottom of the bay, the harbor's administrative core.
    offset: { x: 28, y: -79 },
    npcName: 'Inspector Hale',
    npcEmoji: '🎩',
    dialogue:
      "Every crate that crosses this harbor's meant to pay its due to the crown. Half of it does. I've learned not to ask about the other half.",
  },
  {
    // Blueprint Sheet 3, 2026-08-13: the governor's house, first added as an invented "hero"
    // building in the illustrated town plan. Set back from the busiest quay, near Customs House
    // and Basse-Terre Square, per the sheet's own placement.
    id: 'tortuga_le_vasseur_residence',
    islandId: 'tortuga_cove',
    name: "Le Vasseur's Residence",
    type: 'manor',
    emoji: '🏛️',
    offset: { x: -10, y: -10 },
    npcName: 'Governor Le Vasseur',
    npcEmoji: '👑',
    dialogue:
      "Every crew that sails from my harbor pays a courtesy call, sooner or later. Call it a landing fee, call it insurance — either way, I'll have my due, same as the Customs House gets theirs.",
    recruit: { templateId: 'boarding_captain', level: 7, cost: 110 },
  },
  {
    // Blueprint Sheet 3, 2026-08-13: the town gaol, first added as an invented "hero" building in
    // the illustrated town plan. Placed near the harbor's admin core, close enough to the Locked
    // Ward (rescue.ts) to read as the same complex — the Gaol is the front door, the Locked Ward
    // is the wing nobody's supposed to know about.
    id: 'tortuga_gaol',
    islandId: 'tortuga_cove',
    name: 'The Gaol',
    type: 'gaol',
    emoji: '⛓️',
    spriteId: 'jail',
    offset: { x: 75, y: -10 },
    npcName: 'Warden Achille',
    npcEmoji: '🔑',
    dialogue:
      "This is the gaol proper — debtors, drunks, the odd deserter. The Locked Ward's around back, for the ones nobody's supposed to know we're holding. I don't ask who sent you, and I'd rather you didn't tell me.",
    recruit: { templateId: 'cursed_bosun', level: 6, cost: 90 },
  },
  {
    // Promoted from a landmark (2026-08-13, "add everything" pass) — was flavor-only, matching
    // Sheet 3's "2 promoted" note. Same offset as before, east side of the bay near the
    // Fishmonger's Stall and Chapelle Notre-Dame.
    id: 'tortuga_bakery',
    islandId: 'tortuga_cove',
    name: "The Baker's Oven",
    type: 'shop',
    emoji: '🍞',
    offset: { x: 319, y: -241 },
    npcName: 'Baker Solange',
    npcEmoji: '🧑🏽‍🍳',
    dialogue: "Bread at dawn, before the tavern crowd's even awake. Half the town lines up for it anyway — the other half sends a cabin boy so they don't have to.",
    itemsForSale: ['ships_biscuit'],
  },
  {
    // Promoted from a landmark (2026-08-13, "add everything" pass) — was flavor-only, matching
    // Sheet 3's "2 promoted" note. Same offset as before, docks-and-careening quarter, west side.
    id: 'tortuga_ropewalk',
    islandId: 'tortuga_cove',
    name: 'The Ropewalk',
    type: 'warehouse',
    emoji: '🪢',
    offset: { x: -280, y: -175 },
    npcName: 'Rope-Master Théo',
    npcEmoji: '🧔🏻',
    dialogue: "A long, low shed where hemp gets twisted into rigging, coil by coil. No ship sails without what's made here — mine, or a competitor's, and there isn't one.",
    recruit: { templateId: 'deckhand_swordsman', level: 3, cost: 22 },
  },
  {
    id: 'tortuga_smithy',
    islandId: 'tortuga_cove',
    name: 'The Anchor & Forge',
    type: 'smithy',
    emoji: '⚒️',
    spriteId: 'blacksmith',
    // Full-town rebuild 2026-08-07 (item 52): west side of the bay, between the Chandlery and
    // the Harbourmaster's Office — metalwork close to the working docks.
    offset: { x: -98, y: -105 },
    npcName: 'Forge-Master Kade',
    npcEmoji: '🔨',
    dialogue: "Cutlasses, grapeshot, ship fittings — if it's metal and it's broken, I can fix it or melt it down and start again.",
  },
  {
    // Tortuga was a Spanish possession before French buccaneers seized it in 1629 (and the
    // Spanish razed the pirate settlement more than once afterward, in 1635 and 1638) — this
    // redoubt predates Fort de Rocher, which Le Vasseur only built once the French had the
    // island for good. Sits on the newly-opened west cape beyond West Point Shack.
    id: 'tortuga_ruins',
    islandId: 'tortuga_cove',
    name: 'El Fuerte Viejo',
    type: 'ruins',
    emoji: '🏚️',
    offset: { x: -510, y: -10 },
    npcName: 'The Ruin-Keeper',
    npcEmoji: '🧙',
    dialogue: "Spanish stone, French blood, and nobody left who remembers which came first. I just remember it's quiet out here.",
    recruit: { templateId: 'musketeer_marksman', level: 4, cost: 50 },
  },
  {
    // The word "buccaneer" comes from boucan, the wooden smoking-frame hunters used to cure wild
    // boar and cattle meat on Hispaniola and Tortuga before the trade turned to piracy — this camp
    // is where that older, quieter trade still happens, deep in the High Woods.
    id: 'tortuga_trapper_camp',
    islandId: 'tortuga_cove',
    name: "The Trapper's Camp",
    type: 'beach',
    emoji: '🏕️',
    offset: { x: 332, y: 168 },
    npcName: 'Boucanier Yves',
    npcEmoji: '🏹',
    dialogue: "Wild boar, cut thin and smoked slow over green wood — that's how we did it before anyone called us pirates. Still works.",
    recruit: { templateId: 'gun_deck_veteran', level: 5, cost: 55 },
  },
  {
    // Every crate that crosses the harbor is meant to pay its due to the Customs House — Inspector
    // Hale himself admits half of it does. This is where the other half goes: deep enough in the
    // High Woods that no tax collector has ever bothered to look.
    id: 'tortuga_smuggler_cache',
    islandId: 'tortuga_cove',
    name: "The Smuggler's Cache",
    type: 'warehouse',
    emoji: '🕳️',
    spriteId: 'smugglers_den',
    // Nudged 4 units clear of the avenue it runs alongside (2026-08-04 sweep). See GAME_DESIGN.md.
    offset: { x: 250, y: 266 },
    npcName: 'Silent Mara',
    npcEmoji: '🥷',
    dialogue: "You didn't see this place. In exchange, I didn't see you. That's the whole arrangement.",
    recruit: { templateId: 'boarding_captain', level: 6, cost: 70 },
  },
  {
    // The original French landing on Tortuga wasn't at today's harbor — it was here, until the
    // Spanish burned it out in 1635 and 1638 (see "Ruins of the Old Landing"). A dock still clings
    // to the shore below the ruin, and someone still lives by it.
    id: 'tortuga_old_landing_dock',
    islandId: 'tortuga_cove',
    name: 'The Old Landing Dock',
    type: 'beach',
    emoji: '⚓',
    offset: { x: 184, y: 350 },
    npcName: 'Old Ilsabet',
    npcEmoji: '🧓',
    dialogue: "My grandmother's grandmother fished this water before the harbor town existed. Some of us never left, raid or no raid.",
    recruit: { templateId: 'tavern_brawler', level: 5, cost: 55 },
  },
  {
    // The big-dock district: the Harbor Pier's decorative boardwalks and moored boats got a real
    // neighborhood around them — a proper street front, working buildings, and waterfront housing
    // instead of just Fishing Dock + Warehouse standing alone on open grass. Relocated 2026-08-03
    // to sit right against the real quay (found by ray-cast, see harbor.ts) after the first pass
    // placed the whole district ~250 units inland of the actual coastline — nowhere near the dock.
    id: 'tortuga_harbourmaster',
    islandId: 'tortuga_cove',
    name: "Harbourmaster's Office",
    type: 'customs',
    emoji: '🗼',
    spriteId: 'dock_office',
    // Full-town rebuild 2026-08-07 (item 52): the sheltered bottom of the bay, right on the
    // quay — the harbor's administrative heart.
    offset: { x: -22, y: -100 },
    npcName: 'Harbourmaster Voss',
    npcEmoji: '🎖️',
    dialogue: "Every hull that ties up on this dock answers to me first — the Customs House gets its cut after. Been running this waterfront since before some of you had teeth.",
    recruit: { templateId: 'master_gunner', level: 8, cost: 150 },
  },
  {
    id: 'tortuga_chandlery',
    islandId: 'tortuga_cove',
    name: 'The Chandlery',
    type: 'shop',
    emoji: '🕯️',
    spriteId: 'shipyard',
    // Full-town rebuild 2026-08-07 (item 52): west side of the bay, past the Warehouse.
    offset: { x: -130, y: -140 },
    npcName: 'Fenwick',
    npcEmoji: '🪢',
    dialogue: "Rope, tar, sailcloth, spare rigging — if it keeps a ship's canvas from tearing loose in a storm, I stock it. My apprentice here's quick with a splice, if you're hiring.",
    recruit: { templateId: 'powder_monkey', level: 4, cost: 35 },
  },
  {
    id: 'tortuga_dockworkers_bunkhouse',
    islandId: 'tortuga_cove',
    name: "Dockworkers' Bunkhouse",
    type: 'warehouse',
    emoji: '🛏️',
    spriteId: 'inn',
    // Full-town rebuild 2026-08-07 (item 52): tavern-district side, east of Harbor Trading Post.
    offset: { x: 190, y: -126 },
    npcName: 'Cutter Doyle',
    npcEmoji: '🧢',
    dialogue: "Six of us to a room and the walls still leak, but the pay's honest and the rum's cheap. Card games run past midnight if you fancy losing your coin the easy way.",
    recruit: { templateId: 'tavern_brawler', level: 6, cost: 65 },
  },
  // Old Town infill, wedged between the existing dock buildings and packed row houses (see
  // HOUSES) — positions found the same way as everything else in this district: programmatically
  // cleared against every real path/building/house first, at the tight-but-legal minimum instead
  // of the suburb's usual spacing, so it actually reads as a cramped 17th-century harbor quarter.
  {
    id: 'tortuga_coopers_yard',
    islandId: 'tortuga_cove',
    name: "The Cooper's Yard",
    type: 'market',
    emoji: '🛢️',
    spriteId: 'market',
    // Full-town rebuild 2026-08-07 (item 52): west side of the bay, the docks-and-careening
    // quarter, next to the Sailmaker's Loft.
    offset: { x: -228, y: -211 },
    npcName: 'Old Merriweather',
    npcEmoji: '🔨',
    dialogue: "Every cask of salt pork, rum, and fresh water on this waterfront passed through my hands first. Been hooping barrels since before the Chandlery had a roof.",
    recruit: { templateId: 'cabin_hand', level: 3, cost: 25 },
  },
  {
    id: 'tortuga_sailmakers_loft',
    islandId: 'tortuga_cove',
    name: "The Sailmaker's Loft",
    type: 'shop',
    emoji: '🧵',
    spriteId: 'tailor',
    // Full-town rebuild 2026-08-07 (item 52): the west headland side of the bay, closest to the
    // careening beach.
    offset: { x: -246, y: -259 },
    npcName: 'Needle Annie',
    npcEmoji: '🪡',
    dialogue: "Torn canvas, a busted seam mid-squall, a flag shot clean off its halyard — bring it here before you bring it to the bottom of the sea.",
    recruit: { templateId: 'dockside_sharpshooter', level: 5, cost: 45 },
  },

  // "Add everything" pass (2026-08-13): the rest of Blueprint Sheet 3's named buildings, made
  // real. Offsets script-scattered across the west/interior countryside and the flatter ground
  // south of the harbor core — checked clear of every existing building/house/landmark/scenery/
  // resource/treasure/quest offset and of every street segment. See streets.ts for the matching
  // alleys.
  {
    id: 'tortuga_signal_post',
    islandId: 'tortuga_cove',
    name: 'The Signal Post',
    type: 'watchtower',
    emoji: '🚩',
    spriteId: 'tower_stone',
    // Nudged from the original scatter-generated (-283,-267) — that rounded to just outside the
    // coastline polygon on re-verification.
    offset: { x: -278, y: -258 },
    npcName: 'Lookout Yann',
    npcEmoji: '🔭',
    dialogue: "First to spot a sail, first to ring the bell — friend or Navy, I ring it the same either way and let the town sort out which.",
  },
  {
    id: 'tortuga_powder_magazine',
    islandId: 'tortuga_cove',
    name: 'The Powder Magazine',
    type: 'warehouse',
    emoji: '💣',
    offset: { x: -315, y: -78 },
    npcName: 'Old Brackish',
    npcEmoji: '🧔🏾',
    dialogue: "Kept well clear of every cookfire and hearth in town, and that's exactly why I'm still here to complain about the walk.",
  },
  {
    id: 'tortuga_counting_house',
    islandId: 'tortuga_cove',
    name: 'The Counting House',
    type: 'customs',
    emoji: '📒',
    offset: { x: -262, y: -73 },
    npcName: 'Clerk Osei',
    npcEmoji: '🧑🏿‍💼',
    dialogue: "Every ledger in Basse-Terre passes through here eventually. Mine's the only one in town that actually balances.",
  },
  {
    id: 'tortuga_vendue_house',
    islandId: 'tortuga_cove',
    name: 'The Vendue House',
    type: 'market',
    emoji: '🏷️',
    offset: { x: -291, y: -29 },
    npcName: 'Auctioneer Prue',
    npcEmoji: '🛎️',
    dialogue: "Everything sells eventually — a dead man's boots, a live man's debts. Come back Friday, bring coin, ask no questions about provenance.",
    treasuresForSale: ['sunken_locket', 'coral_earring'],
  },
  {
    id: 'tortuga_gunsmith',
    islandId: 'tortuga_cove',
    name: "The Gunsmith's Shop",
    type: 'smithy',
    emoji: '🔫',
    spriteId: 'weapons',
    offset: { x: -376, y: -108 },
    npcName: 'Powder-Burn Iyabo',
    npcEmoji: '🧑🏿‍🔧',
    dialogue: "Every lock, every barrel, every flint — tested myself before it leaves this counter. Misfires get people killed, and I don't sell dead men's problems.",
    itemsForSale: ['grapeshot_charge'],
  },
  {
    id: 'tortuga_apothecary',
    islandId: 'tortuga_cove',
    name: 'The Apothecary',
    type: 'shop',
    emoji: '🌿',
    offset: { x: -383, y: -45 },
    npcName: 'Herbalist Coline',
    npcEmoji: '🧪',
    dialogue: "Half of what I sell cures fevers. The other half, I don't ask what you're planning to do with — and neither should you.",
    itemsForSale: ['captains_draught'],
  },
  {
    id: 'tortuga_lucky_draw',
    islandId: 'tortuga_cove',
    name: 'The Lucky Draw',
    type: 'tavern',
    emoji: '🎲',
    offset: { x: -392, y: 87 },
    npcName: 'Faro Jacques',
    npcEmoji: '🃏',
    dialogue: "Cards, dice, or a wager on which gull lands first — I'll take your coin any way you'd like to lose it.",
    itemsForSale: ['treasure_map'],
    recruit: { templateId: 'cursed_bosun', level: 5, cost: 70 },
  },
  {
    id: 'tortuga_tailor',
    islandId: 'tortuga_cove',
    name: "The Tailor's Shop",
    type: 'shop',
    emoji: '🧥',
    spriteId: 'tailor',
    offset: { x: -320, y: 86 },
    npcName: 'Needle-Fine Amaru',
    npcEmoji: '🧵',
    dialogue: "A captain's coat says more than his cutlass ever will. I can cut you papers to match it too, if the coin's right.",
    itemsForSale: ['forged_papers'],
  },
  {
    id: 'tortuga_netmenders_shed',
    islandId: 'tortuga_cove',
    name: "The Netmender's Shed",
    type: 'warehouse',
    emoji: '🕸️',
    offset: { x: -315, y: 25 },
    npcName: 'Old Perpetua',
    npcEmoji: '🧓🏽',
    dialogue: "Mend a net, mend a sail, mend a man's coat while he waits — needles don't much care what they're stitching.",
    recruit: { templateId: 'deckhand_swordsman', level: 2, cost: 18 },
  },
  {
    id: 'tortuga_almshouse',
    islandId: 'tortuga_cove',
    name: 'The Almshouse',
    type: 'chapel',
    emoji: '🕊️',
    offset: { x: -243, y: 12 },
    npcName: 'Sister Odile',
    npcEmoji: '🙇🏻‍♀️',
    dialogue: "Every port needs somewhere for the ones plunder forgot. We feed who we can, and don't ask what flag they sailed under to get here.",
  },
  {
    id: 'tortuga_shipwrights_slip',
    islandId: 'tortuga_cove',
    name: "Shipwright's Slip",
    type: 'smithy',
    emoji: '🚢',
    spriteId: 'shipyard',
    offset: { x: -305, y: -136 },
    npcName: 'Master Wright Dubois',
    npcEmoji: '👷🏾',
    dialogue: "Bring me a hull with more hope than planking left, and I'll bring it back able to take a broadside.",
    recruit: { templateId: 'gun_deck_veteran', level: 5, cost: 55 },
  },
  {
    id: 'tortuga_careening_shed',
    islandId: 'tortuga_cove',
    name: 'The Careening Shed',
    type: 'smithy',
    emoji: '🛶',
    spriteId: 'shipyard',
    offset: { x: -185, y: 25 },
    npcName: 'Bosun Katell',
    npcEmoji: '👷🏻‍♀️',
    dialogue: "Tip her on her side, scrape the weed and the worm off the hull, patch what's rotten — same trick that's kept this whole harbor's fleet afloat.",
    recruit: { templateId: 'boarding_captain', level: 5, cost: 60 },
  },
  {
    id: 'tortuga_tannery',
    islandId: 'tortuga_cove',
    name: 'The Tannery',
    type: 'warehouse',
    emoji: '🥾',
    offset: { x: -135, y: 25 },
    npcName: 'Tanner Osric',
    npcEmoji: '🧑🏼‍🏭',
    dialogue: "You can smell this place before you see it, and I've long since stopped apologizing for that. Every belt and boot sole in town starts here.",
  },
  {
    id: 'tortuga_distillery',
    islandId: 'tortuga_cove',
    name: 'The Distillery',
    type: 'shop',
    emoji: '🥃',
    offset: { x: -165, y: -17 },
    npcName: 'Distiller Rosalind',
    npcEmoji: '🧑🏻‍🔬',
    dialogue: "Licensed, taxed, and above-board — unlike a certain still I hear tell of out in the High Woods. Mine's just better rum, is all.",
    itemsForSale: ['rum_ration'],
    buysResources: true,
  },
  {
    id: 'tortuga_tobacco_warehouse',
    islandId: 'tortuga_cove',
    name: 'The Tobacco Warehouse',
    type: 'warehouse',
    emoji: '🍂',
    offset: { x: -220, y: -31 },
    npcName: 'Warehouseman Gwillot',
    npcEmoji: '🧑🏽‍🌾',
    dialogue: "Every leaf out of La Ringot Fields dries under this roof before it ships. Touch the crop before it's cured and I'll know your fingerprints.",
    recruit: { templateId: 'cabin_hand', level: 2, cost: 15 },
  },
  {
    id: 'tortuga_ships_provisioner',
    islandId: 'tortuga_cove',
    name: "The Ship's Provisioner",
    type: 'shop',
    emoji: '🧺',
    spriteId: 'trading_co',
    offset: { x: -65, y: 24 },
    npcName: 'Provisioner Idelle',
    npcEmoji: '🧑🏾‍💼',
    dialogue: "Salt pork, hard biscuit, a cask of water that won't turn green by the second week — I stock a voyage, not a shopping list.",
    itemsForSale: ['ships_biscuit', 'rum_ration'],
  },
  {
    id: 'tortuga_salt_works',
    islandId: 'tortuga_cove',
    name: 'The Salt Works',
    type: 'warehouse',
    emoji: '🧂',
    offset: { x: -7, y: 32 },
    npcName: 'Salter Benoit',
    npcEmoji: '🧑🏼‍🔧',
    dialogue: "Evaporate the seawater, rake the pans, cure the catch before it turns — dull work, but a harbor full of fishermen would starve without it.",
    buysResources: true,
  },
  {
    id: 'tortuga_boarding_house',
    islandId: 'tortuga_cove',
    name: 'The Boarding House',
    type: 'tavern',
    emoji: '🛏️',
    spriteId: 'inn',
    offset: { x: 19, y: 67 },
    npcName: 'Landlady Fenn',
    npcEmoji: '🧑🏽‍🦱',
    dialogue: "A bed, a lock on the door, and I don't ask why you're paying in coin that still smells of powder smoke. Rules of the house — settle up before you sail.",
    recruit: { templateId: 'tavern_brawler', level: 4, cost: 40 },
  },
  {
    id: 'tortuga_turtle_kraal',
    islandId: 'tortuga_cove',
    name: 'The Turtle Kraal',
    type: 'market',
    emoji: '🐢',
    offset: { x: 33, y: 4 },
    npcName: 'Kraal-Keeper Junot',
    npcEmoji: '🧑🏿‍🌾',
    dialogue: "Live pens, penned right off the shallows — the same trade the Dutch named this whole island for. We just never stopped doing it.",
    recruit: { templateId: 'powder_monkey', level: 3, cost: 20 },
  },
  {
    id: 'tortuga_timber_yard',
    islandId: 'tortuga_cove',
    name: 'The Timber Yard',
    type: 'warehouse',
    emoji: '🪵',
    offset: { x: 158, y: 32 },
    npcName: 'Yardmaster Colm',
    npcEmoji: '🧑🏻‍🌾',
    dialogue: "Every plank that patches a hull in this harbor came through my yard first. Good wood's worth more than the gold it gets traded for, some seasons.",
    buysResources: true,
  },
  {
    id: 'tortuga_sextons_house',
    islandId: 'tortuga_cove',
    name: "The Sexton's House",
    type: 'chapel',
    emoji: '⛏️',
    offset: { x: 123, y: 86 },
    npcName: 'Sexton Marcelline',
    npcEmoji: '🧑🏽‍🦳',
    dialogue: "I dig the graves, ring the bell for Chapelle Notre-Dame, and keep the churchyard tidier than most of this town deserves.",
  },
  {
    id: 'tortuga_fishermens_guildhall',
    islandId: 'tortuga_cove',
    name: "Fishermen's Guildhall",
    type: 'market',
    emoji: '🎣',
    spriteId: 'fishmonger',
    offset: { x: 97, y: 38 },
    npcName: 'Guildmaster Perrin',
    npcEmoji: '🧑🏻‍🦲',
    dialogue: "Every hook and net crew on this coast pays dues here, one way or another. Cross the Guild and you'll find your usual waters strangely empty of fish.",
    recruit: { templateId: 'dockside_sharpshooter', level: 4, cost: 40 },
  },
  {
    id: 'tortuga_old_watchtower',
    islandId: 'tortuga_cove',
    name: 'The Old Watchtower',
    type: 'watchtower',
    emoji: '🏯',
    spriteId: 'tower_wood',
    offset: { x: 52, y: -119 },
    npcName: 'Old Garrick',
    npcEmoji: '🧓🏾',
    dialogue: "Older than the Signal Post, and half-fallen besides — but I still climb it most evenings, out of habit more than duty.",
  },
];

export function buildingsForIsland(islandId: string): Building[] {
  return BUILDINGS.filter((b) => b.islandId === islandId);
}

export function buildingWorldPosition(
  building: Building,
  islandPosition: { x: number; y: number }
): { x: number; y: number } {
  return { x: islandPosition.x + building.offset.x, y: islandPosition.y + building.offset.y };
}
