import React, { useEffect, useState } from 'react';
import { BarChart3, Award, TrendingUp, Download, CheckCircle, Clock } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, StatCard, GlassCard } from '../../components/ui';
import { assignmentsService, evaluationsService } from '../../services';
import { useToast } from '../../contexts/ToastContext';

export default function FacultyGrades() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evalsLoading, setEvalsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignmentId) {
      fetchEvaluations(selectedAssignmentId);
    }
  }, [selectedAssignmentId]);

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

  const fetchEvaluations = async (assignmentId) => {
    setEvalsLoading(true);
    try {
      const res = await evaluationsService.getForAssignment(assignmentId);
      const rawEvals = res.data?.data || res.data?.evaluations || [];
      setEvaluations(Array.isArray(rawEvals) ? rawEvals : []);
    } catch (err) {
      showToast('error', 'Failed to load grading details');
    } finally {
      setEvalsLoading(false);
    }
  };

  const currentAssignment = assignments.find((a) => a._id === selectedAssignmentId);

  const totalEvaluated = evaluations.length;
  const avgMarks = totalEvaluated > 0
    ? (evaluations.reduce((acc, curr) => acc + (curr.marks || 0), 0) / totalEvaluated).toFixed(1)
    : 0;
  const maxScore = totalEvaluated > 0 ? Math.max(...evaluations.map((e) => e.marks || 0)) : 0;
  const minScore = totalEvaluated > 0 ? Math.min(...evaluations.map((e) => e.marks || 0)) : 0;

  const handleExportCSV = async () => {
    if (!selectedAssignmentId) return;
    try {
      const res = await evaluationsService.exportCSV(selectedAssignmentId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `grades_${selectedAssignmentId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('success', 'Grades exported to CSV');
    } catch (err) {
      showToast('error', 'Failed to export CSV');
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Grading Analytics & Reports"
        subtitle="Track class performance, grade distribution, and feedback summary"
        action={
          currentAssignment && (
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 text-sm font-medium transition flex items-center gap-2"
            >
              <Download size={16} />
              Export Gradebook
            </button>
          )
        }
      />

      {loading ? (
        <LoadingState message="Loading grading dashboard..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No assignments to analyze"
          description="Create assignments to review grades and analytics."
        />
      ) : (
        <div className="space-y-6">
          <GlassCard className="p-4 flex items-center gap-3">
            <label className="text-slate-400 text-sm font-medium">Select Assignment:</label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="input-glass text-sm py-2 px-3 sm:w-80"
            >
              {assignments.map((a) => (
                <option key={a._id} value={a._id} className="bg-navy-900 text-white">
                  {a.title} ({a.course?.code || 'Course'})
                </option>
              ))}
            </select>
          </GlassCard>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={CheckCircle}
              label="Graded Submissions"
              value={totalEvaluated}
              sub={`Out of registered students`}
              color="teal"
            />
            <StatCard
              icon={TrendingUp}
              label="Class Average"
              value={avgMarks}
              sub={`Max: ${currentAssignment?.maxMarks || 100}`}
              color="violet"
            />
            <StatCard
              icon={Award}
              label="Highest Score"
              value={maxScore}
              sub={`Top performer`}
              color="emerald"
            />
            <StatCard
              icon={Clock}
              label="Lowest Score"
              value={minScore}
              sub={`Passing benchmark`}
              color="amber"
            />
          </div>

          {/* Evaluations Table */}
          {evalsLoading ? (
            <LoadingState message="Fetching evaluations..." />
          ) : evaluations.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No graded submissions"
              description="Submissions for this assignment haven't been evaluated yet. Go to Submissions to grade them."
            />
          ) : (
            <div className="glass-panel overflow-hidden border border-teal-500/10 rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Marks Awarded</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Feedback</th>
                      <th className="py-3 px-4">Graded Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {evaluations.map((ev) => {
                      const max = currentAssignment?.maxMarks || 100;
                      const pct = Math.round(((ev.marks || 0) / max) * 100);
                      return (
                        <tr key={ev._id} className="hover:bg-white/5 transition">
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{ev.student?.name || 'Student'}</div>
                            <div className="text-xs text-slate-400">{ev.student?.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-teal-400">{ev.marks}</span>
                            <span className="text-xs text-slate-500"> / {max}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-navy-950 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-400 to-violet-400"
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-slate-300">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400 max-w-xs truncate">
                            {ev.feedback || <span className="text-slate-600 italic">No written feedback</span>}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400">
                            {new Date(ev.gradedAt || ev.createdAt).toLocaleDateString()}
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
    </div>
  );
}
