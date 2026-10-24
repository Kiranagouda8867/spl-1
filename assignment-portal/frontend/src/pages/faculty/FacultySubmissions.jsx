import React, { useEffect, useState } from 'react';
import { FileText, Download, Award, Search, Filter, CheckCircle, Clock } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, StatusBadge, GlassCard, GradientButton, FormField, Modal } from '../../components/ui';
import { assignmentsService, submissionsService, evaluationsService } from '../../services';
import { useToast } from '../../contexts/ToastContext';

export default function FacultySubmissions() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Grading Modal State
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignmentId) {
      fetchSubmissions(selectedAssignmentId);
    } else {
      setSubmissions([]);
    }
  }, [selectedAssignmentId, statusFilter]);

  const fetchAssignments = async () => {
    try {
      const res = await assignmentsService.list();
      const list = res.data.assignments || res.data || [];
      setAssignments(list);
      if (list.length > 0) {
        setSelectedAssignmentId(list[0]._id);
      }
    } catch (err) {
      showToast('error', 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    setSubmissionsLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await submissionsService.getForAssignment(assignmentId, params);
      setSubmissions(res.data.submissions || res.data || []);
    } catch (err) {
      showToast('error', 'Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const openGradingModal = async (sub) => {
    setGradingSubmission(sub);
    setMarks('');
    setFeedback('');
    try {
      const evalRes = await evaluationsService.getForSubmission(sub._id);
      if (evalRes.data?.data) {
        setMarks(evalRes.data.data.marks ?? '');
        setFeedback(evalRes.data.data.feedback || '');
      }
    } catch (e) {
      // Not evaluated yet
    }
    setGradingModalOpen(true);
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    const currentAssignment = assignments.find((a) => a._id === selectedAssignmentId);
    const numMarks = parseFloat(marks);

    if (isNaN(numMarks) || numMarks < 0) {
      showToast('warning', 'Please enter a valid positive number for marks');
      return;
    }
    if (currentAssignment && numMarks > currentAssignment.maxMarks) {
      showToast('warning', `Marks cannot exceed max marks of ${currentAssignment.maxMarks}`);
      return;
    }

    setSubmittingGrade(true);
    try {
      await evaluationsService.grade({
        submissionId: gradingSubmission._id,
        marks: numMarks,
        feedback,
      });
      showToast('success', 'Grade and feedback saved successfully!');
      setGradingModalOpen(false);
      fetchSubmissions(selectedAssignmentId);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save grade');
    } finally {
      setSubmittingGrade(false);
    }
  };

  const handleExportCSV = async () => {
    if (!selectedAssignmentId) return;
    try {
      const res = await evaluationsService.exportCSV(selectedAssignmentId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `evaluations_${selectedAssignmentId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('success', 'Grades exported to CSV successfully!');
    } catch (err) {
      showToast('error', 'Failed to export CSV');
    }
  };

  const handleDownloadFile = (submissionId) => {
    window.open(submissionsService.downloadUrl(submissionId), '_blank');
  };

  const currentAssignment = assignments.find((a) => a._id === selectedAssignmentId);

  const filteredSubmissions = submissions.filter((sub) => {
    const studentName = sub.student?.name?.toLowerCase() || '';
    const studentEmail = sub.student?.email?.toLowerCase() || '';
    const studentId = sub.student?.studentId?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return studentName.includes(search) || studentEmail.includes(search) || studentId.includes(search);
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Student Submissions"
        subtitle="Review student submissions, download source files, and grade assignments"
        action={
          currentAssignment && (
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 text-sm font-medium transition flex items-center gap-2"
            >
              <Download size={16} />
              Export Grades CSV
            </button>
          )
        }
      />

      {loading ? (
        <LoadingState message="Loading assignments..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments available"
          description="Create assignments in your courses first before inspecting submissions."
        />
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
              <label className="text-slate-400 text-sm whitespace-nowrap">Assignment:</label>
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                className="input-glass text-sm py-2 px-3 w-full sm:w-64"
              >
                {assignments.map((a) => (
                  <option key={a._id} value={a._id} className="bg-navy-900 text-white">
                    {a.title} ({a.course?.code || 'Course'})
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-glass text-sm py-2 px-3 w-full sm:w-40"
              >
                <option value="" className="bg-navy-900 text-white">All Statuses</option>
                <option value="submitted" className="bg-navy-900 text-white">Submitted</option>
                <option value="late" className="bg-navy-900 text-white">Late</option>
                <option value="graded" className="bg-navy-900 text-white">Graded</option>
              </select>
            </div>

            <div className="w-full md:w-72 relative">
              <input
                type="text"
                placeholder="Search student or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-glass text-sm py-2 pl-9 pr-3 w-full"
              />
              <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </GlassCard>

          {/* Submissions List */}
          {submissionsLoading ? (
            <LoadingState message="Fetching student submissions..." />
          ) : filteredSubmissions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No submissions found"
              description="No student has submitted work matching the current filters."
            />
          ) : (
            <div className="glass-panel overflow-hidden border border-teal-500/10 rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Version</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSubmissions.map((sub) => {
                      const latestVersion = sub.versions?.[sub.versions.length - 1] || {};
                      return (
                        <tr key={sub._id} className="hover:bg-white/5 transition">
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{sub.student?.name || 'Unknown Student'}</div>
                            <div className="text-xs text-slate-400">{sub.student?.email} {sub.student?.studentId ? `• ${sub.student.studentId}` : ''}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs">
                              v{sub.currentVersion}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400">
                            {new Date(sub.submittedAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={sub.status} />
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleDownloadFile(sub._id)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs inline-flex items-center gap-1.5 transition"
                              title="Download File"
                            >
                              <Download size={14} />
                              Download
                            </button>
                            <button
                              onClick={() => openGradingModal(sub)}
                              className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-xs font-medium inline-flex items-center gap-1.5 transition"
                            >
                              <Award size={14} />
                              {sub.status === 'graded' ? 'Regrade' : 'Grade'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grade Modal */}
      <Modal
        isOpen={gradingModalOpen}
        onClose={() => setGradingModalOpen(false)}
        title={`Grade Submission — ${gradingSubmission?.student?.name || 'Student'}`}
      >
        <form onSubmit={handleSaveGrade} className="space-y-4">
          <FormField
            label={`Marks (Max: ${currentAssignment?.maxMarks || 100})`}
            required
          >
            <input
              type="number"
              step="0.5"
              min="0"
              max={currentAssignment?.maxMarks || 100}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder="e.g. 85"
              className="input-glass"
              required
            />
          </FormField>

          <FormField label="Feedback & Comments">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback for the student..."
              rows={4}
              className="input-glass"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setGradingModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-sm hover:bg-white/10"
            >
              Cancel
            </button>
            <GradientButton
              type="submit"
              loading={submittingGrade}
            >
              Submit Grade
            </GradientButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
