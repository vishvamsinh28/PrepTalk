"use client";

import LabAdminDashboard from "./lab/LabAdminDashboard";
import LabCandidateDashboard from "./lab/LabCandidateDashboard";

export default function LabClient({ initialAssessmentId = "", userData }) {
  if (userData?.role === "Interviewer") {
    return <LabAdminDashboard initialAssessmentId={initialAssessmentId} />;
  }

  return <LabCandidateDashboard initialAssessmentId={initialAssessmentId} />;
}
