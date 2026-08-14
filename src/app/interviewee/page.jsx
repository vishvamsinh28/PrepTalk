import { getCurrentUser } from "@/lib/serverAuth";
import IntervieweeSessionList from "../components/IntervieweeSessionList";
import ReportList from "../components/ReportList";
import AuthState from "../components/AuthState";
/** @file `/interviewee` — the candidate's workspace: assigned sessions and their feedback. */

import PageHeader, { SignedInAs, SectionHeading } from "../components/ui/PageHeader";

/**
 * Candidate workspace, gated to the Interviewee role.
 * Mirrors the interviewer page minus anything authoring-related — no create
 * form, and `ReportList` renders read-only for this role.
 * @returns {Promise<JSX.Element>} The workspace, or an auth notice.
 */
export default async function IntervieweePage() {
  const userData = await getCurrentUser();

  if (!userData) {
    return <AuthState title="Invalid token." message="Please login again to continue." />;
  }

  if (userData.role !== "Interviewee") {
    return <AuthState title="Access denied." message="This page is restricted to Interviewees only." />;
  }

  return (
    <div className="app-shell min-h-screen px-8 pb-24 pt-28">
      <div className="mx-auto max-w-[84rem]">
        <PageHeader
          eyebrow="Interviewee workspace"
          title="Your practice room"
          description="Join the sessions assigned to you, read the prep material, and track what changed between rounds."
          meta={<SignedInAs email={userData.email} />}
        />

        <section className="mt-14">
          <SectionHeading eyebrow="Assigned" title="Your sessions" />
          <IntervieweeSessionList />
        </section>

        <section className="mt-20 border-t border-rule pt-14">
          <SectionHeading eyebrow="Feedback" title="Your reports" />
          <ReportList />
        </section>
      </div>
    </div>
  );
}
