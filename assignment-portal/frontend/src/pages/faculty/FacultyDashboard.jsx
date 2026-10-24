import React, { useEffect, useState } from 'react';
import { ClipboardList, FileText, Users, Award, BarChart3, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard, PageHeader, LoadingState, GradientButton } from '../../components/ui';
import { assignmentsService, submissionsService, coursesService } from '../../services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ courses: 0, assignments: 0, submissions: 0, graded: 0 });
  const [submissionChart, setSubmissionChart] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cRes, aRes] = await Promise.allSettled([
          coursesService.list(),
          assignmentsService.list(),
        ]);
        const courses = cRes.status === 'fulfilled' ? cRes.value.data.data : [];
        const assignments = aRes.status === 'fulfilled' ? aRes.value.data.data : [];

        // Get submission counts per assignment
        let totalSubs = 0, gradedSubs = 0;
        const chartData = [];

        for (const a of assignments.slice(0, 5)) {
          const sRes = await submissionsService.getForAssignment(a._id).catch(() => null);
          if (sRes) {
            const subs = sRes.data.data;
            const graded = subs.filter((s) => s.status === 'graded').length;
            totalSubs += subs.length;
            gradedSubs += graded;
            chartData.push({ name: a.title.slice(0, 12) + '...', total: subs.length, graded });
          }
        }

        setStats({ courses: courses.length, assignments: assignments.length, submissions: totalSubs, graded: gradedSubs });
        setSubmissionChart(chartData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingState message="Loading faculty dashboard..." />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Faculty Dashboard`}
        subtitle={`Welcome, ${user?.name}. Manage your courses and assignments.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ClipboardList} label="My Courses" value={stats.courses} color="teal" />
        <StatCard icon={FileText} label="Assignments" value={stats.assignments} color="violet" />
        <StatCard icon={Users} label="Submissions" value={stats.submissions} color="amber" />
        <StatCard icon={Award} label="Graded" value={stats.graded} color="emerald" />
      </div>

      {submissionChart.length > 0 && (
        <div className="glass p-6">
          <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
            <BarChart3 size={16} className="text-teal-400" /> Submission Overview
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={submissionChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,184,166,0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#152459', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '10px', color: '#e2e8f0' }}
              />
              <Bar dataKey="total" fill="rgba(20,184,166,0.5)" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="graded" fill="rgba(167,139,250,0.5)" radius={[4, 4, 0, 0]} name="Graded" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
