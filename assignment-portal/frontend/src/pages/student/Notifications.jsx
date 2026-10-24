import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, GradientButton } from '../../components/ui';
import { notificationsService } from '../../services';
import { useToast } from '../../contexts/ToastContext';

const TYPE_ICONS = {
  assignment_published: '📋',
  submission_received: '📥',
  grade_released: '🎯',
  deadline_reminder: '⏰',
  course_enrolled: '📚',
  system: '🔔',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetch = () => {
    notificationsService.list()
      .then((r) => {
        const list = r.data?.data || r.data?.notifications || [];
        setNotifications(Array.isArray(list) ? list : []);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const markAllRead = async () => {
    await notificationsService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read.');
  };

  const markRead = async (id) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotif = async (id) => {
    await notificationsService.delete(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  if (loading) return <LoadingState message="Loading notifications..." />;

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread notification(s)` : 'All caught up!'}
        action={unread > 0 && (
          <GradientButton onClick={markAllRead} size="sm">
            <CheckCheck size={14} /> Mark All Read
          </GradientButton>
        )}
      />
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You have no notifications." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`glass p-4 flex items-start gap-4 transition-all duration-200 ${!n.isRead ? 'border-teal-500/25 bg-teal-500/5' : 'opacity-70'}`}
            >
              <span className="text-xl flex-shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${n.isRead ? 'text-slate-300' : 'text-white'}`}>{n.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!n.isRead && (
                  <button onClick={() => markRead(n._id)} className="p-1.5 hover:text-teal-400 text-slate-400 transition-colors" title="Mark as read">
                    <CheckCheck size={14} />
                  </button>
                )}
                <button onClick={() => deleteNotif(n._id)} className="p-1.5 hover:text-red-400 text-slate-400 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
