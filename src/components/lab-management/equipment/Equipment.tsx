import { useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Table from "../../../common components/Table";
import Pagination from "../../../common components/Pagination";
import "./equipment.css";

export interface EquipmentItem {
  id: string;
  assetCode: string;
  name: string;
  model: string;
  department: string;
  manufacturer: string;
  serialNumber: string;
  installedDate: string;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  calibrationFrequencyDays: number;
  amcProvider: string;
  amcExpiryDate: string;
  status: "Operational" | "Calibration Due" | "Under Maintenance" | "Offline";
  temperatureZone: string;
  notes: string;
}

const INITIAL_EQUIPMENT: EquipmentItem[] = [
  // ==========================================
  // 1. CLINICAL BIOCHEMISTRY (10 Equipments)
  // ==========================================
  {
    id: "EQ-001",
    assetCode: "EQ-2026-001",
    name: "Roche Cobas c311 Chemistry Analyzer",
    model: "Cobas c311 Automated Spectrophotometer",
    department: "Clinical Biochemistry",
    manufacturer: "Roche Diagnostics Ltd.",
    serialNumber: "SN-RC311-9921",
    installedDate: "15 Jan 2023",
    lastCalibrationDate: "15 Sep 2026",
    nextCalibrationDate: "15 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Roche Direct Care India",
    amcExpiryDate: "14 Jan 2027",
    status: "Operational",
    temperatureZone: "20°C - 25°C (Climate Controlled)",
    notes: "300 tests/hour capacity. Calibrated with Roche C.f.a.s. calibrator lot #8812.",
  },
  {
    id: "EQ-002",
    assetCode: "EQ-2026-002",
    name: "Bio-Rad D-10 Hemoglobin Testing System",
    model: "D-10 HPLC Dual Program",
    department: "Clinical Biochemistry",
    manufacturer: "Bio-Rad Laboratories",
    serialNumber: "SN-BRD10-7714",
    installedDate: "01 Jun 2023",
    lastCalibrationDate: "20 Aug 2026",
    nextCalibrationDate: "20 Sep 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Bio-Rad Medical India",
    amcExpiryDate: "31 May 2027",
    status: "Calibration Due",
    temperatureZone: "15°C - 30°C",
    notes: "Gold standard HPLC HbA1c and beta-thalassemia screening.",
  },
  {
    id: "EQ-003",
    assetCode: "EQ-2026-003",
    name: "Thermo Scientific Medifuge Centrifuge",
    model: "Medifuge Small Benchtop",
    department: "Clinical Biochemistry",
    manufacturer: "Thermo Fisher Scientific",
    serialNumber: "SN-THMED-7182",
    installedDate: "15 Jun 2024",
    lastCalibrationDate: "15 Jun 2026",
    nextCalibrationDate: "15 Dec 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Thermo Fisher Direct",
    amcExpiryDate: "14 Jun 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "DualSpin hybrid rotor with 2-in-1 capability. Validated timer & brake.",
  },
  {
    id: "EQ-004",
    assetCode: "EQ-2026-004",
    name: "Siemens Dimension EXL 200 Integrated System",
    model: "EXL 200 Chemistry & ISE",
    department: "Clinical Biochemistry",
    manufacturer: "Siemens Healthineers",
    serialNumber: "SN-SIE-2201",
    installedDate: "10 Jan 2023",
    lastCalibrationDate: "10 Jul 2026",
    nextCalibrationDate: "10 Oct 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Siemens Direct Care",
    amcExpiryDate: "09 Jan 2027",
    status: "Operational",
    temperatureZone: "18°C - 25°C",
    notes: "Automated electrolyte (ISE), routine enzymes, lipids, renal & liver function panel.",
  },
  {
    id: "EQ-005",
    assetCode: "EQ-2026-005",
    name: "Abbott Architect c4000 Clinical Chemistry",
    model: "Architect c4000 Clinical Spectrophotometer",
    department: "Clinical Biochemistry",
    manufacturer: "Abbott Diagnostics",
    serialNumber: "SN-AB-4011",
    installedDate: "05 Feb 2023",
    lastCalibrationDate: "05 Aug 2026",
    nextCalibrationDate: "05 Nov 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Abbott Healthcare India",
    amcExpiryDate: "04 Feb 2027",
    status: "Operational",
    temperatureZone: "20°C - 24°C",
    notes: "High-throughput photometric assays, 800 tests/hour with photometric & potentiometric ISE.",
  },
  {
    id: "EQ-006",
    assetCode: "EQ-2026-006",
    name: "Radiometer ABL800 FLEX Blood Gas Analyzer",
    model: "ABL800 FLEX Automated ABG",
    department: "Clinical Biochemistry",
    manufacturer: "Radiometer Medical",
    serialNumber: "SN-RAD-8819",
    installedDate: "12 Mar 2023",
    lastCalibrationDate: "12 Sep 2026",
    nextCalibrationDate: "12 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Radiometer India Ltd",
    amcExpiryDate: "11 Mar 2027",
    status: "Operational",
    temperatureZone: "20°C - 25°C",
    notes: "Arterial blood gas pH, pCO2, pO2, electrolytes, and automated co-oximetry module.",
  },
  {
    id: "EQ-007",
    assetCode: "EQ-2026-007",
    name: "Erba Mannheim Chem 7 Semi-Automated Chemistry",
    model: "Chem 7 Benchtop Analyzer",
    department: "Clinical Biochemistry",
    manufacturer: "Transasia Bio-Medicals Ltd",
    serialNumber: "SN-TR-7023",
    installedDate: "20 Apr 2023",
    lastCalibrationDate: "20 Jun 2026",
    nextCalibrationDate: "20 Sep 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Transasia Biomedical Care",
    amcExpiryDate: "19 Apr 2027",
    status: "Calibration Due",
    temperatureZone: "20°C - 25°C",
    notes: "Backup optical flow-cell colorimeter for stat chemistry and emergency profiles.",
  },
  {
    id: "EQ-008",
    assetCode: "EQ-2026-008",
    name: "Waters ACQUITY UPLC System",
    model: "ACQUITY UPLC I-Class",
    department: "Clinical Biochemistry",
    manufacturer: "Waters Corporation",
    serialNumber: "SN-WAT-9041",
    installedDate: "01 Jun 2023",
    lastCalibrationDate: "01 May 2026",
    nextCalibrationDate: "01 Nov 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Waters India Technologies",
    amcExpiryDate: "31 May 2027",
    status: "Under Maintenance",
    temperatureZone: "18°C - 22°C",
    notes: "High performance liquid chromatography for therapeutic drug monitoring and vitamins.",
  },
  {
    id: "EQ-009",
    assetCode: "EQ-2026-009",
    name: "Thermo Scientific Orion Star A211 pH Meter",
    model: "Orion Star A211 Benchtop",
    department: "Clinical Biochemistry",
    manufacturer: "Thermo Fisher Scientific",
    serialNumber: "SN-THO-3122",
    installedDate: "15 Jul 2023",
    lastCalibrationDate: "15 Sep 2026",
    nextCalibrationDate: "15 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Thermo Precision Service",
    amcExpiryDate: "14 Jul 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Digital buffer pH verification for reagent reconstitution and QC standards.",
  },
  {
    id: "EQ-010",
    assetCode: "EQ-2026-010",
    name: "Eppendorf 5810R Refrigerated Centrifuge",
    model: "5810R Multi-Rotor",
    department: "Clinical Biochemistry",
    manufacturer: "Eppendorf AG",
    serialNumber: "SN-EPP-5819",
    installedDate: "22 Aug 2023",
    lastCalibrationDate: "22 Feb 2026",
    nextCalibrationDate: "22 Aug 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Eppendorf India Care",
    amcExpiryDate: "21 Aug 2027",
    status: "Operational",
    temperatureZone: "4°C Constant",
    notes: "High capacity refrigerated benchtop centrifuge for serum temperature protection.",
  },

  // ==========================================
  // 2. HEMATOLOGY & COAGULATION (10 Equipments)
  // ==========================================
  {
    id: "EQ-011",
    assetCode: "EQ-2026-011",
    name: "Beckman Coulter DxH 500 CBC Analyzer",
    model: "DxH 500 5-Part Differential",
    department: "Hematology & Coagulation",
    manufacturer: "Beckman Coulter Biomedical",
    serialNumber: "SN-BC500-4412",
    installedDate: "10 Mar 2023",
    lastCalibrationDate: "10 Sep 2026",
    nextCalibrationDate: "10 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Transasia Bio-Medicals Ltd",
    amcExpiryDate: "09 Mar 2027",
    status: "Operational",
    temperatureZone: "18°C - 24°C",
    notes: "Laser flow cytometry with Coulter impedance principle. Runs 60 CBC/hr.",
  },
  {
    id: "EQ-012",
    assetCode: "EQ-2026-012",
    name: "Sysmex CA-660 Automated Coagulation Analyzer",
    model: "CA-660 Photo-Optical Coagulometer",
    department: "Hematology & Coagulation",
    manufacturer: "Sysmex Corporation",
    serialNumber: "SN-SYS660-3101",
    installedDate: "22 Aug 2023",
    lastCalibrationDate: "05 Sep 2026",
    nextCalibrationDate: "05 Nov 2026",
    calibrationFrequencyDays: 60,
    amcProvider: "Sysmex India Pvt Ltd",
    amcExpiryDate: "21 Aug 2027",
    status: "Operational",
    temperatureZone: "15°C - 28°C",
    notes: "PT, INR, APTT, and Fibrinogen automated clot detection.",
  },
  {
    id: "EQ-013",
    assetCode: "EQ-2026-013",
    name: "Sysmex XN-1000 Automated Hematology Analyzer",
    model: "XN-1000 Automated CBC & Diff",
    department: "Hematology & Coagulation",
    manufacturer: "Sysmex Corporation",
    serialNumber: "SN-SYS-1019",
    installedDate: "10 Jan 2023",
    lastCalibrationDate: "10 Sep 2026",
    nextCalibrationDate: "10 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Sysmex India Care",
    amcExpiryDate: "09 Jan 2027",
    status: "Operational",
    temperatureZone: "18°C - 25°C",
    notes: "Fluorescent flow cytometry, automated reticulocyte & nucleated RBC counts.",
  },
  {
    id: "EQ-014",
    assetCode: "EQ-2026-014",
    name: "Horiba Yumizen H500 Hematology Analyzer",
    model: "Yumizen H500 5-Part Diff",
    department: "Hematology & Coagulation",
    manufacturer: "Horiba Medical",
    serialNumber: "SN-HOR-5041",
    installedDate: "15 Mar 2023",
    lastCalibrationDate: "15 Jun 2026",
    nextCalibrationDate: "15 Sep 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Horiba India Diagnostics",
    amcExpiryDate: "14 Mar 2027",
    status: "Calibration Due",
    temperatureZone: "18°C - 24°C",
    notes: "Micro-sampling 5-part CBC analyzer for pediatric and geriatric blood samples.",
  },
  {
    id: "EQ-015",
    assetCode: "EQ-2026-015",
    name: "Stago STA Compact Max Coagulation System",
    model: "STA Compact Max Automated",
    department: "Hematology & Coagulation",
    manufacturer: "Diagnostica Stago",
    serialNumber: "SN-STG-6621",
    installedDate: "05 Apr 2023",
    lastCalibrationDate: "05 Aug 2026",
    nextCalibrationDate: "05 Nov 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Stago Medical India",
    amcExpiryDate: "04 Apr 2027",
    status: "Operational",
    temperatureZone: "15°C - 25°C",
    notes: "Mechanical viscosity clot detection for PT, aPTT, D-Dimer, and Factor VIII assays.",
  },
  {
    id: "EQ-016",
    assetCode: "EQ-2026-016",
    name: "Alere Ves-Matic Cube 30 ESR Analyzer",
    model: "Cube 30 Automated ESR",
    department: "Hematology & Coagulation",
    manufacturer: "Diesse Diagnostica / Alere",
    serialNumber: "SN-VMC-3088",
    installedDate: "18 May 2023",
    lastCalibrationDate: "18 Jun 2026",
    nextCalibrationDate: "18 Dec 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Diesse Precision Service",
    amcExpiryDate: "17 May 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Automated Westergren sedimentation rate directly from EDTA primary tubes.",
  },
  {
    id: "EQ-017",
    assetCode: "EQ-2026-017",
    name: "CellaVision DM9600 Automated Morphology",
    model: "DM9600 Digital Cell Imaging",
    department: "Hematology & Coagulation",
    manufacturer: "CellaVision AB",
    serialNumber: "SN-CV-9602",
    installedDate: "25 Jun 2023",
    lastCalibrationDate: "25 May 2026",
    nextCalibrationDate: "25 Nov 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Sysmex India CellaVision",
    amcExpiryDate: "24 Jun 2027",
    status: "Operational",
    temperatureZone: "18°C - 26°C",
    notes: "High-magnification digital microscopy and AI pre-classification of peripheral blood smears.",
  },
  {
    id: "EQ-018",
    assetCode: "EQ-2026-018",
    name: "Helena Spife 3000 Electrophoresis Analyzer",
    model: "Spife 3000 Automated Agarose",
    department: "Hematology & Coagulation",
    manufacturer: "Helena Laboratories",
    serialNumber: "SN-HEL-3011",
    installedDate: "08 Jul 2023",
    lastCalibrationDate: "08 May 2026",
    nextCalibrationDate: "08 Aug 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Helena India Tech",
    amcExpiryDate: "07 Jul 2027",
    status: "Under Maintenance",
    temperatureZone: "Ambient",
    notes: "Hemoglobin electrophoresis for hemoglobinopathies, sickle cell, and HbE variants.",
  },
  {
    id: "EQ-019",
    assetCode: "EQ-2026-019",
    name: "Chrono-log 700 Whole Blood Aggregometer",
    model: "Model 700 Impedance Aggregometer",
    department: "Hematology & Coagulation",
    manufacturer: "Chrono-log Corporation",
    serialNumber: "SN-CHRO-7120",
    installedDate: "12 Aug 2023",
    lastCalibrationDate: "12 Aug 2026",
    nextCalibrationDate: "12 Feb 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Chrono-log Service",
    amcExpiryDate: "11 Aug 2027",
    status: "Operational",
    temperatureZone: "37°C Heating Block",
    notes: "Platelet aggregation studies, ristocetin cofactor, and antiplatelet drug resistance monitoring.",
  },
  {
    id: "EQ-020",
    assetCode: "EQ-2026-020",
    name: "Olympus BX43 Hematology Binocular Microscope",
    model: "BX43 Clinical Microscope with LED",
    department: "Hematology & Coagulation",
    manufacturer: "Olympus Optical Co.",
    serialNumber: "SN-OLY-4318",
    installedDate: "30 Sep 2023",
    lastCalibrationDate: "30 Jun 2026",
    nextCalibrationDate: "30 Dec 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Olympus India Care",
    amcExpiryDate: "29 Sep 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Oil immersion plan achromatic optics for manual peripheral blood review and malaria slides.",
  },

  // ==========================================
  // 3. IMMUNOLOGY & HORMONES (10 Equipments)
  // ==========================================
  {
    id: "EQ-021",
    assetCode: "EQ-2026-021",
    name: "Mindray CL-900i Chemiluminescence (CLIA)",
    model: "CL-900i Micro-CLIA Benchtop",
    department: "Immunology & Hormones",
    manufacturer: "Mindray Bio-Medical",
    serialNumber: "SN-MD900-5882",
    installedDate: "12 Oct 2023",
    lastCalibrationDate: "12 Sep 2026",
    nextCalibrationDate: "12 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Mindray India Technical",
    amcExpiryDate: "11 Oct 2027",
    status: "Operational",
    temperatureZone: "18°C - 25°C",
    notes: "Thyroid panel (T3, T4, TSH), Vitamin D3, B12, and Ferritin automated assays.",
  },
  {
    id: "EQ-022",
    assetCode: "EQ-2026-022",
    name: "Abbott Architect i2000SR Immunoassay Analyzer",
    model: "Architect i2000SR Chemiflex",
    department: "Immunology & Hormones",
    manufacturer: "Abbott Diagnostics",
    serialNumber: "SN-AB-2009",
    installedDate: "10 Jan 2023",
    lastCalibrationDate: "10 Sep 2026",
    nextCalibrationDate: "10 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Abbott Healthcare India",
    amcExpiryDate: "09 Jan 2027",
    status: "Operational",
    temperatureZone: "18°C - 24°C",
    notes: "High-throughput chemiluminescent microparticle immunoassay (CMIA) for HIV, HBsAg, HCV, and Troponin.",
  },
  {
    id: "EQ-023",
    assetCode: "EQ-2026-023",
    name: "Roche Cobas e411 ECLIA Analyzer",
    model: "Cobas e411 Disk System",
    department: "Immunology & Hormones",
    manufacturer: "Roche Diagnostics",
    serialNumber: "SN-RC-4112",
    installedDate: "15 Feb 2023",
    lastCalibrationDate: "15 Sep 2026",
    nextCalibrationDate: "15 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Roche Direct Care India",
    amcExpiryDate: "14 Feb 2027",
    status: "Operational",
    temperatureZone: "20°C - 25°C",
    notes: "Electro-chemiluminescence technology for tumor markers, fertility hormones (AMH, LH, FSH), and beta-hCG.",
  },
  {
    id: "EQ-024",
    assetCode: "EQ-2026-024",
    name: "Beckman Coulter Access 2 Immunoassay System",
    model: "Access 2 Benchtop",
    department: "Immunology & Hormones",
    manufacturer: "Beckman Coulter",
    serialNumber: "SN-BC-2081",
    installedDate: "01 Apr 2023",
    lastCalibrationDate: "01 Aug 2026",
    nextCalibrationDate: "01 Nov 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Beckman Technical Care",
    amcExpiryDate: "31 Mar 2027",
    status: "Operational",
    temperatureZone: "18°C - 25°C",
    notes: "DxC compatible magnetic particle immunoassays for cardiac markers and anemia panels.",
  },
  {
    id: "EQ-025",
    assetCode: "EQ-2026-025",
    name: "Bio-Rad EVOLIS Fully Automated ELISA System",
    model: "EVOLIS 4-Plate Robotic ELISA",
    department: "Immunology & Hormones",
    manufacturer: "Bio-Rad Laboratories",
    serialNumber: "SN-BR-4091",
    installedDate: "20 May 2023",
    lastCalibrationDate: "20 Jun 2026",
    nextCalibrationDate: "20 Sep 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Bio-Rad Medical India",
    amcExpiryDate: "19 May 2027",
    status: "Calibration Due",
    temperatureZone: "15°C - 30°C",
    notes: "4-microplate automated pipetting, incubation, washing, and photometric reading for viral serology.",
  },
  {
    id: "EQ-026",
    assetCode: "EQ-2026-026",
    name: "Siemens ADVIA Centaur XPT Immunoassay",
    model: "ADVIA Centaur XPT",
    department: "Immunology & Hormones",
    manufacturer: "Siemens Healthineers",
    serialNumber: "SN-SIE-9012",
    installedDate: "15 Jun 2023",
    lastCalibrationDate: "15 May 2026",
    nextCalibrationDate: "15 Nov 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Siemens Direct Care",
    amcExpiryDate: "14 Jun 2027",
    status: "Under Maintenance",
    temperatureZone: "18°C - 24°C",
    notes: "Direct chemiluminescence with acridinium ester for infectious diseases and therapeutic monitoring.",
  },
  {
    id: "EQ-027",
    assetCode: "EQ-2026-027",
    name: "Phadia 250 Allergy & Autoimmunity Analyzer",
    model: "Phadia 250 EliA / ImmunoCAP",
    department: "Immunology & Hormones",
    manufacturer: "Thermo Fisher Scientific",
    serialNumber: "SN-PHA-2501",
    installedDate: "10 Jul 2023",
    lastCalibrationDate: "10 Jul 2026",
    nextCalibrationDate: "10 Oct 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Thermo Fisher Direct",
    amcExpiryDate: "09 Jul 2027",
    status: "Operational",
    temperatureZone: "18°C - 25°C",
    notes: "Specific IgE allergen panels, ANA screening, anti-CCP, and celiac serology automation.",
  },
  {
    id: "EQ-028",
    assetCode: "EQ-2026-028",
    name: "EUROIMMUN EUROBlotOne Western Blot Processor",
    model: "EUROBlotOne Fully Automated",
    department: "Immunology & Hormones",
    manufacturer: "EUROIMMUN AG",
    serialNumber: "SN-EB-1014",
    installedDate: "18 Aug 2023",
    lastCalibrationDate: "18 May 2026",
    nextCalibrationDate: "18 Nov 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Euroimmun India Diagnostics",
    amcExpiryDate: "17 Aug 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Automated membrane strip incubation, image acquisition, and immunoblot band analysis.",
  },
  {
    id: "EQ-029",
    assetCode: "EQ-2026-029",
    name: "DiaSorin LIAISON XL Chemiluminescence",
    model: "LIAISON XL Automated",
    department: "Immunology & Hormones",
    manufacturer: "DiaSorin S.p.A.",
    serialNumber: "SN-LIA-8802",
    installedDate: "05 Oct 2023",
    lastCalibrationDate: "05 Sep 2026",
    nextCalibrationDate: "05 Dec 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "DiaSorin India Support",
    amcExpiryDate: "04 Oct 2027",
    status: "Operational",
    temperatureZone: "18°C - 26°C",
    notes: "Specialized 25-OH Vitamin D Total, Calcitonin, and Bone Mineral metabolism assays.",
  },
  {
    id: "EQ-030",
    assetCode: "EQ-2026-030",
    name: "Tecan HydroSpeed Microplate Washer",
    model: "HydroSpeed 96-Well Washer",
    department: "Immunology & Hormones",
    manufacturer: "Tecan Group Ltd",
    serialNumber: "SN-TEC-9611",
    installedDate: "12 Nov 2023",
    lastCalibrationDate: "12 Aug 2026",
    nextCalibrationDate: "12 Feb 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Tecan India Tech",
    amcExpiryDate: "11 Nov 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Vacuum aspiration wash cycle for ELISA microplates with anti-clogging sensor.",
  },

  // ==========================================
  // 4. ACCESSION & CENTRAL PHLEBOTOMY (10 Equipments)
  // ==========================================
  {
    id: "EQ-031",
    assetCode: "EQ-2026-031",
    name: "Remi R-8C High Speed Centrifuge",
    model: "R-8C Digital Lab Centrifuge (6000 RPM)",
    department: "Accession & Central Phlebotomy",
    manufacturer: "Remi Instruments Ltd",
    serialNumber: "SN-RM600-1190",
    installedDate: "05 Jan 2024",
    lastCalibrationDate: "01 Jul 2026",
    nextCalibrationDate: "01 Jan 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Remi Customer Service",
    amcExpiryDate: "04 Jan 2028",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Tachometer calibrated for 3500 RPM sample separation speed. 16-tube swing-out rotor.",
  },
  {
    id: "EQ-032",
    assetCode: "EQ-2026-032",
    name: "Sarstedt BulkLoader Automated Sorter",
    model: "BL 1200 High-Speed Tube Sorter",
    department: "Accession & Central Phlebotomy",
    manufacturer: "Sarstedt AG & Co.",
    serialNumber: "SN-SAR-1209",
    installedDate: "10 Jan 2023",
    lastCalibrationDate: "10 Sep 2026",
    nextCalibrationDate: "10 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Sarstedt Medical India",
    amcExpiryDate: "09 Jan 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Automated primary tube sorting, barcode orientation, and pneumatic tube dispatch.",
  },
  {
    id: "EQ-033",
    assetCode: "EQ-2026-033",
    name: "Zebra ZD621 Healthcare Barcode Label Printer",
    model: "ZD621-HC Thermal Transfer",
    department: "Accession & Central Phlebotomy",
    manufacturer: "Zebra Technologies",
    serialNumber: "SN-ZEB-6211",
    installedDate: "20 Feb 2023",
    lastCalibrationDate: "20 Aug 2026",
    nextCalibrationDate: "20 Nov 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Zebra India Care",
    amcExpiryDate: "19 Feb 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "High-resolution cryogenic specimen label printing with 2D DataMatrix validation.",
  },
  {
    id: "EQ-034",
    assetCode: "EQ-2026-034",
    name: "VeinViewer Vision2 Vascular Imaging System",
    model: "Vision2 Near-Infrared Vein Finder",
    department: "Accession & Central Phlebotomy",
    manufacturer: "Christie Medical Holdings",
    serialNumber: "SN-VV-2004",
    installedDate: "05 Mar 2023",
    lastCalibrationDate: "05 Jun 2026",
    nextCalibrationDate: "05 Sep 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Christie Medical Support",
    amcExpiryDate: "04 Mar 2027",
    status: "Calibration Due",
    temperatureZone: "Ambient",
    notes: "Near-infrared projection for difficult pediatric and geriatric venipunctures.",
  },
  {
    id: "EQ-035",
    assetCode: "EQ-2026-035",
    name: "Hettich Rotofix 32A Clinical Centrifuge",
    model: "Rotofix 32A Swing-Out Rotor",
    department: "Accession & Central Phlebotomy",
    manufacturer: "Andreas Hettich GmbH",
    serialNumber: "SN-HET-3208",
    installedDate: "12 Apr 2023",
    lastCalibrationDate: "12 Jul 2026",
    nextCalibrationDate: "12 Jan 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Hettich India Service",
    amcExpiryDate: "11 Apr 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "4000 RPM rapid serum gel separator centrifuge with electronic lid locking.",
  },
  {
    id: "EQ-036",
    assetCode: "EQ-2026-036",
    name: "Datalogic Gryphon GFS4400 2D Barcode Scanner",
    model: "Gryphon GFS4470 Fixed-Mount Scanner",
    department: "Accession & Central Phlebotomy",
    manufacturer: "Datalogic S.p.A.",
    serialNumber: "SN-DL-4402",
    installedDate: "18 May 2023",
    lastCalibrationDate: "18 Aug 2026",
    nextCalibrationDate: "18 Feb 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Datalogic Support India",
    amcExpiryDate: "17 May 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Automated specimen check-in scanner integrated directly with LIS accessioning station.",
  },
  {
    id: "EQ-037",
    assetCode: "EQ-2026-037",
    name: "Helmer Scientific i.Series Plasma Thawing Bath",
    model: "DH4 Rapid Plasma Thawer",
    department: "Accession & Central Phlebotomy",
    manufacturer: "Helmer Scientific",
    serialNumber: "SN-HLM-0418",
    installedDate: "02 Jun 2023",
    lastCalibrationDate: "02 May 2026",
    nextCalibrationDate: "02 Nov 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Helmer Precision Care",
    amcExpiryDate: "01 Jun 2027",
    status: "Operational",
    temperatureZone: "37°C Controlled",
    notes: "Controlled agitation water bath for emergency specimen thawing and coagulation prep.",
  },
  {
    id: "EQ-038",
    assetCode: "EQ-2026-038",
    name: "B Medical Systems F381 Laboratory Freezer",
    model: "F381 Biomedical -30°C Freezer",
    department: "Accession & Central Phlebotomy",
    manufacturer: "B Medical Systems",
    serialNumber: "SN-BMS-3819",
    installedDate: "15 Jul 2023",
    lastCalibrationDate: "15 Jun 2026",
    nextCalibrationDate: "15 Sep 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "B Medical Support India",
    amcExpiryDate: "14 Jul 2027",
    status: "Under Maintenance",
    temperatureZone: "-30°C ± 2°C",
    notes: "Sensor recalibration and digital temperature data logger battery replacement.",
  },
  {
    id: "EQ-039",
    assetCode: "EQ-2026-039",
    name: "Accu-Temp Digital Refrigerator Monitored Unit",
    model: "MPR-721 Professional Blood Refrigerator",
    department: "Accession & Central Phlebotomy",
    manufacturer: "PHCbi / Panasonic Healthcare",
    serialNumber: "SN-PHC-7212",
    installedDate: "20 Aug 2023",
    lastCalibrationDate: "20 Aug 2026",
    nextCalibrationDate: "20 Nov 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "PHCbi India Support",
    amcExpiryDate: "19 Aug 2027",
    status: "Operational",
    temperatureZone: "2°C - 6°C",
    notes: "Pre-analytical sample holding refrigerator with continuous cloud temperature tracking.",
  },
  {
    id: "EQ-040",
    assetCode: "EQ-2026-040",
    name: "Terumo TSCD-II Sterile Tubing Welder",
    model: "TSCD-II Automated Welder",
    department: "Accession & Central Phlebotomy",
    manufacturer: "Terumo BCT",
    serialNumber: "SN-TER-2019",
    installedDate: "10 Oct 2023",
    lastCalibrationDate: "10 Oct 2026",
    nextCalibrationDate: "10 Apr 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Terumo India Healthcare",
    amcExpiryDate: "09 Oct 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Sterile connection device for closed blood transfer and aliquot tubing.",
  },

  // ==========================================
  // 5. CLINICAL PATHOLOGY & URINE ROUTINE (10 Equipments)
  // ==========================================
  {
    id: "EQ-041",
    assetCode: "EQ-2026-041",
    name: "Dirui H-500 Urine Chemistry Analyzer",
    model: "H-500 Dual Wavelength Reflectance",
    department: "Clinical Pathology & Urine Routine",
    manufacturer: "Dirui Industrial Co.",
    serialNumber: "SN-DR500-2091",
    installedDate: "18 Feb 2024",
    lastCalibrationDate: "18 Aug 2026",
    nextCalibrationDate: "18 Nov 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Medispec Diagnostics",
    amcExpiryDate: "17 Feb 2027",
    status: "Operational",
    temperatureZone: "15°C - 30°C",
    notes: "514 test strips/hr. 11 parameter urine strip automated reader.",
  },
  {
    id: "EQ-042",
    assetCode: "EQ-2026-042",
    name: "Sysmex UF-5000 Fully Automated Urine Particle Analyzer",
    model: "UF-5000 Fluorescent Flow Cytometer",
    department: "Clinical Pathology & Urine Routine",
    manufacturer: "Sysmex Corporation",
    serialNumber: "SN-SYS-5091",
    installedDate: "10 Jan 2023",
    lastCalibrationDate: "10 Sep 2026",
    nextCalibrationDate: "10 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Sysmex India Pvt Ltd",
    amcExpiryDate: "09 Jan 2027",
    status: "Operational",
    temperatureZone: "18°C - 26°C",
    notes: "Blue laser flow cytometry for RBC, WBC, casts, epithelial cells, bacteria, and crystal count.",
  },
  {
    id: "EQ-043",
    assetCode: "EQ-2026-043",
    name: "Arkray Aution Max AX-4030 Urine Analyzer",
    model: "AX-4030 Automated Reflectance",
    department: "Clinical Pathology & Urine Routine",
    manufacturer: "Arkray Inc.",
    serialNumber: "SN-ARK-4033",
    installedDate: "15 Feb 2023",
    lastCalibrationDate: "15 Aug 2026",
    nextCalibrationDate: "15 Nov 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Arkray Healthcare India",
    amcExpiryDate: "14 Feb 2027",
    status: "Operational",
    temperatureZone: "15°C - 30°C",
    notes: "Microalbumin, creatinine, and urine chemistry strip test reader with specific gravity refractometer.",
  },
  {
    id: "EQ-044",
    assetCode: "EQ-2026-044",
    name: "Iris iRICELL 3000 Urinalysis Workcell",
    model: "iRICELL 3000 Complete Workcell",
    department: "Clinical Pathology & Urine Routine",
    manufacturer: "Beckman Coulter Iris",
    serialNumber: "SN-IRIS-3001",
    installedDate: "01 Apr 2023",
    lastCalibrationDate: "01 Jun 2026",
    nextCalibrationDate: "01 Sep 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Beckman Technical Care",
    amcExpiryDate: "31 Mar 2027",
    status: "Calibration Due",
    temperatureZone: "18°C - 25°C",
    notes: "Digital flow morphology imaging paired with reflectance dry-chemistry strip analyzer.",
  },
  {
    id: "EQ-045",
    assetCode: "EQ-2026-045",
    name: "Nikon Eclipse Ci-L Clinical Phase Contrast Microscope",
    model: "Eclipse Ci-L LED Phase Contrast",
    department: "Clinical Pathology & Urine Routine",
    manufacturer: "Nikon Corporation",
    serialNumber: "SN-NIK-4410",
    installedDate: "20 May 2023",
    lastCalibrationDate: "20 May 2026",
    nextCalibrationDate: "20 Nov 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Nikon India Optical",
    amcExpiryDate: "19 May 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Phase contrast optics for unstained urine sediments, casts, dysmorphic RBCs, and semen analysis.",
  },
  {
    id: "EQ-046",
    assetCode: "EQ-2026-046",
    name: "Mindray UA-66 Semi-Automated Urine Analyzer",
    model: "UA-66 Benchtop",
    department: "Clinical Pathology & Urine Routine",
    manufacturer: "Mindray Bio-Medical",
    serialNumber: "SN-MD-6602",
    installedDate: "12 Jun 2023",
    lastCalibrationDate: "12 Jun 2026",
    nextCalibrationDate: "12 Dec 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Mindray India Technical",
    amcExpiryDate: "11 Jun 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Stat backup urine test strip reader with internal thermal printer.",
  },
  {
    id: "EQ-047",
    assetCode: "EQ-2026-047",
    name: "SQA-Vision Automated Sperm Quality Analyzer",
    model: "SQA-Vision High-Res Visualization",
    department: "Clinical Pathology & Urine Routine",
    manufacturer: "Medical Electronic Systems",
    serialNumber: "SN-SQA-9011",
    installedDate: "05 Jul 2023",
    lastCalibrationDate: "05 Apr 2026",
    nextCalibrationDate: "05 Oct 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "MES Diagnostics Support",
    amcExpiryDate: "04 Jul 2027",
    status: "Operational",
    temperatureZone: "37°C Stage Warmer",
    notes: "WHO 6th edition automated sperm concentration, progressive motility, and strict morphology.",
  },
  {
    id: "EQ-048",
    assetCode: "EQ-2026-048",
    name: "Atago MASTER-SUR/NM Clinical Refractometer",
    model: "MASTER-SUR/NM Handheld",
    department: "Clinical Pathology & Urine Routine",
    manufacturer: "Atago Co., Ltd.",
    serialNumber: "SN-ATG-1102",
    installedDate: "15 Aug 2023",
    lastCalibrationDate: "15 Feb 2026",
    nextCalibrationDate: "15 Aug 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Atago India Service",
    amcExpiryDate: "14 Aug 2027",
    status: "Under Maintenance",
    temperatureZone: "Ambient",
    notes: "Optical scale zero point recalibration using distilled water standard.",
  },
  {
    id: "EQ-049",
    assetCode: "EQ-2026-049",
    name: "Remi Medico Benchtop Clinical Centrifuge",
    model: "Medico R-8M Swing-Out Centrifuge",
    department: "Clinical Pathology & Urine Routine",
    manufacturer: "Remi Instruments Ltd",
    serialNumber: "SN-RM-8041",
    installedDate: "01 Sep 2023",
    lastCalibrationDate: "01 Sep 2026",
    nextCalibrationDate: "01 Mar 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Remi Customer Service",
    amcExpiryDate: "31 Aug 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "2000 RPM soft-spin rotor for conical urine tubes to preserve cellular cast morphology.",
  },
  {
    id: "EQ-050",
    assetCode: "EQ-2026-050",
    name: "Wescor Vapro 5600 Vapor Pressure Osmometer",
    model: "Vapro 5600 Clinical Osmometer",
    department: "Clinical Pathology & Urine Routine",
    manufacturer: "ELITechGroup / Wescor",
    serialNumber: "SN-WES-5604",
    installedDate: "10 Oct 2023",
    lastCalibrationDate: "10 Oct 2026",
    nextCalibrationDate: "10 Jan 2027",
    calibrationFrequencyDays: 90,
    amcProvider: "ELITechGroup Service",
    amcExpiryDate: "09 Oct 2027",
    status: "Operational",
    temperatureZone: "20°C - 25°C",
    notes: "Urine and serum osmolality measurement for renal concentrating capacity assessment.",
  },

  // ==========================================
  // 6. HISTOPATHOLOGY & CYTOLOGY (10 Equipments)
  // ==========================================
  {
    id: "EQ-051",
    assetCode: "EQ-2026-051",
    name: "Leica RM2235 Rotary Microtome",
    model: "RM2235 Manual Rotary Sectioner",
    department: "Histopathology & Cytology",
    manufacturer: "Leica Biosystems",
    serialNumber: "SN-LC223-1490",
    installedDate: "20 May 2024",
    lastCalibrationDate: "20 May 2026",
    nextCalibrationDate: "20 Nov 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Leica Precision Care",
    amcExpiryDate: "19 May 2027",
    status: "Under Maintenance",
    temperatureZone: "Ambient",
    notes: "Replacement of blade carrier clamp and micrometer feed calibration in progress.",
  },
  {
    id: "EQ-052",
    assetCode: "EQ-2026-052",
    name: "Leica ASP300 S Enclosed Tissue Processor",
    model: "ASP300 S Vacuum Tissue Processor",
    department: "Histopathology & Cytology",
    manufacturer: "Leica Biosystems",
    serialNumber: "SN-LC-3008",
    installedDate: "10 Jan 2023",
    lastCalibrationDate: "10 Sep 2026",
    nextCalibrationDate: "10 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "Leica Precision Care",
    amcExpiryDate: "09 Jan 2027",
    status: "Operational",
    temperatureZone: "Ambient with Wax Retort 62°C",
    notes: "300 cassette capacity automated reagent infiltration, vacuum-assisted paraffin processing.",
  },
  {
    id: "EQ-053",
    assetCode: "EQ-2026-053",
    name: "Sakura Tissue-Tek TEC 5 Embedding Center",
    model: "TEC 5 Dual Module Station",
    department: "Histopathology & Cytology",
    manufacturer: "Sakura Finetek",
    serialNumber: "SN-SAK-5012",
    installedDate: "18 Feb 2023",
    lastCalibrationDate: "18 Aug 2026",
    nextCalibrationDate: "18 Nov 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Sakura India Healthcare",
    amcExpiryDate: "17 Feb 2027",
    status: "Operational",
    temperatureZone: "Dispenser 64°C, Cold Plate -5°C",
    notes: "Dual-console paraffin dispenser with integrated Peltier cooling plate for block orientation.",
  },
  {
    id: "EQ-054",
    assetCode: "EQ-2026-054",
    name: "Leica CM1950 Clinical Cryostat",
    model: "CM1950 Rapid Freezing Microtome",
    department: "Histopathology & Cytology",
    manufacturer: "Leica Biosystems",
    serialNumber: "SN-LC-1951",
    installedDate: "05 Mar 2023",
    lastCalibrationDate: "05 Jun 2026",
    nextCalibrationDate: "05 Sep 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Leica Precision Care",
    amcExpiryDate: "04 Mar 2027",
    status: "Calibration Due",
    temperatureZone: "Chamber -25°C, Quick Freeze -42°C",
    notes: "Emergency intraoperative frozen sectioning microtome with UV disinfection.",
  },
  {
    id: "EQ-055",
    assetCode: "EQ-2026-055",
    name: "Thermo Scientific Gemini AS Slide Stainer",
    model: "Gemini AS Dual-Level Robotic Stainer",
    department: "Histopathology & Cytology",
    manufacturer: "Thermo Fisher Scientific",
    serialNumber: "SN-TH-7701",
    installedDate: "22 Apr 2023",
    lastCalibrationDate: "22 Jul 2026",
    nextCalibrationDate: "22 Oct 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Thermo Fisher Direct",
    amcExpiryDate: "21 Apr 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Automated routine Hematoxylin & Eosin (H&E) and Papanicolaou staining protocol.",
  },
  {
    id: "EQ-056",
    assetCode: "EQ-2026-056",
    name: "Hologic ThinPrep 2000 Cytology Processor",
    model: "ThinPrep 2000 Liquid-Based Cytology",
    department: "Histopathology & Cytology",
    manufacturer: "Hologic Inc.",
    serialNumber: "SN-HOL-2009",
    installedDate: "15 May 2023",
    lastCalibrationDate: "15 Aug 2026",
    nextCalibrationDate: "15 Nov 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Hologic India Support",
    amcExpiryDate: "14 May 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Membrane filtration liquid-based Pap smear preparation and non-gynecological cytology.",
  },
  {
    id: "EQ-057",
    assetCode: "EQ-2026-057",
    name: "Leica BOND-MAX Automated IHC & ISH Stainer",
    model: "BOND-MAX Precision Staining System",
    department: "Histopathology & Cytology",
    manufacturer: "Leica Biosystems",
    serialNumber: "SN-LC-7722",
    installedDate: "01 Jun 2023",
    lastCalibrationDate: "01 May 2026",
    nextCalibrationDate: "01 Nov 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Leica Precision Care",
    amcExpiryDate: "31 May 2027",
    status: "Operational",
    temperatureZone: "Reagent Chiller 4°C - 8°C",
    notes: "Full automation for ER, PR, HER2-neu, Ki-67, and lymphoma immunohistochemical panels.",
  },
  {
    id: "EQ-058",
    assetCode: "EQ-2026-058",
    name: "Sakura Tissue-Tek Coverslipper Film System",
    model: "Coverslipper Automated 4740",
    department: "Histopathology & Cytology",
    manufacturer: "Sakura Finetek",
    serialNumber: "SN-SAK-4740",
    installedDate: "10 Jul 2023",
    lastCalibrationDate: "10 Jul 2026",
    nextCalibrationDate: "10 Jan 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Sakura India Healthcare",
    amcExpiryDate: "09 Jul 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "High-speed resin film slide coverslipping without air bubbles, 1000 slides/hour.",
  },
  {
    id: "EQ-059",
    assetCode: "EQ-2026-059",
    name: "Olympus BX53 Five-Headed Discussion Microscope",
    model: "BX53 Multi-Viewing System",
    department: "Histopathology & Cytology",
    manufacturer: "Olympus Optical Co.",
    serialNumber: "SN-OLY-5309",
    installedDate: "20 Aug 2023",
    lastCalibrationDate: "20 Aug 2026",
    nextCalibrationDate: "20 Feb 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Olympus India Care",
    amcExpiryDate: "19 Aug 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Plan apochromat objectives, illuminated LED optical pointer for multi-observer tumor boards.",
  },
  {
    id: "EQ-060",
    assetCode: "EQ-2026-060",
    name: "Thermo Scientific Shandon Cytospin 4",
    model: "Cytospin 4 Cytocentrifuge",
    department: "Histopathology & Cytology",
    manufacturer: "Thermo Fisher Scientific",
    serialNumber: "SN-TH-4418",
    installedDate: "15 Oct 2023",
    lastCalibrationDate: "15 Jul 2026",
    nextCalibrationDate: "15 Jan 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Thermo Fisher Direct",
    amcExpiryDate: "14 Oct 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Thin-layer monolayer cell deposition on glass slides for CSF, pleural, and ascitic fluids.",
  },

  // ==========================================
  // 7. MICROBIOLOGY & SEROLOGY (10 Equipments)
  // ==========================================
  {
    id: "EQ-061",
    assetCode: "EQ-2026-061",
    name: "Bio-Rad CFX96 Real-Time PCR Detection",
    model: "CFX96 Touch Thermal Cycler",
    department: "Microbiology & Serology",
    manufacturer: "Bio-Rad Laboratories",
    serialNumber: "SN-CFX96-8801",
    installedDate: "10 Apr 2024",
    lastCalibrationDate: "10 Jun 2026",
    nextCalibrationDate: "10 Dec 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Bio-Rad Medical India",
    amcExpiryDate: "09 Apr 2027",
    status: "Operational",
    temperatureZone: "15°C - 31°C",
    notes: "Multiplex molecular diagnostics and infectious disease target detection.",
  },
  {
    id: "EQ-062",
    assetCode: "EQ-2026-062",
    name: "bioMérieux VITEK 2 Compact Microbial ID / AST",
    model: "VITEK 2 Compact 60 Card",
    department: "Microbiology & Serology",
    manufacturer: "bioMérieux SA",
    serialNumber: "SN-BMX-2041",
    installedDate: "10 Jan 2023",
    lastCalibrationDate: "10 Sep 2026",
    nextCalibrationDate: "10 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "bioMérieux India Customer Care",
    amcExpiryDate: "09 Jan 2027",
    status: "Operational",
    temperatureZone: "35.5°C Incubator",
    notes: "Automated Gram-negative, Gram-positive bacteria and yeast identification with MIC antibiotic panels.",
  },
  {
    id: "EQ-063",
    assetCode: "EQ-2026-063",
    name: "Becton Dickinson BACTEC FX40 Blood Culture",
    model: "BACTEC FX40 Fluorescent Sensor",
    department: "Microbiology & Serology",
    manufacturer: "BD Biosciences",
    serialNumber: "SN-BD-4099",
    installedDate: "15 Feb 2023",
    lastCalibrationDate: "15 Sep 2026",
    nextCalibrationDate: "15 Oct 2026",
    calibrationFrequencyDays: 30,
    amcProvider: "BD India Technical Service",
    amcExpiryDate: "14 Feb 2027",
    status: "Operational",
    temperatureZone: "35°C Internal Incubator",
    notes: "Continuous fluorescent carbon dioxide monitoring for early detection of bacteremia and fungemia.",
  },
  {
    id: "EQ-064",
    assetCode: "EQ-2026-064",
    name: "bioMérieux BacT/ALERT 3D Microbial Detection",
    model: "BacT/ALERT 3D 120 System",
    department: "Microbiology & Serology",
    manufacturer: "bioMérieux SA",
    serialNumber: "SN-BMX-3120",
    installedDate: "01 Apr 2023",
    lastCalibrationDate: "01 Aug 2026",
    nextCalibrationDate: "01 Nov 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "bioMérieux India Customer Care",
    amcExpiryDate: "31 Mar 2027",
    status: "Operational",
    temperatureZone: "35°C Colorimetric Chamber",
    notes: "Colorimetric sensor bottles for sterile body fluid culture and mycobacterial recovery.",
  },
  {
    id: "EQ-065",
    assetCode: "EQ-2026-065",
    name: "Cepheid GeneXpert XVI Real-Time Cartridge System",
    model: "GeneXpert XVI 16-Module",
    department: "Microbiology & Serology",
    manufacturer: "Cepheid Inc.",
    serialNumber: "SN-CEP-1601",
    installedDate: "20 May 2023",
    lastCalibrationDate: "20 May 2026",
    nextCalibrationDate: "20 Nov 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Cepheid Medical India",
    amcExpiryDate: "19 May 2027",
    status: "Operational",
    temperatureZone: "15°C - 30°C",
    notes: "Fully integrated automated nested RT-PCR for MTB/RIF ultra, viral loads, and Clostridium difficile.",
  },
  {
    id: "EQ-066",
    assetCode: "EQ-2026-066",
    name: "Thermo Scientific Heracell 150i CO2 Incubator",
    model: "Heracell 150i Solid Copper",
    department: "Microbiology & Serology",
    manufacturer: "Thermo Fisher Scientific",
    serialNumber: "SN-TH-1502",
    installedDate: "10 Jun 2023",
    lastCalibrationDate: "10 Jun 2026",
    nextCalibrationDate: "10 Sep 2026",
    calibrationFrequencyDays: 90,
    amcProvider: "Thermo Fisher Direct",
    amcExpiryDate: "09 Jun 2027",
    status: "Calibration Due",
    temperatureZone: "37.0°C ± 0.1°C, 5% CO2",
    notes: "Certified CO2 and temperature calibration with 140°C overnight decontamination cycle.",
  },
  {
    id: "EQ-067",
    assetCode: "EQ-2026-067",
    name: "Esco Airstream Class II Type A2 Biosafety Cabinet",
    model: "AC2-4E8 Biological Safety Cabinet",
    department: "Microbiology & Serology",
    manufacturer: "Esco Micro Pte Ltd",
    serialNumber: "SN-ESC-4028",
    installedDate: "18 Jul 2023",
    lastCalibrationDate: "18 May 2026",
    nextCalibrationDate: "18 Nov 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Esco Global India",
    amcExpiryDate: "17 Jul 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "ULPA filter velocity and aerosol challenge DOP certification for BSL-2 pathogen processing.",
  },
  {
    id: "EQ-068",
    assetCode: "EQ-2026-068",
    name: "Tuttnauer 3870ELV Vertical Autoclave",
    model: "3870ELV 85-Liter Laboratory Autoclave",
    department: "Microbiology & Serology",
    manufacturer: "Tuttnauer Ltd",
    serialNumber: "SN-TUT-3871",
    installedDate: "12 Aug 2023",
    lastCalibrationDate: "12 Jun 2026",
    nextCalibrationDate: "12 Dec 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Tuttnauer Service India",
    amcExpiryDate: "11 Aug 2027",
    status: "Operational",
    temperatureZone: "121°C / 134°C Pressure Chamber",
    notes: "Validated with Geobacillus stearothermophilus biological spore indicators for media sterilization.",
  },
  {
    id: "EQ-069",
    assetCode: "EQ-2026-069",
    name: "Bruker MALDI Biotyper sirius System",
    model: "Microflex LT/SH MALDI-TOF",
    department: "Microbiology & Serology",
    manufacturer: "Bruker Daltonics",
    serialNumber: "SN-BRK-9902",
    installedDate: "05 Sep 2023",
    lastCalibrationDate: "05 Jun 2026",
    nextCalibrationDate: "05 Dec 2026",
    calibrationFrequencyDays: 180,
    amcProvider: "Bruker India Scientific",
    amcExpiryDate: "04 Sep 2027",
    status: "Under Maintenance",
    temperatureZone: "18°C - 24°C",
    notes: "Laser pulse source detector calibration and vacuum turbopump routine maintenance.",
  },
  {
    id: "EQ-070",
    assetCode: "EQ-2026-070",
    name: "Anoxomat III Anaerobic Jar Generation System",
    model: "Mark II Automatic Gas Evacuation",
    department: "Microbiology & Serology",
    manufacturer: "Advanced Instruments",
    serialNumber: "SN-ANX-3010",
    installedDate: "25 Oct 2023",
    lastCalibrationDate: "25 Oct 2026",
    nextCalibrationDate: "25 Apr 2027",
    calibrationFrequencyDays: 180,
    amcProvider: "Advanced Instruments Service",
    amcExpiryDate: "24 Oct 2027",
    status: "Operational",
    temperatureZone: "Ambient",
    notes: "Microaerophilic and anaerobic gas mixture generation for Bacteroides and Clostridia culture.",
  },
];

export default function Equipment() {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Department Card View State (Image 2 style)
  const [activeDepartmentCard, setActiveDepartmentCard] = useState<string | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<EquipmentItem | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const confirmDelete = () => {
    if (!deletingEquipment) return;
    setEquipmentList((prev) => prev.filter((e) => e.id !== deletingEquipment.id));
    setDeletingEquipment(null);
    showToast("Deleted successfully");
  };

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<EquipmentItem | null>(null);
  const [calibratingEquipment, setCalibratingEquipment] = useState<EquipmentItem | null>(null);
  const [calibrationLogDate, setCalibrationLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [calibrationNotes, setCalibrationNotes] = useState("");

  const [formData, setFormData] = useState({
    assetCode: "",
    name: "",
    model: "",
    department: "Clinical Biochemistry",
    manufacturer: "",
    serialNumber: "",
    installedDate: "2024-01-15",
    lastCalibrationDate: new Date().toISOString().split("T")[0],
    nextCalibrationDate: "2026-11-15",
    calibrationFrequencyDays: 30,
    amcProvider: "",
    amcExpiryDate: "2027-01-15",
    status: "Operational" as EquipmentItem["status"],
    temperatureZone: "20°C - 25°C",
    notes: "",
  });


  // Filtered List
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((eq) => {
      const matchesSearch =
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === "All" || eq.department === selectedDept;
      const matchesStatus = selectedStatus === "All" || eq.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [equipmentList, searchTerm, selectedDept, selectedStatus]);

  // Paginated List
  const paginatedEquipment = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredEquipment.slice(start, start + rowsPerPage);
  }, [filteredEquipment, currentPage, rowsPerPage]);

  // Department statistics for Card View (matching Image reference)
  const departmentCardsData = useMemo(() => {
    const departments = [
      {
        name: "Clinical Biochemistry",
        deptMatch: "Clinical Biochemistry",
        bg: "bg-[#dcfce7]", // pastel green (Card 1)
        border: "border-[#86efac]",
        iconBg: "bg-[#16a34a] text-white",
        linkColor: "text-[#15803d]",
      },
      {
        name: "Hematology & Coagulation",
        deptMatch: "Hematology & Coagulation",
        bg: "bg-[#fef3c7]", // pastel yellow/amber (Card 2)
        border: "border-[#fcd34d]",
        iconBg: "bg-[#d97706] text-white",
        linkColor: "text-[#b45309]",
      },
      {
        name: "Immunology & Hormones",
        deptMatch: "Immunology & Hormones",
        bg: "bg-[#dbeafe]", // pastel blue (Card 3)
        border: "border-[#93c5fd]",
        iconBg: "bg-[#2563eb] text-white",
        linkColor: "text-[#1d4ed8]",
      },
      {
        name: "Accession & Phlebotomy",
        deptMatch: "Accession & Central Phlebotomy",
        bg: "bg-[#f3e8ff]", // pastel purple (Card 4)
        border: "border-[#d8b4fe]",
        iconBg: "bg-[#9333ea] text-white",
        linkColor: "text-[#7e22ce]",
      },
      {
        name: "Clinical Pathology",
        deptMatch: "Clinical Pathology & Urine Routine",
        bg: "bg-[#fee2e2]", // pastel red/coral (Card 5)
        border: "border-[#fca5a5]",
        iconBg: "bg-[#dc2626] text-white",
        linkColor: "text-[#b91c1c]",
      },
      {
        name: "Histopathology & Cytology",
        deptMatch: "Histopathology & Cytology",
        bg: "bg-[#ccfbf1]", // pastel mint/teal (Card 6)
        border: "border-[#5eead4]",
        iconBg: "bg-[#0d9488] text-white",
        linkColor: "text-[#0f766e]",
      },
      {
        name: "Microbiology & Serology",
        deptMatch: "Microbiology & Serology",
        bg: "bg-[#fce7f3]", // pastel pink (Card 7)
        border: "border-[#f472b6]",
        iconBg: "bg-[#db2777] text-white",
        linkColor: "text-[#be185d]",
      },
      {
        name: "Overall Equipments",
        deptMatch: "All",
        bg: "bg-[#f1f5f9]", // pastel gray/slate (Card 8)
        border: "border-[#cbd5e1]",
        iconBg: "bg-[#475569] text-white",
        linkColor: "text-[#334155]",
      },
    ];

    return departments.map((dept) => {
      const items =
        dept.deptMatch === "All"
          ? equipmentList
          : equipmentList.filter((e) => e.department === dept.deptMatch);

      return {
        ...dept,
        total: items.length,
        items,
      };
    });
  }, [equipmentList]);

  // Inside Department View KPI stats
  const insideDeptItems = useMemo(() => {
    if (!activeDepartmentCard || activeDepartmentCard === "Overall Equipments") {
      return equipmentList;
    }
    const matched = departmentCardsData.find((d) => d.name === activeDepartmentCard);
    const deptFilter = matched ? matched.deptMatch : activeDepartmentCard;
    if (deptFilter === "All") return equipmentList;
    return equipmentList.filter((e) => e.department === deptFilter);
  }, [equipmentList, activeDepartmentCard, departmentCardsData]);

  const insideTotal = insideDeptItems.length;
  const insideOperational = insideDeptItems.filter((e) => e.status === "Operational").length;
  const insideCalibrationDue = insideDeptItems.filter((e) => e.status === "Calibration Due").length;
  const insideMaintenance = insideDeptItems.filter((e) => e.status === "Under Maintenance").length;

  const handleOpenAddModal = () => {
    setEditingEquipment(null);
    setFormData({
      assetCode: `EQ-2026-0${equipmentList.length + 1}`,
      name: "",
      model: "",
      department: "Clinical Biochemistry",
      manufacturer: "",
      serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      installedDate: new Date().toISOString().split("T")[0],
      lastCalibrationDate: new Date().toISOString().split("T")[0],
      nextCalibrationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      calibrationFrequencyDays: 30,
      amcProvider: "Authorized Service Center",
      amcExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Operational",
      temperatureZone: "20°C - 25°C",
      notes: "",
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (eq: EquipmentItem) => {
    setEditingEquipment(eq);
    setFormData({
      assetCode: eq.assetCode,
      name: eq.name,
      model: eq.model,
      department: eq.department,
      manufacturer: eq.manufacturer,
      serialNumber: eq.serialNumber,
      installedDate: eq.installedDate,
      lastCalibrationDate: eq.lastCalibrationDate,
      nextCalibrationDate: eq.nextCalibrationDate,
      calibrationFrequencyDays: eq.calibrationFrequencyDays,
      amcProvider: eq.amcProvider,
      amcExpiryDate: eq.amcExpiryDate,
      status: eq.status,
      temperatureZone: eq.temperatureZone,
      notes: eq.notes,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.manufacturer.trim()) return;

    if (editingEquipment) {
      setEquipmentList((prev) =>
        prev.map((item) =>
          item.id === editingEquipment.id
            ? {
                ...item,
                assetCode: formData.assetCode,
                name: formData.name,
                model: formData.model,
                department: formData.department,
                manufacturer: formData.manufacturer,
                serialNumber: formData.serialNumber,
                installedDate: formData.installedDate,
                lastCalibrationDate: formData.lastCalibrationDate,
                nextCalibrationDate: formData.nextCalibrationDate,
                calibrationFrequencyDays: Number(formData.calibrationFrequencyDays),
                amcProvider: formData.amcProvider,
                amcExpiryDate: formData.amcExpiryDate,
                status: formData.status,
                temperatureZone: formData.temperatureZone,
                notes: formData.notes,
              }
            : item
        )
      );
    } else {
      const newEq: EquipmentItem = {
        id: `EQ-0${equipmentList.length + 1}`,
        assetCode: formData.assetCode || `EQ-2026-0${equipmentList.length + 1}`,
        name: formData.name,
        model: formData.model || formData.name,
        department: formData.department,
        manufacturer: formData.manufacturer,
        serialNumber: formData.serialNumber,
        installedDate: formData.installedDate,
        lastCalibrationDate: formData.lastCalibrationDate,
        nextCalibrationDate: formData.nextCalibrationDate,
        calibrationFrequencyDays: Number(formData.calibrationFrequencyDays) || 30,
        amcProvider: formData.amcProvider,
        amcExpiryDate: formData.amcExpiryDate,
        status: formData.status,
        temperatureZone: formData.temperatureZone,
        notes: formData.notes,
      };
      setEquipmentList((prev) => [newEq, ...prev]);
    }
    setIsAddEditModalOpen(false);
  };

  const handleOpenCalibrationModal = (eq: EquipmentItem) => {
    setCalibratingEquipment(eq);
    setCalibrationLogDate(new Date().toISOString().split("T")[0]);
    setCalibrationNotes(`Periodic ISO 15189 calibration passed. Certified by Er. Karthik Raja.`);
  };

  const handleSaveCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calibratingEquipment) return;

    const nextDueDate = new Date(Date.now() + calibratingEquipment.calibrationFrequencyDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    setEquipmentList((prev) =>
      prev.map((eq) =>
        eq.id === calibratingEquipment.id
          ? {
              ...eq,
              lastCalibrationDate: calibrationLogDate,
              nextCalibrationDate: nextDueDate,
              status: "Operational",
              notes: `${eq.notes ? eq.notes + " | " : ""}${calibrationNotes}`,
            }
          : eq
      )
    );
    setCalibratingEquipment(null);
  };

  const handleToggleStatus = (id: string) => {
    setEquipmentList((prev) =>
      prev.map((eq) => {
        if (eq.id !== id) return eq;
        const nextStatus = eq.status === "Operational" ? "Offline" : "Operational";
        return { ...eq, status: nextStatus };
      })
    );
  };

  const handleExportCSV = () => {
    const headers = "Asset Code,Equipment Name,Model,Department,Manufacturer,Serial No,Last Calibrated,Next Due,AMC Provider,Status\n";
    const rows = filteredEquipment
      .map(
        (e) =>
          `"${e.assetCode}","${e.name}","${e.model}","${e.department}","${e.manufacturer}","${e.serialNumber}","${e.lastCalibrationDate}","${e.nextCalibrationDate}","${e.amcProvider}","${e.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laboratory-equipment-register.csv";
    a.click();
  };

  const columns = [
    "Asset Code & Equipment",
    "Department",
    "Manufacturer & Model",
    "Serial Number",
    "Last Calibrated",
    "Next Due Date",
    "AMC / Warranty",
    "Operating Status",
    "Actions",
  ];

  return (
    <div className="equipment-page min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[10000] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircleOutlineOutlinedIcon className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {!activeDepartmentCard ? (
        <>
          {/* Top Header matching reference image: Title on left, Search & Filter on right */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Equipment
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-sm"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none shadow-sm"
              >
                <option value="All">All Types</option>
                <option value="Operational">Operational</option>
                <option value="Calibration Due">Calibration Due</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Offline">Offline</option>
              </select>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <AddIcon sx={{ fontSize: 16 }} />
                <span>Add Equipment</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: Department Cards Grid (Exact match to reference image) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {departmentCardsData.map((dept) => (
              <div
                key={dept.name}
                onClick={() => {
                  setSelectedDept(dept.deptMatch);
                  setActiveDepartmentCard(dept.name);
                  setCurrentPage(1);
                }}
                className={`group cursor-pointer rounded-2xl border ${dept.border} ${dept.bg} p-6 flex flex-col justify-between h-[180px] transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
              >
                <div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${dept.iconBg} shadow-sm`}>
                    <BiotechOutlinedIcon sx={{ fontSize: 24 }} />
                  </div>
                  <h3 className="mt-3.5 text-base font-bold text-slate-900 leading-snug">
                    {dept.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 font-medium">
                    {dept.total} {dept.total === 1 ? "Equipment" : "Equipments"}
                  </p>
                </div>

                <div>
                  <span className={`text-xs font-semibold ${dept.linkColor} group-hover:underline flex items-center gap-1`}>
                    View Equipments
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* VIEW 2: Inside Department Equipment View with Upper KPI Content */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDepartmentCard(null);
                    setSelectedDept("All");
                    setCurrentPage(1);
                  }}
                  className="hover:text-blue-600 transition underline underline-offset-2"
                >
                  Equipment
                </button>
                <span>•</span>
                <span className="text-blue-600 font-semibold">{activeDepartmentCard}</span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDepartmentCard(null);
                    setSelectedDept("All");
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                >
                  <ArrowBackIcon sx={{ fontSize: 16 }} />
                  <span>Back to Equipment Cards</span>
                </button>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {activeDepartmentCard} Register
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <AddIcon sx={{ fontSize: 16 }} />
                <span>Add Equipment</span>
              </button>
            </div>
          </div>

          {/* 4 KPI Summary Cards for Selected Department */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Equipment Assets
                </p>
                <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <BiotechOutlinedIcon sx={{ fontSize: 20 }} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{insideTotal}</p>
              <p className="mt-1 text-xs text-slate-500">
                {activeDepartmentCard === "Overall Equipments" ? "Across all testing benches" : `Assigned to ${activeDepartmentCard}`}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Operational & Validated
                </p>
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <CheckCircleOutlinedIcon sx={{ fontSize: 20 }} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{insideOperational}</p>
              <p className="mt-1 text-xs text-emerald-600 font-medium">Ready for clinical samples</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Calibration Due / Alert
                </p>
                <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
                  <WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-700">{insideCalibrationDue}</p>
              <p className="mt-1 text-xs text-amber-600 font-medium">Re-calibration required</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Maintenance In-Progress
                </p>
                <span className="rounded-lg bg-rose-50 p-2 text-rose-600">
                  <BuildCircleOutlinedIcon sx={{ fontSize: 20 }} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{insideMaintenance}</p>
              <p className="mt-1 text-xs text-rose-600 font-medium">Service engineer call-out</p>
            </div>
          </div>

          {/* Department Equipment Table Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search analyzer, model, serial no, vendor..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500">Department:</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="All">All Departments</option>
                    <option value="Clinical Biochemistry">Clinical Biochemistry</option>
                    <option value="Hematology & Coagulation">Hematology & Coagulation</option>
                    <option value="Microbiology & Serology">Microbiology & Serology</option>
                    <option value="Immunology & Hormones">Immunology & Hormones</option>
                    <option value="Clinical Pathology & Urine Routine">Clinical Pathology & Urine Routine</option>
                    <option value="Accession & Central Phlebotomy">Accession & Central Phlebotomy</option>
                    <option value="Histopathology & Cytology">Histopathology & Cytology</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500">Status:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Operational">Operational</option>
                    <option value="Calibration Due">Calibration Due</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <span className="text-xs text-slate-500 font-medium ml-1">
                  {filteredEquipment.length} {filteredEquipment.length === 1 ? "unit" : "units"}
                </span>
              </div>
            </div>

        {/* Table View */}
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            data={paginatedEquipment}
            maxHeight="380px"
            minWidth="1200px"
            emptyMessage="No equipment matches your search or filter criteria."
            renderRow={(eq: EquipmentItem) => {
              let statusBadge = "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
              if (eq.status === "Calibration Due") {
                statusBadge = "bg-amber-100 text-amber-700 hover:bg-amber-200";
              } else if (eq.status === "Under Maintenance") {
                statusBadge = "bg-rose-100 text-rose-700 hover:bg-rose-200";
              } else if (eq.status === "Offline") {
                statusBadge = "bg-slate-200 text-slate-700 hover:bg-slate-300";
              }

              return (
                <>
                  {/* 1. Asset Code & Equipment */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[240px]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                        <BiotechOutlinedIcon sx={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm max-w-[200px] truncate" title={eq.name}>
                          {eq.name}
                        </div>
                        <div className="font-mono text-xs text-purple-600 font-semibold">{eq.assetCode}</div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Department */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[190px]">
                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {eq.department}
                    </span>
                  </td>

                  {/* 3. Manufacturer & Model */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[190px]">
                    <div className="text-xs font-semibold text-slate-800">{eq.manufacturer}</div>
                    <div className="text-[11px] text-slate-400 max-w-[170px] truncate" title={eq.model}>
                      {eq.model}
                    </div>
                  </td>

                  {/* 4. Serial Number */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[150px]">
                    <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {eq.serialNumber}
                    </span>
                  </td>

                  {/* 5. Last Calibrated */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[140px]">
                    <div className="text-xs text-slate-700 font-medium">{eq.lastCalibrationDate}</div>
                    <div className="text-[10px] text-slate-400">Freq: {eq.calibrationFrequencyDays} days</div>
                  </td>

                  {/* 6. Next Due Date */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[140px]">
                    <div
                      className={`text-xs font-bold ${
                        eq.status === "Calibration Due" ? "text-amber-700" : "text-slate-800"
                      }`}
                    >
                      {eq.nextCalibrationDate}
                    </div>
                    {eq.status === "Calibration Due" && (
                      <span className="text-[10px] text-amber-600 font-semibold">Immediate action</span>
                    )}
                  </td>

                  {/* 7. AMC / Warranty */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-left min-w-[150px]">
                    <div className="text-xs font-medium text-slate-800 truncate max-w-[140px]" title={eq.amcProvider}>
                      {eq.amcProvider}
                    </div>
                    <div className="text-[10px] text-slate-400">Exp: {eq.amcExpiryDate}</div>
                  </td>

                  {/* 8. Operating Status */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-center min-w-[150px]">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(eq.id)}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition ${statusBadge}`}
                      title="Click to toggle operational status"
                    >
                      {eq.status}
                    </button>
                  </td>

                  {/* 9. Actions */}
                  <td className="whitespace-nowrap px-4 py-3 text-center min-w-[130px]">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewingEquipment(eq)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-purple-600 transition"
                        title="View Full Profile"
                      >
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCalibrationModal(eq)}
                        className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 transition"
                        title="Log Calibration Record"
                      >
                        <VerifiedUserOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(eq)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="Edit Equipment"
                      >
                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingEquipment(eq)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete Equipment"
                      >
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </td>
                </>
              );
            }}
          />
        </div>

        {/* Standard Pagination */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
          <Pagination
            totalItems={filteredEquipment.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )}

      {/* Log Calibration Modal */}
      {calibratingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setCalibratingEquipment(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-lg bg-amber-100 p-2 text-amber-700">
                <VerifiedUserOutlinedIcon sx={{ fontSize: 22 }} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Log Calibration Record</h3>
                <p className="text-xs text-slate-500">{calibratingEquipment.name}</p>
              </div>
            </div>

            <form onSubmit={handleSaveCalibration} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calibration Completion Date
                </label>
                <input
                  type="date"
                  required
                  value={calibrationLogDate}
                  onChange={(e) => setCalibrationLogDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calibration Standards & Verification Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={calibrationNotes}
                  onChange={(e) => setCalibrationNotes(e.target.value)}
                  placeholder="Lot number, calibrator type, standard curve slope, bio-medical engineer sign-off..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCalibratingEquipment(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700 transition"
                >
                  Certify Calibration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Equipment Details Right-Side Drawer */}
      {viewingEquipment && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setViewingEquipment(null)}
          />

          <div
            className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <BiotechOutlinedIcon sx={{ fontSize: 24 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewingEquipment.name}</h3>
                  <span className="font-mono text-xs text-purple-600 font-semibold">{viewingEquipment.assetCode}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingEquipment(null)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800">{viewingEquipment.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Manufacturer:</span>
                  <span className="font-semibold text-slate-800">{viewingEquipment.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model:</span>
                  <span className="text-slate-700">{viewingEquipment.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Serial Number:</span>
                  <span className="font-mono font-bold text-slate-800">{viewingEquipment.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Temperature Zone:</span>
                  <span className="text-slate-700">{viewingEquipment.temperatureZone}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Last Calibration</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{viewingEquipment.lastCalibrationDate}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Next Due Date</span>
                  <p className="font-bold text-purple-700 text-xs mt-0.5">{viewingEquipment.nextCalibrationDate}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Status</span>
                  <p className="font-bold text-emerald-700 text-xs mt-0.5">{viewingEquipment.status}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-semibold">Maintenance Contract (AMC)</span>
                <p className="text-slate-800 font-semibold">{viewingEquipment.amcProvider}</p>
                <p className="text-slate-500 text-[11px]">Contract Expiry: {viewingEquipment.amcExpiryDate}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Specs &amp; Calibration Logs
                </label>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {viewingEquipment.notes || "Equipment fully validated according to CLSI & ISO 15189 specifications."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewingEquipment(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Equipment Drawer (Right Side) */}
      {isAddEditModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setIsAddEditModalOpen(false)}
          />

          {/* Drawer */}
          <div
            className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <BiotechOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingEquipment ? "Edit Equipment Details" : "Enroll New Equipment"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingEquipment ? editingEquipment.assetCode : "Register equipment specs & schedule"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Asset / Machine Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EQ-2026-011"
                      value={formData.assetCode}
                      onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Equipment / Analyzer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sysmex XN-1000"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Manufacturer / Brand <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sysmex Corporation"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Clinical Biochemistry">Clinical Biochemistry</option>
                      <option value="Hematology & Coagulation">Hematology & Coagulation</option>
                      <option value="Microbiology & Serology">Microbiology & Serology</option>
                      <option value="Immunology & Hormones">Immunology & Hormones</option>
                      <option value="Clinical Pathology & Urine Routine">Clinical Pathology & Urine Routine</option>
                      <option value="Accession & Central Phlebotomy">Accession & Central Phlebotomy</option>
                      <option value="Histopathology & Cytology">Histopathology & Cytology</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SN-SYS-9901"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Temperature Zone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 20°C - 25°C"
                      value={formData.temperatureZone}
                      onChange={(e) => setFormData({ ...formData, temperatureZone: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Calibration
                    </label>
                    <input
                      type="date"
                      value={formData.lastCalibrationDate}
                      onChange={(e) => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Next Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.nextCalibrationDate}
                      onChange={(e) => setFormData({ ...formData, nextCalibrationDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Operating Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as EquipmentItem["status"],
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Calibration Due">Calibration Due</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      AMC Service Provider
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Roche Direct Care"
                      value={formData.amcProvider}
                      onChange={(e) => setFormData({ ...formData, amcProvider: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      AMC Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.amcExpiryDate}
                      onChange={(e) => setFormData({ ...formData, amcExpiryDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Technical Specifications &amp; Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Throughput, calibrators used, interface cable (RS232/LAN)..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#29384d] hover:bg-[#1e293b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation Right-Side Drawer */}
      {deletingEquipment && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setDeletingEquipment(null)}
          />

          <div
            className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete Equipment</h3>
                  <p className="text-xs text-slate-500">Confirm deletion</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeletingEquipment(null)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <WarningAmberOutlinedIcon className="text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-800">
                  <p className="font-semibold text-sm mb-1">Are you sure you want to delete this equipment?</p>
                  <p>This action cannot be undone. All linked calibration history and service schedules will be removed.</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Asset Code:</span>
                  <span className="font-mono font-bold text-slate-900">{deletingEquipment.assetCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Equipment Name:</span>
                  <span className="font-semibold text-slate-800">{deletingEquipment.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="text-slate-700">{deletingEquipment.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Manufacturer:</span>
                  <span className="text-slate-700">{deletingEquipment.manufacturer}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                type="button"
                onClick={() => setDeletingEquipment(null)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
