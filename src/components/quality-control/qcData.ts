import { getFormattedCurrentDate } from "../../common components/dateUtils";

export interface QCRunRecord {
  id: string;
  runNumber: string;
  testName: string;
  department: string;
  analyzerId: string;
  analyzerName: string;
  controlName: string;
  controlLevel: "Level 1 (Normal)" | "Level 2 (Abnormal/High)" | "Level 3 (Low)";
  lotNumber: string;
  expiryDate: string;
  technician: string;
  runDate: string;
  runTime: string;
  targetMean: number;
  targetSD: number;
  measuredValue: number;
  zScore: number;
  unit: string;
  westgardRule: "1-SD (Normal)" | "1-2s (Warning)" | "1-3s (Rejection)" | "2-2s (Systematic Error)" | "R-4s (Random Error)";
  status: "Passed" | "Warning" | "Failed";
  affectedBatch?: string;
  notes?: string;
}

export interface QCControlLot {
  id: string;
  lotNumber: string;
  controlName: string;
  manufacturer: string;
  department: string;
  assignedAnalyzers: string[];
  testsCovered: string[];
  matrixType: "Lyophilized Human Serum" | "Whole Blood" | "Aqueous Buffer";
  expiryDate: string;
  openStability: string;
  runsCompleted: number;
  meanCv: string;
  status: "Active" | "Expiring Soon" | "Exhausted";
}

export interface QCFailedItem {
  id: string;
  qcRunId: string;
  testName: string;
  analyzerName: string;
  controlLot: string;
  measuredValue: number;
  targetMean: number;
  zScore: number;
  violationRule: string;
  failedDate: string;
  failedTime: string;
  technician: string;
  affectedSamplesCount: number;
  affectedSampleIds: string[];
  status: "Action Required" | "Under Investigation" | "Resolved";
  severity: "High" | "Critical";
}

export interface CorrectiveActionRecord {
  id: string;
  capaNumber: string;
  failedQcId: string;
  qcRunId: string;
  analyzerName: string;
  testName: string;
  identifiedIssue: string;
  rootCauseCategory: "Reagent Deterioration" | "Calibration Drift" | "Optical / Lamp Error" | "Temperature Fluctuation" | "Pipette Calibration" | "Mechanical Alignment";
  rootCauseDetails: string;
  actionTaken: string;
  repeatRunValue: number;
  repeatRunStatus: "Passed" | "Retest Required";
  reanalysisAuthorized: boolean;
  releasedSampleIds: string[];
  investigatedBy: string;
  actionDate: string;
  actionTime: string;
  approvalStatus: "Approved & Released" | "Pending Review";
}

