import React, { useEffect, useState } from 'react';
import { Users, BookOpen, ClipboardList, Award, UserPlus, PlusCircle, CheckCircle } from 'lucide-react';
import { PageHeader, LoadingState, StatCard, GlassCard, StatusBadge } from '../../components/ui';
import { adminService } from '../../services';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Admin Portal Control Center"
        subtitle="Overview of system metrics, active enrollments, and academic operations"
      />

      {loading ? (
        <LoadingState message="Loading administrative metrics..." />
      ) : (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats?.users?.total || 0}
              sub={`${stats?.users?.students || 0} Students • ${stats?.users?.faculty || 0} Faculty`}
              color="teal"
            />
            <StatCard
              icon={BookOpen}
              label="Courses"
              value={stats?.courses?.total || 0}
              sub={`${stats?.courses?.active || 0} Active Courses`}
              color="violet"
            />
            <StatCard
              icon={ClipboardList}
              label="Assignments"
              value={stats?.assignments?.total || 0}
              sub={`${stats?.assignments?.published || 0} Published`}
              color="emerald"
            />
            <StatCard
              icon={Award}
              label="Submissions"
              value={stats?.submissions?.total || 0}
              sub={`${stats?.submissions?.graded || 0} Graded`}
              color="amber"
            />
          </div>

          {/* Quick Actions & Recent Users */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <GlassCard className="p-6">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <PlusCircle size={20} className="text-teal-400" />
                Administrative Shortcuts
              </h3>
              <div className="space-y-3">
                <Link
                  to="/admin/users"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-teal-500/30 transition text-sm text-slate-300"
                >
                  <span className="flex items-center gap-2.5">
                    <UserPlus size={16} className="text-teal-400" />
                    Create New User Account
                  </span>
                  <span className="text-xs text-teal-400">Manage →</span>
                </Link>
                <Link
                  to="/admin/courses"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-teal-500/30 transition text-sm text-slate-300"
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen size={16} className="text-violet-400" />
                    Create & Assign Course
                  </span>
                  <span className="text-xs text-violet-400">Manage →</span>
                </Link>
                <Link
                  to="/admin/assignments"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-teal-500/30 transition text-sm text-slate-300"
                >
                  <span className="flex items-center gap-2.5">
                    <ClipboardList size={16} className="text-amber-400" />
                    Monitor All Assignments
                  </span>
                  <span className="text-xs text-amber-400">View →</span>
                </Link>
              </div>
            </GlassCard>

            {/* Recent Users List */}
            <GlassCard className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Users size={20} className="text-teal-400" />
                  Recently Registered Users
                </h3>
                <Link to="/admin/users" className="text-xs text-teal-400 hover:underline">
                  View All
                </Link>
              </div>

              {stats?.recentUsers?.length === 0 ? (
                <p className="text-slate-400 text-sm">No recent users found.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {stats?.recentUsers?.map((u) => (
                    <div key={u._id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{u.name}</p>
                        <p className="text-slate-400 text-xs">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={u.role} />
                        <span className="text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
