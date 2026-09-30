import { getFormattedCurrentDate } from "../../common components/dateUtils";

export interface NotificationLogItem {
  id: string;
  notificationCode: string;
  eventType:
    | "Registration Welcome"
    | "Report Ready"
    | "Payment Reminder"
    | "Report Shared"
    | "Critical Panic Alert"
    | "Sample Collection Confirmation";
  channel: "WhatsApp" | "SMS" | "Email" | "In-App";
  recipientType: "Patient" | "Doctor" | "Staff";
  recipientName: string;
  recipientContact: string;
  referenceId: string; // e.g. PAT-1001, RES-2026-001, INV-2026-05
  subject: string;
  messagePreview: string;
  sentDate: string;
  sentTime: string;
  deliveryStatus: "Delivered" | "Sent" | "Read" | "Failed";
  deliveredAt?: string;
  errorMessage?: string;
}

export interface MessageTemplateItem {
  id: string;
  templateCode: string;
  name: string;
  eventType: NotificationLogItem["eventType"];
  supportedChannels: ("WhatsApp" | "SMS" | "Email" | "In-App")[];
  subjectTemplate?: string;
  bodyTemplate: string;
  availableTags: string[];
  isActive: boolean;
  lastUpdated: string;
}

export interface NotificationGatewaySetting {
  id: string;
  name: string;
  channel: "WhatsApp" | "SMS" | "Email" | "In-App";
  provider: string;
  status: "Connected" | "Disconnected" | "Testing";
  accountSidOrUser?: string;
  senderId?: string;
  dailyQuota: number;
  dailyUsed: number;
  isAutoTriggerEnabled: boolean;
}

export const INITIAL_NOTIFICATIONS: NotificationLogItem[] = [
  {
    id: "NOTIF-001",
    notificationCode: "NTF-2026-1001",
    eventType: "Report Ready",
    channel: "WhatsApp",
    recipientType: "Patient",
    recipientName: "Dr. Govindaraj",
    recipientContact: "+91 98403 33445",
    referenceId: "RES-2026-008",
    subject: "Diagnostic Report Ready - Lax360",
    messagePreview: "Dear Dr. Govindaraj, your Lipid Profile report is ready for download. View online: https://lax360.med/report/RES-2026-008",
    sentDate: getFormattedCurrentDate(),
    sentTime: "09:22 AM",
    deliveryStatus: "Read",
    deliveredAt: "09:23 AM",
  },
  {
    id: "NOTIF-002",
    notificationCode: "NTF-2026-1002",
    eventType: "Report Ready",
    channel: "SMS",
    recipientType: "Patient",
    recipientName: "Lakshmi Narayanan",
    recipientContact: "+91 98404 44556",
    referenceId: "RES-2026-009",
    subject: "Lab Report Notification",
    messagePreview: "Lax360: Blood Glucose test results verified. Download report at https://lax360.med/r/009. Thank you.",
    sentDate: getFormattedCurrentDate(),
    sentTime: "09:25 AM",
    deliveryStatus: "Delivered",
    deliveredAt: "09:25 AM",
  },
  {
    id: "NOTIF-003",
    notificationCode: "NTF-2026-1003",
    eventType: "Registration Welcome",
    channel: "WhatsApp",
    recipientType: "Patient",
    recipientName: "Raj Kumar",
    recipientContact: "+91 98401 23456",
    referenceId: "PAT-1007",
    subject: "Welcome to Lax360 Diagnostic Center",
    messagePreview: "Hello Raj Kumar, welcome to Lax360. Your registration is complete. Patient ID: PAT-1007. Sample SMP-10007 is under analysis.",
    sentDate: getFormattedCurrentDate(),
    sentTime: "09:40 AM",
    deliveryStatus: "Delivered",
    deliveredAt: "09:41 AM",
  },
  {
    id: "NOTIF-004",
    notificationCode: "NTF-2026-1004",
    eventType: "Payment Reminder",
    channel: "SMS",
    recipientType: "Patient",
    recipientName: "Anita Sharma",
    recipientContact: "+91 98402 34567",
    referenceId: "INV-2026-044",
    subject: "Payment Pending Reminder",
    messagePreview: "Dear Anita Sharma, an outstanding balance of Rs. 450 is pending for Invoice #INV-2026-044. Pay securely via UPI: https://lax360.med/pay/44",
    sentDate: getFormattedCurrentDate(),
    sentTime: "10:00 AM",
    deliveryStatus: "Sent",
  },
  {
    id: "NOTIF-005",
    notificationCode: "NTF-2026-1005",
    eventType: "Critical Panic Alert",
    channel: "In-App",
    recipientType: "Doctor",
    recipientName: "Dr. K. Ravindran, MD",
    recipientContact: "+91 98409 99887",
    referenceId: "SMP-10010",
    subject: "CRITICAL PANIC VALUE ALERT",
    messagePreview: "URGENT: Patient Suresh Babu (PAT-1010) Fasting Blood Sugar measured critical value: 310 mg/dL. Immediate clinical attention required.",
    sentDate: getFormattedCurrentDate(),
    sentTime: "10:15 AM",
    deliveryStatus: "Read",
    deliveredAt: "10:16 AM",
  },
  {
    id: "NOTIF-006",
    notificationCode: "NTF-2026-1006",
    eventType: "Report Shared",
    channel: "Email",
    recipientType: "Doctor",
    recipientName: "Dr. V. Meenakshi, Physician",
    recipientContact: "dr.meenakshi@carehosp.org",
    referenceId: "RES-2026-008",
    subject: "Patient Diagnostic Report: Dr. Govindaraj (PAT-1003)",
    messagePreview: "Attached is the verified diagnostic investigation report for patient Dr. Govindaraj (Ref: Dr. V. Meenakshi). PDF encrypted.",
    sentDate: getFormattedCurrentDate(),
    sentTime: "10:30 AM",
    deliveryStatus: "Delivered",
  },
];