export const INITIAL_QC_RUNS: QCRunRecord[] = [
  {
    id: "QC-RUN-901",
    runNumber: "QC-2026-0901",
    testName: "Complete Blood Count (CBC)",
    department: "Hematology",
    analyzerId: "EQ-HEM-01",
    analyzerName: "Sysmex XN-1000",
    controlName: "Bio-Rad Liquichek Hematology",
    controlLevel: "Level 1 (Normal)",
    lotNumber: "LOT-HEM-8821",
    expiryDate: "15 Dec 2026",
    technician: "Suresh Kumar",
    runDate: getFormattedCurrentDate(),
    runTime: "07:30 AM",
    targetMean: 14.0,
    targetSD: 0.4,
    measuredValue: 14.1,
    zScore: 0.25,
    unit: "g/dL",
    westgardRule: "1-SD (Normal)",
    status: "Passed",
    notes: "Baseline morning calibration run optimal.",
  },
  {
    id: "QC-RUN-902",
    runNumber: "QC-2026-0902",
    testName: "Kidney Function Test (KFT)",
    department: "Biochemistry",
    analyzerId: "EQ-BIO-01",
    analyzerName: "AU480 Chemistry Analyzer",
    controlName: "Bio-Rad Lyphochek Assayed Chemistry",
    controlLevel: "Level 1 (Normal)",
    lotNumber: "LOT-BIO-4412",
    expiryDate: "28 Feb 2027",
    technician: "Karthik S",
    runDate: getFormattedCurrentDate(),
    runTime: "07:45 AM",
    targetMean: 0.95,
    targetSD: 0.05,
    measuredValue: 0.97,
    zScore: 0.4,
    unit: "mg/dL",
    westgardRule: "1-SD (Normal)",
    status: "Passed",
    notes: "AU480 photometer check passed.",
  },
  {
    id: "QC-RUN-903",
    runNumber: "QC-2026-0903",
    testName: "Liver Function Test (LFT - SGPT)",
    department: "Biochemistry",
    analyzerId: "EQ-BIO-01",
    analyzerName: "AU480 Chemistry Analyzer",
    controlName: "Bio-Rad Lyphochek Assayed Chemistry",
    controlLevel: "Level 2 (Abnormal/High)",
    lotNumber: "LOT-BIO-4413",
    expiryDate: "28 Feb 2027",
    technician: "Karthik S",
    runDate: getFormattedCurrentDate(),
    runTime: "08:00 AM",
    targetMean: 85.0,
    targetSD: 3.5,
    measuredValue: 92.4,
    zScore: 2.11,
    unit: "U/L",
    westgardRule: "1-2s (Warning)",
    status: "Warning",
    notes: "SGPT/ALT slightly elevated past +2SD. Monitored for systematic drift.",
  },
  {
    id: "QC-RUN-905",
    runNumber: "QC-2026-0905",
    testName: "Lipid Profile (Cholesterol)",
    department: "Biochemistry",
    analyzerId: "EQ-BIO-03",
    analyzerName: "Mindray BS-200E",
    controlName: "Randox Acusera Liquid Lipid Control",
    controlLevel: "Level 2 (Abnormal/High)",
    lotNumber: "LOT-RAN-6602",
    expiryDate: "30 Nov 2026",
    technician: "Priya M",
    runDate: getFormattedCurrentDate(),
    runTime: "08:30 AM",
    targetMean: 220.0,
    targetSD: 6.0,
    measuredValue: 221.8,
    zScore: 0.3,
    unit: "mg/dL",
    westgardRule: "1-SD (Normal)",
    status: "Passed",
    notes: "Lipid channels within 1-SD tolerance.",
  },
  {
    id: "QC-RUN-906",
    runNumber: "QC-2026-0906",
    testName: "Thyroid Profile (TSH)",
    department: "Endocrinology",
    analyzerId: "EQ-IMM-01",
    analyzerName: "Cobas e411",
    controlName: "Roche Elecsys PreciControl Universal",
    controlLevel: "Level 1 (Normal)",
    lotNumber: "LOT-ELE-3320",
    expiryDate: "15 Apr 2027",
    technician: "Arun Raj",
    runDate: getFormattedCurrentDate(),
    runTime: "08:45 AM",
    targetMean: 1.85,
    targetSD: 0.12,
    measuredValue: 1.82,
    zScore: -0.25,
    unit: "mIU/L",
    westgardRule: "1-SD (Normal)",
    status: "Passed",
    notes: "Chemiluminescence detector clean and calibrated.",
  },
];

