/** @file `/dashboard` — the shared signed-in landing page. */

import { getCurrentUser } from "@/lib/serverAuth";
import DashboardClient from "../components/DashboardClient";
import AuthState from "../components/AuthState";

/**
 * Resolves the current user server-side and hands it to the client dashboard.
 * Middleware already redirects signed-out users, so the `AuthState` branch
 * covers the narrower case of a cookie that survived the redirect but fails
 * verification — an expired token, or a rotated `JWT_SECRET`.
 * @returns {Promise<JSX.Element>} The dashboard, or the auth notice.
 */
export default async function DashboardPage() {
  const userData = await getCurrentUser();

  if (!userData) {
    return <AuthState title="Invalid or expired token." message="Please login again to continue." />;
  }

  return <DashboardClient userData={userData} />;
}
