"use client";

import { useState } from "react";
import { site } from "@/content/site";
import type { Dict } from "@/lib/i18n";

export default function ContactForm({ d }: { d: Dict }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Enquiry from ${name || "the website"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ""}`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
  };

  const field =
    "w-full border-b border-line bg-transparent py-3 font-sans text-base text-ink placeholder:text-stone-light focus:border-ink focus:outline-none transition-colors";

  return (
    <form onSubmit={submit} className="flex flex-col gap-7">
      <label className="block">
        <span className="eyebrow mb-2 block">{d.contact.formName}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
          autoComplete="name"
          required
        />
      </label>
      <label className="block">
        <span className="eyebrow mb-2 block">{d.contact.formEmail}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
          autoComplete="email"
        />
      </label>
      <label className="block">
        <span className="eyebrow mb-2 block">{d.contact.formMessage}</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className={`${field} resize-none`}
          required
        />
      </label>
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          className="group inline-flex w-fit items-center gap-3 border border-ink px-7 py-3 font-sans text-sm text-ink transition-colors duration-500 hover:bg-ink hover:text-paper"
        >
          {d.contact.formSend}
          <span className="transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">→</span>
        </button>
        <p className="caption max-w-sm text-stone-light">{d.contact.formNote}</p>
      </div>
    </form>
  );
}