export const INITIAL_QC_LOTS: QCControlLot[] = [
  {
    id: "LOT-01",
    lotNumber: "LOT-HEM-8821",
    controlName: "Bio-Rad Liquichek Hematology",
    manufacturer: "Bio-Rad Laboratories",
    department: "Hematology",
    assignedAnalyzers: ["Sysmex XN-1000", "Sysmex XP-300"],
    testsCovered: ["CBC", "Hemoglobin", "Platelets", "WBC Differential"],
    matrixType: "Whole Blood",
    expiryDate: "15 Dec 2026",
    openStability: "21 days refrigerated",
    runsCompleted: 84,
    meanCv: "1.4%",
    status: "Active",
  },
  {
    id: "LOT-02",
    lotNumber: "LOT-BIO-4412",
    controlName: "Bio-Rad Lyphochek Assayed Chemistry",
    manufacturer: "Bio-Rad Laboratories",
    department: "Biochemistry",
    assignedAnalyzers: ["AU480 Chemistry Analyzer", "Cobas c311"],
    testsCovered: ["LFT", "KFT", "Electrolytes", "Uric Acid", "Bilirubin"],
    matrixType: "Lyophilized Human Serum",
    expiryDate: "28 Feb 2027",
    openStability: "7 days at 2-8┬░C",
    runsCompleted: 112,
    meanCv: "2.1%",
    status: "Active",
  },
  {
    id: "LOT-03",
    lotNumber: "LOT-ROC-1190",
    controlName: "Roche PreciControl ClinChem Multi 1",
    manufacturer: "Roche Diagnostics",
    department: "Biochemistry",
    assignedAnalyzers: ["Cobas c311"],
    testsCovered: ["Glucose", "HbA1c", "Cholesterol"],
    matrixType: "Lyophilized Human Serum",
    expiryDate: "10 Jan 2027",
    openStability: "5 days refrigerated",
    runsCompleted: 68,
    meanCv: "3.8%",
    status: "Expiring Soon",
  },
  {
    id: "LOT-04",
    lotNumber: "LOT-RAN-6602",
    controlName: "Randox Acusera Liquid Lipid Control",
    manufacturer: "Randox Laboratories",
    department: "Biochemistry",
    assignedAnalyzers: ["Mindray BS-200E", "AU480"],
    testsCovered: ["Total Cholesterol", "Triglycerides", "HDL", "LDL"],
    matrixType: "Lyophilized Human Serum",
    expiryDate: "30 Nov 2026",
    openStability: "14 days refrigerated",
    runsCompleted: 56,
    meanCv: "1.8%",
    status: "Active",
  },
  {
    id: "LOT-05",
    lotNumber: "LOT-ELE-3320",
    controlName: "Roche Elecsys PreciControl Universal",
    manufacturer: "Roche Diagnostics",
    department: "Endocrinology",
    assignedAnalyzers: ["Cobas e411"],
    testsCovered: ["TSH", "Total T3", "Total T4", "Ferritin", "Vitamin D"],
    matrixType: "Lyophilized Human Serum",
    expiryDate: "15 Apr 2027",
    openStability: "30 days at -20┬░C",
    runsCompleted: 42,
    meanCv: "2.3%",
    status: "Active",
  },
];

export const INITIAL_FAILED_QC: QCFailedItem[] = [
  {
    id: "FAIL-001",
    qcRunId: "QC-RUN-904",
    testName: "Blood Glucose (Hexokinase)",
    analyzerName: "Cobas c311",
    controlLot: "LOT-ROC-1190",
    measuredValue: 102.2,
    targetMean: 95.0,
    zScore: 3.6,
    violationRule: "1-3s (Value exceeds target mean by +3.60 Standard Deviations)",
    failedDate: getFormattedCurrentDate(),
    failedTime: "08:15 AM",
    technician: "Meena Devi",
    affectedSamplesCount: 4,
    affectedSampleIds: ["SMP-10010", "SMP-10014", "SMP-10015", "SMP-10018"],
    status: "Action Required",
    severity: "Critical",
  },
];

export const INITIAL_CORRECTIVE_ACTIONS: CorrectiveActionRecord[] = [
  {
    id: "CAPA-001",
    capaNumber: "CAPA-2026-042",
    failedQcId: "FAIL-PREV-098",
    qcRunId: "QC-RUN-884",
    analyzerName: "AU480 Chemistry Analyzer",
    testName: "Alkaline Phosphatase (ALP)",
    identifiedIssue: "ALP control reading shifted +2.8 SD outside acceptable control envelope.",
    rootCauseCategory: "Reagent Deterioration",
    rootCauseDetails: "Reagent onboard vial exposed to ambient temperature overnight during power conditioner switchover.",
    actionTaken: "Discarded existing ALP reagent cassette. Placed fresh refrigerated lot #ALP-2026-09. Performed two-point reagent calibration.",
    repeatRunValue: 88.5,
    repeatRunStatus: "Passed",
    reanalysisAuthorized: true,
    releasedSampleIds: ["SMP-09941", "SMP-09942", "SMP-09943"],
    investigatedBy: "Dr. Ananya Swaminathan (Quality Manager)",
    actionDate: getFormattedCurrentDate(),
    actionTime: "09:30 AM",
    approvalStatus: "Approved & Released",
  },
];

