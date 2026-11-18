"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ChevronRight, Pencil, Plus, RotateCcw, Stethoscope, Trash2 } from "lucide-react";
import { apiFetch, buildQuery, fetcher } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { Doctor, FilterOptions, Paginated } from "@/lib/types";
import { PageHeader, Card } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { FilterDate, FilterSelect, SearchField } from "@/components/ui/filter-bar";
import { DoctorFormModal } from "@/components/doctors/doctor-form-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/providers/toast-provider";

const PAGE_SIZE = 8;

export default function DoctorsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [specialization, setSpecialization] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") setModalOpen(true);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, specialization, from, to, sort]);

  const query = buildQuery({
    q: debouncedSearch,
    specialization,
    from,
    to,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  const { data, error, isLoading, isValidating, mutate } = useSWR<Paginated<Doctor>>(
    `/doctors${query}`,
    fetcher
  );
  const { data: meta } = useSWR<FilterOptions>("/meta", fetcher);

  const hasFilters =
    Boolean(search || specialization || from || to) || sort !== "newest";

  const clearFilters = () => {
    setSearch("");
    setSpecialization("");
    setFrom("");
    setTo("");
    setSort("newest");
  };

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/doctors/${deleteTarget.id}`, { method: "DELETE" });
      toast({
        title: "Doctor deleted",
        description: `${deleteTarget.name} was removed from the directory.`,
        tone: "success",
      });
      setDeleteTarget(null);
      void mutate();
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

  return (
    <div className="space-y-5">
      <PageHeader
        title="Doctors"
        description="The practice directory — search, filter, and drill into each doctor's patient list."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>
            Add doctor
          </Button>
        }
      />

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))_auto]">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search name, hospital, email…"
            label="Search doctors"
          />
          <FilterSelect
            value={specialization}
            onChange={setSpecialization}
            options={meta?.specializations ?? []}
            placeholder="All specializations"
            label="Filter by specialization"
          />
          <FilterDate value={from} onChange={setFrom} label="Joined from date" />
          <FilterDate value={to} onChange={setTo} label="Joined until date" />
          <FilterSelect
            value={sort}
            onChange={setSort}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "name", label: "Name A–Z" },
              { value: "name_desc", label: "Name Z–A" },
            ]}
            placeholder="Sort"
            label="Sort doctors"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={!hasFilters}
            icon={<RotateCcw className="size-4" />}
            className="h-10"
          >
            Reset
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Directory</h2>
            {data ? (
              <Badge className="bg-brand-50 text-brand-800 ring-brand-100">
                {data.meta.total} {data.meta.total === 1 ? "doctor" : "doctors"}
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
          <ErrorState message="We could not load doctors." onRetry={() => void mutate()} />
        ) : isLoading || !data ? (
          <TableSkeleton rows={PAGE_SIZE} columns={4} />
        ) : data.data.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="size-5" />}
            title={hasFilters ? "No doctors match these filters" : "No doctors yet"}
            description={
              hasFilters
                ? "Try broadening your search or resetting the filters."
                : "Add your first doctor to start registering patients."
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Reset filters
                </Button>
              ) : (
                <Button icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>
                  Add doctor
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="scrollbar-slim hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Doctor</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Specialization</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Hospital</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Patients</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Last visit</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Joined</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((doctor) => (
                    <tr key={doctor.id} className="group transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <Link href={`/doctors/${doctor.id}`} className="flex items-center gap-3">
                          <Avatar name={doctor.name} />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-slate-900 group-hover:text-brand-800">
                              {doctor.name}
                            </span>
                            <span className="block truncate text-xs text-slate-500">{doctor.email}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className="bg-indigo-50 text-indigo-700 ring-indigo-100">
                          {doctor.specialization}
                        </Badge>
                      </td>
                      <td className="max-w-52 px-4 py-4">
                        <span className="block truncate text-slate-600">{doctor.hospital}</span>
                        <span className="block text-xs text-slate-400">{doctor.phone}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex min-w-9 items-center justify-center rounded-lg bg-brand-50 px-2 py-0.5 text-sm font-semibold text-brand-800 tabular-nums">
                          {doctor.patientCount}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {doctor.lastVisitAt ? formatDate(doctor.lastVisitAt) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center justify-end gap-2 text-slate-500">
                          {formatDate(doctor.createdAt)}
                          <Link
                            href={`/doctors/${doctor.id}`}
                            aria-label={`Open ${doctor.name}`}
                            className="rounded-md p-1 text-slate-300 transition group-hover:text-brand-600"
                          >
                            <ChevronRight className="size-4" />
                          </Link>
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditDoctor(doctor)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Edit ${doctor.name}`}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(doctor)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Delete ${doctor.name}`}
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
              {data.data.map((doctor) => (
                <li key={doctor.id}>
                  <div className="flex flex-col gap-3 px-4 py-4 transition active:bg-slate-50">
                    <Link href={`/doctors/${doctor.id}`} className="flex items-center gap-3">
                      <Avatar name={doctor.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">{doctor.name}</p>
                        <p className="truncate text-xs text-slate-500">{doctor.hospital}</p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-slate-300" />
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 pl-12">
                      <Badge className="bg-indigo-50 text-indigo-700 ring-indigo-100">
                        {doctor.specialization}
                      </Badge>
                      <Badge className="bg-brand-50 text-brand-800 ring-brand-100">
                        {doctor.patientCount} {doctor.patientCount === 1 ? "patient" : "patients"}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        Joined {formatDate(doctor.createdAt)}
                      </span>
                      <div className="ml-auto flex gap-1">
                        <button
                          type="button"
                          onClick={() => setEditDoctor(doctor)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                          aria-label={`Edit ${doctor.name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(doctor)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Delete ${doctor.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Pagination meta={data.meta} onPageChange={setPage} disabled={isValidating} />
          </>
        )}
      </Card>

      <DoctorFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        specializations={meta?.specializations ?? []}
        onCreated={() => {
          void mutate();
          setPage(1);
        }}
      />
      <DoctorFormModal
        open={Boolean(editDoctor)}
        onClose={() => setEditDoctor(null)}
        doctor={editDoctor}
        specializations={meta?.specializations ?? []}
        onSaved={() => void mutate()}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete doctor?"
        description={
          deleteTarget
            ? `This removes ${deleteTarget.name} from the directory. Doctors with assigned patients cannot be deleted.`
            : ""
        }
        loading={deleting}
      />
    </div>
  );
}
