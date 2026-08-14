/**
 * @file `/api/session/:id/workspace` — the shared notes and code pad.
 * Both roles read and write it; realtime mirroring happens over Ably, this is
 * only the durable copy.
 */

import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findSessionForUser } from "@/lib/sessionAccess";
import { normalizeText } from "@/lib/validation";

/**
 * Returns the session's saved workspace.
 * Falls back to empty strings when the session has never been written to, so
 * the client always gets both fields and never has to null-check them.
 * @param {import("next/server").NextRequest} req - Authenticated request.
 * @param {{ params: Promise<{ sessionId: string }> }} props - Route params; awaited per Next 15.
 * @returns {Promise<import("next/server").NextResponse>} 200 with `{ workspace }`;
 *   401 signed out; 404 when missing or not a participant; 500 otherwise.
 */
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

/**
 * Overwrites the session's workspace with the submitted notes and code.
 * A last-write-wins replace, not a merge — two participants typing at once will
 * clobber each other, which is why the client debounces and mirrors over Ably
 * rather than relying on this endpoint for concurrency.
 * @param {import("next/server").NextRequest} req - Body carries `{ notes, code }`.
 * @param {{ params: Promise<{ sessionId: string }> }} props - Route params; awaited per Next 15.
 * @returns {Promise<import("next/server").NextResponse>} 200 with the saved
 *   `{ workspace }` (notes capped at 20k chars, code at 40k); 401 signed out;
 *   404 when missing or not a participant; 500 otherwise.
 */
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
