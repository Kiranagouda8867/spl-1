import React from 'react';
import { motion } from 'framer-motion';
import { StatusBadge } from '../ui';
import { Calendar, BookOpen, Clock } from 'lucide-react';

function formatDeadline(deadline) {
  const date = new Date(deadline);
  const now = new Date();
  const diff = date - now;
  if (diff < 0) return { label: 'Past deadline', urgent: true, formatted: date.toLocaleDateString() };
  const days = Math.floor(diff / 86400000);
  if (days === 0) return { label: 'Due today', urgent: true, formatted: date.toLocaleDateString() };
  if (days === 1) return { label: 'Due tomorrow', urgent: true, formatted: date.toLocaleDateString() };
  if (days <= 3) return { label: `Due in ${days} days`, urgent: true, formatted: date.toLocaleDateString() };
  return { label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), urgent: false, formatted: date.toLocaleDateString() };
}

export function AssignmentCard({ assignment, onClick, role = 'student', submission }) {
  const deadline = formatDeadline(assignment.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -2 }}
      onClick={onClick}
      className="glass p-5 cursor-pointer hover:border-teal-500/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-white font-semibold truncate">{assignment.title}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-xs">
            <BookOpen size={12} />
            <span>{assignment.course?.name || assignment.course?.code}</span>
          </div>
        </div>
        <StatusBadge status={submission?.status || assignment.status} />
      </div>

      <p className="text-slate-400 text-sm line-clamp-2 mb-4">{assignment.description}</p>

      <div className="flex items-center justify-between text-xs">
        <div className={`flex items-center gap-1.5 ${deadline.urgent ? 'text-amber-400' : 'text-slate-400'}`}>
          <Clock size={12} />
          <span>{deadline.label}</span>
        </div>
        <span className="text-slate-500">
          Max: <span className="text-teal-400 font-medium">{assignment.maxMarks}</span> marks
        </span>
      </div>

      {submission?.status === 'graded' && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-400">Your score</span>
          <span className="text-teal-400 font-bold text-sm">
            {submission.evaluation?.marks ?? '—'} / {assignment.maxMarks}
          </span>
        </div>
      )}
    </motion.div>
  );
}