export const INITIAL_TEMPLATES: MessageTemplateItem[] = [
  {
    id: "TMPL-01",
    templateCode: "TMPL-REG-WELCOME",
    name: "Patient Registration Welcome",
    eventType: "Registration Welcome",
    supportedChannels: ["WhatsApp", "SMS", "In-App"],
    subjectTemplate: "Welcome to {{lab_name}}",
    bodyTemplate: "Dear {{patient_name}}, welcome to {{lab_name}}. Your registration ID is {{patient_id}}. Sample {{sample_id}} has been accepted for analysis. We will notify you once your results are ready.",
    availableTags: ["{{patient_name}}", "{{patient_id}}", "{{lab_name}}", "{{sample_id}}", "{{date}}"],
    isActive: true,
    lastUpdated: getFormattedCurrentDate(),
  },
  {
    id: "TMPL-02",
    templateCode: "TMPL-REPORT-READY",
    name: "Diagnostic Report Ready & Sign-off",
    eventType: "Report Ready",
    supportedChannels: ["WhatsApp", "SMS", "Email", "In-App"],
    subjectTemplate: "Your {{test_name}} Report is Ready - {{lab_name}}",
    bodyTemplate: "Dear {{patient_name}}, your test results for {{test_name}} have been verified and signed by our Pathologist. You can download your official report here: {{report_url}}. Thank you for choosing {{lab_name}}.",
    availableTags: ["{{patient_name}}", "{{test_name}}", "{{report_url}}", "{{lab_name}}", "{{doctor_name}}", "{{verified_date}}"],
    isActive: true,
    lastUpdated: getFormattedCurrentDate(),
  },
  {
    id: "TMPL-03",
    templateCode: "TMPL-PAY-REMIND",
    name: "Pending Balance & Payment Link",
    eventType: "Payment Reminder",
    supportedChannels: ["SMS", "WhatsApp"],
    subjectTemplate: "Payment Pending Notification",
    bodyTemplate: "Dear {{patient_name}}, a pending balance of Rs. {{amount_due}} is due for invoice {{invoice_no}}. Please pay online at {{payment_link}} or at our front desk. For support call {{lab_phone}}.",
    availableTags: ["{{patient_name}}", "{{amount_due}}", "{{invoice_no}}", "{{payment_link}}", "{{lab_phone}}"],
    isActive: true,
    lastUpdated: getFormattedCurrentDate(),
  },
  {
    id: "TMPL-04",
    templateCode: "TMPL-CRITICAL-ALERT",
    name: "Doctor Urgent Panic Value Alert",
    eventType: "Critical Panic Alert",
    supportedChannels: ["In-App", "SMS", "WhatsApp"],
    subjectTemplate: "URGENT CRITICAL ALERT: {{patient_name}} ({{test_name}})",
    bodyTemplate: "CRITICAL VALUE ALERT: Patient {{patient_name}} (ID: {{patient_id}}) has a panic result for {{test_name}}: {{parameter_name}} = {{measured_value}} {{unit}} (Ref: {{reference_range}}). Please evaluate immediately.",
    availableTags: ["{{patient_name}}", "{{patient_id}}", "{{test_name}}", "{{parameter_name}}", "{{measured_value}}", "{{unit}}", "{{reference_range}}"],
    isActive: true,
    lastUpdated: getFormattedCurrentDate(),
  },
  {
    id: "TMPL-05",
    templateCode: "TMPL-REPORT-SHARED",
    name: "Report Dispatched to Referring Doctor",
    eventType: "Report Shared",
    supportedChannels: ["Email", "WhatsApp"],
    subjectTemplate: "Medical Report Shared: {{patient_name}}",
    bodyTemplate: "Dear Dr. {{doctor_name}}, the test report for your referred patient {{patient_name}} ({{test_name}}) is attached for your clinical review. Generated by {{lab_name}}.",
    availableTags: ["{{doctor_name}}", "{{patient_name}}", "{{test_name}}", "{{lab_name}}", "{{report_url}}"],
    isActive: true,
    lastUpdated: getFormattedCurrentDate(),
  },
];

