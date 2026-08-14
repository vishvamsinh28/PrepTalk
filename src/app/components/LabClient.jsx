"use client";

/** @file Role switch for `/lab` — the two dashboards share a route but nothing else. */

import LabAdminDashboard from "./lab/LabAdminDashboard";
import LabCandidateDashboard from "./lab/LabCandidateDashboard";

/**
 * Picks the admin or candidate Lab dashboard by role.
 * Anything that isn't `"Interviewer"` gets the candidate view, so an absent or
 * unexpected role degrades to the lower-privilege screen. That's presentation
 * only — both dashboards are still gated by the API on every request.
 * @param {object} props - Component props.
 * @param {string} [props.initialAssessmentId=""] - Assessment to open on mount, from the URL.
 * @param {{role?: string}} props.userData - Signed-in user; only `role` is read.
 * @returns {JSX.Element} The role-appropriate dashboard.
 */
export default function LabClient({ initialAssessmentId = "", userData }) {
  if (userData?.role === "Interviewer") {
    return <LabAdminDashboard initialAssessmentId={initialAssessmentId} />;
  }

  return <LabCandidateDashboard initialAssessmentId={initialAssessmentId} />;
}
