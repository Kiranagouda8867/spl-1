import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, StatusBadge } from '../../components/ui';
import { coursesService } from '../../services';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesService.list().then((r) => setCourses(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading courses..." />;

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Courses" subtitle={`You are enrolled in ${courses.length} course(s).`} />
      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses" description="You are not enrolled in any courses. Contact your administrator." />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c._id} className="glass p-5 hover:border-teal-500/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-violet-500/20 border border-teal-500/20 flex items-center justify-center">
                  <BookOpen size={18} className="text-teal-400" />
                </div>
                <span className="badge badge-teal text-xs">{c.code}</span>
              </div>
              <h3 className="text-white font-semibold mt-3">{c.name}</h3>
              {c.description && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{c.description}</p>}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>{c.faculty?.map((f) => f.name).join(', ') || 'No faculty'}</span>
                {c.semester && <span>{c.semester}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
