# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# 🔒 Art asset generation: one asset per image, never a grid/sheet

Locked in 2026-08-17. When writing or updating any art brief (`ART_BRIEF.md`, `TERRAIN_BRIEF.md`,
`UI_MENU_ART_BRIEF.md`, `CONVERSATION_BACKGROUNDS_BRIEF.md`, or any future one), every generation
request must ask for **exactly one asset per image** — never a multi-item grid, catalog sheet, or
collage packing several items into one canvas for later cutting. This applies regardless of how
cheap or convenient a multi-item sheet seems, and regardless of what any brief said before this
date. If a brief groups items into numbered "sheets" or batches for the user's own ordering
convenience, that's a checklist grouping only — the accompanying prompt text must still make clear
each item is its own separate image generation, not a panel in one packed canvas. This is a
standing rule, not a one-off preference — do not reintroduce grid/sheet delivery language into any
brief without the user explicitly asking for it again.

# 🔒 World art style: locked to docs/style/target_style.png

Locked in 2026-11-23 by the user. All island and world art (ground, buildings, trees, props, boats,
animals) is dense, detailed top-down pixel art matching `docs/style/target_style.png`: bright turquoise
sea with foam and submerged rocks, dark jagged coastal rocks, palms and flowering bushes everywhere,
grey cobbles, red-tiled cream buildings, heavy timber docks on pilings, sun from the upper left.
Every art brief and every generation request (Weave, Figma or an artist) uses this image as the
style reference. Do not switch the world to smooth cartoon, painterly or any other style, and do not
change or replace the target image, unless the user explicitly asks to change the locked style.
Characters' look for map sprites vs portraits is a separate decision and is not covered by this lock.
