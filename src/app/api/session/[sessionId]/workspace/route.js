import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Session from "@/models/Session";

function canAccess(session, user, inviteCode) {
  if (session.createdBy === user.email) return true;
  if (session.interviewees?.includes(user.email)) return true;
  return Boolean(inviteCode && session.inviteCode && inviteCode === session.inviteCode);
}

export async function GET(req, props) {
  try {
    const { sessionId } = await props.params;
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);

    const { searchParams } = new URL(req.url);
    await connectDB();
    const session = await Session.findById(sessionId);
    if (!session) return json({ message: "Session not found" }, 404);
    if (!canAccess(session, user, searchParams.get("invite"))) return json({ message: "Forbidden" }, 403);

    return json({ workspace: session.workspace || { notes: "", code: "" } });
  } catch (error) {
    console.error("Workspace fetch error:", error);
    return json({ message: "Failed to fetch workspace", error: error.message }, 500);
  }
}

export async function PATCH(req, props) {
  try {
    const { sessionId } = await props.params;
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);

    const { notes, code, inviteCode } = await req.json();
    await connectDB();
    const session = await Session.findById(sessionId);
    if (!session) return json({ message: "Session not found" }, 404);
    if (!canAccess(session, user, inviteCode)) return json({ message: "Forbidden" }, 403);

    const workspace = {
      notes: String(notes || ""),
      code: String(code || ""),
    };
    await Session.findByIdAndUpdate(sessionId, { $set: { workspace } }, { runValidators: false });

    return json({ workspace });
  } catch (error) {
    console.error("Workspace save error:", error);
    return json({ message: "Failed to save workspace", error: error.message }, 500);
  }
}
