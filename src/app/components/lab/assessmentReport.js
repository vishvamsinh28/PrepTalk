import { formatDateTime } from "./adminUtils";

/**
 * Stable identity for a submission (candidate email + timestamp).
 * @param {object} submission
 * @returns {string}
 */
export function submissionKey(submission) {
  return `${submission.candidateEmail}-${submission.attempts}-${submission.submittedAt}`;
}

/**
 * Overall pass/fail/partial status for one submission.
 * @param {object} submission
 * @returns {string}
 */
export function submissionResultStatus(submission) {
  if (!submission) return "Pending";
  if (Number(submission.totalTests) > 0 && Number(submission.passedTests) === Number(submission.totalTests)) return "Passed";
  return "Failed";
}

/**
 * Maps a submission status to its display tone.
 * @param {string} status
 * @returns {string}
 */
export function statusTone(status) {
  if (status === "Passed") return "border-emerald-600/40 bg-emerald-50 text-emerald-700";
  if (status === "Failed") return "border-rose-600/40 bg-rose-50 text-rose-700";
  return "border-amber-600/40 bg-amber-50 text-amber-700";
}

/**
 * Aggregates an assessment and its submissions into the report
 * structure the viewer and PDF share.
 * @param {object} assessment
 * @returns {object}
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
 * Renders the report as a minimal single-file PDF Blob (no deps).
 * @param {object} report
 * @returns {Blob}
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
 * Flattens the report into printable text lines for the PDF.
 * @param {object} report
 * @returns {string[]}
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
 * Hard-wraps one line to a maximum character width.
 * @param {string} line
 * @param {number} maxLength
 * @returns {string[]}
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
 * Escapes parentheses/backslashes for PDF string literals.
 * @param {string} value
 * @returns {string}
 */
export function escapePdf(value) {
  return String(value).replace(/[^\x20-\x7E]/g, "?").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * Finds the candidate's submitted code for a given problem.
 * @returns {string}
 */
export function findSubmittedCode(solutions, problem) {
  const match = (solutions || []).find((solution) => solution.problemIndex === problem.problemIndex || solution.title === problem.title);
  return match?.code || "";
}

/**
 * Filename-safe slug of a title.
 * @param {string} value
 * @returns {string}
 */
export function slugify(value) {
  return String(value || "assessment").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "assessment";
}

/**
 * Formats a date for a datetime-local input, in local time.
 * @param {unknown} value
 * @returns {string}
 */
export function toDateTimeLocalValue(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setSeconds(0, 0);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/**
 * Splits a comma-separated email string into trimmed entries.
 * @param {string} value
 * @returns {string[]}
 */
export function parseRecipientList(value) {
  return [...new Set(String(value || "").split(",").map((email) => email.trim()).filter(Boolean))];
}

/**
 * Deep clone of assessment problems for safe draft editing.
 * @param {object[]} problems
 * @returns {object[]}
 */
export function cloneAssessmentProblems(problems) {
  return (problems || []).map((problem) => ({
    ...problem,
    tests: (problem.tests || []).map((test) => ({ ...test })),
  }));
}
