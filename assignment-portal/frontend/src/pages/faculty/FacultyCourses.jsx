import React, { useEffect, useState } from 'react';
import { BookOpen, Users, FileText, Plus } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, StatusBadge, GlassCard } from '../../components/ui';
import { coursesService } from '../../services';

export default function FacultyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await coursesService.list();
      const list = res.data?.data || res.data?.courses || [];
      setCourses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="My Assigned Courses"
        subtitle="Courses you are assigned to teach and manage"
      />

      {loading ? (
        <LoadingState message="Loading your courses..." />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses assigned"
          description="You are currently not assigned to any courses. Contact your administrator to be added to course teaching staff."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <GlassCard key={course._id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <BookOpen size={20} />
                  </div>
                  <StatusBadge status={course.isActive ? 'active' : 'inactive'} />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{course.title}</h3>
                <p className="text-teal-400 text-sm font-medium mb-3">{course.code}</p>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">{course.description || 'No description provided.'}</p>
              </div>

              <div className="pt-4 border-t border-teal-500/10 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-teal-400" />
                  {course.enrolledStudents?.length || 0} Students
                </span>
                <span className="capitalize px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                  {course.department || 'General'}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
