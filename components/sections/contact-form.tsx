"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { trackContactSubmit } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPanel } from "@/components/ui/status-panel";
import { Textarea } from "@/components/ui/textarea";

type FieldErrors = Partial<Record<"name" | "email" | "company" | "projectType" | "note", string>>;

type Payload = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  note: string;
  /** Honeypot -- hidden from real users */
  website: string;
};

const projectTypes = [
  "iOS / Android app",
  "Website",
  "AI automation",
  "Product design",
  "Frontend implementation",
  "Not sure yet"
] as const;

function validate(payload: Payload) {
  const errors: FieldErrors = {};

  if (!payload.name.trim()) errors.name = "Name is required.";
  if (!payload.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.email = "Use a valid email address.";
  if (!payload.note.trim()) errors.note = "A short project note helps us prepare.";
  else if (payload.note.trim().length < 12) errors.note = "Add a bit more context so the next step is useful.";

  return errors;
}

const initialValues: Payload = {
  name: "",
  email: "",
  company: "",
  projectType: "",
  note: "",
  website: ""
};

export function ContactForm() {
  const [values, setValues] = useState<Payload>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFieldChange = <K extends keyof Payload>(field: K, value: Payload[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setSuccess(false);
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/contact", {
          body: JSON.stringify(values),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        });

        if (response.status === 429) {
          setFormError("Too many submissions. Please wait a minute and try again.");
          setSuccess(false);
          return;
        }

        const result = (await response.json()) as {
          errors?: FieldErrors;
          error?: string;
          success?: boolean;
        };

        if (!response.ok || result.success !== true) {
          if (result.errors) {
            setFieldErrors(result.errors);
          }
          setFormError(result.error ?? "The form could not be submitted. Email works as a fallback.");
          setSuccess(false);
          return;
        }

        trackContactSubmit(values.projectType);
        setSuccess(true);
        setFieldErrors({});
        setFormError(null);
        setValues(initialValues);
      } catch {
        setFormError("The network request failed. Use email if this keeps happening.");
        setSuccess(false);
      }
    });
  };

  if (success) {
    return (
      <StatusPanel
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="secondary">
              <Link href="/work">See selected work</Link>
            </Button>
            <Button onClick={() => setSuccess(false)} type="button">
              Send another note
            </Button>
          </div>
        }
        description="We'll review your goals and reply with a practical next step, typically within one business day."
        meta="Sent"
        title="Inquiry received."
        tone="success"
      />
    );
  }

  return (
    <form aria-busy={isPending} className="space-y-4" noValidate onSubmit={handleSubmit}>
      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
        Your name, email and a short note are enough. No finished brief needed.
      </p>
      {/* Honeypot -- invisible to real users */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          autoComplete="off"
          id="website"
          name="website"
          onChange={(event) => handleFieldChange("website", event.target.value)}
          tabIndex={-1}
          type="text"
          value={values.website}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="name">
          Name
        </label>
        <Input
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          aria-invalid={Boolean(fieldErrors.name)}
          autoComplete="name"
          id="name"
          name="name"
          onChange={(event) => handleFieldChange("name", event.target.value)}
          placeholder="Your name"
          required
          value={values.name}
        />
        {fieldErrors.name ? <p className="mt-2 text-sm text-[var(--color-error)]" id="name-error" role="alert">{fieldErrors.name}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="email">
          Email
        </label>
        <Input
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          aria-invalid={Boolean(fieldErrors.email)}
          autoComplete="email"
          id="email"
          name="email"
          onChange={(event) => handleFieldChange("email", event.target.value)}
          placeholder="name@company.com"
          required
          type="email"
          value={values.email}
        />
        {fieldErrors.email ? <p className="mt-2 text-sm text-[var(--color-error)]" id="email-error" role="alert">{fieldErrors.email}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="company">
          Company <span className="font-normal text-[var(--color-text-secondary)]">(optional)</span>
        </label>
        <Input
          autoComplete="organization"
          id="company"
          name="company"
          onChange={(event) => handleFieldChange("company", event.target.value)}
          placeholder="Your company"
          value={values.company}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="projectType">
          What do you need? <span className="font-normal text-[var(--color-text-secondary)]">(optional)</span>
        </label>
        <select
          className="h-13 w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-fill)] px-4 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-input)] outline-none transition-[border-color,box-shadow,background-color] duration-[180ms] focus:border-[var(--color-focus-ring)] focus:ring-4 focus:ring-[var(--color-focus-soft)]"
          id="projectType"
          name="projectType"
          onChange={(event) => handleFieldChange("projectType", event.target.value)}
          value={values.projectType}
        >
          <option value="">Choose an option</option>
          {projectTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="note">
          What would you like to improve?
        </label>
        <Textarea
          aria-describedby={fieldErrors.note ? "note-help note-error" : "note-help"}
          aria-invalid={Boolean(fieldErrors.note)}
          id="note"
          name="note"
          onChange={(event) => handleFieldChange("note", event.target.value)}
          placeholder="For example: We need an app for our customers, our website needs a clearer message, or our team spends too much time on manual work."
          required
          value={values.note}
        />
        <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]" id="note-help">A sentence or two about your goal is a useful start.</p>
        {fieldErrors.note ? <p className="mt-2 text-sm text-[var(--color-error)]" id="note-error" role="alert">{fieldErrors.note}</p> : null}
      </div>

      {formError ? (
        <div className="text-sm leading-6 text-[var(--color-error)]" role="alert">
          <p>{formError}</p>
          <a className="font-semibold underline underline-offset-4" href={`mailto:${siteConfig.email}`}>
            Email {siteConfig.email}
          </a>
        </div>
      ) : null}

      <Button disabled={isPending} size="large" type="submit">
        {isPending ? "Sending..." : "Send project note"}
      </Button>
    </form>
  );
}
