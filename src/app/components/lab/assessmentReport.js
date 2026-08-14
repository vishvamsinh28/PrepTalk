/**
 * @file Assessment reporting: aggregation, and a dependency-free PDF writer.
 * The PDF is built by hand rather than with jsPDF/pdfmake to keep the client
 * bundle small — the tradeoff is ASCII-only text and fixed-pitch layout.
 */

import { formatDateTime } from "./adminUtils";

/**
 * Stable React key for a submission: email, attempt number, and timestamp.
 * All three are needed — one candidate can submit repeatedly, and attempt
 * number alone repeats across candidates.
 * @param {object} submission - Submission record.
 * @returns {string} Composite key.
 */
export function submissionKey(submission) {
  return `${submission.candidateEmail}-${submission.attempts}-${submission.submittedAt}`;
}

/**
 * Overall pass/fail status for one submission.
 * Only an all-tests-pass run counts as `"Passed"`; partial credit still reads
 * `"Failed"`, since the badge answers "did this clear the bar", not "what score".
 * A submission with zero tests also reads `"Failed"` rather than `"Passed"`.
 * @param {object|null} submission - Submission record, or null when not yet attempted.
 * @returns {string} `"Passed"`, `"Failed"`, or `"Pending"` when absent.
 */
export function submissionResultStatus(submission) {
  if (!submission) return "Pending";
  if (Number(submission.totalTests) > 0 && Number(submission.passedTests) === Number(submission.totalTests)) return "Passed";
  return "Failed";
}

/**
 * Maps a submission status to its Tailwind badge classes.
 * Anything unrecognized falls through to the amber "pending" tone, so a new
 * status renders neutrally rather than unstyled.
 * @param {string} status - Value from `submissionResultStatus`.
 * @returns {string} Tailwind class string.
 */
export function statusTone(status) {
  if (status === "Passed") return "border-emerald-600/40 bg-emerald-50 text-emerald-700";
  if (status === "Failed") return "border-rose-600/40 bg-rose-50 text-rose-700";
  return "border-amber-600/40 bg-amber-50 text-amber-700";
}

/**
 * Aggregates an assessment and its submissions into one report structure.
 * Test inputs and expectations are pulled from the *assessment* by index while
 * results come from the submission, because graded results don't carry the
 * original JSON. That pairing is positional, so editing a problem's tests after
 * submission will misalign this against older runs.
 * Only interviewers should call this — it exposes hidden tests and every
 * candidate's code.
 * @param {object} assessment - Full assessment document with `submissions`.
 * @returns {object} Report shared by the on-screen viewer and the PDF writer.
 */
export function buildAssessmentReport(assessment) {
  return {
    assessmentId: assessment._id,
    title: assessment.title,
    durationMinutes: assessment.durationMinutes,
    candidates: assessment.candidates || [],
    generatedAt: new Date().toISOString(),
    submissions: (assessment.submissions || []).map((submission) => ({
      candidateEmail: submission.candidateEmail,
      attempts: submission.attempts,
      resultStatus: submissionResultStatus(submission),
      submittedAt: submission.submittedAt,
      score: submission.score,
      maxScore: submission.maxScore,
      passedTests: submission.passedTests,
      totalTests: submission.totalTests,
      runtimeMs: submission.runtimeMs,
      sections: (submission.problemResults || []).map((problem) => ({
        problemIndex: problem.problemIndex,
        title: problem.title,
        score: problem.score,
        maxScore: problem.maxScore,
        code: problem.code || findSubmittedCode(submission.solutions, problem),
        tests: (problem.tests || []).map((test, testIndex) => {
          const sourceTest = assessment.problems?.[problem.problemIndex]?.tests?.[testIndex] || {};
          return {
            name: test.name,
            visible: Boolean(test.visible),
            passed: Boolean(test.passed),
            duration: test.duration,
            error: test.error || "",
            inputJson: sourceTest.inputJson || "",
            expectedJson: sourceTest.expectedJson || "",
            output: test.output ?? null,
          };
        }),
      })),
    })),
  };
}

/**
 * Renders the report as a PDF, writing the file format by hand.
 * Emits one Page plus one content-stream object per page, which is why object
 * ids advance by two (`3 + pageIndex * 2`) and why the xref table is built from
 * running byte offsets — a wrong offset makes readers reject the file.
 * Courier is used because it is a PDF base-14 font (no embedding needed) and
 * monospaced, so submitted code keeps its indentation.
 * Layout is fixed at 45 lines per page and 92 characters per line, tuned for
 * 10pt Courier on US Letter.
 * @param {object} report - Output of `buildAssessmentReport`.
 * @returns {Blob} `application/pdf` blob ready for a download link.
 */
