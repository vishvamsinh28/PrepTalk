import { getCurrentUser } from "@/lib/serverAuth";
import DashboardClient from "../components/DashboardClient";
import AuthState from "../components/AuthState";

export default async function DashboardPage() {
  const userData = await getCurrentUser();

  if (!userData) {
    return <AuthState title="Invalid or expired token." message="Please login again to continue." />;
  }

  return <DashboardClient userData={userData} />;
}
