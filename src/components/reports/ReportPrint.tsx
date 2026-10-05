import type { ReactNode } from "react";

export interface ResultParameter {
    name: string;
    value: string;
    unit?: string;
    referenceRange?: string;
    flag?: string;
}

export interface StoredSample {
    id: string;
    sampleId: string;
    accessionNumber: string;
    barcode: string;

    patientId: string;
    registrationId: string;
    patientName: string;

    testId: string;
    testName: string;
    sampleType: string;

    collectionDate: string;
    collectionTime: string;
    collector: string;

    status:
        | "Pending Collection"
        | "Collected"
        | "Received"
        | "Accepted"
        | "Processing"
        | "Completed"
        | "Rejected";

    source: "Patient Registration";
    createdAt: string;

    receivedDate?: string;
    receivedTime?: string;
    receivedBy?: string;

    acceptedDate?: string;
    acceptedTime?: string;
    acceptedBy?: string;

    rejectedDate?: string;
    rejectedTime?: string;
    rejectedBy?: string;
    rejectionReason?: string;

    processingDate?: string;
    processingTime?: string;
    processingBy?: string;

    completedDate?: string;
    completedTime?: string;
    completedBy?: string;

    analyzer?: string;
    method?: string;

    priority?: "Normal" | "Urgent" | "STAT";

    resultStatus?:
        | "Pending"
        | "Entered"
        | "QC Pending"
        | "QC Passed"
        | "QC Failed"
        | "Verified";

    resultParameters?: ResultParameter[];

    resultRemarks?: string;

    resultEnteredDate?: string;
    resultEnteredTime?: string;
    resultEnteredBy?: string;

    qcDate?: string;
    qcTime?: string;
    qcBy?: string;
    qcRemarks?: string;
    qcStatus?: "Passed" | "Failed";

    verificationDate?: string;
    verificationTime?: string;
    verificationBy?: string;
    verificationRemarks?: string;

    reportId?: string;
    reportStatus?: "Pending" | "Final";
    reportGeneratedDate?: string;
    reportGeneratedTime?: string;
    reportGeneratedBy?: string;
}

interface ReportPrintProps {
    sample: StoredSample;
}

interface InfoItemProps {
    label: string;
    value?: string;
}

const InfoItem = ({ label, value }: InfoItemProps) => (
    <div className="report-info-item">
        <span className="report-info-label">{label}</span>
        <strong className="report-info-value">{value || "-"}</strong>
    </div>
);

interface SectionProps {
    title: string;
    children: ReactNode;
    className?: string;
}

const ReportSection = ({
    title,
    children,
    className = "",
}: SectionProps) => (
    <section className={`report-section ${className}`}>
        <div className="report-section-heading">
            <span className="report-section-number" />
            <h2>{title}</h2>
        </div>

        {children}
    </section>
);

