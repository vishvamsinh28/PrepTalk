import { getCurrentUser } from "@/lib/serverAuth";
import AuthState from "../components/AuthState";
import LabClient from "../components/LabClient";

const LAB_ROLES = new Set(["Interviewer", "Interviewee"]);

export default async function LabPage() {
  const userData = await getCurrentUser();

  if (!userData) {
    return <AuthState title="Invalid token." message="Please login again to continue." />;
  }

  if (!LAB_ROLES.has(userData.role)) {
    return <AuthState title="Access denied." message="This page is restricted to PrepTalk users only." />;
  }

  return <LabClient userData={userData} />;
}
