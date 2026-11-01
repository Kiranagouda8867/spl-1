import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Users, UserCheck, Search, CheckCircle } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, StatusBadge, GlassCard, GradientButton, FormField, Modal } from '../../components/ui';
import { coursesService, usersService } from '../../services';
import { useToast } from '../../contexts/ToastContext';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Course Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    department: '',
    semester: 'Fall 2024',
  });

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignType, setAssignType] = useState('faculty'); // 'faculty' or 'student'
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await coursesService.list();
      const rawCourses = res.data?.data || res.data?.courses || [];
      setCourses(Array.isArray(rawCourses) ? rawCourses : []);
    } catch (err) {
      showToast('error', 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await coursesService.create(formData);
      showToast('success', 'Course created successfully!');
      setCreateModalOpen(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        department: '',
        semester: 'Fall 2024',
      });
      fetchCourses();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const openAssignModal = async (course, type) => {
    setSelectedCourse(course);
    setAssignType(type);
    setSelectedUserId('');
    setAssignModalOpen(true);
    try {
      const res = await usersService.listUsers({ role: type });
      const userList = res.data.data || [];
      setAvailableUsers(userList);
      if (userList.length > 0) setSelectedUserId(userList[0]._id);
    } catch (err) {
      showToast('error', `Failed to load ${type} users`);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedUserId) return;
    setAssigning(true);
    try {
      if (assignType === 'faculty') {
        await coursesService.assignFaculty(selectedCourse._id, [selectedUserId]);
        showToast('success', 'Faculty assigned to course!');
      } else {
        await coursesService.enrollStudents(selectedCourse._id, [selectedUserId]);
        showToast('success', 'Student enrolled into course!');
      }
      setAssignModalOpen(false);
      fetchCourses();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Course Administration"
        subtitle="Create academic offerings, assign instructional faculty, and enroll students"
        action={
          <GradientButton onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} />
            Create Course
          </GradientButton>
        }
      />

      {/* Search Bar */}
      <GlassCard className="p-4 mb-6 flex items-center justify-between">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search by code, title, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass text-sm py-2 pl-9 pr-3 w-full"
          />
          <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </GlassCard>

      {/* Courses Grid */}
      {loading ? (
        <LoadingState message="Loading courses..." />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Create your first academic course offering to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <GlassCard key={c._id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs uppercase">
                    {c.code?.substring(0, 4) || 'CRS'}
                  </div>
                  <StatusBadge status={c.isActive ? 'active' : 'inactive'} />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{c.name}</h3>
                <p className="text-teal-400 text-sm font-semibold mb-2">{c.code}</p>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4">{c.description || 'No description provided.'}</p>

                <div className="text-xs text-slate-400 space-y-1 mb-4">
                  <div>Department: <span className="text-slate-300 font-medium">{c.department || 'General'}</span></div>
                  <div>Semester: <span className="text-slate-300 font-medium">{c.semester || 'Current'}</span></div>
                  <div>Faculty: <span className="text-slate-300 font-medium">{c.faculty?.map((f) => f.name).join(', ') || 'None assigned'}</span></div>
                  <div>Enrolled: <span className="text-teal-400 font-semibold">{c.students?.length || 0} Students</span></div>
                </div>
              </div>

              <div className="pt-4 border-t border-teal-500/10 flex items-center gap-2">
                <button
                  onClick={() => openAssignModal(c, 'faculty')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium flex items-center justify-center gap-1 transition"
                >
                  <UserCheck size={14} className="text-violet-400" />
                  + Faculty
                </button>
                <button
                  onClick={() => openAssignModal(c, 'student')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-300 text-xs font-medium flex items-center justify-center gap-1 transition"
                >
                  <Users size={14} className="text-teal-400" />
                  + Student
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Academic Course"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <FormField label="Course Name" required>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Distributed Operating Systems"
              className="input-glass"
            />
          </FormField>

          <FormField label="Course Code" required>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CS-401"
              className="input-glass uppercase"
            />
          </FormField>

          <FormField label="Department" required>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Computer Science"
              className="input-glass"
            />
          </FormField>

          <FormField label="Semester / Academic Term">
            <input
              type="text"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              placeholder="e.g. Fall 2024"
              className="input-glass"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief course objectives and syllabus..."
              rows={3}
              className="input-glass"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-sm hover:bg-white/10"
            >
              Cancel
            </button>
            <GradientButton type="submit" loading={creating}>
              Create course
            </GradientButton>
          </div>
        </form>
      </Modal>

      {/* Assign User Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={assignType === 'faculty' ? `Assign Faculty — ${selectedCourse?.code}` : `Enroll Student — ${selectedCourse?.code}`}
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <FormField label={`Select ${assignType === 'faculty' ? 'Faculty Member' : 'Student'}`} required>
            {availableUsers.length === 0 ? (
              <p className="text-slate-400 text-sm">No {assignType} accounts available in directory.</p>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input-glass"
                required
              >
                {availableUsers.map((u) => (
                  <option key={u._id} value={u._id} className="bg-navy-900 text-white">
                    {u.name} ({u.email}) {u.studentId ? `— ${u.studentId}` : ''}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-sm hover:bg-white/10"
            >
              Cancel
            </button>
            <GradientButton
              type="submit"
              loading={assigning}
              disabled={availableUsers.length === 0}
            >
              Confirm Assignment
            </GradientButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
