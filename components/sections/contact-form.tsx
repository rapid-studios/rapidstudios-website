"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { trackContactSubmit } from "@/lib/analytics";
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
  "Product design",
  "Marketing / launch site",
  "Frontend implementation",
  "Full engagement",
  "Something else"
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

        if (!response.ok) {
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
        description="We'll review your project details and get back to you within 24 hours with next steps."
        meta="Sent"
        title="Inquiry received."
        tone="success"
      />
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
          id="name"
          name="name"
          onChange={(event) => handleFieldChange("name", event.target.value)}
          placeholder="Your name"
          value={values.name}
        />
        {fieldErrors.name ? <p className="mt-2 text-sm text-[var(--color-error)]">{fieldErrors.name}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          name="email"
          onChange={(event) => handleFieldChange("email", event.target.value)}
          placeholder="name@company.com"
          type="email"
          value={values.email}
        />
        {fieldErrors.email ? <p className="mt-2 text-sm text-[var(--color-error)]">{fieldErrors.email}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="company">
          Company <span className="font-normal text-[var(--color-text-secondary)]">(optional)</span>
        </label>
        <Input
          id="company"
          name="company"
          onChange={(event) => handleFieldChange("company", event.target.value)}
          placeholder="Your company"
          value={values.company}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="projectType">
          Project Type <span className="font-normal text-[var(--color-text-secondary)]">(optional)</span>
        </label>
        <select
          className="h-13 w-full rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[rgba(16,24,34,0.82)] px-4 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-soft)] outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[var(--color-brand-primary)] focus:ring-4 focus:ring-[var(--color-focus-ring)]"
          id="projectType"
          name="projectType"
          onChange={(event) => handleFieldChange("projectType", event.target.value)}
          value={values.projectType}
        >
          <option value="">Select a project type</option>
          {projectTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]" htmlFor="note">
          Project Brief
        </label>
        <Textarea
          id="note"
          name="note"
          onChange={(event) => handleFieldChange("note", event.target.value)}
          placeholder="Tell us about what you're building..."
          value={values.note}
        />
        {fieldErrors.note ? <p className="mt-2 text-sm text-[var(--color-error)]">{fieldErrors.note}</p> : null}
      </div>

      {formError ? <p className="text-sm text-[var(--color-error)]">{formError}</p> : null}

      <Button disabled={isPending} size="large" type="submit">
        {isPending ? "Sending..." : "Send Inquiry"}
      </Button>
    </form>
  );
}
