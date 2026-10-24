import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Search, Edit2, Shield, Mail, Building } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, StatusBadge, GlassCard, GradientButton, FormField, Modal } from '../../components/ui';
import { usersService, adminService } from '../../services';
import { useToast } from '../../contexts/ToastContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  // Create User Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    department: '',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      const res = await usersService.listUsers(params);
      setUsers(res.data.data || []);
    } catch (err) {
      showToast('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminService.createUser(formData);
      showToast('success', `Created ${formData.role} account successfully!`);
      setModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        studentId: '',
        department: '',
      });
      fetchUsers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.studentId?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      <PageHeader
        title="User Management"
        subtitle="Provision faculty and student accounts, assign administrative roles, and inspect directory"
        action={
          <GradientButton onClick={() => setModalOpen(true)}>
            <UserPlus size={16} />
            Create User
          </GradientButton>
        }
      />

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-slate-400 text-sm whitespace-nowrap">Filter by Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-glass text-sm py-2 px-3 w-full sm:w-48"
          >
            <option value="" className="bg-navy-900 text-white">All Roles</option>
            <option value="student" className="bg-navy-900 text-white">Student</option>
            <option value="faculty" className="bg-navy-900 text-white">Faculty</option>
            <option value="admin" className="bg-navy-900 text-white">Administrator</option>
          </select>
        </div>

        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass text-sm py-2 pl-9 pr-3 w-full"
          />
          <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </GlassCard>

      {/* Users Table */}
      {loading ? (
        <LoadingState message="Loading user directory..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try adjusting your search criteria or create a new user account."
        />
      ) : (
        <div className="glass-panel overflow-hidden border border-teal-500/10 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / ID</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={u.role} />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      <div>{u.department || '—'}</div>
                      {u.studentId && <div className="text-slate-400 font-mono">{u.studentId}</div>}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New User Account"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <FormField label="Full Name" required>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Alan Turing"
              className="input-glass"
            />
          </FormField>

          <FormField label="Email Address" required>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. aturing@university.edu"
              className="input-glass"
            />
          </FormField>

          <FormField label="Password" required>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 8 characters"
              className="input-glass"
            />
          </FormField>

          <FormField label="Role" required>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-glass"
            >
              <option value="student" className="bg-navy-900 text-white">Student</option>
              <option value="faculty" className="bg-navy-900 text-white">Faculty</option>
              <option value="admin" className="bg-navy-900 text-white">Administrator</option>
            </select>
          </FormField>

          {formData.role === 'student' && (
            <FormField label="Student Roll / ID Number">
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="e.g. CS2024-042"
                className="input-glass"
              />
            </FormField>
          )}

          <FormField label="Department">
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Computer Science and Engineering"
              className="input-glass"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-sm hover:bg-white/10"
            >
              Cancel
            </button>
            <GradientButton type="submit" loading={creating}>
              Create Account
            </GradientButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
