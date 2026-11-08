# 2. Design direction

Two distinct concepts were developed and compared against the brief: exhibition, publication, product.

## Concept A — "Exhibition Wall"

Image-led. A paper-white ground (#F7F6F2) and near-black ink. Display serif titles (Instrument Serif) with a neutral grotesk for interface text (Inter). Works sit on an asymmetrical 12-column grid with large margins, like prints hung on a wall. Text is sparse and always placed beside the image, never on it.

- **For:** feels like an exhibition; the artwork carries all the colour; strong curatorial impression.
- **Against:** on its own it can feel like a lookbook; long texts and CV need a more structured system.

## Concept B — "Research Index"

Text-first. Everything starts as a numbered typographic index (Works, Writing, CV) in a single grotesk, with thumbnails as secondary information. Dense, archival, close to Taryn Simon and Laia Abril.

- **For:** excellent for curators and institutions scanning for facts; scales to many projects and essays.
- **Against:** the artwork is not the entry point. With only one completed project, an index-first homepage looks empty and bureaucratic.

## Decision — "Quiet Archive" (A, structured by B)

| Criterion | A | B | Chosen |
|---|---|---|---|
| Artwork as central experience | ●●● | ●○○ | A for Home, Project and Artwork pages |
| Curator efficiency (facts, CV, contact) | ●○○ | ●●● | B for Works index, Writing index, CV and Exhibitions |
| Long-form reading | ●●○ | ●●○ | A dedicated reading layout (below) |
| Works with 1 project and with 30 | ●●○ | ●●● | B's index scales; A's homepage stays strong with one project |
| Bilingual RTL/LTR | ●●○ | ●●○ | Both work, using logical CSS properties |

The site therefore **behaves like an exhibition** (homepage cover, project sequences, lightbox) and **reads like an art publication** (essay layout, footnotes, pull quotes). Its **structure works like a well-designed product**: indexes, CV, clear navigation, a contact form with clear states.

## Works page: two layouts evaluated

1. **Editorial index** (implemented): numbered rows of thumbnail, title, year/medium/number of works, and status. Every fact is visible at once; it scales to many projects; no cropping (thumbnails use `object-fit: contain`).
2. **Curated visual grid**: large uniform tiles. Rejected for now. With one or two published projects it looks sparse. Uniform tiles also force crops or uneven heights for mixed portrait and landscape covers, which violates the no-crop rule.

Status filters appear automatically only once there are at least 6 projects in more than one status, so the page is not overengineered.

## Major design decisions and reasons

- **No hero slogan, no slider.** The homepage opens with one uncropped CONATUS work and its title. Nothing else competes.
- **Artwork never cropped or distorted.** Every image keeps its file ratio. Sequence figures are sized by aspect ratio so a whole work fits the viewport height (`86svh`) and its caption aligns with the image edge. Automated tests check rendered ratio = file ratio at 6 widths.
- **Captions outside images**, numbered `01, 02 …` to give the sequence an exhibition-checklist rhythm and a stable reference for curators ("image 07").
- **Each artwork has its own permalink** (`/works/conatus/7`) for press and editors.
- **The lightbox uses the paper ground, not black**, so the viewing atmosphere stays the same. The interface is reduced to a counter, Previous/Next and Close.
- **Motion is limited to** a 0.9 s fade-in of images entering the viewport, a hairline underline on navigation hover and a 240 ms lightbox fade. All of it is disabled under `prefers-reduced-motion`.
- **The header is not sticky.** The pages are image sequences; a fixed bar would sit over artworks. The lightbox and the mobile menu provide their own controls.
- **Persian is designed, not mirrored.** It uses its own family (Vazirmatn), sizes, weights and line height (≈2.0 for reading). It never uses uppercase or letter-spacing, which break joined script, and it uses Persian digits. Text in one language placed inside a page of the other switches typography for that element only.
