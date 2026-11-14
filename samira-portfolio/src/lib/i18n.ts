export const locales = ["en", "fa"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const dir = (l: Locale): "ltr" | "rtl" => (l === "fa" ? "rtl" : "ltr");
export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

export const localeNames: Record<Locale, string> = { en: "EN", fa: "فارسی" };

/** UI strings. Content (projects, statements, bio) lives in /content. */
export const dict = {
  en: {
    nav: { works: "Works", about: "About", journal: "Journal", cv: "CV", contact: "Contact" },
    skipToContent: "Skip to content",
    menu: "Menu",
    close: "Close",
    site: { role: "Visual artist & photographer", location: "Tehran" },
    home: {
      featured: "Current project",
      selectedWorks: "Selected works",
      enterConatus: "Enter Conatus",
      practiceTitle: "On the practice",
      viewAll: "All works",
    },
    works: {
      title: "Works",
      intro:
        "Two bodies of work, a decade apart: a documentary attention to the street, and Conatus — an ongoing inquiry into the body, persistence and the limits of the photographic image.",
      ongoing: "Ongoing",
      medium: "Medium",
      year: "Year",
      view: "View project",
    },
    project: {
      statement: "Statement",
      about: "About the work",
      context: "Research & context",
      index: "Index of works",
      chapters: "Movements",
      related: "Also in this project",
      next: "Next",
      back: "Back to works",
      plate: "Plate",
    },
    about: {
      title: "About",
      biography: "Biography",
      practice: "Practice",
      themes: "Selected themes",
      downloadCv: "Full CV",
    },
    cv: {
      title: "Curriculum Vitae",
      download: "Download PDF",
      based: "Based in Tehran",
      sections: {
        profile: "Profile",
        education: "Education",
        projects: "Selected projects",
        exhibitions: "Exhibitions",
        publications: "Publications",
        awards: "Awards & grants",
        contact: "Contact",
      },
      placeholderNote:
        "This section is maintained by the artist and will be completed with verified entries.",
    },
    journal: {
      title: "Journal",
      intro:
        "Occasional notes — on photography, memory, the body, and the texts that accompany the work. Written slowly, published rarely.",
      readingTime: "min read",
      back: "All notes",
      empty: "Notes will appear here.",
    },
    contact: {
      title: "Contact",
      intro:
        "For exhibitions, commissions, writing or studio enquiries, please get in touch.",
      email: "Email",
      instagram: "Instagram",
      location: "Location",
      formName: "Name",
      formEmail: "Email",
      formMessage: "Message",
      formSend: "Send message",
      formNote:
        "This opens your email client. You can also write directly to the address above.",
    },
    footer: {
      tagline: "A quiet space for photography, memory and the body.",
      colophon: "Design & build",
      rights: "All images © Samira Dadashi. All rights reserved.",
      toTop: "To top",
    },
    lang: { switch: "فارسی", label: "Language" },
  },
  fa: {
    nav: { works: "آثار", about: "درباره", journal: "یادداشت‌ها", cv: "رزومه", contact: "تماس" },
    skipToContent: "رفتن به محتوا",
    menu: "فهرست",
    close: "بستن",
    site: { role: "هنرمند تجسمی و عکاس", location: "تهران" },
    home: {
      featured: "پروژه‌ی جاری",
      selectedWorks: "آثار منتخب",
      enterConatus: "ورود به کوناتوس",
      practiceTitle: "درباره‌ی پرَکتیس",
      viewAll: "همه‌ی آثار",
    },
    works: {
      title: "آثار",
      intro:
        "دو مجموعه با فاصله‌ی یک دهه: نگاهی مستند به خیابان، و کوناتوس — جست‌وجویی در جریان درباره‌ی بدن، تداوم و مرزهای تصویرِ عکاسانه.",
      ongoing: "در حال انجام",
      medium: "مدیوم",
      year: "سال",
      view: "دیدن پروژه",
    },
    project: {
      statement: "استیتمنت",
      about: "درباره‌ی اثر",
      context: "پژوهش و زمینه",
      index: "فهرست آثار",
      chapters: "بخش‌ها",
      related: "دیگر آثار این پروژه",
      next: "بعدی",
      back: "بازگشت به آثار",
      plate: "تصویر",
    },
    about: {
      title: "درباره",
      biography: "بیوگرافی",
      practice: "پرَکتیس",
      themes: "محورهای منتخب",
      downloadCv: "رزومه‌ی کامل",
    },
    cv: {
      title: "رزومه",
      download: "دریافت PDF",
      based: "ساکن تهران",
      sections: {
        profile: "معرفی",
        education: "تحصیلات",
        projects: "پروژه‌های منتخب",
        exhibitions: "نمایشگاه‌ها",
        publications: "انتشارات",
        awards: "جوایز و گرنت‌ها",
        contact: "تماس",
      },
      placeholderNote:
        "این بخش توسط هنرمند نگه‌داری می‌شود و با اطلاعات تأییدشده تکمیل خواهد شد.",
    },
    journal: {
      title: "یادداشت‌ها",
      intro:
        "یادداشت‌هایی گاه‌به‌گاه — درباره‌ی عکاسی، حافظه، بدن و متن‌هایی که همراه اثرند. آهسته نوشته می‌شوند و کم منتشر.",
      readingTime: "دقیقه مطالعه",
      back: "همه‌ی یادداشت‌ها",
      empty: "یادداشت‌ها این‌جا منتشر می‌شوند.",
    },
    contact: {
      title: "تماس",
      intro:
        "برای نمایشگاه، سفارش اثر، نوشتن یا هر پرسشِ استودیویی، در تماس باشید.",
      email: "ایمیل",
      instagram: "اینستاگرام",
      location: "مکان",
      formName: "نام",
      formEmail: "ایمیل",
      formMessage: "پیام",
      formSend: "ارسال پیام",
      formNote:
        "این فرم برنامه‌ی ایمیل شما را باز می‌کند. می‌توانید مستقیم هم به نشانی بالا بنویسید.",
    },
    footer: {
      tagline: "فضایی آرام برای عکاسی، حافظه و بدن.",
      colophon: "طراحی و ساخت",
      rights: "تمام تصاویر © سمیرا داداشی. همه‌ی حقوق محفوظ است.",
      toTop: "بالا",
    },
    lang: { switch: "EN", label: "زبان" },
  },
} as const;

export type Dict = (typeof dict)["en"];
export const getDict = (l: Locale): Dict => dict[l] as Dict;
