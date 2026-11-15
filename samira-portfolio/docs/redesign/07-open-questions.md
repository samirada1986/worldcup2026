# 07 · What I need from the artist (nothing below has been guessed)

Everything the site shows is either her own words or a plain description of what is visible. These are the gaps, in order of impact.

## 1. Photographs

- [ ] **Original or highest-resolution files.** Today the only source is the portfolio document, which holds each photograph at about **1110 × 740 px**. That is why no photograph is shown larger than that. With originals (even 2000–3000 px on the long edge) the site could present them larger, and prints/press would be possible. *Never send print masters to the site; web versions only.*
- [ ] **Titles** (if she wants any), **years**, **locations**, **edition/medium** for each photograph. None were supplied, so the site shows plate numbers only.
- [ ] **Series title.** The black-and-white page in her document carries the label **«مجموعه‌ی لحظه‌ی جاری»**. Is that the title of that series? Is the colour set part of it? (The site currently calls the whole set simply "Documentary".)
- [ ] **Sequence.** I proposed an order (the two lake photographs paired; the two solitary figures paired). It is changeable by drag-and-drop in `/admin`. Her decision.
- [ ] **Alt text review.** I wrote plain descriptions in English and Persian. She should correct anything that doesn't match what she sees.
- [ ] **Rights / credits** line for the footer and shared images, if different from "© Samira Dadashi".

## 2. Biography and CV

- [ ] **Education:** degree levels, institutions, years. (The site lists only "Pure Mathematics" and "Industrial Engineering", exactly what her biography says.)
- [ ] **Series dates** (documentary period), if she wants them shown.
- [ ] **Exhibitions, publications, awards and grants**, with year, title, venue, city. Sections appear only when filled.
- [ ] **Downloadable CV (PDF)** and **portfolio PDF.** The CV page prints cleanly to PDF today; a designed PDF can be added.
- [ ] **Persian text** for any new content (optional fields fall back to English).

## 3. Decisions

- [ ] **Domain name** (set `NEXT_PUBLIC_SITE_URL` in Netlify).
- [ ] **Release policy** for work that is not yet public: what, when, and in what words.
- [ ] **Repository privacy.** If the repository is public, check that nothing unreleased is in its *history* as well as in its current files; if it is, make the repository private or rewrite the history before sharing the link.
- [ ] **Contact form:** it currently opens the visitor's email program. A hosted form (e.g. Netlify Forms) would send directly; needs her go-ahead.

## 4. For the benchmark

- [ ] Allow the four benchmark hosts listed in `03-benchmark.md` in the environment's network settings (or send addresses), so the website study can be done by observation.
- [ ] Open the **deployed** Netlify URL from a machine with access and confirm it matches this build (it could not be opened from here).

## Content corrected in this pass (so it is on record)

| Was shown | Why it was wrong | Now |
|---|---|---|
| "M.A. — Industrial Engineering / B.Sc. — Pure Mathematics" | Degree levels were never supplied | "Pure Mathematics", "Industrial Engineering" |
| Series dates "2016 – 2022" | Never supplied | No dates |
| Medium "Digital photography" | Never supplied | "Photography" |
| Lede / intro about "the moment the everyday turns strange" | My interpretation, not her words | Her own phrases from her biography |
| About › Selected themes (body, trace, residue…) | From the brief, not from her documents | Her own phrases from her biography |
| Public copy naming unreleased work | Must stay private until released | Removed from every public surface |
