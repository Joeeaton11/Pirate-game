# Captain Scally — locked design (2026-11-14)

Chosen by Joe: **Current look + Option B (Cheeky on the shoulder).**

- **Scally's base design is unchanged.** Black tricorn with a skull, red bandana, brown hair, black coat with gold trim, red sash, gold hoop earring. The `emote_wave.png` sprite is the master reference.
- **Signature feature: Cheeky.** Before Cheeky joins (story gate: after the Black Pearl is captured), Scally appears alone, exactly as he looks now.
  After Cheeky joins, he is Scally's trademark:
  - Key art, portraits, menus, dialogue and the store icon show Cheeky riding on Scally's **left shoulder** (Scally's left, which is the viewer's right). Reference: `scally_with_cheeky_shoulder.png`.
  - On the overworld map, Cheeky walks behind Scally (`CHEEKY_*` in MapScreen.tsx).
- **Rejected options:** A (plume + coin), C (teal sea coat) and D (compass + hair tuft). C may come back as an unlockable outfit.
- `character_sheet_options.png` is the comparison sheet the decision was made from.

## Dialogue portraits with Cheeky
These are `face_cheeky_0..4.png` (256×256). They use the same expression order as `face_0..4`: grin, smirk, determined, laughing, shocked.
After the Black Pearl is captured, use these instead of `face_N`.
`face_cheeky_5` is a victory cheer, shown when a rival lord is defeated.
