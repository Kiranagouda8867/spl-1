import React, { useEffect, useState } from 'react';
import { Upload, Clock, CheckCircle } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, StatusBadge } from '../../components/ui';
import { submissionsService } from '../../services';

export default function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsService.getMine().then((r) => setSubmissions(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading submissions..." />;

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Submissions" subtitle="View history of all your submitted assignments." />
      {submissions.length === 0 ? (
        <EmptyState icon={Upload} title="No submissions yet" description="Submit an assignment to see it here." />
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s._id} className="glass p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{s.assignment?.title}</h3>
                  <p className="text-slate-400 text-sm">{s.course?.name}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-slate-500">Submitted</p>
                  <p className="text-slate-300">{new Date(s.submittedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Version</p>
                  <p className="text-slate-300">v{s.currentVersion}</p>
                </div>
                <div>
                  <p className="text-slate-500">Deadline</p>
                  <p className={s.isLate ? 'text-red-400' : 'text-slate-300'}>
                    {new Date(s.assignment?.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">File</p>
                  <p className="text-slate-300 truncate">
                    {s.versions?.[s.versions.length - 1]?.originalName || '—'}
                  </p>
                </div>
              </div>
              {s.status === 'graded' && s.evaluation && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Grade</span>
                  <span className="text-teal-400 font-bold">{s.evaluation.marks}/{s.assignment?.maxMarks}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
