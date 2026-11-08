# 1. Benchmark analysis

## Method and limitations

Live browsing was available. On 8 November 2026, each reference homepage was:

1. fetched and converted to text, to read navigation, structure and copy;
2. loaded in headless Chromium at **1440 × 900** (desktop) and **390 × 844** (mobile). Screenshots and computed font families were recorded.

Limitations, stated plainly:

- **Only homepages were reviewed.** Project pages, galleries and biographies were not crawled. Statements about those areas come from homepage navigation and links only.
- **laiaabril.com** returned a bot-verification screen to the headless browser. Its findings come from the text extraction (structure, labels, grouping), not from its visual design.
- **vivianesassen.com** did not reach "network idle" within 30 s (streaming video). The screenshot shows the state after load.
- Typefaces are the CSS `font-family` values the browser reported, not visual identification.

## Comparison

| | Viviane Sassen | Rinko Kawauchi | Laia Abril | Taryn Simon | Alec Soth | Elina Brotherus | Cristina de Middel |
|---|---|---|---|---|---|---|---|
| **Visual language** | Immersive, experimental. A mirrored, kaleidoscopic moving-image composition fills the screen. | Pale grey ground, one large photograph, almost no text. | Text-only index (visual not captured). | Black ground, condensed uppercase sans for navigation, centred serif lists. | Helvetica, an orange intro banner, embedded YouTube. | Full-bleed photograph with the name and statement set over it. | Red wordmark on white, playful, with GIFs. |
| **Navigation** | Hidden. Only the name (a link to /news) is visible. | Small serif text column at the left: News, Biography, Works, Publications, Articles, Contact, Instagram. | Work, Books, Exhibitions, Workshops, About, Contact. | Works, Installation views, Books, Essays/Videos, Contact. | "Menu": Projects, Calendar, About, Contact. | One link: "Works and info". | My spark, Their spark, books, exhibitions, journal, about. |
| **Homepage** | One immersive work, sound toggle. | One image (gallery of 9), no copy. | Numbered project index grouped by series and chapter. | Exhibition list in reverse chronological order. | Bio, fundraiser, exhibitions, books and press quotes, videos. | Hero image plus a one-line statement. | Featured book slider plus a masonry grid. |
| **Project presentation** | Not reviewed. | Not reviewed. | Each project links to Project / Book / Exhibitions / Press anchors, with counts. | Works listed as titles. | Books with publisher, year and press quotes. | Behind a single link. | `/works/` pages. Titles repeat across many grid tiles. |
| **Typography** | EB Garamond, 14 px | Adobe Garamond, 10–15 px (very small) | Times New Roman | Akzidenz (condensed) + Adobe Garamond | Helvetica Neue | Futura PT | Work Sans / Silva Text |
| **Responsive** | Composition crops to a band on mobile. | "Menu" button. The image sits far below the fold, leaving a large empty area. | n/a | The mobile menu fills the whole first screen in huge condensed caps. | The orange banner pushes content down. | The text over the image becomes hard to read. | Two-column masonry. Readable. |
| **Biography** | Not reviewed. | A "Biography" page is in the navigation. | About. | Not in the navigation. | Inline on the homepage. | Hidden behind "Works and info". | About. |

## Strengths and weaknesses

- **Sassen.** *Strength:* artistic confidence; the site itself behaves like a work. *Weakness:* almost no discoverability; heavy autoplaying media; a curator cannot find the CV quickly.
- **Kawauchi.** *Strength:* quiet rhythm, uninterrupted viewing, a clear EN/JP language switch. *Weakness:* 10–13 px text fails comfortable reading and accessibility; awkward empty space on mobile.
- **Abril.** *Strength:* the best project architecture in the set. Series, chapters and Project/Book/Exhibition/Press layers suit research-led practice. *Weakness (from structure):* a text-heavy index with no imagery on the homepage.
- **Simon.** *Strength:* rigorous typographic archive with institutional credibility. *Weakness:* the homepage is an exhibition list, the artwork is not the entry point, and the mobile menu dominates.
- **Soth.** *Strength:* personal voice; press and books are easy to find. *Weakness:* busy and promotional (banner, fundraiser, embeds), closer to a blog than an exhibition.
- **Brotherus.** *Strength:* immediate image impact. *Weakness:* an agency-style hero with text over the photograph, which conflicts with artwork integrity.
- **de Middel.** *Strength:* a distinctive, humorous identity. *Weakness:* masonry breaks intentional sequencing; the newsletter pop-up interrupts.

## Transferable ideas and how they were used

| Idea | Source | Used as |
|---|---|---|
| One uncropped work as the entry point, no slogan | Kawauchi, Sassen | Homepage "exhibition cover": one CONATUS work, placed asymmetrically, never overlaid by text |
| Visible bilingual switch | Kawauchi (EN/JP) | `فارسی` / `English` always visible in the header, including on mobile |
| Layered project architecture | Abril | Project page = statement → sequence → exhibition views → exhibitions → documents → related writing |
| Typographic index | Simon, Abril | Works index, Writing index and CV are ruled, numbered typographic lists |
| Restraint with media | negative lesson from Sassen and Soth | No autoplay, no embeds unless the artist adds a video block |
| Never text over the artwork | negative lesson from Brotherus | Captions always sit outside the image |
| Intentional sequence, not a masonry grid | negative lesson from de Middel | CMS layout blocks with exact order; no automatic grids |
| Readable type sizes | negative lesson from Kawauchi | Body text 17 px minimum, captions 14 px, labels ≥ 12.5 px |
