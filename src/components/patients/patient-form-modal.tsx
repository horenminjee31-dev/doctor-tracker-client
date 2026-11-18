"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { apiFetch, fieldErrors } from "@/lib/api";
import { toDateInputValue } from "@/lib/format";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import type { FilterOptions, Patient } from "@/lib/types";

type FormState = {
  name: string;
  age: string;
  gender: string;
  condition: string;
  visitDate: string;
  phone: string;
  email: string;
  notes: string;
};

const emptyForm = (): FormState => ({
  name: "",
  age: "",
  gender: "female",
  condition: "",
  visitDate: toDateInputValue(new Date()),
  phone: "",
  email: "",
  notes: "",
});

export function PatientFormModal({
  open,
  onClose,
  onSaved,
  mode,
  doctorId,
  patient,
  options,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (patient: Patient) => void;
  mode: "create" | "edit";
  doctorId?: string;
  patient?: Patient | null;
  options: FilterOptions | undefined;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setMessage(null);
    setSubmitting(false);

    if (mode === "edit" && patient) {
      setForm({
        name: patient.name,
        age: String(patient.age),
        gender: patient.gender,
        condition: patient.condition,
        visitDate: toDateInputValue(patient.visitDate),
        phone: patient.phone,
        email: patient.email,
        notes: patient.notes,
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, mode, patient]);

  const update = (field: keyof FormState) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 2) nextErrors.name = "Enter the patient's full name";
    const age = Number(form.age);
    if (!form.age || !Number.isInteger(age) || age < 0 || age > 130)
      nextErrors.age = "Enter an age between 0 and 130";
    if (!form.condition) nextErrors.condition = "Select a condition";
    if (!form.visitDate) nextErrors.visitDate = "Choose the visit date";
    if (form.phone && !/^[+()\-\s\d]{6,24}$/.test(form.phone.trim()))
      nextErrors.phone = "Enter a valid phone number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nextErrors.email = "Enter a valid email";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      age,
      gender: form.gender,
      condition: form.condition,
      visitDate: form.visitDate,
      phone: form.phone.trim(),
      email: form.email.trim(),
      notes: form.notes.trim(),
    };

    setSubmitting(true);
    try {
      const response =
        mode === "edit" && patient
          ? await apiFetch<{ data: Patient }>(`/patients/${patient.id}`, {
              method: "PATCH",
              body: payload,
            })
          : await apiFetch<{ data: Patient }>(`/doctors/${doctorId}/patients`, {
              method: "POST",
              body: payload,
            });

      toast({
        title: mode === "edit" ? "Patient updated" : "Patient registered",
        description: `${response.data.name} saved successfully.`,
        tone: "success",
      });
      onSaved(response.data);
      onClose();
    } catch (error) {
      setErrors(fieldErrors(error));
      setMessage(error instanceof Error ? error.message : "Unable to save the patient");
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit patient" : "Register a patient"}
      description={
        mode === "edit"
          ? "Update this patient's details and latest visit."
          : "Add a new patient record under this doctor."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="patient-form" loading={submitting}>
            {submitting ? "Saving…" : mode === "edit" ? "Save changes" : "Register patient"}
          </Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {message ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {message}
          </div>
        ) : null}

        <Input
          label="Full name"
          name="name"
          placeholder="e.g. Nadia Hossain"
          value={form.name}
          error={errors.name}
          onChange={(event) => update("name")(event.target.value)}
          autoFocus
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Age"
            name="age"
            type="number"
            min={0}
            max={130}
            placeholder="34"
            value={form.age}
            error={errors.age}
            onChange={(event) => update("age")(event.target.value)}
          />
          <Select
            label="Gender"
            name="gender"
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
              { value: "other", label: "Other" },
            ]}
            value={form.gender}
            error={errors.gender}
            onChange={(event) => update("gender")(event.target.value)}
          />
          <Input
            label="Visit date"
            name="visitDate"
            type="date"
            value={form.visitDate}
            error={errors.visitDate}
            onChange={(event) => update("visitDate")(event.target.value)}
          />
        </div>

        <Select
          label="Condition"
          name="condition"
          placeholder="Select condition"
          options={options?.conditions ?? []}
          value={form.condition}
          error={errors.condition}
          onChange={(event) => update("condition")(event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone"
            name="phone"
            type="tel"
            placeholder="Optional"
            value={form.phone}
            error={errors.phone}
            onChange={(event) => update("phone")(event.target.value)}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Optional"
            value={form.email}
            error={errors.email}
            onChange={(event) => update("email")(event.target.value)}
          />
        </div>

        <Field label="Notes" htmlFor="notes" hint="Optional clinical or administrative notes (max 500 characters).">
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={500}
            value={form.notes}
            onChange={(event) => update("notes")(event.target.value)}
            placeholder="Follow-up plan, observations, referrals…"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </Field>
      </form>
    </Modal>
  );
}
