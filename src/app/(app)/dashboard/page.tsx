"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Stethoscope,
  TrendingUp,
  Users,
  UserRound,
} from "lucide-react";
import { fetcher } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";
import type { DashboardData } from "@/lib/types";
import { PageHeader, Card, CardHeader } from "@/components/ui/page";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton, ChartSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { ConditionsChart } from "@/components/dashboard/conditions-chart";
import { DoctorsChart } from "@/components/dashboard/doctors-chart";
import { useAuth } from "@/components/providers/auth-provider";

function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  }, []);
  return greeting;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const greeting = useGreeting();
  const { data, error, isLoading, mutate } = useSWR<DashboardData>("/dashboard", fetcher);

  const monthName = new Date().toLocaleString("en-US", { month: "long" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="A live snapshot of your practice — patients, doctors, and what needs attention."
        actions={
          <>
            <Link href="/patients">
              <Button variant="secondary" icon={<Users className="size-4" />}>
                All patients
              </Button>
            </Link>
            <Link href="/doctors?new=1">
              <Button icon={<Stethoscope className="size-4" />}>Add doctor</Button>
            </Link>
          </>
        }
      />

      {error && !data ? (
        <Card>
          <ErrorState message="We could not load your dashboard." onRetry={() => void mutate()} />
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading || !data ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="p-5">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="size-9 rounded-xl" />
                  </div>
                  <Skeleton className="mt-4 h-8 w-20" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </Card>
              ))
            ) : (
              <>
                <StatCard
                  label="Total doctors"
                  value={formatNumber(data.summary.totalDoctors)}
                  hint="Active in the directory"
                  icon={<Stethoscope className="size-4" />}
                  tone="brand"
                />
                <StatCard
                  label="Total patients"
                  value={formatNumber(data.summary.totalPatients)}
                  hint={
                    data.summary.lastVisitAt
                      ? `Last visit ${formatDate(data.summary.lastVisitAt)}`
                      : "No visits recorded yet"
                  }
                  icon={<Users className="size-4" />}
                  tone="indigo"
                />
                <StatCard
                  label="Patients this month"
                  value={formatNumber(data.summary.patientsThisMonth)}
                  hint={`Visits recorded in ${monthName}`}
                  icon={<CalendarDays className="size-4" />}
                  tone="amber"
                />
                <StatCard
                  label="Avg. patients / doctor"
                  value={data.summary.avgPatientsPerDoctor.toLocaleString("en-US")}
                  hint="Average caseload across the team"
                  icon={<TrendingUp className="size-4" />}
                  tone="sky"
                />
              </>
            )}
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader
                title="Patient activity"
                subtitle="Visits and new doctors over the last 6 months"
                action={
                  <div className="hidden items-center gap-4 text-xs font-medium text-slate-500 sm:flex">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-brand-600" /> Patients
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-indigo-500" /> New doctors
                    </span>
                  </div>
                }
              />
              <div className="px-2 pb-4 pt-3 sm:px-4">
                {isLoading || !data ? (
                  <div className="h-72 px-4">
                    <ChartSkeleton />
                  </div>
                ) : (
                  <TrendChart data={data.trend} />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Condition mix" subtitle="All-time case distribution" />
              <div className="px-5 pb-5 pt-3 sm:px-6">
                {isLoading || !data ? (
                  <div className="space-y-4">
                    <Skeleton className="mx-auto size-44 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : data.byCondition.length === 0 ? (
                  <EmptyState
                    icon={<Users className="size-5" />}
                    title="No conditions yet"
                    description="Condition insights appear once patients are registered."
                  />
                ) : (
                  <ConditionsChart data={data.byCondition} totalPatients={data.summary.totalPatients} />
                )}
              </div>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader
                title="Patient load by doctor"
                subtitle="Top doctors by registered patients"
                action={
                  <Link
                    href="/doctors"
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                  >
                    View all <ChevronRight className="size-4" />
                  </Link>
                }
              />
              <div className="px-2 pb-4 pt-4 sm:px-4">
                {isLoading || !data ? (
                  <div className="h-72 px-4">
                    <ChartSkeleton />
                  </div>
                ) : data.byDoctor.length === 0 ? (
                  <EmptyState
                    icon={<Stethoscope className="size-5" />}
                    title="No doctor activity"
                    description="Register patients under a doctor to see caseload distribution."
                  />
                ) : (
                  <DoctorsChart data={data.byDoctor} />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Recent visits"
                subtitle="Latest patient activity"
                action={
                  <Link
                    href="/patients"
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                  >
                    Open <ArrowUpRight className="size-4" />
                  </Link>
                }
              />
              <div className="px-3 pb-3 pt-2">
                {isLoading || !data ? (
                  <div className="space-y-4 px-2 py-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Skeleton className="size-9 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : data.recentPatients.length === 0 ? (
                  <EmptyState
                    icon={<UserRound className="size-5" />}
                    title="No visits yet"
                    description="Recent patient visits will appear here."
                  />
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {data.recentPatients.map((visit) => (
                      <li key={visit.id}>
                        <Link
                          href={visit.doctorId ? `/doctors/${visit.doctorId}` : "/patients"}
                          className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50"
                        >
                          <Avatar name={visit.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">{visit.name}</p>
                            <p className="truncate text-xs text-slate-500">
                              {formatDate(visit.visitDate)}
                              {visit.doctorName ? ` · ${visit.doctorName}` : ""}
                            </p>
                          </div>
                          <Badge className="hidden bg-slate-50 text-slate-600 ring-slate-200 sm:inline-flex">
                            {visit.condition}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
