import type { Project } from "@/lib/types";
import { PUBLISH_CONATUS } from "./visibility";

/**
 * Source of truth: the artist's own portfolio (Summer 1405 / 2026).
 * Persian texts are hers; English is a faithful translation.
 * No exhibitions, awards or biographical facts are invented.
 */

const conatus: Project = {
  slug: "conatus",
  order: 1,
  status: "ongoing",
  mode: "cinematic",
  title: { en: "Conatus", fa: "کوناتوس" },
  kicker: { en: "Ongoing · 2025–2026", fa: "در حال انجام · ۱۴۰۴–۱۴۰۵" },
  year: { en: "2025 – ongoing", fa: "۱۴۰۴ – تاکنون" },
  medium: {
    en: "Photography, altered photographic prints, double exposure, thinner on surface",
    fa: "عکاسی، چاپِ دست‌کاری‌شده، دابل‌اکسپوژر، تینر بر سطح",
  },
  cover: {
    src: "/works/conatus/overlap/damavand.jpg",
    w: 1181,
    h: 836,
    alt: {
      en: "A photograph of Mount Damavand overtaken by dark, ink-like root forms spreading across the frame.",
      fa: "تصویری از قله‌ی دماوند که فرم‌های تیره و ریشه‌مانند سطح آن را فرا گرفته‌اند.",
    },
  },
  intro: {
    en: [
      "Conatus is an ongoing project that began from a personal encounter with cancer — with the body, its transformation, and the bare human impulse to persist.",
      "It does not set out to picture illness, and it refuses to romanticise suffering. It asks, instead, what happens when two wills to survive share a single body.",
    ],
    fa: [
      "کوناتوس پروژه‌ای در جریان است که از مواجهه‌ای شخصی با سرطان آغاز شد — با بدن، دگرگونی‌اش و میلِ عریانِ انسان به ادامه‌یافتن.",
      "این کار در پیِ تصویرکردنِ بیماری نیست و از رمانتیزه‌کردنِ رنج می‌پرهیزد. پرسش آن این است: وقتی دو میل به بقا در یک بدن جمع می‌شوند، چه رخ می‌دهد؟",
    ],
  },
  statement: {
    en: [
      "Every form of life carries a will to persist — a pull that, before choice, before awareness, before any name is laid upon it, moves the living thing to preserve itself and resist its own undoing. This will is forever seeking a way to remain.",
      "A presence that advances in silence, passes through the fissures, and — leaving no clear border between itself and its surroundings — transforms whatever it touches. Every extension brings a change with it; every presence shapes a different order.",
      "For this reason, continuing and eroding cannot be held as two separate processes. Each attempt to persist contains both at once: to preserve itself, a thing must wear away, erase, or remove something else. Life is a continual process of displacement, adaptation, and the redefinition of borders.",
      "This series took shape from a personal encounter with illness — an experience that turned survival from an abstraction into a bodily fact. What became a question for me was not illness itself, but the simultaneity of two wills to persist: two expressions of a single, fundamental drive, both obeying the same logic, yet one threatening the other's capacity to live.",
    ],
    fa: [
      "هر شکلِ حیات، میل به ادامه‌یافتن دارد؛ میلی که پیش از انتخاب، پیش از آگاهی و حتی پیش از آنکه نامی بر آن گذاشته شود، موجود زنده را به حفظِ خود و مقاومت در برابر زوال وا می‌دارد. این میل، همواره در جست‌وجوی راهی برای ماندن است.",
      "حضوری که در سکوت پیش می‌رود، از میان شکاف‌ها عبور می‌کند و بی‌آنکه مرز روشنی میان خود و پیرامونش باقی بگذارد، آنچه را لمس می‌کند دگرگون می‌سازد. هر امتداد، تغییری را با خود به همراه می‌آورد و هر حضوری، نظمی دیگر را شکل می‌دهد.",
      "از همین رو، تداوم و فرسایش را نمی‌توان دو فرایندِ مستقل دانست. هر تلاشی برای ادامه‌یافتن، هم‌زمان واجدِ هر دو است؛ برای حفظِ خود، ناگزیر چیزی را می‌فرساید، حذف می‌کند یا از میان برمی‌دارد. زندگی، فرایندی مداوم از جابه‌جایی، سازگاری و بازتعریفِ مرزهاست.",
      "این مجموعه از مواجهه‌ای شخصی با بیماری شکل گرفت؛ تجربه‌ای که بقا را از مفهومی انتزاعی به واقعیتی جسمانی بدل کرد. آنچه برای من به پرسش تبدیل شد، خودِ بیماری نبود، بلکه هم‌زمانیِ دو میل به ادامه‌یافتن بود؛ دو تجلیِ یک میلِ بنیادین که هر دو از منطقی واحد پیروی می‌کردند، اما یکی امکانِ زیستنِ دیگری را تهدید می‌کرد.",
    ],
  },
  context: {
    en: [
      "As the work developed, Spinoza's conception of conatus became one of its intellectual foundations. For Spinoza, conatus is the striving of every being to preserve and persevere in its own existence. The encounter with illness turned this idea from an abstraction into a lived experience — the experience of facing something that had risen from within the body and that, like the body itself, wills to survive.",
      "A tumour, too, like any other form of life, seeks to preserve and extend its own existence. Seen this way, the project's real subject is not illness but the simultaneity of two wills to survive within one body — two co-rooted forces, the continuation of each a threat to the other.",
      "The project's first aim was to picture illness. But over the course of research and making, that approach gradually changed. Its focus moved away from representing the appearance of illness toward the mechanisms and forces at work beneath it. As Susan Sontag insists in Illness as Metaphor, illness must not be reduced to metaphor. This work likewise tries to step away from a metaphorical reading of illness — to study it not as a symbol but as a form of life with its own internal logic.",
    ],
    fa: [
      "در ادامه، مفهوم «کوناتوس» در فلسفه‌ی اسپینوزا نیز به یکی از مبانی فکریِ پروژه بدل شد. اسپینوزا کوناتوس را گرایشِ هر موجود به حفظ و استمرارِ هستیِ خویش می‌داند. مواجهه‌ی هنرمند با بیماری، این مفهوم را از یک ایده‌ی انتزاعی به تجربه‌ای زیسته تبدیل کرد؛ تجربه‌ی رویارویی با چیزی که از درونِ بدن برخاسته است و همانندِ خودِ بدن، میل به بقا دارد.",
      "تومور نیز، همچون هر شکلِ دیگری از حیات، در پیِ حفظ و گسترشِ وجودِ خویش است. از این منظر، مسئله‌ی اصلیِ پروژه بیماری نیست، بلکه هم‌زمانیِ دو میل به بقا در یک بدن است؛ دو نیروی هم‌ریشه که تداومِ هر یک، دیگری را با تهدید مواجه می‌کند.",
      "هدفِ اولیه‌ی این پروژه، تصویرکردنِ بیماری بود. اما در روندِ پژوهش و شکل‌گیریِ آثار، این رویکرد به‌تدریج تغییر کرد. تمرکزِ پروژه از بازنماییِ ظاهرِ بیماری فاصله گرفت و به سازوکارها و نیروهایی معطوف شد که در پسِ آن عمل می‌کنند. همان‌گونه که سوزان سانتاگ در کتابِ بیماری به‌مثابه استعاره تأکید می‌کند، بیماری نباید به استعاره تقلیل یابد. این پروژه نیز می‌کوشد از خوانشِ استعاریِ بیماری فاصله بگیرد و آن را نه به‌عنوان نماد، بلکه به‌عنوان شکلی از حیات با منطقِ درونیِ خود مطالعه کند.",
    ],
  },
  chapters: [
    {
      id: "archive",
      kicker: { en: "Beginning", fa: "آغاز" },
      title: { en: "The archival image", fa: "تصویر آرشیوی" },
      text: {
        en: [
          "The work began from an archive of everyday photographs. At first these were only records of the surroundings, but little by little they drifted away from their documentary function.",
          "Intervening on the surface of the image was the first step toward rethinking what it means to record and to remember — an attempt to turn the photograph from a visual document into a ground for thinking.",
        ],
        fa: [
          "نقطه‌ی آغازِ آثار، آرشیوی از عکس‌های روزمره بود. این تصاویر در ابتدا تنها ثبت‌هایی از محیطِ پیرامون بودند، اما به‌تدریج از کارکردِ مستندِ خود فاصله گرفتند.",
          "مداخله بر سطحِ تصویر، نخستین گام برای بازاندیشی در مفهومِ ثبت و حافظه بود؛ تلاشی برای تبدیلِ عکس از یک سندِ بصری به بستری برای اندیشیدن.",
        ],
      },
      mode: "diptych",
      images: [
        {
          src: "/works/conatus/archival/pomegranate.jpg",
          w: 780,
          h: 880,
          alt: {
            en: "A staged self-portrait: a small figure set within a dense field of red marks over a patterned ground.",
            fa: "یک خودنگاره‌ی صحنه‌پردازی‌شده: پیکری کوچک در میان میدانی متراکم از نشانه‌های سرخ بر زمینه‌ای نقش‌دار.",
          },
          caption: { en: "Archival image", fa: "تصویر آرشیوی" },
        },
        {
          src: "/works/conatus/archival/ribbon.jpg",
          w: 606,
          h: 878,
          alt: {
            en: "A desaturated street photograph in which strands of red beads fall from a standing figure in white.",
            fa: "عکسی خیابانی و کم‌رنگ که رشته‌هایی از مهره‌های سرخ از پیکری سفیدپوش فرو می‌ریزند.",
          },
          caption: { en: "Archival image", fa: "تصویر آرشیوی" },
        },
      ],
    },
    {
      id: "root",
      kicker: { en: "Movement one · Root", fa: "بخش یک · ریشه" },
      title: { en: "Root", fa: "ریشه" },
      quote: {
        text: {
          en: "The rhizome has no beginning or end; it is always in the middle.",
          fa: "ریزوم آغاز و پایان ندارد؛ همیشه در میانه است.",
        },
        source: { en: "Deleuze & Guattari, A Thousand Plateaus", fa: "دلوز و گتاری · هزار فلات" },
      },
      text: {
        en: [
          "A study of the rhizome in Deleuze and Guattari changed the project's course. The rhizome is a structure without centre, without fixed beginning or end — a network that can grow from any point and ignore established borders.",
          "This drew the work toward the structure of plant roots, which revealed striking similarities between their growth and the growth of a tumour: both follow a non-linear, invasive logic, extending their territory without obeying a fixed centre.",
          "From here the root became the central element — not as a symbol of illness, but as a form that makes the logic of growth, penetration and the occupation of space materially visible.",
        ],
        fa: [
          "مطالعه‌ی مفهومِ «ریزوم» در اندیشه‌ی دلوز و گتاری مسیرِ پروژه را تغییر داد. ریزوم ساختاری است فاقدِ مرکز، آغاز و پایانِ مشخص؛ شبکه‌ای که از هر نقطه می‌تواند رشد کند و مرزهای تثبیت‌شده را نادیده بگیرد.",
          "این نگاه توجه را به ساختارِ ریشه‌های گیاهان جلب کرد؛ مطالعه‌ی ریشه‌ها شباهت‌های چشمگیری میان الگوی رشدِ آن‌ها و رشدِ تومور آشکار ساخت: هر دو از منطقی غیرخطی و نفوذی پیروی می‌کنند و بدون تبعیت از مرکزی ثابت، قلمروِ خود را گسترش می‌دهند.",
          "از این مرحله، ریشه به عنصرِ اصلیِ پروژه بدل شد؛ نه به‌عنوان نمادی از بیماری، بلکه به‌عنوان فرمی که منطقِ رشد، نفوذ و اشغالِ فضا را به‌صورتِ مادی آشکار می‌کند.",
        ],
      },
      mode: "grid",
      images: [
        { src: "/works/conatus/root/root-01.jpg", w: 793, h: 828, alt: { en: "A delicate ink-root form spreading thinly across white.", fa: "فرمی ظریف و ریشه‌مانند که به‌نازکی بر زمینه‌ی سفید می‌گسترد." }, caption: { en: "Pressure", fa: "فشار" } },
        { src: "/works/conatus/root/root-03.jpg", w: 487, h: 581, alt: { en: "A dense, granular root mass printed in black.", fa: "توده‌ای متراکم و دانه‌دانه از ریشه، چاپ‌شده با سیاه." }, caption: { en: "Proliferation", fa: "تکثیر" } },
        { src: "/works/conatus/root/root-02.jpg", w: 799, h: 827, alt: { en: "A black root form branching outward against white.", fa: "فرمی سیاه و ریشه‌مانند که رو به بیرون منشعب می‌شود." }, caption: { en: "Rhizome", fa: "ریزوم" } },
        { src: "/works/conatus/root/root-05.jpg", w: 799, h: 804, alt: { en: "A spiky black root structure occupying the surface.", fa: "ساختاری سیاه و خاردار از ریشه که سطح را اشغال می‌کند." }, caption: { en: "Root study", fa: "مطالعه‌ی ریشه" } },
        { src: "/works/conatus/root/root-04.jpg", w: 732, h: 803, alt: { en: "An ink-root splatter spreading from a dense centre.", fa: "پاششِ مرکبِ ریشه‌مانند که از مرکزی متراکم می‌گسترد." }, caption: { en: "Root study", fa: "مطالعه‌ی ریشه" } },
        { src: "/works/conatus/root/root-06.jpg", w: 798, h: 862, alt: { en: "A branching black root reaching across the frame.", fa: "ریشه‌ای سیاه و منشعب که در کادر کشیده می‌شود." }, caption: { en: "Root study", fa: "مطالعه‌ی ریشه" } },
      ],
    },
    {
      id: "overlap",
      kicker: { en: "Movement two · Overlap", fa: "بخش دو · هم‌پوشانی" },
      title: { en: "Overlap", fa: "هم‌پوشانی" },
      text: {
        en: [
          "The roots enter the void, take over the surface of the photograph and impose a new structure upon it. Through double exposure, root and intact image are held in one frame.",
          "Making and unmaking are not opposite poles here; every intervention holds both at once.",
        ],
        fa: [
          "ریشه‌ها وارد خلأ می‌شوند، سطحِ عکس را تصرف می‌کنند و ساختارِ تازه‌ای بر آن تحمیل می‌کنند. در دابل‌اکسپوژر، ریشه و تصویرِ سالم در یک کادر کنار هم می‌نشینند.",
          "ساختن و ویران‌کردن این‌جا دو قطبِ متضاد نیستند؛ هر مداخله هر دو را هم‌زمان در خود دارد.",
        ],
      },
      mode: "fullbleed",
      images: [
        { src: "/works/conatus/overlap/garden-hands.jpg", w: 1660, h: 804, alt: { en: "Double exposure: hand-shaped voids open across a garden dense with poppies and dark foliage.", fa: "دابل‌اکسپوژر: خلأهایی دست‌مانند بر باغی انبوه از شقایق و شاخ‌وبرگِ تیره گشوده می‌شوند." }, caption: { en: "Seizing the surface", fa: "تصاحبِ سطح" }, feature: true },
        { src: "/works/conatus/overlap/garden-wide.jpg", w: 1600, h: 606, alt: { en: "A pale garden surface threaded with faint root lines and scattered red points.", fa: "سطحِ کم‌رنگِ یک باغ که خطوطِ محوِ ریشه و نقاطِ پراکنده‌ی سرخ در آن تنیده شده‌اند." }, caption: { en: "Root over an intact image", fa: "ریشه بر تصویرِ سالم" } },
        { src: "/works/conatus/overlap/forest-blue.jpg", w: 1660, h: 804, alt: { en: "Double exposure of a forest, branches and roots overlaid into a blurred weave.", fa: "دابل‌اکسپوژرِ یک جنگل؛ شاخه‌ها و ریشه‌ها در بافتی محو روی هم می‌نشینند." } },
        { src: "/works/conatus/overlap/forest-green.jpg", w: 1660, h: 904, alt: { en: "Dark green foliage broken by pale openings where the surface gives way.", fa: "شاخ‌وبرگِ سبزِ تیره که با گشودگی‌های کم‌رنگ، جایی که سطح فرو می‌ریزد، شکسته می‌شود." } },
        { src: "/works/conatus/overlap/mountain-ink.jpg", w: 1184, h: 836, alt: { en: "A mountain landscape dissolving into black ink-root forms.", fa: "چشم‌اندازی کوهستانی که در فرم‌های سیاهِ ریشه‌مانند حل می‌شود." } },
      ],
    },
    {
      id: "erosion",
      kicker: { en: "Movement three · Erosion", fa: "بخش سه · فرسایش" },
      title: { en: "Erosion", fa: "فرسایش" },
      text: {
        en: [
          "Thinner dissolves the detail of the photograph; part of the image fades and its layers come apart.",
          "This erosion is not annihilation but the sign of a being changed after its encounter with another force.",
        ],
        fa: [
          "تینر جزئیاتِ عکس را حل می‌کند؛ بخشی از تصویر محو می‌شود و لایه‌های آن از بین می‌روند.",
          "این فرسایش نه به معنای نابودی، بلکه نشانه‌ی تغییرِ یک موجود پس از مواجهه با نیرویی دیگر است.",
        ],
      },
      mode: "stagger",
      images: [
        { src: "/works/conatus/erosion/white-figure.jpg", w: 1664, h: 880, alt: { en: "A photographic surface dissolving into pale cloud, a faint figure emerging from the blur.", fa: "سطحی عکاسانه که در ابری کم‌رنگ حل می‌شود و پیکری محو از دلِ آن بیرون می‌زند." }, caption: { en: "Dissolving the surface", fa: "حل‌شدنِ سطح" }, feature: true },
        { src: "/works/conatus/erosion/mountain.jpg", w: 1660, h: 828, alt: { en: "A mountain ridge half-erased by soft pale blooms across the image.", fa: "ستیغِ کوهی که با شکوفه‌های نرم و کم‌رنگ تا نیمه از تصویر پاک شده است." } },
        { src: "/works/conatus/erosion/redland.jpg", w: 1664, h: 925, alt: { en: "A deep-red shoreline beneath a dissolving sky, the surface clouded and uncertain.", fa: "ساحلی به‌شدت سرخ زیرِ آسمانی در حالِ حل‌شدن؛ سطحی ابری و نامطمئن." }, caption: { en: "Unstable surface", fa: "سطحِ ناپایدار" } },
        { src: "/works/conatus/erosion/poppies-cloud.jpg", w: 1380, h: 856, alt: { en: "A field of poppies beneath a heavy dark cloud eroding the upper image.", fa: "دشتی از شقایق زیرِ ابرِ تیره و سنگینی که بخشِ بالاییِ تصویر را می‌فرساید." } },
      ],
    },
  ],
};

