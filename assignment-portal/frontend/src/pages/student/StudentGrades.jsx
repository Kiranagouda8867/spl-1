import React, { useEffect, useState } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, StatusBadge } from '../../components/ui';
import { evaluationsService } from '../../services';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export default function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    evaluationsService.getMine().then((r) => setGrades(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading grades..." />;

  const avg = grades.length
    ? Math.round(grades.reduce((sum, g) => sum + (g.marks / g.assignment?.maxMarks) * 100, 0) / grades.length)
    : null;

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Grades" subtitle="View marks and feedback from your faculty." />

      {avg !== null && (
        <div className="glass p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-violet-500/20 border border-teal-500/20 flex items-center justify-center">
            <TrendingUp size={24} className="text-teal-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Overall Average</p>
            <p className="text-3xl font-bold gradient-text">{avg}%</p>
          </div>
        </div>
      )}

      {grades.length === 0 ? (
        <EmptyState icon={Award} title="No grades yet" description="Your grades will appear here once assignments are evaluated." />
      ) : (
        <div className="space-y-4">
          {grades.map((g) => {
            const pct = Math.round((g.marks / g.assignment?.maxMarks) * 100);
            const color = pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400';
            return (
              <div key={g._id} className="glass p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{g.assignment?.title}</h3>
                    <p className="text-slate-400 text-sm">{g.assignment?.course?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-400">{g.marks}<span className="text-slate-400 text-base font-normal">/{g.assignment?.maxMarks}</span></p>
                    <p className={`text-sm font-semibold ${color}`}>{pct}%</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-navy-900/50 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${pct >= 75 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {g.feedback && (
                  <div className="mt-3 p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl">
                    <p className="text-xs text-violet-400 font-medium mb-1">Faculty Feedback</p>
                    <p className="text-sm text-slate-300">{g.feedback}</p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Graded by: {g.gradedBy?.name}</span>
                  <span>{new Date(g.gradedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
