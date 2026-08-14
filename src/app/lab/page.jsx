import { getCurrentUser } from "@/lib/serverAuth";
import AuthState from "../components/AuthState";
import LabClient from "../components/LabClient";

const LAB_ROLES = new Set(["Interviewer", "Interviewee"]);

/**
 * Lab entry page: renders the admin or candidate lab experience based
 * on the caller's role.
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
