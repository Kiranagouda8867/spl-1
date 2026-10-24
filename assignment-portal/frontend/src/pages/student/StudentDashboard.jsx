import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Award, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  StatCard, PageHeader, LoadingState, EmptyState, StatusBadge
} from '../../components/ui';
import { coursesService, assignmentsService, submissionsService, evaluationsService } from '../../services';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ courses: 0, pending: 0, submitted: 0, graded: 0 });
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, assignmentsRes, submissionsRes, gradesRes] = await Promise.allSettled([
          coursesService.list(),
          assignmentsService.list(),
          submissionsService.getMine(),
          evaluationsService.getMine(),
        ]);

        const rawCourses = coursesRes.status === 'fulfilled' ? (coursesRes.value?.data?.data || coursesRes.value?.data?.courses) : [];
        const rawAssignments = assignmentsRes.status === 'fulfilled' ? (assignmentsRes.value?.data?.data || assignmentsRes.value?.data?.assignments) : [];
        const rawSubmissions = submissionsRes.status === 'fulfilled' ? (submissionsRes.value?.data?.data || submissionsRes.value?.data?.submissions) : [];
        const rawGrades = gradesRes.status === 'fulfilled' ? (gradesRes.value?.data?.data || gradesRes.value?.data?.evaluations) : [];

        const courses = Array.isArray(rawCourses) ? rawCourses : [];
        const assignments = Array.isArray(rawAssignments) ? rawAssignments : [];
        const submissions = Array.isArray(rawSubmissions) ? rawSubmissions : [];
        const grades = Array.isArray(rawGrades) ? rawGrades : [];

        const submittedIds = new Set(submissions.map((s) => s.assignment?._id || s.assignment));
        const pending = assignments.filter(
          (a) => !submittedIds.has(a._id) && new Date(a.deadline) > new Date()
        ).length;

        setStats({
          courses: courses.length,
          pending,
          submitted: submissions.length,
          graded: submissions.filter((s) => s.status === 'graded').length,
        });

        setRecentAssignments(assignments.slice(0, 5));
        setRecentGrades(grades.slice(0, 5));
      } catch {
        // handled by individual failures
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingState message="Loading your dashboard..." />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}! 👋`}
        subtitle="Here's an overview of your academic activity."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={stats.courses} color="teal" />
        <StatCard icon={Clock} label="Pending Assignments" value={stats.pending} color="amber" />
        <StatCard icon={FileText} label="Submitted" value={stats.submitted} color="violet" />
        <StatCard icon={Award} label="Graded" value={stats.graded} color="emerald" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="glass p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock size={16} className="text-teal-400" /> Upcoming Assignments
          </h2>
          {recentAssignments.length === 0 ? (
            <EmptyState icon={FileText} title="No assignments" description="You have no active assignments." />
          ) : (
            <div className="space-y-3">
              {recentAssignments.map((a) => {
                const isPast = new Date(a.deadline) < new Date();
                return (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-teal-500/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{a.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{a.course?.name}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className={`text-xs font-medium ${isPast ? 'text-red-400' : 'text-amber-400'}`}>
                        {isPast ? 'Past due' : new Date(a.deadline).toLocaleDateString()}
                      </p>
                      <p className="text-slate-500 text-xs">{a.maxMarks} marks</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Grades */}
        <div className="glass p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award size={16} className="text-violet-400" /> Recent Grades
          </h2>
          {recentGrades.length === 0 ? (
            <EmptyState icon={Award} title="No grades yet" description="Your grades will appear here once assignments are evaluated." />
          ) : (
            <div className="space-y-3">
              {recentGrades.map((g) => {
                const pct = Math.round((g.marks / g.assignment?.maxMarks) * 100);
                return (
                  <div key={g._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-violet-500/5 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{g.assignment?.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{g.assignment?.course?.name}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-teal-400 font-bold text-sm">{g.marks}/{g.assignment?.maxMarks}</p>
                      <p className={`text-xs font-medium ${pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {pct}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
