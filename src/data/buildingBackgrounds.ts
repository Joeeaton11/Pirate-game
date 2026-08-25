// Real background art for BuildingScreen's interior view, replacing the flat INTERIOR_COLORS/
// FLOOR_COLORS fill that's been standing in since the walkable-room rewrite (item 111). Sourced
// entirely from the conversation-background library filed across items 167-176 in GAME_DESIGN.md —
// no new art, this is purely a wiring pass per the user's explicit request to close the gap between
// "art library" and "what's actually on screen."
//
// Two-tier lookup: a per-building override where a specific scene is a real, documented match
// (an actual named location from a manifest, or a strong thematic name match), falling back to one
// default scene per BuildingType for the other ~40 buildings that don't have bespoke art. This is a
// deliberate choice over hand-picking something for all 55 — the library doesn't have 55 distinct
// interiors, and pretending otherwise would mean either reusing the same handful of scenes under a
// false pretense of specificity, or forcing a mismatch. A type-based fallback is honest about that
// and still replaces every single flat-color room with real art.
import { ImageSourcePropType } from 'react-native';
import { BuildingType } from './buildings';
import {
  SCENE_BLACK_PEARL_CAPTAINS_QUARTERS,
  SCENE_CASTAWAY_CAMP_BEACH_DAY,
  SCENE_FORT_COURTYARD_GENERIC,
  SCENE_JUNGLE_TEMPLE_RUINS_1,
  SCENE_ROATAN_CAREENING_YARD,
  SCENE_ROATAN_CAREENING_YARD_ALT2,
  SCENE_ROATAN_CAREENING_YARD_ALT3,
  SCENE_ROATAN_FORGE_INTERIOR,
  SCENE_ROATAN_FORGE_NIGHT,
  SCENE_RUM_CELLAR_GENERIC,
  SCENE_SMUGGLERS_GROTTO,
  SCENE_TAVERN_INTERIOR_GENERIC,
  SCENE_TAVERN_INTERIOR_GENERIC_2,
  SCENE_TAVERN_INTERIOR_GENERIC_3,
  SCENE_TAVERN_INTERIOR_GENERIC_4,
  SCENE_TORTUGA_CHAPEL_1,
  SCENE_TORTUGA_CHAPEL_2,
  SCENE_TORTUGA_GAOL_INTERIOR,
  SCENE_TORTUGA_GOVERNORS_RESIDENCE,
  SCENE_TORTUGA_HARBOURMASTER_OFFICE,
  SCENE_TORTUGA_MARKET_DAY,
  SCENE_TORTUGA_MARKET_DAY_ALT2,
  SCENE_TORTUGA_RUINS,
  SCENE_TORTUGA_SIGNAL_POST,
} from './sceneBackgrounds';

/** One scene per `BuildingType` — used whenever a building has no bespoke entry below. Picked for
 * the closest real thematic fit among what's actually in the library (see GAME_DESIGN.md items
 * 167-176 for what each scene is and where it came from). */
const TYPE_FALLBACK: Record<BuildingType, ImageSourcePropType> = {
  tavern: SCENE_TAVERN_INTERIOR_GENERIC,
  beach: SCENE_CASTAWAY_CAMP_BEACH_DAY,
  manor: SCENE_TORTUGA_GOVERNORS_RESIDENCE,
  // No dedicated "naval college" scene exists — the Harbourmaster's Office (charts, a globe,
  // navigation instruments) is the closest thematic fit in the library.
  college: SCENE_TORTUGA_HARBOURMASTER_OFFICE,
  // No dedicated shrine scene — the jungle temple ruins are the closest "ancient/mystical" match.
  shrine: SCENE_JUNGLE_TEMPLE_RUINS_1,
  shop: SCENE_TORTUGA_MARKET_DAY,
  market: SCENE_TORTUGA_MARKET_DAY_ALT2,
  fort: SCENE_FORT_COURTYARD_GENERIC,
  chapel: SCENE_TORTUGA_CHAPEL_1,
  warehouse: SCENE_RUM_CELLAR_GENERIC,
  customs: SCENE_TORTUGA_HARBOURMASTER_OFFICE,
  smithy: SCENE_ROATAN_FORGE_INTERIOR,
  ruins: SCENE_TORTUGA_RUINS,
  gaol: SCENE_TORTUGA_GAOL_INTERIOR,
  watchtower: SCENE_TORTUGA_SIGNAL_POST,
};

