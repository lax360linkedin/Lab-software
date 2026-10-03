import { getFormattedCurrentDate, getFormattedCurrentTime } from "../../common components/dateUtils";

export interface TestParameterDefinition {
  name: string;
  code: string;
  unit: string;
  lowRef: number;
  highRef: number;
  defaultValue?: number | string;
  type?: "numeric" | "text";
}

export interface ResultParameterValue {
  name: string;
  code: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  flag: "Normal" | "High" | "Low" | "Critical";
}

export interface TestResultItem {
  id: string;
  sampleId: string;
  accessionId: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  testId: string;
  testName: string;
  department: string;
  sampleType: string;
  analyzer: string;
  technician: string;
  completedDate: string;
  completedTime: string;
  status:
    | "AWAITING_ENTRY"
    | "ENTERED"
    | "QC_PENDING"
    | "QC_PASSED"
    | "QC_FAILED"
    | "PENDING_VERIFICATION"
    | "VERIFIED";
  qcStatus: "PASSED" | "FAILED" | "PENDING";
  qcRunId?: string;
  parameters: ResultParameterValue[];
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  reportStatus?: "Generated" | "Pending" | "Dispatched";
}

export const TEST_DEFINITIONS: Record<string, { name: string; department: string; parameters: TestParameterDefinition[] }> = {
  "Complete Blood Count (CBC)": {
    name: "Complete Blood Count (CBC)",
    department: "Hematology",
    parameters: [
      { name: "Hemoglobin (Hb)", code: "HB", unit: "g/dL", lowRef: 13.0, highRef: 17.0, defaultValue: 14.2 },
      { name: "Total WBC Count", code: "WBC", unit: "cells/mcL", lowRef: 4000, highRef: 11000, defaultValue: 7200 },
      { name: "RBC Count", code: "RBC", unit: "mil/mcL", lowRef: 4.5, highRef: 5.9, defaultValue: 4.8 },
      { name: "Platelet Count", code: "PLT", unit: "lakhs/mcL", lowRef: 1.5, highRef: 4.5, defaultValue: 2.8 },
      { name: "Hematocrit (PCV)", code: "PCV", unit: "%", lowRef: 40.0, highRef: 50.0, defaultValue: 43.5 },
      { name: "MCV", code: "MCV", unit: "fL", lowRef: 80.0, highRef: 96.0, defaultValue: 88.0 },
      { name: "MCH", code: "MCH", unit: "pg", lowRef: 27.0, highRef: 33.0, defaultValue: 29.5 },
      { name: "MCHC", code: "MCHC", unit: "g/dL", lowRef: 32.0, highRef: 36.0, defaultValue: 33.8 },
      { name: "Neutrophils", code: "NEUT", unit: "%", lowRef: 40.0, highRef: 75.0, defaultValue: 58.0 },
      { name: "Lymphocytes", code: "LYMPH", unit: "%", lowRef: 20.0, highRef: 45.0, defaultValue: 32.0 },
    ],
  },
  "Liver Function Test (LFT)": {
    name: "Liver Function Test (LFT)",
    department: "Biochemistry",
    parameters: [
      { name: "Total Bilirubin", code: "TBIL", unit: "mg/dL", lowRef: 0.2, highRef: 1.2, defaultValue: 0.8 },
      { name: "Direct Bilirubin", code: "DBIL", unit: "mg/dL", lowRef: 0.0, highRef: 0.3, defaultValue: 0.2 },
      { name: "SGOT / AST", code: "SGOT", unit: "U/L", lowRef: 5, highRef: 40, defaultValue: 28 },
      { name: "SGPT / ALT", code: "SGPT", unit: "U/L", lowRef: 7, highRef: 56, defaultValue: 34 },
      { name: "Alkaline Phosphatase (ALP)", code: "ALP", unit: "U/L", lowRef: 44, highRef: 147, defaultValue: 88 },
      { name: "Total Protein", code: "TPROT", unit: "g/dL", lowRef: 6.0, highRef: 8.3, defaultValue: 7.1 },
      { name: "Serum Albumin", code: "ALB", unit: "g/dL", lowRef: 3.5, highRef: 5.0, defaultValue: 4.2 },
    ],
  },
  "Lipid Profile": {
    name: "Lipid Profile",
    department: "Biochemistry",
    parameters: [
      { name: "Total Cholesterol", code: "CHOL", unit: "mg/dL", lowRef: 125, highRef: 200, defaultValue: 178 },
      { name: "Triglycerides", code: "TRIG", unit: "mg/dL", lowRef: 50, highRef: 150, defaultValue: 130 },
      { name: "HDL Cholesterol", code: "HDL", unit: "mg/dL", lowRef: 40, highRef: 60, defaultValue: 46 },
      { name: "LDL Cholesterol", code: "LDL", unit: "mg/dL", lowRef: 60, highRef: 100, defaultValue: 94 },
      { name: "VLDL Cholesterol", code: "VLDL", unit: "mg/dL", lowRef: 10, highRef: 30, defaultValue: 22 },
    ],
  },
  "Blood Glucose": {
    name: "Blood Glucose",
    department: "Biochemistry",
    parameters: [
      { name: "Fasting Blood Sugar (FBS)", code: "FBS", unit: "mg/dL", lowRef: 70, highRef: 100, defaultValue: 88 },
      { name: "Post Prandial (PPBS)", code: "PPBS", unit: "mg/dL", lowRef: 70, highRef: 140, defaultValue: 124 },
      { name: "HbA1c", code: "HBA1C", unit: "%", lowRef: 4.0, highRef: 5.6, defaultValue: 5.2 },
    ],
  },
  "Kidney Function Test (KFT)": {
    name: "Kidney Function Test (KFT)",
    department: "Biochemistry",
    parameters: [
      { name: "Blood Urea", code: "UREA", unit: "mg/dL", lowRef: 15, highRef: 45, defaultValue: 26 },
      { name: "Serum Creatinine", code: "CREAT", unit: "mg/dL", lowRef: 0.6, highRef: 1.2, defaultValue: 0.9 },
      { name: "Uric Acid", code: "URIC", unit: "mg/dL", lowRef: 3.5, highRef: 7.2, defaultValue: 5.4 },
      { name: "Blood Urea Nitrogen (BUN)", code: "BUN", unit: "mg/dL", lowRef: 7, highRef: 20, defaultValue: 12 },
    ],
  },
  "Thyroid Profile": {
    name: "Thyroid Profile",
    department: "Endocrinology",
    parameters: [
      { name: "Total T3", code: "T3", unit: "ng/mL", lowRef: 0.8, highRef: 2.0, defaultValue: 1.3 },
      { name: "Total T4", code: "T4", unit: "mcg/dL", lowRef: 5.1, highRef: 14.1, defaultValue: 8.5 },
      { name: "TSH Ultrasensitive", code: "TSH", unit: "mIU/L", lowRef: 0.4, highRef: 4.2, defaultValue: 2.1 },
    ],
  },
};

