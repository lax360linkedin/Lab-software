import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import Layout from "../../common components/layout/Layout";
import Signup from "../home/Signup";
import Login from "../home/Login";
import Dashboard from "../dashboard/Dashboard";
import PatientList from "../patients/patients-list/PatientsList";
import NewRegistration from "../patients/registration/NewRegistration";
import PatientHistory from "../patients/history/PatientHistory";
import SampleCollection from "../accession/SampleCollection";
import ReceivedSamples from "../accession/ReceivedSamples";
import AcceptedSamples from "../accession/AcceptedSamples";
import Collection from "../financial analysis/collections/collection";
import Revenue from "../financial analysis/revenue/revenue";
import SampleTracking from "../accession/SampleTracking";
import PendingTests from "../analysis/PendingTests";
import Processing from "../analysis/Processing";
import Completed from "../analysis/Completed";
import Discounts from "../financial analysis/discounts/discounts";
import MonthlyRevenue from "../financial analysis/monthly-revenue/monthlyRevenue";
import PaymentStatistics from "../financial analysis/payment-statistics/paymentStatistics";
import PendingPayments from "../financial analysis/pending-payments/pendingPayments";
import TotalBilling from "../financial analysis/total-billing/totalBilling";
import ExpenseDashboard from "../expenses/dashboard/ExpenseDashboard";
import AddExpense from "../expenses/add-expense/AddExpense";
import ExpenseList from "../expenses/expense-list/ExpenseList";
import ExpenseCategories from "../expenses/categories/ExpenseCategories";
import ExpenseReports from "../expenses/reports/ExpenseReports";
import StaffUsers from "../staff/users/StaffUsers";
import StaffRoles from "../staff/roles/StaffRoles";
import StaffPermissions from "../staff/permissions/StaffPermissions";
import Departments from "../lab-management/departments/Departments";
import Equipment from "../lab-management/equipment/Equipment";
import LabSettings from "../lab-management/settings/LabSettings";
import LabProfile from "../lab-profile/LabProfile";
import Tests from "../tests/Tests";
import Doctors from "../doctors/Doctor";
import NewBill from "../../common components/billing/NewBill";
import Payments from "../../common components/billing/Payments";
import BillingPendingPayments from "../../common components/billing/BillingPendingPayments";
import RejectedSamples from "../accession/RejectedSamples";
import PendingResults from "../results/PendingResults";
import ResultEntry from "../results/ResultEntry";
import PendingQC from "../quality-control/PendingQC";
import QCPassed from "../quality-control/QCPassed";
import QCFailed from "../quality-control/QCFailed";
import VerificationPending from "../verification/Verification";
import VerifiedResults from "../verification/VerifiedResults";
import PendingReports from "../reports/PendingReports";
import FinalReports from "../reports/FinalReports";
import SettingsModule from "../settings/SettingsModule";
import CorrectiveActions from "../quality-control/CorrectiveActions";
import NotificationHistory from "../notifications/NotificationHistory";
import MessageTemplates from "../notifications/MessageTemplates";
import NotificationSettings from "../notifications/NotificationSettings";
import ReportHistory from "../reports/ReportHistory";

const AppRoutes = () => {
    console.log("CURRENT PATH:", window.location.pathname);
    
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/signup" replace />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/patients" element={<PatientList />} />
                    <Route path="/patients/new-registration" element={<NewRegistration />} />
                    <Route path="/patients/history" element={<PatientHistory />} />
                    <Route path="/patients/history/:patientId" element={<PatientHistory />} />
                    <Route path="/accession/sample-collection" element={<SampleCollection />} />
                    <Route path="/accession/received-samples" element={<ReceivedSamples />} />
                    <Route path="/accession/accepted-samples" element={<AcceptedSamples />} />
                    <Route path="/accession/rejected-samples" element={<RejectedSamples />} />
                    <Route path="/accession/sample-tracking" element={<SampleTracking />} />
                    <Route path="/analysis/pending" element={<PendingTests />} />
                    <Route path="/analysis/processing" element={<Processing />} />
                    <Route path="/analysis/completed" element={<Completed />} />
                    <Route path="/financial-analysis/collections" element={<Collection />} />
                    <Route path="/financial-analysis/revenue" element={<Revenue />} />
                    <Route path="/financial-analysis/total-billing" element={<TotalBilling />} />
                    <Route path="/financial-analysis/discounts" element={<Discounts />} />
                    <Route path="/financial-analysis/pending-payments" element={<PendingPayments />} />
                    <Route path="/financial-analysis/monthly-revenue" element={<MonthlyRevenue />} />
                    <Route path="/financial-analysis/payment-statistics" element={<PaymentStatistics />} />
                    <Route path="/expenses" element={<ExpenseDashboard />} />
                    <Route path="/expenses/add" element={<AddExpense />} />
                    <Route path="/expenses/list" element={<ExpenseList />} />
                    <Route path="/expenses/categories" element={<ExpenseCategories />} />
                    <Route path="/expenses/reports" element={<ExpenseReports />} />
                    <Route path="/staff/users" element={<StaffUsers />} />
                    <Route path="/staff/roles" element={<StaffRoles />} />
                    <Route path="/staff/permissions" element={<StaffPermissions />} />
                    <Route path="/lab-management/departments" element={<Departments />} />
                    <Route path="/lab-management/equipment" element={<Equipment />} />
                    <Route path="/lab-management/settings" element={<LabSettings />} />
                    <Route path="/lab-profile" element={<LabProfile />} />
                    <Route path="/tests" element={<Tests />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/billing/new" element={<NewBill />} />
                    <Route path="/billing/payments" element={<Payments />} />
                    <Route path="/billing/pending-payments" element={<BillingPendingPayments />} />
                    <Route path="/results/pending-results" element={<PendingResults />} />
                    <Route path="/results/entry" element={<ResultEntry />} />
                    <Route path="/results/entry/:sampleId" element={<ResultEntry />} />
                    <Route path="/qc/pending" element={<PendingQC />} />
                    <Route path="/qc/passed" element={<QCPassed />} />
                    <Route path="/qc/failed" element={<QCFailed />} />
                    <Route path="/quality-control/corrective-actions" element={<CorrectiveActions />} />
                    <Route path="/verification/pending" element={<VerificationPending />} />
                    <Route path="/verification/verified" element={<VerifiedResults />} />
                    <Route path="/reports/pending" element={<PendingReports />} />
                    <Route path="/reports/final" element={<FinalReports />} />
                    <Route path="/reports/history" element={<ReportHistory />} />
                    <Route path="/notifications/history" element={<NotificationHistory />} />
                    <Route path="/notifications/templates" element={<MessageTemplates />} />
                    <Route path="/notifications/settings" element={<NotificationSettings />} />
                    <Route path="/settings" element={<SettingsModule />} />
                    
                </Route>
            </Route>

            <Route path="*" element={
                <div className="p-10 text-center">
                    ROUTE NOT FOUND: {window.location.pathname}
                </div>
            }
            />
        </Routes>
    );
};

export default AppRoutes;