/** @file `GET /api/progress` — score averages across the caller's reports, for the progress dashboard. */

import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import InterviewReport from "@/models/InterviewReport";

/** The five scorecard dimensions. Must match `SCORE_KEYS` in the reports route. */
const scoreKeys = ["communication", "technicalDepth", "problemSolving", "confidence", "roleFit"];

/**
 * Averages each scorecard dimension across every report the caller is party to.
 * Interviewers see the reports they wrote, interviewees the ones about them.
 * A missing dimension counts as 0 rather than being skipped, so one malformed
 * report drags the average down instead of silently changing the divisor.
 * With no reports every average is 0, which the dashboard renders as an empty state.
 * @param {import("next/server").NextRequest} req - Authenticated request.
 * @returns {Promise<import("next/server").NextResponse>} 200 with
 *   `{ totalReports, averages }` rounded to one decimal; 401 signed out; 500 otherwise.
 */
export async function GET(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);

    await connectDB();
    const query = user.role === "Interviewer"
      ? { interviewerEmail: user.email }
      : { intervieweeEmail: user.email };
    const reports = await InterviewReport.find(query).sort({ createdAt: 1 });

    const totals = Object.fromEntries(scoreKeys.map((key) => [key, 0]));
    reports.forEach((report) => {
      scoreKeys.forEach((key) => {
        totals[key] += Number(report.scores?.[key] || 0);
      });
    });

    const averages = Object.fromEntries(
      scoreKeys.map((key) => [key, reports.length ? Number((totals[key] / reports.length).toFixed(1)) : 0])
    );

    return json({ totalReports: reports.length, averages });
  } catch (error) {
    console.error("Progress fetch error:", error);
    return serverError("Failed to fetch progress");
  }
}
