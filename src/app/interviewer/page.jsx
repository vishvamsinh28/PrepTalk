import { getCurrentUser } from "@/lib/serverAuth";
import CreateSessionForm from "../components/CreateSessionForm";
import SessionList from "../components/SessionList";
import ReportList from "../components/ReportList";
import AuthState from "../components/AuthState";
/** @file `/interviewer` — the interviewer's workspace: create sessions, manage them, review reports. */

import PageHeader, { SignedInAs, SectionHeading } from "../components/ui/PageHeader";

/**
 * Interviewer workspace, gated to the Interviewer role.
 * Interviewees reaching this URL get an access notice rather than a redirect,
 * so a mistyped or shared link explains itself instead of bouncing silently.
 * The session list is sticky beside the create form on wide screens, so a new
 * session appears without scrolling away from what you just filled in.
 * @returns {Promise<JSX.Element>} The workspace, or an auth notice.
 */
export default async function InterviewerPage() {
  const userData = await getCurrentUser();

  if (!userData) {
    return <AuthState title="Invalid token." message="Please login again to continue." />;
  }

  if (userData.role !== "Interviewer") {
    return <AuthState title="Access denied." message="This page is restricted to Interviewers only." />;
  }

  return (
    <div className="app-shell min-h-screen px-8 pb-24 pt-28">
      <div className="mx-auto max-w-[84rem]">
        <PageHeader
          eyebrow="Interviewer workspace"
          title="Run better interviews"
          description="Create sessions, send invites, generate question banks, and review reports from one place."
          meta={<SignedInAs email={userData.email} />}
        />

        <div className="mt-14 grid gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.7fr)] xl:items-start xl:gap-12">
          <section id="create-session">
            <CreateSessionForm />
          </section>

          <section id="sessions" className="xl:sticky xl:top-28">
            <SectionHeading eyebrow="Manage" title="Your sessions" />
            <SessionList compact />
          </section>
        </div>

        <section id="reports" className="mt-20 border-t border-rule pt-14">
          <SectionHeading eyebrow="Review" title="Submitted reports" />
          <ReportList />
        </section>
      </div>
    </div>
  );
}
