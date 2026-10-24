import React, { useEffect, useState } from 'react';
import { ClipboardList, Trash2, Search, Calendar, Award } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, StatusBadge, GlassCard, ConfirmDialog } from '../../components/ui';
import { assignmentsService } from '../../services';
import { useToast } from '../../contexts/ToastContext';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await assignmentsService.list();
      setAssignments(res.data.assignments || res.data || []);
    } catch (err) {
      showToast('error', 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await assignmentsService.delete(deleteId);
      showToast('success', 'Assignment deleted');
      setDeleteId(null);
      fetchAssignments();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = assignments.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.course?.name?.toLowerCase().includes(q) ||
      a.course?.code?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Assignment Registry"
        subtitle="Global audit and oversight of assignments across all institutional departments"
      />

      <GlassCard className="p-4 mb-6 flex items-center justify-between">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search assignments or course codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass text-sm py-2 pl-9 pr-3 w-full"
          />
          <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </GlassCard>

      {loading ? (
        <LoadingState message="Fetching system assignments..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments found"
          description="There are currently no assignments matching your query."
        />
      ) : (
        <div className="glass-panel overflow-hidden border border-teal-500/10 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Assignment</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((a) => (
                  <tr key={a._id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{a.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{a.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-teal-400 font-medium">{a.course?.code || '—'}</span>
                      <div className="text-xs text-slate-500">{a.course?.name}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(a.deadline).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {a.maxMarks} pts
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setDeleteId(a._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                        title="Delete assignment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? All associated student submissions and evaluations may be permanently affected."
      />
    </div>
  );
}
