import type { UserRole } from "./authTypes";

export const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    "dashboard",
    "patients",
    "tests",
    "samples",
    "accession",
    "analysis",
    "results",
    "reports",
    "billing",
    "financial-analysis",
    "expenses",
    "doctors",
    "quality-control",
    "staff",
    "lab-management",
    "lab-profile",
    "notifications",
    "settings",
  ],

  receptionist: [
    "dashboard",
    "patients",
    "doctors",
    "billing",
    "reports",
  ],

  lab_technician: [
    "dashboard",
    "samples",
    "accession",
    "analysis",
    "results",
    "reports",
  ],
};