export function createReportPdf(report) {
  const lines = reportLines(report).flatMap((line) => wrapLine(line, 92));
  const pages = [];
  for (let index = 0; index < lines.length; index += 45) {
    pages.push(lines.slice(index, index + 45));
  }
  if (pages.length === 0) pages.push(["No submissions yet."]);

  const objects = ["<< /Type /Catalog /Pages 2 0 R >>"];
  const pageRefs = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");
  objects.push(`<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectId = 3 + pageIndex * 2;
    const contentObjectId = pageObjectId + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >> /Contents ${contentObjectId} 0 R >>`);
    const content = `BT /F1 10 Tf 50 750 Td 14 TL ${pageLines.map((line) => `(${escapePdf(line)}) Tj T*`).join(" ")} ET`;
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

/**
 * Flattens the report into printable lines, indented by nesting depth.
 * Indentation is plain spaces because the PDF writer has no layout engine — two
 * spaces per level is the whole hierarchy.
 * Includes hidden tests and full candidate code, so the result is
 * interviewer-only material.
 * @param {object} report - Output of `buildAssessmentReport`.
 * @returns {string[]} Lines, pre-wrap; `createReportPdf` wraps and paginates them.
 */
export function reportLines(report) {
  const lines = [
    `PrepTalk Lab Report`,
    `Assessment: ${report.title}`,
    `Assessment ID: ${report.assessmentId}`,
    `Duration: ${report.durationMinutes} mins`,
    `Generated: ${formatDateTime(report.generatedAt)}`,
    "",
  ];

  for (const submission of report.submissions) {
    lines.push(`Candidate: ${submission.candidateEmail}`);
    lines.push(`Status: Submitted / ${submission.resultStatus}`);
    lines.push(`Attempt: ${submission.attempts} | Score: ${submission.score}/${submission.maxScore} | Tests: ${submission.passedTests}/${submission.totalTests}`);
    lines.push(`Submitted: ${formatDateTime(submission.submittedAt)}`);
    for (const section of submission.sections) {
      lines.push(`  Q${section.problemIndex + 1}: ${section.title} (${section.score}/${section.maxScore})`);
      lines.push(`  Code:`);
      String(section.code || "No code submitted.").split("\n").forEach((line) => lines.push(`    ${line}`));
      section.tests.forEach((test) => {
        lines.push(`  Test: ${test.name} | ${test.passed ? "Passed" : "Failed"} | visible=${test.visible}`);
        if (test.error) lines.push(`    Error: ${test.error}`);
      });
    }
    lines.push("");
  }

  return lines;
}

/**
 * Hard-wraps a line to a fixed character width.
 * Splits mid-word by design: the content is mostly code, where breaking at
 * spaces would misrepresent the source more than a hard cut does.
 * @param {string} line - Line to wrap.
 * @param {number} maxLength - Maximum characters per chunk.
 * @returns {string[]} One entry when it already fits, otherwise fixed-width chunks.
 */
export function wrapLine(line, maxLength) {
  const text = String(line);
  if (text.length <= maxLength) return [text];
  const chunks = [];
  for (let index = 0; index < text.length; index += maxLength) {
    chunks.push(text.slice(index, index + maxLength));
  }
  return chunks;
}

/**
 * Escapes a string for a PDF literal.
 * Parentheses and backslashes are the delimiters of PDF strings, so both must be
 * escaped — and backslashes first, or the escapes we add would be re-escaped.
 * KNOWN LIMITATION: non-ASCII is replaced with `?`, because Courier's base-14
 * encoding has no glyphs for it. Accented names and non-Latin text will be
 * mangled in the PDF; embedding a Unicode font is the only real fix.
 * @param {string} value - Raw text.
 * @returns {string} ASCII-safe, escaped text.
 */
export function escapePdf(value) {
  return String(value).replace(/[^\x20-\x7E]/g, "?").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * Recovers a candidate's code for a problem when the graded result omits it.
 * Matches on index first, then title, because older submissions were stored
 * before `problemIndex` was recorded — the title match is that fallback and
 * will misfire if two sections share a title.
 * @param {object[]|null} solutions - Raw solutions stored with the submission.
 * @param {object} problem - Graded problem result, supplying index and title.
 * @returns {string} The submitted code, or `""` when no match is found.
 */
export function findSubmittedCode(solutions, problem) {
  const match = (solutions || []).find((solution) => solution.problemIndex === problem.problemIndex || solution.title === problem.title);
  return match?.code || "";
}

/**
 * Builds a filename-safe slug for the downloaded report.
 * Falls back to `"assessment"` twice — for nullish input, and again when the
 * title is entirely non-alphanumeric and reduces to an empty string.
 * @param {string} value - Assessment title.
 * @returns {string} Lowercase hyphenated slug; never empty.
 */
export function slugify(value) {
  return String(value || "assessment").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "assessment";
}

/**
 * Formats a date for a `datetime-local` input, in local time.
 * Subtracts the timezone offset before slicing because `toISOString` emits UTC
 * while the input renders local — without it the field shows a shifted time.
 * Duplicates `defaultDeadlineInputValue` in `adminUtils`; worth sharing one.
 * @param {unknown} value - Date or ISO string.
 * @returns {string} `YYYY-MM-DDTHH:mm`, or `""` when unparseable.
 */
export function toDateTimeLocalValue(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setSeconds(0, 0);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/**
 * Splits a comma-separated email string into unique, trimmed entries.
 * Deduplicates but does not validate — addresses are checked server-side.
 * @param {string} value - Comma-separated emails.
 * @returns {string[]} Unique, non-empty entries.
 */
export function parseRecipientList(value) {
  return [...new Set(String(value || "").split(",").map((email) => email.trim()).filter(Boolean))];
}

/**
 * Clones assessment problems two levels deep for draft editing.
 * Same depth as `cloneProblem` in `adminUtils`, applied to a whole array, so
 * edits to a draft never write through to the fetched assessment.
 * @param {object[]|null} problems - Problems from a fetched assessment.
 * @returns {object[]} Independent copies; `[]` for nullish input.
 */
export function cloneAssessmentProblems(problems) {
  return (problems || []).map((problem) => ({
    ...problem,
    tests: (problem.tests || []).map((test) => ({ ...test })),
  }));
}