const documentary: Project = {
  slug: "documentary",
  order: 2,
  status: "complete",
  mode: "sequence",
  title: { en: "Documentary", fa: "مستند" },
  kicker: { en: "Street & documentary photography", fa: "عکاسیِ مستند و خیابانی" },
  year: { en: "2016 – 2022", fa: "۱۳۹۵ – ۱۴۰۱" },
  medium: { en: "Digital photography", fa: "عکاسیِ دیجیتال" },
  cover: {
    src: "/works/documentary/archway.jpg",
    w: 1660,
    h: 795,
    alt: {
      en: "A black-and-white street scene: a man crosses toward a receding tiled archway in Tehran.",
      fa: "صحنه‌ای خیابانی به سیاه‌وسفید: مردی به‌سمتِ طاقیِ کاشی‌کاری‌شده‌ای در تهران عبور می‌کند.",
    },
  },
  intro: {
    en: [
      "Before Conatus, the camera was turned outward — to the street, to the ordinary choreography of the city.",
      "These photographs attend to the relationship between people and their surroundings: painted walls that stand in for landscape, equations chalked on concrete, figures passing through Tehran's constructed scenery. The attention is documentary, but never neutral — it waits for the moment the everyday turns strange.",
    ],
    fa: [
      "پیش از کوناتوس، دوربین رو به بیرون داشت — به خیابان، به نظمِ روزمره‌ی شهر.",
      "این عکس‌ها به رابطه‌ی انسان و پیرامونش توجه می‌کنند: دیوارهایی نقاشی‌شده که جای منظره می‌نشینند، معادله‌هایی بر بتن، و پیکرهایی که از دلِ صحنه‌آراییِ شهرِ تهران عبور می‌کنند. نگاه مستند است، اما هرگز بی‌طرف نیست — در انتظارِ لحظه‌ای است که امرِ روزمره غریب می‌شود.",
    ],
  },
  images: [
    { src: "/works/documentary/archway.jpg", w: 1660, h: 795, alt: { en: "A man walks toward a tiled archway tunnel; a small figure stands deep inside it.", fa: "مردی به‌سمتِ تونلی طاقی و کاشی‌کاری‌شده قدم می‌زند؛ پیکری کوچک در عمقِ آن ایستاده است." } },
    { src: "/works/documentary/mural-trees.jpg", w: 1664, h: 853, alt: { en: "A painted wall of trees and a path; a lone figure walks the real pavement below.", fa: "دیواری نقاشی‌شده از درختان و یک مسیر؛ پیکری تنها بر پیاده‌روِ واقعیِ زیرِ آن راه می‌رود." } },
    { src: "/works/documentary/swan-mural.jpg", w: 1660, h: 812, alt: { en: "A man passes a mural of swans, dappled light falling across the wall.", fa: "مردی از کنارِ دیوارنگاره‌ای از قوها می‌گذرد و نورِ لکه‌لکه بر دیوار می‌افتد." } },
    { src: "/works/documentary/mathwall.jpg", w: 1664, h: 871, alt: { en: "A figure in a hood walks past a wall chalked with mathematical equations and a cube.", fa: "پیکری با کلاه از کنارِ دیواری می‌گذرد که معادله‌های ریاضی و یک مکعب رویش کشیده شده است." } },
    { src: "/works/documentary/lake-pointing.jpg", w: 1660, h: 796, alt: { en: "Three women at the water's edge; two point up toward the sky.", fa: "سه زن در لبه‌ی آب؛ دو نفر رو به آسمان اشاره می‌کنند." } },
    { src: "/works/documentary/tetrapods.jpg", w: 1664, h: 899, alt: { en: "A lone figure sits atop a heap of concrete tetrapods against a clear sky.", fa: "پیکری تنها بر تلی از تتراپادهای بتنی، زیرِ آسمانی صاف نشسته است." } },
    { src: "/works/documentary/two-women.jpg", w: 1660, h: 764, alt: { en: "Two women in headscarves stand at a railing, looking out over a lake toward a distant bridge.", fa: "دو زنِ روسری‌به‌سر کنارِ نرده ایستاده‌اند و به دریاچه و پلی دوردست می‌نگرند." } },
    { src: "/works/documentary/canyon-tent.jpg", w: 1664, h: 859, alt: { en: "A small blue tent pitched in a red-rock canyon with pale mountains beyond.", fa: "چادری کوچک و آبی در دره‌ای از صخره‌های سرخ، با کوه‌های کم‌رنگ در دوردست." } },
  ],
};

const all: Project[] = [conatus, documentary].sort((a, b) => a.order - b.order);

/** Only released projects. Unreleased work never reaches a page, list or sitemap. */
export const projects: Project[] = all.filter((p) => PUBLISH_CONATUS || p.slug !== "conatus");
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
/** The project shown first on the home page. */
export const featuredProject: Project = PUBLISH_CONATUS ? conatus : documentary;