export const INITIAL_GATEWAY_SETTINGS: NotificationGatewaySetting[] = [
  {
    id: "GATE-01",
    name: "WhatsApp Cloud API",
    channel: "WhatsApp",
    provider: "Meta Graph API (Cloud)",
    status: "Connected",
    senderId: "+91 98400 12360",
    accountSidOrUser: "WA_BIZ_ACC_99218",
    dailyQuota: 5000,
    dailyUsed: 142,
    isAutoTriggerEnabled: true,
  },
  {
    id: "GATE-02",
    name: "Transactional SMS Gateway",
    channel: "SMS",
    provider: "Twilio / Fast2SMS DLT",
    status: "Connected",
    senderId: "LAXMED",
    accountSidOrUser: "AC_tw_88291082",
    dailyQuota: 2000,
    dailyUsed: 89,
    isAutoTriggerEnabled: true,
  },
  {
    id: "GATE-03",
    name: "Secure Clinical SMTP Server",
    channel: "Email",
    provider: "AWS SES / SendGrid",
    status: "Connected",
    senderId: "reports@lax360.med",
    accountSidOrUser: "smtp.lax360.med",
    dailyQuota: 10000,
    dailyUsed: 65,
    isAutoTriggerEnabled: true,
  },
  {
    id: "GATE-04",
    name: "Laboratory Real-time In-App Push",
    channel: "In-App",
    provider: "WebSocket / Firebase FCM",
    status: "Connected",
    senderId: "System Broadcaster",
    accountSidOrUser: "FCM_PROJECT_LAX360",
    dailyQuota: 50000,
    dailyUsed: 310,
    isAutoTriggerEnabled: true,
  },
];

const NOTIFICATIONS_LOG_KEY = "lax360_lab_notifications_log";
const TEMPLATES_KEY = "lax360_lab_message_templates";
const GATEWAYS_KEY = "lax360_lab_gateways";

export const getStoredNotifications = (): NotificationLogItem[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_LOG_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_LOG_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
};

export const saveNotifications = (items: NotificationLogItem[]) => {
  localStorage.setItem(NOTIFICATIONS_LOG_KEY, JSON.stringify(items));
};

export const getStoredTemplates = (): MessageTemplateItem[] => {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(INITIAL_TEMPLATES));
      return INITIAL_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TEMPLATES;
  }
};

export const saveTemplates = (items: MessageTemplateItem[]) => {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(items));
};

export const getStoredGateways = (): NotificationGatewaySetting[] => {
  try {
    const raw = localStorage.getItem(GATEWAYS_KEY);
    if (!raw) {
      localStorage.setItem(GATEWAYS_KEY, JSON.stringify(INITIAL_GATEWAY_SETTINGS));
      return INITIAL_GATEWAY_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_GATEWAY_SETTINGS;
  }
};

export const saveGateways = (items: NotificationGatewaySetting[]) => {
  localStorage.setItem(GATEWAYS_KEY, JSON.stringify(items));
};
