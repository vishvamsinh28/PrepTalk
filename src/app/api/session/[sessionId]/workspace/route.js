import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findSessionForUser } from "@/lib/sessionAccess";
import { normalizeText } from "@/lib/validation";

export async function GET(req, props) {
  try {
    const { sessionId } = await props.params;
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);

    await connectDB();
    const session = await findSessionForUser(sessionId, user);
    if (!session) return json({ message: "Session not found" }, 404);

    return json({ workspace: session.workspace || { notes: "", code: "" } });
  } catch (error) {
    console.error("Workspace fetch error:", error);
    return serverError("Failed to fetch workspace");
  }
}

export async function PATCH(req, props) {
  try {
    const { sessionId } = await props.params;
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);

    const { notes, code } = await req.json();
    await connectDB();
    const session = await findSessionForUser(sessionId, user);
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
    return serverError("Failed to save workspace");
  }
}
