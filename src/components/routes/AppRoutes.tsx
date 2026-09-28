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