const ReportPrint = ({ sample }: ReportPrintProps) => {
    const priority = sample.priority || "Normal";

    return (
        <div className="print-report">
            {/* =====================================================
                HEADER
            ===================================================== */}
            <header className="report-header">
                <div className="report-brand">
                    <div className="report-brand-mark">
                        <span>DL</span>
                    </div>

                    <div>
                        <h1>DIAGNOSTIC LABORATORY</h1>

                        <p>
                            Laboratory Management System
                        </p>

                        <small>
                            Accurate Testing • Reliable Results
                        </small>
                    </div>
                </div>

                <div className="report-header-meta">
                    <div className="final-badge">
                        FINAL REPORT
                    </div>

                    <div className="header-report-id">
                        <span>Report ID</span>
                        <strong>
                            {sample.reportId || "-"}
                        </strong>
                    </div>

                    <div className="header-report-date">
                        <span>Report Date</span>
                        <strong>
                            {sample.reportGeneratedDate || "-"}
                        </strong>
                    </div>
                </div>
            </header>

            {/* =====================================================
                REPORT SUMMARY STRIP
            ===================================================== */}
            <div className="report-summary-strip">
                <div>
                    <span>Test</span>
                    <strong>{sample.testName}</strong>
                </div>

                <div>
                    <span>Sample</span>
                    <strong>{sample.sampleId}</strong>
                </div>

                <div>
                    <span>Accession</span>
                    <strong>{sample.accessionNumber}</strong>
                </div>

                <div>
                    <span>Priority</span>

                    <strong
                        className={`priority-value priority-${priority.toLowerCase()}`}
                    >
                        {priority}
                    </strong>
                </div>
            </div>

            {/* =====================================================
                PATIENT INFORMATION
            ===================================================== */}
            <ReportSection title="Patient Information">
                <div className="report-info-grid">
                    <InfoItem
                        label="Patient Name"
                        value={sample.patientName}
                    />

                    <InfoItem
                        label="Patient ID"
                        value={sample.patientId}
                    />

                    <InfoItem
                        label="Registration ID"
                        value={sample.registrationId}
                    />

                    <InfoItem
                        label="Sample ID"
                        value={sample.sampleId}
                    />

                    <InfoItem
                        label="Sample Type"
                        value={sample.sampleType}
                    />

                    <InfoItem
                        label="Barcode"
                        value={sample.barcode}
                    />
                </div>
            </ReportSection>

            {/* =====================================================
                TEST INFORMATION
            ===================================================== */}
            <ReportSection title="Test Information">
                <div className="report-info-grid">
                    <InfoItem
                        label="Test Name"
                        value={sample.testName}
                    />

                    <InfoItem
                        label="Test Method"
                        value={sample.method}
                    />

                    <InfoItem
                        label="Analyzer"
                        value={sample.analyzer}
                    />

                    <InfoItem
                        label="Sample Collector"
                        value={sample.collector}
                    />

                    <InfoItem
                        label="Collection Date"
                        value={sample.collectionDate}
                    />

                    <InfoItem
                        label="Collection Time"
                        value={sample.collectionTime}
                    />
                </div>
            </ReportSection>

            {/* =====================================================
                RESULTS
            ===================================================== */}
            <ReportSection
                title="Test Results"
                className="results-section"
            >
                <div className="result-table-wrapper">
                    <table className="professional-result-table">
                        <thead>
                            <tr>
                                <th className="parameter-column">
                                    Parameter
                                </th>

                                <th className="result-column">
                                    Result
                                </th>

                                <th className="unit-column">
                                    Unit
                                </th>

                                <th className="reference-column">
                                    Reference Range
                                </th>

                                <th className="flag-column">
                                    Flag
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {sample.resultParameters?.length ? (
                                sample.resultParameters.map(
                                    (parameter, index) => (
                                        <tr key={index}>
                                            <td className="parameter-name">
                                                {parameter.name}
                                            </td>

                                            <td className="result-value">
                                                {parameter.value}
                                            </td>

                                            <td>
                                                {parameter.unit || "-"}
                                            </td>

                                            <td>
                                                {parameter.referenceRange ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {parameter.flag ? (
                                                    <span className="result-flag">
                                                        {parameter.flag}
                                                    </span>
                                                ) : (
                                                    <span className="normal-flag">
                                                        Normal
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="no-results"
                                    >
                                        No result parameters available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {sample.resultRemarks && (
                    <div className="remarks-box">
                        <div className="remarks-title">
                            Result Remarks
                        </div>

                        <p>{sample.resultRemarks}</p>
                    </div>
                )}
            </ReportSection>

            {/* =====================================================
                INTERPRETATION
            ===================================================== */}
            <ReportSection title="Report Interpretation">
                <div className="interpretation-box">
                    <div className="interpretation-icon">
                        ✓
                    </div>

                    <div>
                        <h3>Laboratory Result</h3>

                        <p>
                            The above laboratory results have been
                            reviewed and verified according to the
                            laboratory quality control procedure.
                        </p>

                        {sample.verificationRemarks && (
                            <p className="verification-comment">
                                <strong>Verification Remarks:</strong>{" "}
                                {sample.verificationRemarks}
                            </p>
                        )}
                    </div>
                </div>
            </ReportSection>

            {/* =====================================================
                QC + VERIFICATION
            ===================================================== */}
            <div className="two-column-sections">
                <ReportSection title="Quality Control">
                    <div className="compact-info-grid">
                        <InfoItem
                            label="QC Status"
                            value={
                                sample.qcStatus === "Passed"
                                    ? "Passed"
                                    : sample.qcStatus || "-"
                            }
                        />

                        <InfoItem
                            label="Checked By"
                            value={sample.qcBy}
                        />

                        <InfoItem
                            label="QC Date"
                            value={sample.qcDate}
                        />

                        <InfoItem
                            label="QC Time"
                            value={sample.qcTime}
                        />
                    </div>
                </ReportSection>

                <ReportSection title="Verification">
                    <div className="compact-info-grid">
                        <InfoItem
                            label="Status"
                            value="Verified"
                        />

                        <InfoItem
                            label="Verified By"
                            value={sample.verificationBy}
                        />

                        <InfoItem
                            label="Date"
                            value={sample.verificationDate}
                        />

                        <InfoItem
                            label="Time"
                            value={sample.verificationTime}
                        />
                    </div>
                </ReportSection>
            </div>

            {/* =====================================================
                SIGNATURES
            ===================================================== */}
            <div className="signature-section">
                <div className="signature-box">
                    <div className="signature-space" />

                    <div className="signature-line" />

                    <strong>
                        Laboratory Technician
                    </strong>

                    <span>
                        Result Entry / Laboratory Processing
                    </span>
                </div>

                <div className="signature-box">
                    <div className="signature-space" />

                    <div className="signature-line" />

                    <strong>
                        Authorized Signatory
                    </strong>

                    <span>
                        Laboratory Verification
                    </span>
                </div>
            </div>

            {/* =====================================================
                FOOTER
            ===================================================== */}
            <footer className="report-footer">
                <div className="footer-main">
                    <div>
                        <strong>
                            DIAGNOSTIC LABORATORY
                        </strong>

                        <span>
                            Laboratory Management System
                        </span>
                    </div>

                    <div className="footer-contact">
                        <span>
                            This is a computer-generated report.
                        </span>

                        <span>
                            No physical signature is required unless
                            specified.
                        </span>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>
                        Report ID:{" "}
                        {sample.reportId || "-"}
                    </span>

                    <span>
                        Generated By:{" "}
                        {sample.reportGeneratedBy ||
                            "Laboratory Administrator"}
                    </span>

                    <span>
                        Generated:{" "}
                        {sample.reportGeneratedDate || "-"}{" "}
                        {sample.reportGeneratedTime || ""}
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default ReportPrint;