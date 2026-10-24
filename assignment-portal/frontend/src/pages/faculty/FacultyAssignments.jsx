import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, StatusBadge, GradientButton, IconButton, FormField } from '../../components/ui';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { assignmentsService, coursesService } from '../../services';
import { useToast } from '../../contexts/ToastContext';

export default function FacultyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const initForm = { title: '', description: '', course: '', deadline: '', maxMarks: 100, resubmissionPolicy: 'before_deadline', status: 'draft' };
  const [form, setForm] = useState(initForm);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [aRes, cRes] = await Promise.allSettled([assignmentsService.list(), coursesService.list()]);
    setAssignments(aRes.status === 'fulfilled' ? aRes.value.data.data : []);
    setCourses(cRes.status === 'fulfilled' ? cRes.value.data.data : []);
    setLoading(false);
  }

  const openCreate = () => { setEditing(null); setForm(initForm); setModalOpen(true); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title, description: a.description,
      course: a.course?._id || a.course,
      deadline: a.deadline ? new Date(a.deadline).toISOString().slice(0, 16) : '',
      maxMarks: a.maxMarks,
      resubmissionPolicy: a.resubmissionPolicy,
      status: a.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.course || !form.deadline) { toast.error('Please fill all required fields.'); return; }
    setSaving(true);
    try {
      if (editing) {
        await assignmentsService.update(editing._id, form);
        toast.success('Assignment updated.');
      } else {
        await assignmentsService.create(form);
        toast.success('Assignment created.');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await assignmentsService.delete(deleteDialog.id);
      toast.success('Assignment deleted.');
      setDeleteDialog({ open: false, id: null });
      fetchData();
    } catch { toast.error('Failed to delete.'); }
    finally { setDeleting(false); }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  if (loading) return <LoadingState message="Loading assignments..." />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Assignments"
        subtitle="Create and manage assignments for your courses."
        action={<GradientButton onClick={openCreate} size="sm"><Plus size={14} /> Create Assignment</GradientButton>}
      />

      {assignments.length === 0 ? (
        <EmptyState icon={Plus} title="No assignments" description="Create your first assignment." action={<GradientButton onClick={openCreate} size="sm"><Plus size={14} /> Create</GradientButton>} />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a._id} className="glass p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold truncate">{a.title}</h3>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-slate-400 text-sm">{a.course?.name} · {a.course?.code}</p>
                <p className="text-slate-500 text-xs mt-1">
                  Deadline: {new Date(a.deadline).toLocaleString()} · Max: {a.maxMarks} marks
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <IconButton icon={Edit2} onClick={() => openEdit(a)} label="Edit" variant="teal" />
                <IconButton icon={Trash2} onClick={() => setDeleteDialog({ open: true, id: a._id })} label="Delete" variant="danger" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Assignment' : 'Create Assignment'} size="lg">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Title" required className="md:col-span-2">
              <input value={form.title} onChange={set('title')} className="input-glass" placeholder="Assignment title" />
            </FormField>

            <FormField label="Course" required>
              <select value={form.course} onChange={set('course')} className="input-glass">
                <option value="">Select course...</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
            </FormField>

            <FormField label="Deadline" required>
              <input type="datetime-local" value={form.deadline} onChange={set('deadline')} className="input-glass" />
            </FormField>

            <FormField label="Max Marks" required>
              <input type="number" value={form.maxMarks} onChange={set('maxMarks')} min="1" max="1000" className="input-glass" />
            </FormField>

            <FormField label="Resubmission Policy">
              <select value={form.resubmissionPolicy} onChange={set('resubmissionPolicy')} className="input-glass">
                <option value="none">No resubmission</option>
                <option value="before_deadline">Before deadline only</option>
                <option value="always">Always allow</option>
              </select>
            </FormField>

            <FormField label="Status">
              <select value={form.status} onChange={set('status')} className="input-glass">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </FormField>

            <FormField label="Description" required className="md:col-span-2">
              <textarea value={form.description} onChange={set('description')} rows={4} className="input-glass resize-none" placeholder="Assignment instructions..." />
            </FormField>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-300 hover:bg-white/5 border border-white/10 rounded-xl">Cancel</button>
            <GradientButton onClick={handleSave} loading={saving} size="sm">{editing ? 'Update' : 'Create'}</GradientButton>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
