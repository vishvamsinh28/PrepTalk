"use client";

import ProgressDashboard from "./ProgressDashboard";
import PageHeader, { SignedInAs, SectionHeading } from "./ui/PageHeader";

const roleCopy = {
  Interviewer: {
    description:
      "Create sessions, run live interviews, and submit structured reports on what you saw.",
  },
  Interviewee: {
    description:
      "Join the interviews assigned to you and read the report after each session.",
  },
};

export default function DashboardClient({ userData }) {
  const role = userData?.role;
  const copy = roleCopy[role];

  // Two rows, two real destinations — the old list had four links to one page
  const shortcuts =
    role === "Interviewer"
      ? [
          ["Interview workspace", "Create sessions, send invites, review reports", "/interviewer"],
          ["The Lab", "Build and assign coding screens", "/lab"],
        ]
      : [
          ["Interview workspace", "Assigned sessions and your feedback", "/interviewee"],
          ["The Lab", "Timed coding assessments", "/lab"],
        ];

  return (
    <div className="app-shell min-h-screen px-8 pb-24 pt-28">
      <div className="mx-auto max-w-[84rem]">
        <PageHeader
          eyebrow={role ? `${role} account` : "Dashboard"}
          title="Welcome back."
          description={
            copy?.description ||
            "Get set up and start running practice sessions that behave like the real thing."
          }
          meta={<SignedInAs email={userData?.email} />}
        />

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.55fr)] lg:gap-12">
          <section>
            <SectionHeading eyebrow="Shortcuts" title="Jump back in" />
            <ul>
              {shortcuts.map(([label, hint, href]) => (
                <li key={href} className="row-hair">
                  <a
                    href={href}
                    className="flex items-baseline justify-between gap-6 px-1 py-5"
                  >
                    <span>
                      <span className="app-h3 block">{label}</span>
                      <span className="mt-1 block text-sm text-ink-soft">{hint}</span>
                    </span>
                    <span aria-hidden="true" className="text-accent">
                      &rarr;
                    </span>
                  </a>
                </li>
              ))}
            </ul>

          </section>

          <aside>
            <SectionHeading eyebrow="Account" title="Details" />
            <dl className="text-sm">
              <div className="row-hair flex items-baseline justify-between gap-4 px-1 py-4">
                <dt className="text-ink-soft">Email</dt>
                <dd className="min-w-0 truncate text-ink">{userData?.email}</dd>
              </div>
              <div className="row-hair flex items-baseline justify-between gap-4 px-1 py-4">
                <dt className="text-ink-soft">Role</dt>
                <dd>
                  <span className="chip chip-accent">{role}</span>
                </dd>
              </div>
            </dl>
          </aside>
        </div>

        <section className="mt-20 border-t border-rule pt-14">
          <ProgressDashboard />
        </section>
      </div>
    </div>
  );
}
