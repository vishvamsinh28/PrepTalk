import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findSessionForUser } from "@/lib/sessionAccess";
import { normalizeText } from "@/lib/validation";

export async function GET(req, props) {
  try {
    const { sessionId } = await props.params;
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);

    const { searchParams } = new URL(req.url);
    await connectDB();
    const session = await findSessionForUser(sessionId, user, searchParams.get("invite"));
    if (!session) return json({ message: "Session not found" }, 404);

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
    const session = await findSessionForUser(sessionId, user, inviteCode);
    if (!session) return json({ message: "Session not found" }, 404);

    const workspace = {
      notes: normalizeText(notes, 20000),
      code: normalizeText(code, 40000),
    };
    session.workspace = workspace;
    await session.save();

    return json({ workspace });
  } catch (error) {
    console.error("Workspace save error:", error);
    return json({ message: "Failed to save workspace", error: error.message }, 500);
  }
}
