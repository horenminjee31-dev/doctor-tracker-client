"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { apiFetch, fieldErrors } from "@/lib/api";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import type { Doctor } from "@/lib/types";

const EMPTY = { name: "", specialization: "", hospital: "", phone: "", email: "" };

export function DoctorFormModal({
  open,
  onClose,
  onCreated,
  onSaved,
  doctor,
  specializations,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (doctor: Doctor) => void;
  onSaved?: (doctor: Doctor) => void;
  doctor?: Doctor | null;
  specializations: string[];
}) {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        doctor
          ? {
              name: doctor.name,
              specialization: doctor.specialization,
              hospital: doctor.hospital,
              phone: doctor.phone,
              email: doctor.email,
            }
          : EMPTY
      );
      setErrors({});
      setMessage(null);
      setSubmitting(false);
    }
  }, [open, doctor]);

  const update = (field: keyof typeof EMPTY) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 2) nextErrors.name = "Enter the doctor's full name";
    if (!form.specialization) nextErrors.specialization = "Select a specialization";
    if (form.hospital.trim().length < 2) nextErrors.hospital = "Enter the hospital or clinic";
    if (!/^[+()\-\s\d]{6,24}$/.test(form.phone.trim())) nextErrors.phone = "Enter a valid phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Enter a valid email";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await apiFetch<{ data: Doctor }>(
        doctor ? `/doctors/${doctor.id}` : "/doctors",
        {
        method: doctor ? "PATCH" : "POST",
        body: {
          name: form.name.trim(),
          specialization: form.specialization,
          hospital: form.hospital.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        },
        }
      );
      toast({
        title: doctor ? "Doctor updated" : "Doctor added",
        description: `${response.data.name} ${doctor ? "was updated." : "is now in the directory."}`,
        tone: "success",
      });
      if (doctor) onSaved?.(response.data);
      else onCreated?.(response.data);
      onClose();
    } catch (error) {
      setErrors(fieldErrors(error));
      setMessage(error instanceof Error ? error.message : "Unable to add the doctor");
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doctor ? "Edit doctor" : "Add a doctor"}
      description={doctor ? "Update this doctor's practice profile." : "Create a profile so patients can be registered under this doctor."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="doctor-form" loading={submitting}>
            {submitting ? "Saving…" : doctor ? "Save changes" : "Save doctor"}
          </Button>
        </>
      }
    >
      <form id="doctor-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {message ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {message}
          </div>
        ) : null}

        <Input
          label="Full name"
          name="name"
          placeholder="Dr. Jane Doe"
          value={form.name}
          error={errors.name}
          onChange={(event) => update("name")(event.target.value)}
          autoFocus
        />

        <Select
          label="Specialization"
          name="specialization"
          placeholder="Select specialization"
          options={specializations}
          value={form.specialization}
          error={errors.specialization}
          onChange={(event) => update("specialization")(event.target.value)}
        />

        <Input
          label="Hospital / clinic"
          name="hospital"
          placeholder="City General Hospital"
          value={form.hospital}
          error={errors.hospital}
          onChange={(event) => update("hospital")(event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone"
            name="phone"
            type="tel"
            placeholder="+880 1700 000000"
            value={form.phone}
            error={errors.phone}
            onChange={(event) => update("phone")(event.target.value)}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="doctor@clinic.com"
            value={form.email}
            error={errors.email}
            onChange={(event) => update("email")(event.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
