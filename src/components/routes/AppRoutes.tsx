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
import RejectedSamples from "../accession/RejectedSamples";
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
import ResultEntry from "../results/ResultEntry";
import PendingVerification from "../results/PendingVerification";
import VerifiedResults from "../results/VerifiedResults";
import QCChecks from "../quality-control/QCChecks";
import ControlResults from "../quality-control/ControlResults";
import FailedQC from "../quality-control/FailedQC";
import CorrectiveActions from "../quality-control/CorrectiveActions";
import NotificationHistory from "../notifications/NotificationHistory";
import MessageTemplates from "../notifications/MessageTemplates";
import NotificationSettings from "../notifications/NotificationSettings";


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
                    <Route path="/financial-analysis/total-billing"element={<TotalBilling />}/>
                    <Route path="/financial-analysis/discounts" element={<Discounts />} />
                    <Route path="/financial-analysis/pending-payments" element={<PendingPayments />}/>
                    <Route path="/financial-analysis/monthly-revenue" element={<MonthlyRevenue />}/>
                    <Route path="/financial-analysis/payment-statistics"element={<PaymentStatistics />}/>
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

                    {/* Results */}
                    <Route path="/results/enter" element={<ResultEntry />} />
                    <Route path="/results/pending-verification" element={<PendingVerification />} />
                    <Route path="/results/verified" element={<VerifiedResults />} />

                    {/* Quality Control */}
                    <Route path="/quality-control/checks" element={<QCChecks />} />
                    <Route path="/quality-control/control-results" element={<ControlResults />} />
                    <Route path="/quality-control/failed" element={<FailedQC />} />
                    <Route path="/quality-control/corrective-actions" element={<CorrectiveActions />} />

                    {/* Notifications */}
                    <Route path="/notifications/history" element={<NotificationHistory />} />
                    <Route path="/notifications/templates" element={<MessageTemplates />} />
                    <Route path="/notifications/settings" element={<NotificationSettings />} />
        </Route>

            </Route>

            <Route
                path="*"
                element={
                    <div className="p-10 text-center">
                        ROUTE NOT FOUND: {window.location.pathname}
                    </div>
                }
            />
        </Routes>
    );
};

export default AppRoutes;