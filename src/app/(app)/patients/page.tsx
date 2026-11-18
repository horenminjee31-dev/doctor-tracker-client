"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ChevronRight,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Users,
} from "lucide-react";
import { apiFetch, buildQuery, fetcher } from "@/lib/api";
import { conditionTone, formatDate } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { FilterOptions, Paginated, Patient } from "@/lib/types";
import { PageHeader, Card } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { FilterDate, FilterSelect, SearchField } from "@/components/ui/filter-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DoctorPickerModal } from "@/components/patients/doctor-picker-modal";
import { PatientFormModal } from "@/components/patients/patient-form-modal";
import { useToast } from "@/components/providers/toast-provider";

const PAGE_SIZE = 10;

export default function PatientsPage() {
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [condition, setCondition] = useState("");
  const [gender, setGender] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("visit_newest");
  const [page, setPage] = useState(1);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [createDoctorId, setCreateDoctorId] = useState<string | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, condition, gender, from, to, sort]);

  const query = buildQuery({
    q: debouncedSearch,
    condition,
    gender,
    from,
    to,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  const { data, error, isLoading, isValidating, mutate } = useSWR<Paginated<Patient>>(
    `/patients${query}`,
    fetcher
  );
  const { data: meta } = useSWR<FilterOptions>("/meta", fetcher);

  const hasFilters =
    Boolean(search || condition || gender || from || to) || sort !== "visit_newest";

  const clearFilters = () => {
    setSearch("");
    setCondition("");
    setGender("");
    setFrom("");
    setTo("");
    setSort("visit_newest");
  };

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/patients/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "Patient deleted", description: `${deleteTarget.name} was removed.`, tone: "success" });
      setDeleteTarget(null);
      void mutate();
    } catch (deleteError) {
      toast({
        title: "Delete failed",
        description: deleteError instanceof Error ? deleteError.message : "Please try again.",
        tone: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Patients"
        description="Every patient across the practice — edit records, filter by condition, or remove duplicates."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setPickerOpen(true)}>
            Register patient
          </Button>
        }
      />

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search name, phone, email, condition…"
            label="Search patients"
            className="xl:col-span-1"
          />
          <FilterSelect
            value={condition}
            onChange={setCondition}
            options={meta?.conditions ?? []}
            placeholder="All conditions"
            label="Filter by condition"
          />
          <FilterSelect
            value={gender}
            onChange={setGender}
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
              { value: "other", label: "Other" },
            ]}
            placeholder="All genders"
            label="Filter by gender"
          />
          <FilterDate value={from} onChange={setFrom} label="Visited from date" />
          <FilterDate value={to} onChange={setTo} label="Visited until date" />
          <div className="flex gap-2">
            <FilterSelect
              value={sort}
              onChange={setSort}
              options={[
                { value: "visit_newest", label: "Latest visit" },
                { value: "visit_oldest", label: "Oldest visit" },
                { value: "name", label: "Name A–Z" },
                { value: "newest", label: "Recently added" },
              ]}
              placeholder="Sort"
              label="Sort patients"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="h-10"
              aria-label="Reset filters"
              icon={<RotateCcw className="size-4" />}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Patient records</h2>
            {data ? (
              <Badge className="bg-brand-50 text-brand-800 ring-brand-100">
                {data.meta.total} {data.meta.total === 1 ? "patient" : "patients"}
              </Badge>
            ) : null}
          </div>
          {isValidating && !isLoading ? (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="size-3 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              Updating
            </span>
          ) : null}
        </div>

        {error && !data ? (
          <ErrorState message="We could not load patients." onRetry={() => void mutate()} />
        ) : isLoading || !data ? (
          <TableSkeleton rows={PAGE_SIZE} columns={5} />
        ) : data.data.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" />}
            title={hasFilters ? "No patients match these filters" : "No patients yet"}
            description={
              hasFilters
                ? "Try adjusting the search, condition, gender, or date range."
                : "Register a patient under one of your doctors to get started."
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Reset filters
                </Button>
              ) : (
                <Button icon={<Plus className="size-4" />} onClick={() => setPickerOpen(true)}>
                  Register patient
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="scrollbar-slim hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Patient</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Condition</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Doctor</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Visit date</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Contact</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((patient) => (
                    <tr key={patient.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={patient.name} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-slate-900">{patient.name}</span>
                            <span className="block truncate text-xs text-slate-500">
                              {patient.age} yrs · <span className="capitalize">{patient.gender}</span>
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={conditionTone(patient.condition)}>{patient.condition}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        {patient.doctor ? (
                          <Link
                            href={`/doctors/${patient.doctor.id}`}
                            className="group inline-flex items-center gap-1 text-slate-700 hover:text-brand-800"
                          >
                            <span className="max-w-44 truncate">{patient.doctor.name}</span>
                            <ChevronRight className="size-3.5 text-slate-300 group-hover:text-brand-600" />
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        {patient.doctor ? (
                          <span className="block text-xs text-slate-400">{patient.doctor.specialization}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(patient.visitDate)}</td>
                      <td className="px-4 py-4">
                        <span className="block text-slate-600">{patient.phone || "—"}</span>
                        <span className="block max-w-44 truncate text-xs text-slate-400">
                          {patient.email || "No email"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditPatient(patient)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Edit ${patient.name}`}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(patient)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Delete ${patient.name}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-slate-100 md:hidden">
              {data.data.map((patient) => (
                <li key={patient.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={patient.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-500">
                        {patient.age} yrs · <span className="capitalize">{patient.gender}</span> ·{" "}
                        {formatDate(patient.visitDate)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge className={conditionTone(patient.condition)}>{patient.condition}</Badge>
                        {patient.doctor ? (
                          <span className="text-xs text-slate-500">{patient.doctor.name}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditPatient(patient)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                        aria-label={`Edit ${patient.name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(patient)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Delete ${patient.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Pagination meta={data.meta} onPageChange={setPage} disabled={isValidating} />
          </>
        )}
      </Card>

      <DoctorPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(doctor) => {
          setPickerOpen(false);
          setCreateDoctorId(doctor.id);
        }}
      />

      <PatientFormModal
        open={Boolean(createDoctorId)}
        onClose={() => setCreateDoctorId(null)}
        onSaved={() => void mutate()}
        mode="create"
        doctorId={createDoctorId ?? undefined}
        options={meta}
      />

      <PatientFormModal
        open={Boolean(editPatient)}
        onClose={() => setEditPatient(null)}
        onSaved={() => void mutate()}
        mode="edit"
        patient={editPatient}
        options={meta}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete patient?"
        description={
          deleteTarget
            ? `This permanently removes ${deleteTarget.name}'s record from the practice. This action cannot be undone.`
            : ""
        }
        loading={deleting}
      />
    </div>
  );
}
