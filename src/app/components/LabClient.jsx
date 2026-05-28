"use client";

import LabAdminDashboard from "./lab/LabAdminDashboard";
import LabCandidateDashboard from "./lab/LabCandidateDashboard";

export default function LabClient({ userData }) {
  if (userData?.role === "Interviewer") {
    return <LabAdminDashboard />;
  }

  return <LabCandidateDashboard />;
}