const QC_RUNS_KEY = "lax360_lab_qc_runs";
const QC_FAILED_KEY = "lax360_lab_qc_failed";
const QC_CAPA_KEY = "lax360_lab_qc_capa";

export const getStoredQCRuns = (): QCRunRecord[] => {
  try {
    const raw = localStorage.getItem(QC_RUNS_KEY);
    if (!raw) {
      localStorage.setItem(QC_RUNS_KEY, JSON.stringify(INITIAL_QC_RUNS));
      return INITIAL_QC_RUNS;
    }
    const parsed: QCRunRecord[] = JSON.parse(raw);
    const failedRuns = parsed.filter((r) => r.status === "Failed");
    if (failedRuns.length > 0) {
      const storedFailed = getStoredFailedQC();
      const newFailed: QCFailedItem[] = [];
      failedRuns.forEach((fr) => {
        if (!storedFailed.some((f) => f.qcRunId === fr.id)) {
          newFailed.push({
            id: `FAIL-${fr.id}`,
            qcRunId: fr.id,
            testName: fr.testName,
            analyzerName: fr.analyzerName,
            controlLot: fr.lotNumber,
            measuredValue: fr.measuredValue,
            targetMean: fr.targetMean,
            zScore: fr.zScore,
            violationRule: `${fr.westgardRule} (Exceeded limit - auto-routed)`,
            failedDate: fr.runDate,
            failedTime: fr.runTime,
            technician: fr.technician,
            affectedSamplesCount: 3,
            affectedSampleIds: ["SMP-HOLD-01", "SMP-HOLD-02", "SMP-HOLD-03"],
            status: "Action Required",
            severity: "Critical",
          });
        }
      });
      if (newFailed.length > 0) {
        saveFailedQC([...newFailed, ...storedFailed]);
      }
      const passedAndWarning = parsed.filter((r) => r.status === "Passed" || r.status === "Warning");
      localStorage.setItem(QC_RUNS_KEY, JSON.stringify(passedAndWarning));
      return passedAndWarning;
    }
    return parsed.filter((r) => r.status === "Passed" || r.status === "Warning");
  } catch {
    return INITIAL_QC_RUNS;
  }
};

export const saveQCRuns = (runs: QCRunRecord[]) => {
  localStorage.setItem(QC_RUNS_KEY, JSON.stringify(runs));
};

export const getStoredFailedQC = (): QCFailedItem[] => {
  try {
    const raw = localStorage.getItem(QC_FAILED_KEY);
    if (!raw) {
      localStorage.setItem(QC_FAILED_KEY, JSON.stringify(INITIAL_FAILED_QC));
      return INITIAL_FAILED_QC;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FAILED_QC;
  }
};

export const saveFailedQC = (items: QCFailedItem[]) => {
  localStorage.setItem(QC_FAILED_KEY, JSON.stringify(items));
};

export const getStoredCAPA = (): CorrectiveActionRecord[] => {
  try {
    const raw = localStorage.getItem(QC_CAPA_KEY);
    if (!raw) {
      localStorage.setItem(QC_CAPA_KEY, JSON.stringify(INITIAL_CORRECTIVE_ACTIONS));
      return INITIAL_CORRECTIVE_ACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CORRECTIVE_ACTIONS;
  }
};

export const saveCAPA = (items: CorrectiveActionRecord[]) => {
  localStorage.setItem(QC_CAPA_KEY, JSON.stringify(items));
};
