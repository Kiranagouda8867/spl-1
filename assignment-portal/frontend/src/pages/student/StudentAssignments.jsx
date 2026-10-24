import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Download, Clock } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, StatusBadge, GradientButton } from '../../components/ui';
import { AssignmentCard } from '../../components/assignments/AssignmentCard';
import { assignmentsService, submissionsService } from '../../services';
import { Modal } from '../../components/common/Modal';
import { FileDropzone } from '../../components/common/FileDropzone';
import { useToast } from '../../contexts/ToastContext';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.allSettled([
        assignmentsService.list(),
        submissionsService.getMine(),
      ]);
      const aList = aRes.status === 'fulfilled' ? aRes.value.data.data : [];
      const sList = sRes.status === 'fulfilled' ? sRes.value.data.data : [];

      setAssignments(aList);
      const subMap = {};
      for (const s of sList) {
        const aId = s.assignment?._id || s.assignment;
        subMap[aId] = s;
      }
      setSubmissions(subMap);
    } catch {
      toast.error('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  }

  const openSubmit = (assignment) => {
    setSelected(assignment);
    setFile(null);
    setNotes('');
    setSubmitModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!file) { toast.error('Please select a file.'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('assignmentId', selected._id);
      fd.append('file', file);
      fd.append('notes', notes);
      await submissionsService.submit(fd);
      toast.success('Assignment submitted successfully!');
      setSubmitModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading assignments..." />;

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Assignments" subtitle="View and submit your assignments." />

      {assignments.length === 0 ? (
        <EmptyState icon={FileText} title="No assignments" description="No assignments have been published for your courses yet." />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {assignments.map((a) => (
            <div key={a._id} className="relative">
              <AssignmentCard
                assignment={a}
                submission={submissions[a._id]}
                onClick={() => {}}
                role="student"
              />
              <div className="px-5 pb-4 -mt-2">
                <GradientButton
                  onClick={() => openSubmit(a)}
                  size="sm"
                  className="w-full"
                  disabled={
                    a.status === 'closed' ||
                    (submissions[a._id]?.status === 'submitted' && a.resubmissionPolicy === 'none')
                  }
                >
                  <Upload size={14} />
                  {submissions[a._id] ? 'Resubmit' : 'Submit'}
                </GradientButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title={`Submit: ${selected?.title}`}
      >
        <div className="space-y-5">
          <div className="p-4 glass rounded-xl text-sm text-slate-300">
            <p><span className="text-slate-400">Course:</span> {selected?.course?.name}</p>
            <p><span className="text-slate-400">Deadline:</span> {selected && new Date(selected.deadline).toLocaleString()}</p>
            <p><span className="text-slate-400">Max Marks:</span> {selected?.maxMarks}</p>
          </div>

          <FileDropzone
            onFileSelect={setFile}
            selectedFile={file}
            onClear={() => setFile(null)}
            maxSizeMB={10}
          />

          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes for your submission..."
              rows={3}
              className="input-glass resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={() => setSubmitModalOpen(false)} className="px-4 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-xl border border-white/10 transition-colors">
              Cancel
            </button>
            <GradientButton onClick={handleSubmit} loading={submitting} size="sm">
              <Upload size={14} /> Submit Assignment
            </GradientButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
