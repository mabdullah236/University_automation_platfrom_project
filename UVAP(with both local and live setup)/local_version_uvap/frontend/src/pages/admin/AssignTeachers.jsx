import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  FaChalkboardTeacher,
  FaSave,
  FaRobot,
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch
} from 'react-icons/fa';

const AssignTeachers = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null); // ID of course being saved
  const [autoAssigning, setAutoAssigning] = useState(false);

  // Filters
  const [batches, setBatches] = useState(['TEST-2025', 'FALL-2024', 'SPRING-2024']); // Mock or fetch
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [sections, setSections] = useState(['M1', 'M2', 'M3', 'E1', 'E2', 'E3']);

  const [filters, setFilters] = useState({
    batch: 'TEST-2025',
    program: '',
    semester: '',
    section: ''
  });

  // Data
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [allocations, setAllocations] = useState({}); // Map: courseId -> teacherId
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  // Modals
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);
  const [autoAssignResult, setAutoAssignResult] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (filters.batch && filters.program && filters.semester && filters.section) {
      fetchData();
    } else {
        // Reset data if filters are incomplete
        setCourses([]);
        setFaculty([]);
        setAllocations({});
    }
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      toast.error("Failed to load departments");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses/allocations/data', { params: filters });
      if (res.data.success) {
        setCourses(res.data.data.courses || []);
        setFaculty(res.data.data.faculty || []);
        
        // Map allocations: courseId -> teacherId
        const allocMap = {};
        if (res.data.data.allocations) {
            res.data.data.allocations.forEach(a => {
                allocMap[a.course] = a.teacher;
            });
        }
        setAllocations(allocMap);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load allocation data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAllocationChange = (courseId, teacherId) => {
    setAllocations(prev => ({ ...prev, [courseId]: teacherId }));
  };

  const handleSave = async (courseId) => {
    const teacherId = allocations[courseId];
    if (!teacherId) {
        toast.error("Please select a teacher first");
        return;
    }

    setSaving(courseId);
    try {
      await api.post('/courses/allocations', {
        courseId,
        teacherId,
        ...filters
      });
      toast.success("Teacher assigned successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign teacher");
    } finally {
      setSaving(null);
    }
  };

  const handleAutoAssign = async () => {
    setShowAutoAssignModal(false);
    setAutoAssigning(true);
    try {
      const res = await api.post('/courses/allocations/auto-assign', filters);
      
      if (res.data.success) {
          setAutoAssignResult({
              count: res.data.count,
              logs: res.data.logs
          });
          toast.success(`Auto-assigned ${res.data.count} courses!`);
          fetchData(); // Refresh data
      }
    } catch (error) {
      toast.error("Auto-assign failed");
      console.error(error);
    } finally {
      setAutoAssigning(false);
    }
  };

  // Helper to get teacher load
  const getTeacherLoad = (teacherId) => {
      const teacher = faculty.find(f => f.user._id === teacherId);
      return teacher ? { current: teacher.currentLoad, max: teacher.maxLoad } : { current: 0, max: 0 };
  };

  // Filtered courses for display
  const displayedCourses = showUnassignedOnly 
    ? courses.filter(c => !allocations[c._id]) 
    : courses;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <FaChalkboardTeacher className="text-blue-600" /> Teacher Allocation
            </h1>
            <p className="text-gray-500 mt-1">Assign faculty to courses for specific sections.</p>
          </div>
          <div className="flex gap-3">
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <input 
                    type="checkbox" 
                    id="unassignedOnly"
                    checked={showUnassignedOnly}
                    onChange={(e) => setShowUnassignedOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="unassignedOnly" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Show Unassigned Only
                </label>
             </div>
             <button 
                onClick={() => {
                    setFilters({ batch: '', program: '', semester: '', section: '' }); // Clear filters for global
                    setShowAutoAssignModal(true);
                }}
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
             >
                <FaRobot /> Global Auto-Assign
             </button>
             <button 
                onClick={() => setShowAutoAssignModal(true)}
                disabled={!filters.section || autoAssigning}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {autoAssigning ? <FaRobot className="animate-spin" /> : <FaRobot />} 
                {autoAssigning ? 'Assigning...' : 'Auto-Assign Remaining'}
             </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Batch</label>
              <select 
                value={filters.batch}
                onChange={(e) => handleFilterChange('batch', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              >
                {batches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Program</label>
              <select 
                value={filters.program}
                onChange={(e) => handleFilterChange('program', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              >
                <option value="">Select Program</option>
                {departments.map(d => (
                    <option key={d._id} value={d.programCode || d.shortName}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Semester</label>
              <select 
                value={filters.semester}
                onChange={(e) => handleFilterChange('semester', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                disabled={!filters.program}
              >
                <option value="">Select Semester</option>
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section</label>
              <select 
                value={filters.section}
                onChange={(e) => handleFilterChange('section', e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                disabled={!filters.semester}
              >
                <option value="">Select Section</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        ) : !filters.section ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <FaFilter className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Select filters to view courses</h3>
                <p className="text-gray-500">Please select a Program, Semester, and Section to start assigning teachers.</p>
            </div>
        ) : displayedCourses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <FaSearch className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                <p className="text-gray-500">No courses match your current filters.</p>
            </div>
        ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course Code</th>
                            <th className="p-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course Title</th>
                            <th className="p-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Credits</th>
                            <th className="p-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Assigned Teacher</th>
                            <th className="p-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {displayedCourses.map(course => {
                            const assignedId = allocations[course._id];
                            const assignedTeacher = faculty.find(f => f.user._id === assignedId);
                            const isAssigned = !!assignedId;
                            const isOverloaded = assignedTeacher && assignedTeacher.currentLoad > assignedTeacher.maxLoad;

                            return (
                                <tr key={course._id} className={`hover:bg-blue-50/50 transition ${!isAssigned ? 'bg-orange-50/30' : ''}`}>
                                    <td className="p-5 font-medium text-gray-900">{course.code}</td>
                                    <td className="p-5 text-gray-700">{course.title}</td>
                                    <td className="p-5 text-gray-500">{course.credits}</td>
                                    <td className="p-5">
                                        <div className="relative">
                                            <select 
                                                value={assignedId || ''}
                                                onChange={(e) => handleAllocationChange(course._id, e.target.value)}
                                                className={`w-full p-2.5 pr-8 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${
                                                    isOverloaded ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-700'
                                                }`}
                                            >
                                                <option value="">Select Teacher</option>
                                                {faculty.map(fac => (
                                                    <option key={fac.user._id} value={fac.user._id}>
                                                        {fac.user.name} ({fac.currentLoad}/{fac.maxLoad}) - {fac.department}
                                                    </option>
                                                ))}
                                            </select>
                                            {isOverloaded && (
                                                <div className="absolute right-8 top-3 text-red-500" title="Teacher Overloaded">
                                                    <FaExclamationTriangle />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button 
                                            onClick={() => handleSave(course._id)}
                                            disabled={saving === course._id}
                                            className="text-blue-600 hover:text-blue-800 font-medium p-2 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
                                        >
                                            {saving === course._id ? 'Saving...' : <FaSave size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}

      </div>

      {/* Auto-Assign Confirmation Modal */}
      {showAutoAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6">
                <FaRobot className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Auto-Assign Remaining?</h3>
            <p className="text-sm text-gray-500 mb-6">
                This will automatically assign the best available teachers to all unassigned courses 
                {filters.batch ? (
                    <strong> in {filters.program} {filters.semester} {filters.section}</strong>
                ) : (
                    <strong> across the ENTIRE SYSTEM (All Batches)</strong>
                )}.
            </p>
            <div className="flex gap-4 justify-center">
                <button
                    onClick={() => setShowAutoAssignModal(false)}
                    className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAutoAssign}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg transition-transform transform hover:scale-105"
                >
                    Yes, Auto-Assign
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Assign Result Modal */}
      {autoAssignResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" /> Auto-Assign Complete
              </h3>
              <button onClick={() => setAutoAssignResult(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mb-4">
                <p className="text-gray-600">Successfully assigned <strong>{autoAssignResult.count}</strong> courses.</p>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-y-auto flex-1 whitespace-pre-wrap">
              {autoAssignResult.logs && autoAssignResult.logs.join('\n')}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setAutoAssignResult(null)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssignTeachers;
