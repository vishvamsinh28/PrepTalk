"use client";

import LabAdminDashboard from "./lab/LabAdminDashboard";
import LabCandidateDashboard from "./lab/LabCandidateDashboard";

/**
 * Client wrapper that picks the admin or candidate lab dashboard
 * by role.
 * @param {{ role: string, initialAssessmentId?: string }} props
 */
export default function LabClient({ initialAssessmentId = "", userData }) {
  if (userData?.role === "Interviewer") {
    return <LabAdminDashboard initialAssessmentId={initialAssessmentId} />;
  }

  return <LabCandidateDashboard initialAssessmentId={initialAssessmentId} />;
}
