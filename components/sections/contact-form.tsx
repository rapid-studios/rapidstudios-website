"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPanel } from "@/components/ui/status-panel";
import { Textarea } from "@/components/ui/textarea";

type FieldErrors = Partial<Record<"name" | "email" | "company" | "note", string>>;

type Payload = {
  name: string;
  email: string;
  company: string;
  note: string;
};

function validate(payload: Payload) {
  const errors: FieldErrors = {};

  if (!payload.name.trim()) errors.name = "Name is required.";
  if (!payload.email.trim()) errors.email = "Email is required.";
  if (!payload.email.includes("@")) errors.email = "Use a valid email address.";
  if (!payload.note.trim()) errors.note = "A short project note helps.";
  if (payload.note.trim().length < 12) errors.note = "Add a bit more context so the next step is useful.";

  return errors;
}

const initialValues: Payload = {
  name: "",
  email: "",
  company: "",
  note: ""
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
          headers: {
            "Content-Type": "application/json"
          },
          method: "POST"
        });

        const result = (await response.json()) as {
          errors?: FieldErrors;
          success?: boolean;
        };

        if (!response.ok) {
          setFieldErrors(result.errors ?? {});
          setFormError("The form could not be submitted. Email works as a fallback.");
          setSuccess(false);
          return;
        }

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
        description="The placeholder endpoint accepted the inquiry. In production, this is where Resend or a scheduling follow-up would attach."
        meta="Success"
        title="Inquiry received."
        tone="success"
      />
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
