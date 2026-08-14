"use client";

import { useEffect, useState } from "react";
import { deleteJson, getJson, patchJson, postJson } from "@/lib/clientApi";
import AdminAssessmentDetail from "./AdminAssessmentDetail";
import AdminCreateTest from "./AdminCreateTest";
import { Toast } from "./AdminShared";
import AdminTestBuilder from "./AdminTestBuilder";
import AdminTestList from "./AdminTestList";
import { blankProblem, customTemplate, roleTemplates } from "./adminTemplates";
/**
 * @file The interviewer's Lab dashboard. Owns all assessment data and CRUD, and
 * switches between the four admin views.
 */

import { cloneProblem, templateToForm, toWholeNumber, validateAssessmentForm } from "./adminUtils";

/**
 * State machine for the admin Lab: `list` → `create` → `builder` → `detail`.
 * A single `view` string drives which child renders, and every piece of state
 * lives here — the children are controlled and hold no data of their own.
 * `initialAssessmentId` is applied in a second effect rather than at mount,
 * because the assessments have to load before an id can be matched against
 * them; a deep link to an assessment this account can't see is simply ignored,
 * leaving the list view.
 * `customTemplate` is prepended to the template list so "start blank" reads
 * first in the picker.
 * @param {object} props - Component props.
 * @param {string} [props.initialAssessmentId=""] - Assessment to open on mount, from `?assessment=`.
 * @returns {JSX.Element} The active admin view.
 */
