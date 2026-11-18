export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin";
};

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  patientCount: number;
  lastVisitAt: string | null;
};

export type DoctorDetail = Omit<Doctor, "patientCount" | "lastVisitAt"> & {
  summary: {
    totalPatients: number;
    thisMonth: number;
    lastVisitAt: string | null;
  };
};

export type DoctorRef = {
  id: string;
  name: string;
  specialization: string;
  hospital?: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  condition: string;
  phone: string;
  email: string;
  notes: string;
  visitDate: string;
  createdAt: string;
  doctor: DoctorRef | null;
};

export type PageMeta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type Paginated<T> = {
  data: T[];
  meta: PageMeta;
};

export type DashboardData = {
  summary: {
    totalDoctors: number;
    totalPatients: number;
    patientsThisMonth: number;
    avgPatientsPerDoctor: number;
    lastVisitAt: string | null;
  };
  trend: Array<{ month: string; label: string; patients: number; doctors: number }>;
  byCondition: Array<{ label: string; value: number }>;
  byDoctor: Array<{
    doctorId: string;
    name: string;
    specialization: string;
    count: number;
  }>;
  recentPatients: Array<{
    id: string;
    name: string;
    condition: string;
    visitDate: string;
    doctorId: string | null;
    doctorName: string | null;
  }>;
};

export type FilterOptions = {
  specializations: string[];
  conditions: string[];
  genders: string[];
};

export type PatientInput = {
  name: string;
  age: number;
  gender: Patient["gender"];
  condition: string;
  phone: string;
  email: string;
  notes: string;
  visitDate: string;
};