/** Per-building overrides — a real documented location match (the building's own name identifies
 * the scene, or vice versa per that scene's manifest) or a strong enough thematic match to name
 * beat the generic type fallback. Anything not listed here just uses `TYPE_FALLBACK[building.type]`. */
const BUILDING_OVERRIDES: Record<string, ImageSourcePropType> = {
  // Chapelle Notre-Dame — the real chapel this scene was cut from (GAME_DESIGN.md item 174).
  tortuga_chapel: SCENE_TORTUGA_CHAPEL_1,
  // Same chapel, second angle — a variety pick for another chapel-typed building rather than
  // reusing the exact same frame everywhere.
  tortuga_almshouse: SCENE_TORTUGA_CHAPEL_2,
  // Le Vasseur's Residence — the real governor's manor this scene was cut from (item 174).
  tortuga_le_vasseur_residence: SCENE_TORTUGA_GOVERNORS_RESIDENCE,
  // Harbourmaster's Office — the real building this scene was cut from (item 174).
  tortuga_harbourmaster: SCENE_TORTUGA_HARBOURMASTER_OFFICE,
  // The Gaol — the real building this scene was cut from (item 168's original delivery).
  tortuga_gaol: SCENE_TORTUGA_GAOL_INTERIOR,
  // El Fuerte Viejo — the real ruins this scene was cut from (item 172).
  tortuga_ruins: SCENE_TORTUGA_RUINS,
  // The Signal Post — the real watchtower this scene was cut from (an early, pre-session delivery
  // per sceneBackgrounds.ts's own note on SCENE_TORTUGA_SIGNAL_POST).
  tortuga_signal_post: SCENE_TORTUGA_SIGNAL_POST,
  // The Anchor & Forge — the real smithy this scene was cut from (item 171's note: despite the
  // "Roatan" export name, the manifest documents this as Tortuga's own smithy).
  tortuga_smithy: SCENE_ROATAN_FORGE_INTERIOR,
  // The Gunsmith — a second, distinct smithy building; the exterior forge-at-night scene gives it
  // a different look from the Anchor & Forge's interior rather than reusing the same frame.
  tortuga_gunsmith: SCENE_ROATAN_FORGE_NIGHT,
  // Shipwright's Slip — a real shipyard scene fits a shipwright's own workspace directly.
  tortuga_shipwrights_slip: SCENE_ROATAN_CAREENING_YARD,
  // The Careening Shed — name match: this is literally a careening-yard building.
  tortuga_careening_shed: SCENE_ROATAN_CAREENING_YARD_ALT2,
  // The Careening Yard — exact name match, and per item 170's manifest note this scene's real
  // location is New Providence, which is exactly where this building sits.
  new_providence_careening_yard: SCENE_ROATAN_CAREENING_YARD_ALT3,
  // Smuggler's Den / Smugglers' Warehouse — a hidden sea-cave stash fits both names directly.
  roatan_den: SCENE_SMUGGLERS_GROTTO,
  tortuga_warehouse: SCENE_SMUGGLERS_GROTTO,
  // The Distillery (both islands' copies) — the rum-cellar scene is a direct thematic match for a
  // building that makes spirits, closer than the generic shop/market fallback.
  tortuga_distillery: SCENE_RUM_CELLAR_GENERIC,
  new_providence_distillery: SCENE_RUM_CELLAR_GENERIC,
  // Extra tavern variety — three more tavern-typed buildings get the other tavern-interior scenes
  // instead of all sharing the exact same frame as The Salty Parrot.
  tortuga_lucky_draw: SCENE_TAVERN_INTERIOR_GENERIC_2,
  tortuga_boarding_house: SCENE_TAVERN_INTERIOR_GENERIC_3,
  new_providence_tavern: SCENE_TAVERN_INTERIOR_GENERIC_4,
  // The Black Pearl's own captain's quarters — used if/when the ship ever routes through
  // BuildingScreen for a below-decks interior; harmless to predefine even if unused today.
  black_pearl_captains_quarters: SCENE_BLACK_PEARL_CAPTAINS_QUARTERS,
};

/** The background image to show behind a building's interior — a real per-building match where
 * one exists, else the closest scene for that building's type. Every building gets real art; none
 * fall through to a flat color. */
export function backgroundForBuilding(buildingId: string, type: BuildingType): ImageSourcePropType {
  return BUILDING_OVERRIDES[buildingId] ?? TYPE_FALLBACK[type];
}