export const INITIAL_RESULTS_STORE: TestResultItem[] = [
  {
    id: "RES-2026-001",
    sampleId: "SMP-10007",
    accessionId: "ACC-2026-0019",
    patientId: "PAT-1007",
    patientName: "Raj Kumar",
    age: 38,
    gender: "Male",
    phone: "+91 98401 23456",
    testId: "TST-CBC",
    testName: "Complete Blood Count (CBC)",
    department: "Hematology",
    sampleType: "Whole Blood (EDTA)",
    analyzer: "Sysmex XN-1000",
    technician: "Suresh Kumar",
    completedDate: getFormattedCurrentDate(),
    completedTime: getFormattedCurrentTime(),
    status: "AWAITING_ENTRY",
    qcStatus: "PENDING",
    parameters: [],
    notes: "Analysis completed on Sysmex XN-1000. Ready for technician entry.",
  },
  {
    id: "RES-2026-002",
    sampleId: "SMP-10008",
    accessionId: "ACC-2026-0020",
    patientId: "PAT-1008",
    patientName: "Anita Sharma",
    age: 45,
    gender: "Female",
    phone: "+91 98402 34567",
    testId: "TST-LFT",
    testName: "Liver Function Test (LFT)",
    department: "Biochemistry",
    sampleType: "Serum",
    analyzer: "AU480 Chemistry Analyzer",
    technician: "Karthik S",
    completedDate: getFormattedCurrentDate(),
    completedTime: "10:15 AM",
    status: "AWAITING_ENTRY",
    qcStatus: "PENDING",
    parameters: [],
    notes: "Serum clear, non-lipemic.",
  },
  {
    id: "RES-2026-003",
    sampleId: "SMP-10009",
    accessionId: "ACC-2026-0021",
    patientId: "PAT-1009",
    patientName: "Meenakshi Sundaram",
    age: 52,
    gender: "Female",
    phone: "+91 98403 45678",
    testId: "TST-LIPID",
    testName: "Lipid Profile",
    department: "Biochemistry",
    sampleType: "Serum",
    analyzer: "Mindray BS-200E",
    technician: "Priya M",
    completedDate: getFormattedCurrentDate(),
    completedTime: "10:30 AM",
    status: "AWAITING_ENTRY",
    qcStatus: "PENDING",
    parameters: [],
  },
  {
    id: "RES-2026-004",
    sampleId: "SMP-10010",
    accessionId: "ACC-2026-0022",
    patientId: "PAT-1010",
    patientName: "Suresh Babu",
    age: 61,
    gender: "Male",
    phone: "+91 98404 56789",
    testId: "TST-GLUCOSE",
    testName: "Blood Glucose",
    department: "Biochemistry",
    sampleType: "Fluoride Plasma",
    analyzer: "Cobas c311",
    technician: "Meena Devi",
    completedDate: getFormattedCurrentDate(),
    completedTime: "11:00 AM",
    status: "AWAITING_ENTRY",
    qcStatus: "PENDING",
    parameters: [],
  },
  {
    id: "RES-2026-005",
    sampleId: "SMP-10011",
    accessionId: "ACC-2026-0023",
    patientId: "PAT-1011",
    patientName: "Priya Raman",
    age: 29,
    gender: "Female",
    phone: "+91 98405 67890",
    testId: "TST-THYROID",
    testName: "Thyroid Profile",
    department: "Endocrinology",
    sampleType: "Serum",
    analyzer: "Cobas e411",
    technician: "Arun Raj",
    completedDate: getFormattedCurrentDate(),
    completedTime: "11:15 AM",
    status: "AWAITING_ENTRY",
    qcStatus: "PENDING",
    parameters: [],
  },
  {
    id: "RES-2026-006",
    sampleId: "SMP-10001",
    accessionId: "ACC-2026-0001",
    patientId: "PAT-1001",
    patientName: "Arun Kumar",
    age: 42,
    gender: "Male",
    phone: "+91 98401 11223",
    testId: "TST-CBC",
    testName: "Complete Blood Count (CBC)",
    department: "Hematology",
    sampleType: "Whole Blood (EDTA)",
    analyzer: "Sysmex XN-1000",
    technician: "Suresh Kumar",
    completedDate: getFormattedCurrentDate(),
    completedTime: "09:30 AM",
    status: "PENDING_VERIFICATION",
    qcStatus: "PASSED",
    qcRunId: "QC-RUN-901",
    notes: "Counts verified with automated smear review. Normal morphology.",
    parameters: [
      { name: "Hemoglobin (Hb)", code: "HB", value: 14.5, unit: "g/dL", referenceRange: "13.0 - 17.0", flag: "Normal" },
      { name: "Total WBC Count", code: "WBC", value: 7400, unit: "cells/mcL", referenceRange: "4000 - 11000", flag: "Normal" },
      { name: "RBC Count", code: "RBC", value: 4.9, unit: "mil/mcL", referenceRange: "4.5 - 5.9", flag: "Normal" },
      { name: "Platelet Count", code: "PLT", value: 2.6, unit: "lakhs/mcL", referenceRange: "1.5 - 4.5", flag: "Normal" },
      { name: "Hematocrit (PCV)", code: "PCV", value: 44.0, unit: "%", referenceRange: "40.0 - 50.0", flag: "Normal" },
      { name: "MCV", code: "MCV", value: 89.2, unit: "fL", referenceRange: "80.0 - 96.0", flag: "Normal" },
      { name: "Neutrophils", code: "NEUT", value: 62.0, unit: "%", referenceRange: "40.0 - 75.0", flag: "Normal" },
      { name: "Lymphocytes", code: "LYMPH", value: 30.0, unit: "%", referenceRange: "20.0 - 45.0", flag: "Normal" },
    ],
  },
  {
    id: "RES-2026-007",
    sampleId: "SMP-10002",
    accessionId: "ACC-2026-0002",
    patientId: "PAT-1002",
    patientName: "Kavitha R",
    age: 34,
    gender: "Female",
    phone: "+91 98402 22334",
    testId: "TST-KFT",
    testName: "Kidney Function Test (KFT)",
    department: "Biochemistry",
    sampleType: "Serum",
    analyzer: "AU480 Chemistry Analyzer",
    technician: "Karthik S",
    completedDate: getFormattedCurrentDate(),
    completedTime: "09:45 AM",
    status: "PENDING_VERIFICATION",
    qcStatus: "PASSED",
    qcRunId: "QC-RUN-902",
    notes: "Renal parameters within physiological limits.",
    parameters: [
      { name: "Blood Urea", code: "UREA", value: 24, unit: "mg/dL", referenceRange: "15 - 45", flag: "Normal" },
      { name: "Serum Creatinine", code: "CREAT", value: 0.8, unit: "mg/dL", referenceRange: "0.6 - 1.2", flag: "Normal" },
      { name: "Uric Acid", code: "URIC", value: 5.1, unit: "mg/dL", referenceRange: "3.5 - 7.2", flag: "Normal" },
      { name: "Blood Urea Nitrogen (BUN)", code: "BUN", value: 11.2, unit: "mg/dL", referenceRange: "7 - 20", flag: "Normal" },
    ],
  },
  {
    id: "RES-2026-008",
    sampleId: "SMP-09991",
    accessionId: "ACC-2026-0001",
    patientId: "PAT-1003",
    patientName: "Dr. Govindaraj",
    age: 58,
    gender: "Male",
    phone: "+91 98403 33445",
    testId: "TST-LIPID",
    testName: "Lipid Profile",
    department: "Biochemistry",
    sampleType: "Serum",
    analyzer: "Mindray BS-200E",
    technician: "Priya M",
    completedDate: getFormattedCurrentDate(),
    completedTime: "08:30 AM",
    status: "VERIFIED",
    qcStatus: "PASSED",
    qcRunId: "QC-RUN-898",
    verifiedBy: "Dr. Ananya Swaminathan, MD Pathologist",
    verifiedAt: `${getFormattedCurrentDate()}, 09:15 AM`,
    reportStatus: "Generated",
    parameters: [
      { name: "Total Cholesterol", code: "CHOL", value: 215, unit: "mg/dL", referenceRange: "125 - 200", flag: "High" },
      { name: "Triglycerides", code: "TRIG", value: 172, unit: "mg/dL", referenceRange: "50 - 150", flag: "High" },
      { name: "HDL Cholesterol", code: "HDL", value: 38, unit: "mg/dL", referenceRange: "40 - 60", flag: "Low" },
      { name: "LDL Cholesterol", code: "LDL", value: 142, unit: "mg/dL", referenceRange: "60 - 100", flag: "High" },
      { name: "VLDL Cholesterol", code: "VLDL", value: 34, unit: "mg/dL", referenceRange: "10 - 30", flag: "High" },
    ],
    notes: "Borderline dyslipidemia. Lifestyle modification advised.",
  },
  {
    id: "RES-2026-009",
    sampleId: "SMP-09992",
    accessionId: "ACC-2026-0002",
    patientId: "PAT-1004",
    patientName: "Lakshmi Narayanan",
    age: 66,
    gender: "Male",
    phone: "+91 98404 44556",
    testId: "TST-GLUCOSE",
    testName: "Blood Glucose",
    department: "Biochemistry",
    sampleType: "Plasma",
    analyzer: "Cobas c311",
    technician: "Meena Devi",
    completedDate: getFormattedCurrentDate(),
    completedTime: "08:45 AM",
    status: "VERIFIED",
    qcStatus: "PASSED",
    qcRunId: "QC-RUN-899",
    verifiedBy: "Dr. Ananya Swaminathan, MD Pathologist",
    verifiedAt: `${getFormattedCurrentDate()}, 09:20 AM`,
    reportStatus: "Dispatched",
    parameters: [
      { name: "Fasting Blood Sugar (FBS)", code: "FBS", value: 138, unit: "mg/dL", referenceRange: "70 - 100", flag: "High" },
      { name: "Post Prandial (PPBS)", code: "PPBS", value: 210, unit: "mg/dL", referenceRange: "70 - 140", flag: "High" },
      { name: "HbA1c", code: "HBA1C", value: 7.8, unit: "%", referenceRange: "4.0 - 5.6", flag: "High" },
    ],
    notes: "Diabetic range. Clinical correlation suggested.",
  },
];

// In-browser state management helpers
const STORAGE_KEY = "lax360_lab_results_store";

export const getStoredResults = (): TestResultItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESULTS_STORE));
      return INITIAL_RESULTS_STORE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RESULTS_STORE;
  }
};

export const saveResultsStore = (items: TestResultItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to persist results store:", e);
  }
};
