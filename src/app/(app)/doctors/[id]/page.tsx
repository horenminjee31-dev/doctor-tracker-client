"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import {
  CalendarCheck,
  CalendarDays,
  Mail,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Building2,
  Trash2,
  UserRound,
} from "lucide-react";
import { ApiError, apiFetch, buildQuery, fetcher } from "@/lib/api";
import { conditionTone, formatDate } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { DoctorDetail, FilterOptions, Paginated, Patient } from "@/lib/types";
import { PageHeader, Card } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { FilterSelect, SearchField } from "@/components/ui/filter-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PatientFormModal } from "@/components/patients/patient-form-modal";
import { useToast } from "@/components/providers/toast-provider";

const PAGE_SIZE = 8;

export default function DoctorDetailPage() {
  const params = useParams<{ id: string }>();
  const doctorId = params.id;
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [condition, setCondition] = useState("");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, condition]);

  const doctorKey = `/doctors/${doctorId}`;
  const {
    data: doctorResponse,
    error: doctorError,
    isLoading: doctorLoading,
    mutate: mutateDoctor,
  } = useSWR<{ data: DoctorDetail }>(doctorKey, fetcher);

  const patientsKey = `/doctors/${doctorId}/patients${buildQuery({
    q: debouncedSearch,
    condition,
    page,
    limit: PAGE_SIZE,
    sort: "visit_newest",
  })}`;
  const {
    data: patientsResponse,
    error: patientsError,
    isLoading: patientsLoading,
    isValidating,
    mutate: mutatePatients,
  } = useSWR<Paginated<Patient>>(patientsKey, fetcher);

  const { data: meta } = useSWR<FilterOptions>("/meta", fetcher);

  const doctor = doctorResponse?.data;
  const hasFilters = Boolean(search || condition);

  const refreshAll = () => {
    void mutateDoctor();
    void mutatePatients();
  };

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/patients/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "Patient deleted", description: `${deleteTarget.name} was removed.`, tone: "success" });
      setDeleteTarget(null);
      refreshAll();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  if (doctorError && !doctor) {
    return (
      <div className="space-y-5">
        <PageHeader title="Doctor profile" backHref="/doctors" backLabel="Back to doctors" />
        <Card>
          <ErrorState
            message={
              doctorError instanceof ApiError && doctorError.status === 404
                ? "This doctor no longer exists."
                : "We could not load this doctor."
            }
            onRetry={() => void mutateDoctor()}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Doctor profile"
        description="Contact details, caseload, and the full patient list."
        backHref="/doctors"
        backLabel="Back to doctors"
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)} disabled={!doctor}>
            Add patient
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {doctorLoading || !doctor ? (
          <div className="p-6">
            <div className="flex items-end gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="space-y-2 pb-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="relative h-24 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 15% 20%, white 0, transparent 45%), radial-gradient(circle at 80% 120%, white 0, transparent 50%)",
                }}
              />
            </div>

            <div className="relative px-5 pb-6 sm:px-6">
              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-start sm:gap-4">
                <Avatar
                  name={doctor.name}
                  size="xl"
                  className="-mt-8 shrink-0 ring-4 ring-white shadow-md sm:-mt-14"
                />
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">{doctor.name}</h2>
                    <Badge className="bg-indigo-50 text-indigo-700 ring-indigo-100">
                      {doctor.specialization}
                    </Badge>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                    <Building2 className="size-3.5" />
                    {doctor.hospital}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                <a
                  href={`mailto:${doctor.email}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Mail className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-slate-400">Email</span>
                    <span className="block truncate font-medium text-slate-800">{doctor.email}</span>
                  </span>
                </a>
                <a
                  href={`tel:${doctor.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Phone className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-slate-400">Phone</span>
                    <span className="block truncate font-medium text-slate-800">{doctor.phone}</span>
                  </span>
                </a>
                <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <CalendarDays className="size-4" />
                  </span>
                  <span>
                    <span className="block text-xs text-slate-400">Joined the practice</span>
                    <span className="block font-medium text-slate-800">{formatDate(doctor.createdAt)}</span>
                  </span>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <StatTile
                  label="Total patients"
                  value={String(doctor.summary.totalPatients)}
                  icon={<UserRound className="size-4" />}
                />
                <StatTile
                  label="Visits this month"
                  value={String(doctor.summary.thisMonth)}
                  icon={<CalendarCheck className="size-4" />}
                />
                <StatTile
                  label="Last visit"
                  value={doctor.summary.lastVisitAt ? formatDate(doctor.summary.lastVisitAt) : "—"}
                  icon={<CalendarDays className="size-4" />}
                />
              </div>
            </div>
          </>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Patients</h2>
            {patientsResponse ? (
              <Badge className="bg-brand-50 text-brand-800 ring-brand-100">
                {patientsResponse.meta.total}
              </Badge>
            ) : null}
            {isValidating && !patientsLoading ? (
              <span className="text-xs text-slate-400">updating…</span>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search patients…"
              label="Search this doctor's patients"
              className="sm:w-60"
            />
            <FilterSelect
              value={condition}
              onChange={setCondition}
              options={meta?.conditions ?? []}
              placeholder="All conditions"
              label="Filter by condition"
              className="sm:w-44"
            />
            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-10"
                onClick={() => {
                  setSearch("");
                  setCondition("");
                }}
                icon={<RotateCcw className="size-4" />}
              >
                Reset
              </Button>
            ) : null}
          </div>
        </div>

        {patientsError && !patientsResponse ? (
          <ErrorState message="We could not load this doctor's patients." onRetry={() => void mutatePatients()} />
        ) : patientsLoading || !patientsResponse ? (
          <TableSkeleton rows={5} columns={4} />
        ) : patientsResponse.data.length === 0 ? (
          <EmptyState
            icon={<UserRound className="size-5" />}
            title={hasFilters ? "No matching patients" : "No patients yet"}
            description={
              hasFilters
                ? "Try a different search or clear the condition filter."
                : "Register this doctor's first patient to see them here."
            }
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setCondition("");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>
                  Add patient
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="scrollbar-slim hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Patient</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Age / gender</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Condition</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Visit date</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Phone</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patientsResponse.data.map((patient) => (
                    <tr key={patient.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={patient.name} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-slate-900">{patient.name}</span>
                            <span className="block truncate text-xs text-slate-500">
                              {patient.email || "No email"}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {patient.age} · <span className="capitalize">{patient.gender}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={conditionTone(patient.condition)}>{patient.condition}</Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(patient.visitDate)}</td>
                      <td className="px-4 py-4 text-slate-600">{patient.phone || "—"}</td>
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
              {patientsResponse.data.map((patient) => (
                <li key={patient.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={patient.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-500">
                        {patient.age} yrs · <span className="capitalize">{patient.gender}</span> ·{" "}
                        {formatDate(patient.visitDate)}
                      </p>
                      <div className="mt-2">
                        <Badge className={conditionTone(patient.condition)}>{patient.condition}</Badge>
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

            <Pagination meta={patientsResponse.meta} onPageChange={setPage} disabled={isValidating} />
          </>
        )}
      </Card>

      <PatientFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={refreshAll}
        mode="create"
        doctorId={doctorId}
        options={meta}
      />

      <PatientFormModal
        open={Boolean(editPatient)}
        onClose={() => setEditPatient(null)}
        onSaved={refreshAll}
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

function StatTile({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-slate-200">
        {icon}
      </span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900 tabular-nums">{value}</p>
      </div>
    </div>
  );
}
