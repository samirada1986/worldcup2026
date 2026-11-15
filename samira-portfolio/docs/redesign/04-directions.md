# 04 · Three creative directions, and the one chosen

All three were judged against the *actual* work (see `02-practice.md`): eight photographs at ~1110 × 740 px, four black-and-white and four colour, people meeting painted surfaces and open ground.

## A · The Quiet Gallery
Museum-like, spacious, photograph-led.

- **Rationale:** the pictures are quiet and rely on small figures in large frames; a hushed ground lets them speak.
- **Type:** a literary serif for names and ledes, a neutral sans for interface and captions.
- **Colour:** warm paper, ink, one clay hairline.
- **Layout:** one photograph per "room"; wide margins; consistent caption.
- **Home:** one photograph, name set small, almost no text.
- **Motion:** near none.
- **For:** calm, credible to curators, unmistakably "not a template".
- **Against:** with eight photographs the page can feel sparse and repetitive; nothing creates rhythm.

## B · The Experimental Photobook
Asymmetric, editorial, tactile.

- **Rationale:** the series has a natural order, two tonal halves and obvious pairs; that *is* a book.
- **Type:** the same serif at modest scale, plate numbers as a typographic device.
- **Layout:** large plate, pairs with an offset drop, single plates alternating sides, an index of plates like a contact sheet.
- **Home:** a title page (typographic) facing a plate.
- **Motion:** quiet, tied to turning a page.
- **For:** gives the short series rhythm and authorship; easy to extend.
- **Against:** easy to over-design; offsets and pairing must never break reading order.

## C · The Digital Exhibition
Immersive, spatial, cinematic.

- **Rationale:** a walk-through of rooms with controlled motion.
- **Layout:** full-bleed images, scroll-driven transitions.
- **For:** memorable.
- **Against, specific to this work:** the photographs are ~1110 px wide, so full-bleed on a 1440–1920 px screen means enlarging them 30–70 % (visibly soft); eight photographs are too few to justify a spatial route; scroll-driven effects work against slow looking; heavy JavaScript hurts mobile.
- **Verdict:** rejected as a base; one idea kept (a slow mask "unveil").

## Decision: **A + B, with one idea from C**

**"A quiet gallery, built like a book."**

1. **The ground and restraint of A:** paper, ink, hairlines, no decoration.
2. **The authorship of B:** an authored sequence with a large opening plate, pairs, singles, and an index of plates.
3. **From C, only the unveil:** a slow mask that lifts as a photograph enters the screen, because it paces looking without delaying it.

**Original identity**, in three signatures: (1) *plate numbers* instead of titles, in tabular figures, as the site's quiet signature; (2) the **single clay hairline** taken from her own printed portfolio; (3) the **"native size" rule**: a photograph is never shown larger than its own pixels, so every image sits as an object in generous space.

## How the three project layouts work (all share one `Plate` component)

| Mode | Rhythm | Use |
|---|---|---|
| **Visual essay** (`essay`) | One photograph at a time, long pauses | A short, cinematic series |
| **Editorial sequence** (`editorial`) | Large plate, pairs, singles, offsets; honours per-photograph hints | The documentary series (in use) |
| **Research archive** (`archive`) | Photograph beside its note | Work that needs text, documents, context |

The artist chooses the mode, order and per-photograph placement in the admin panel; nothing is hard-coded.
