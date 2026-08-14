/** @file `/lab` — entry point for both Lab dashboards. */

import { getCurrentUser } from "@/lib/serverAuth";
import AuthState from "../components/AuthState";
import LabClient from "../components/LabClient";

/** Roles permitted in the Lab. Anything else gets the access-denied notice. */
const LAB_ROLES = new Set(["Interviewer", "Interviewee"]);

/**
 * Gates the Lab by role, then hands off to `LabClient` to pick a dashboard.
 * `?assessment=` is threaded through so a deep link opens straight into one
 * test — the value is passed as a plain string and validated by the API, not
 * here. `searchParams` is awaited because Next 15 made it async.
 * @param {object} props - Page props.
 * @param {Promise<{assessment?: string}>} props.searchParams - Query params.
 * @returns {Promise<JSX.Element>} The Lab dashboard, or an auth notice.
 */
export default async function LabPage({ searchParams }) {
  const userData = await getCurrentUser();
  const params = await searchParams;
  const assessmentId = typeof params?.assessment === "string" ? params.assessment : "";

  if (!userData) {
    return <AuthState title="Invalid token." message="Please login again to continue." />;
  }

  if (!LAB_ROLES.has(userData.role)) {
    return <AuthState title="Access denied." message="This page is restricted to PrepTalk users only." />;
  }

  return <LabClient initialAssessmentId={assessmentId} userData={userData} />;
}