export default function LabAdminDashboard({ initialAssessmentId = "" }) {
  const [assessments, setAssessments] = useState([]);
  const [view, setView] = useState("list");
  const [selectedTemplateId, setSelectedTemplateId] = useState("backend");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(() => templateToForm(roleTemplates[0]));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    if (!initialAssessmentId || assessments.length === 0) return;
    if (assessments.some((assessment) => assessment._id === initialAssessmentId)) {
      setSelectedAssessmentId(initialAssessmentId);
      setView("detail");
    }
  }, [assessments, initialAssessmentId]);

  const allTemplates = [customTemplate, ...roleTemplates];
  const selectedAssessment = assessments.find((assessment) => assessment._id === selectedAssessmentId);
  const visibleAssessments = assessments.filter((assessment) => {
    const haystack = `${assessment.title} ${assessment.description} ${(assessment.candidates || []).join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const loadAssessments = async () => {
    const data = await getJson("/api/lab/assessments");
    setAssessments(data.assessments || []);
  };

  const chooseTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setForm(templateToForm(template));
  };

  const openAssessment = (assessmentId) => {
    setSelectedAssessmentId(assessmentId);
    setView("detail");
  };

  const exportAssessments = () => exportAssessmentsCsv(visibleAssessments);

  const startCreate = () => {
    setView("create");
    setMessage("");
    setError("");
  };

  const createAssessment = async () => {
    setMessage("");
    setError("");

    try {
      const validationError = validateAssessmentForm(form);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsSubmitting(true);
      const payload = buildAssessmentPayload(form);
      const data = await postJson("/api/lab/assessments", payload);
      setMessage(data.message || "Test created");
      await loadAssessments();
      setSelectedAssessmentId(data.assessment?._id || "");
      setView("detail");
    } catch (err) {
      setError(err.message || "Could not create test");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAssessment = async (assessmentId) => {
    setMessage("");
    setError("");

    try {
      const data = await deleteJson(`/api/lab/assessments/${assessmentId}`);
      setMessage(data.message || "Test deleted");
      await loadAssessments();
      if (selectedAssessmentId === assessmentId) {
        setSelectedAssessmentId("");
        setView("list");
      }
    } catch (err) {
      setError(err.message || "Could not delete test");
    }
  };

  const updateAssessment = async (assessmentId, patch) => {
    setMessage("");
    setError("");

    try {
      const data = await patchJson(`/api/lab/assessments/${assessmentId}`, patch);
      setMessage(data.message || "Lab assessment updated");
      await loadAssessments();
      setSelectedAssessmentId(data.assessment?._id || assessmentId);
    } catch (err) {
      setError(err.message || "Could not update assessment");
    }
  };

  const updateProblem = (index, patch) => {
    setForm((previous) => ({
      ...previous,
      problems: previous.problems.map((problem, problemIndex) => (
        problemIndex === index ? { ...problem, ...patch } : problem
      )),
    }));
  };

  const updateTest = (problemIndex, testIndex, patch) => {
    setForm((previous) => ({
      ...previous,
      problems: previous.problems.map((problem, currentProblemIndex) => (
        currentProblemIndex === problemIndex
          ? {
              ...problem,
              tests: problem.tests.map((test, currentTestIndex) => (
                currentTestIndex === testIndex ? { ...test, ...patch } : test
              )),
            }
          : problem
      )),
    }));
  };

  const addProblem = () => {
    setForm((previous) => ({
      ...previous,
      durationMinutes: toWholeNumber(previous.durationMinutes, 0) + blankProblem.timeLimitMinutes,
      problems: [...previous.problems, cloneProblem(blankProblem)],
    }));
  };

  const removeProblem = (problemIndex) => {
    setForm((previous) => {
      const removed = previous.problems[problemIndex];
      return {
        ...previous,
        durationMinutes: Math.max(1, toWholeNumber(previous.durationMinutes, 0) - toWholeNumber(removed?.timeLimitMinutes, 0)),
        problems: previous.problems.filter((_, index) => index !== problemIndex),
      };
    });
  };

  const addTest = (problemIndex) => {
    const problem = form.problems[problemIndex];
    updateProblem(problemIndex, {
      tests: [
        ...problem.tests,
        { name: `Test Case ${problem.tests.length + 1}`, inputJson: "[]", expectedJson: "null", visible: true },
      ],
    });
  };

  const removeTest = (problemIndex, testIndex) => {
    updateProblem(problemIndex, {
      tests: form.problems[problemIndex].tests.filter((_, index) => index !== testIndex),
    });
  };

  return (
    <div className="app-shell relative min-h-screen overflow-x-hidden px-4 pb-6 pt-20 text-ink sm:px-5 lg:overflow-hidden lg:pb-8 lg:pt-24">
      <div className="soft-grid absolute inset-0 opacity-60" />
      {error && (
        <div className="relative z-10 mx-auto mb-4 flex max-w-7xl flex-col items-end gap-3">
          {error && <Toast tone="error" text={error} />}
        </div>
      )}

      {view === "list" && (
        <AdminTestList
          assessments={visibleAssessments}
          query={query}
          setQuery={setQuery}
          onCreate={startCreate}
          onDelete={deleteAssessment}
          onExport={exportAssessments}
          onOpen={openAssessment}
        />
      )}

      {view === "create" && (
        <AdminCreateTest
          form={form}
          roleTemplates={allTemplates}
          selectedTemplateId={selectedTemplateId}
          onBack={() => setView("list")}
          onChooseTemplate={chooseTemplate}
          onContinue={() => setView("builder")}
        />
      )}

      {view === "builder" && (
        <AdminTestBuilder
          form={form}
          isSubmitting={isSubmitting}
          onAddProblem={addProblem}
          onAddTest={addTest}
          onBack={() => setView("create")}
          onCreate={createAssessment}
          onRemoveProblem={removeProblem}
          onRemoveTest={removeTest}
          onSetForm={setForm}
          onUpdateProblem={updateProblem}
          onUpdateTest={updateTest}
        />
      )}

      {view === "detail" && selectedAssessment && (
        <AdminAssessmentDetail
          assessment={selectedAssessment}
          notice={message}
          onBack={() => setView("list")}
          onDelete={() => deleteAssessment(selectedAssessment._id)}
          onUpdate={updateAssessment}
        />
      )}
    </div>
  );
}
