"use client";

import { useMemo, useState } from "react";
import { site } from "@/lib/data";

const SERVICES = [
  "Web Design",
  "UI/UX",
  "WordPress",
  "Shopify",
  "Headless E-commerce",
  "Automation & Integrations",
  "Not sure yet",
];

const BUDGETS = ["Under $1k", "$1k — $3k", "$3k — $8k", "$8k+", "Let's discuss"];
const TIMELINES = ["ASAP", "1 — 2 months", "3 — 6 months", "Flexible"];

type Fields = {
  name: string;
  email: string;
  company: string;
  link: string;
  details: string;
};

/**
 * Project brief. There is no backend yet, so submitting opens the visitor's mail
 * client with the whole brief already written out, addressed to `site.email`.
 */
export default function ProjectForm() {
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    company: "",
    link: "",
    details: "",
  });
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const toggleService = (value: string) =>
    setServices((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]));

  const missing = useMemo(() => {
    const list: string[] = [];
    if (!fields.name.trim()) list.push("name");
    if (!/^\S+@\S+\.\S+$/.test(fields.email)) list.push("email");
    if (!fields.details.trim()) list.push("details");
    return list;
  }, [fields]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (missing.length) return;

    const body = [
      `Name: ${fields.name}`,
      `Email: ${fields.email}`,
      fields.company && `Company: ${fields.company}`,
      fields.link && `Current site: ${fields.link}`,
      "",
      `Looking for: ${services.length ? services.join(", ") : "—"}`,
      `Budget: ${budget || "—"}`,
      `Timeline: ${timeline || "—"}`,
      "",
      "About the project:",
      fields.details,
    ]
      .filter(Boolean)
      .join("\n");

    const subject = `Project enquiry — ${fields.name}${fields.company ? ` (${fields.company})` : ""}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const invalid = (field: string) => touched && missing.includes(field);

  return (
    <form className="brief" onSubmit={handleSubmit} noValidate>
      {/* 01 — who */}
      <section className="brief__row" data-reveal style={{ "--i": 0 } as React.CSSProperties}>
        <span className="brief__index mono">01</span>
        <div className="brief__body">
          <h2 className="brief__q">Who are you?</h2>
          <div className="brief__fields">
            <label className={`field${invalid("name") ? " is-invalid" : ""}`}>
              <span className="mono">Name *</span>
              <input value={fields.name} onChange={set("name")} placeholder="Jane Doe" autoComplete="name" />
            </label>
            <label className={`field${invalid("email") ? " is-invalid" : ""}`}>
              <span className="mono">Email *</span>
              <input
                type="email"
                value={fields.email}
                onChange={set("email")}
                placeholder="jane@company.com"
                autoComplete="email"
              />
            </label>
            <label className="field">
              <span className="mono">Company</span>
              <input value={fields.company} onChange={set("company")} placeholder="Optional" />
            </label>
            <label className="field">
              <span className="mono">Current site</span>
              <input value={fields.link} onChange={set("link")} placeholder="yoursite.com — optional" />
            </label>
          </div>
        </div>
      </section>

      {/* 02 — what */}
      <section className="brief__row" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
        <span className="brief__index mono">02</span>
        <div className="brief__body">
          <h2 className="brief__q">What do you need?</h2>
          <div className="chips">
            {SERVICES.map((s) => (
              <button
                type="button"
                key={s}
                className={`chip${services.includes(s) ? " is-on" : ""}`}
                aria-pressed={services.includes(s)}
                onClick={() => toggleService(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 03 — budget */}
      <section className="brief__row" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
        <span className="brief__index mono">03</span>
        <div className="brief__body">
          <h2 className="brief__q">Budget in mind?</h2>
          <div className="chips">
            {BUDGETS.map((b) => (
              <button
                type="button"
                key={b}
                className={`chip${budget === b ? " is-on" : ""}`}
                aria-pressed={budget === b}
                onClick={() => setBudget(budget === b ? "" : b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — timeline */}
      <section className="brief__row" data-reveal style={{ "--i": 3 } as React.CSSProperties}>
        <span className="brief__index mono">04</span>
        <div className="brief__body">
          <h2 className="brief__q">When do you need it?</h2>
          <div className="chips">
            {TIMELINES.map((t) => (
              <button
                type="button"
                key={t}
                className={`chip${timeline === t ? " is-on" : ""}`}
                aria-pressed={timeline === t}
                onClick={() => setTimeline(timeline === t ? "" : t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — details */}
      <section className="brief__row" data-reveal style={{ "--i": 4 } as React.CSSProperties}>
        <span className="brief__index mono">05</span>
        <div className="brief__body">
          <h2 className="brief__q">Tell me about it.</h2>
          <label className={`field field--area${invalid("details") ? " is-invalid" : ""}`}>
            <span className="mono">The project *</span>
            <textarea
              rows={6}
              value={fields.details}
              onChange={set("details")}
              placeholder="What are you building, who is it for, and what does success look like?"
            />
          </label>
        </div>
      </section>

      <div className="brief__submit">
        <button type="submit" className="btn-send" data-magnetic>
          <span>Send brief</span>
          <span className="btn-send__arrow">↗</span>
        </button>
        <p className="mono brief__note">
          {sent
            ? "Your mail app should be open with the brief ready — hit send."
            : touched && missing.length
              ? `Still needed: ${missing.join(", ")}`
              : `Goes straight to ${site.email}`}
        </p>
      </div>
    </form>
  );
}
