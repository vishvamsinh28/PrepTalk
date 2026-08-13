"use client";

import { useEffect, useState } from "react";
import { deleteJson, getJson, patchJson, postJson } from "@/lib/clientApi";
import AdminAssessmentDetail from "./AdminAssessmentDetail";
import AdminCreateTest from "./AdminCreateTest";
import { Toast } from "./AdminShared";
import AdminTestBuilder from "./AdminTestBuilder";
import AdminTestList from "./AdminTestList";
import { blankProblem, customTemplate, roleTemplates } from "./adminTemplates";
import { cloneProblem, parseSkillList, templateToForm, toWholeNumber, validateAssessmentForm } from "./adminUtils";

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

  const exportAssessments = () => {
    const rows = [
      ["Title", "Candidates", "Sections", "Duration", "Submissions"],
      ...visibleAssessments.map((assessment) => [
        assessment.title,
        (assessment.candidates || []).join("; "),
        assessment.problems?.length || 0,
        assessment.durationMinutes,
        assessment.submissions?.length || 0,
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "preptalk-lab-tests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

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
      const totalProblemMinutes = form.problems.reduce((total, problem) => total + toWholeNumber(problem.timeLimitMinutes, 30), 0);
      const payload = {
        ...form,
        candidates: form.candidates.split(",").map((email) => email.trim()).filter(Boolean),
        coreSkills: parseSkillList(form.coreSkills),
        deadlineAt: form.deadlineAt,
        durationMinutes: totalProblemMinutes,
        problems: form.problems.map((problem) => ({
          ...problem,
          points: toWholeNumber(problem.points, 100),
          timeLimitMinutes: toWholeNumber(problem.timeLimitMinutes, 30),
        })),
      };
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
