"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ChevronRight, Stethoscope } from "lucide-react";
import { buildQuery, fetcher } from "@/lib/api";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { Doctor, Paginated } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SearchField } from "@/components/ui/filter-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";

export function DoctorPickerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (doctor: Doctor) => void;
}) {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search);
  const { data, isLoading } = useSWR<Paginated<Doctor>>(
    open ? `/doctors${buildQuery({ q: debounced, limit: 50, sort: "name" })}` : null,
    fetcher
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose a doctor"
      description="Patients are registered under a specific doctor. Pick one to continue."
    >
      <div className="space-y-4">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search doctors by name or hospital…"
          label="Search doctors"
        />

        {isLoading || !data ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : data.data.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="size-5" />}
            title="No doctors found"
            description="Add a doctor to the directory before registering patients."
            action={
              <Link href="/doctors?new=1" onClick={onClose} className="text-sm font-medium text-brand-700 hover:underline">
                Go to doctors
              </Link>
            }
          />
        ) : (
          <ul className="max-h-[55vh] space-y-2 overflow-y-auto pr-1 scrollbar-slim">
            {data.data.map((doctor) => (
              <li key={doctor.id}>
                <button
                  type="button"
                  onClick={() => onSelect(doctor)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <Avatar name={doctor.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{doctor.name}</span>
                    <span className="block truncate text-xs text-slate-500">{doctor.hospital}</span>
                  </span>
                  <Badge className="hidden bg-indigo-50 text-indigo-700 ring-indigo-100 sm:inline-flex">
                    {doctor.specialization}
                  </Badge>
                  <ChevronRight className="size-4 shrink-0 text-slate-300" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
