import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { sanitizeAssessmentForUser, userCanAccessAssessment } from "@/lib/labAccess";
import { isValidObjectId } from "@/lib/sessionAccess";
import LabAssessment from "@/models/LabAssessment";

export async function GET(req, props) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);

    const { assessmentId } = await props.params;
    if (!isValidObjectId(assessmentId)) return json({ message: "Invalid assessmentId" }, 400);

    await connectDB();
    const assessment = await LabAssessment.findById(assessmentId);
    if (!assessment) return json({ message: "Assessment not found" }, 404);
    if (!userCanAccessAssessment(assessment, user)) return json({ message: "Forbidden" }, 403);

    return json({ assessment: sanitizeAssessmentForUser(assessment, user) });
  } catch (error) {
    console.error("Lab assessment fetch error:", error);
    return json({ message: "Failed to fetch Lab assessment", error: error.message }, 500);
  }
}

export async function DELETE(req, props) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") return json({ message: "Only interviewers can delete Lab assessments" }, 403);

    const { assessmentId } = await props.params;
    if (!isValidObjectId(assessmentId)) return json({ message: "Invalid assessmentId" }, 400);

    await connectDB();
    const assessment = await LabAssessment.findById(assessmentId);
    if (!assessment) return json({ message: "Assessment not found" }, 404);
    if (assessment.createdBy !== user.email) return json({ message: "Forbidden" }, 403);

    await LabAssessment.deleteOne({ _id: assessmentId });
    return json({ message: "Lab assessment deleted" });
  } catch (error) {
    console.error("Lab assessment delete error:", error);
    return json({ message: "Failed to delete Lab assessment", error: error.message }, 500);
  }
}
