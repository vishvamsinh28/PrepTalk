import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import InterviewReport from "@/models/InterviewReport";

const scoreKeys = ["communication", "technicalDepth", "problemSolving", "confidence", "roleFit"];

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
    return json({ message: "Failed to fetch progress", error: error.message }, 500);
  }
}
