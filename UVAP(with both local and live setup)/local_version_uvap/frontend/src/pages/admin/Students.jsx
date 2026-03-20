import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import AdminVerifyModal from '../../components/AdminVerifyModal';
import ResetPasswordModal from '../../components/ResetPasswordModal';

const Students = () => {
  const [students, setStudents] = useState([]);
  
  // Reset Password States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [verifiedAdminPass, setVerifiedAdminPass] = useState('');

  const handleResetPasswordClick = (studentId) => {
    setResetUserId(studentId);
    setShowVerifyModal(true);
  };

  const handleVerifySuccess = (password) => {
    setVerifiedAdminPass(password);
    setShowVerifyModal(false);
    setShowResetModal(true);
  };
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('All Students');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState(''); // New state for section
  const [selectedShift, setSelectedShift] = useState(''); // New state for shift
  const [selectedBatch, setSelectedBatch] = useState(''); // New state for batch
  const location = useLocation(); // Hook to get URL params

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Secure View States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [viewStudent, setViewStudent] = useState(null);

  // Secure Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    id: null, 
    type: null, // 'archive', 'restore', 'graduate'
    title: '',
    message: '',
    isDanger: false
  });

  const [departments, setDepartments] = useState(['All Students']);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [counts, setCounts] = useState({ total: 0 });

  const fetchFilters = async () => {
    try {
      let url = '/students/filters?';
      if (selectedBatch) url += `batch=${selectedBatch}&`;
      if (selectedShift) url += `shift=${selectedShift}&`;
      if (selectedSemester) url += `semester=${selectedSemester}&`;
      if (selectedSection) url += `section=${selectedSection}&`;

      const res = await api.get(url);
      if (res.data.success) {
        // Only update batches/sections if we don't have them yet
        if (batches.length === 0) {
          setBatches(res.data.data.batches);
        }
        if (sections.length === 0) {
          setSections(res.data.data.sections);
        }
        setCounts(res.data.data.counts);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(['All Students', ...res.data.map(d => d.name)]);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch filters (counts) whenever batch, shift, semester, or section changes
  useEffect(() => {
    fetchFilters();
  }, [selectedBatch, selectedShift, selectedSemester, selectedSection]);

  const [viewStatus, setViewStatus] = useState('Active'); // Active, Archived, Alumni

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const deptParam = params.get('department');
    const semParam = params.get('semester');
    const secParam = params.get('section');
    const shiftParam = params.get('shift');
    const batchParam = params.get('batch');

    if (deptParam) setActiveTab(deptParam);
    if (semParam) setSelectedSemester(semParam);
    if (secParam) setSelectedSection(secParam);
    if (shiftParam) setSelectedShift(shiftParam);
    if (batchParam) setSelectedBatch(batchParam);
  }, [location.search]);

  useEffect(() => {
    fetchStudents();
  }, [activeTab, selectedSemester, selectedSection, selectedShift, selectedBatch, keyword, location.search, viewStatus]); // Add viewStatus

  const fetchStudents = async () => {
    try {
      let url = `/students?status=${viewStatus}&`; // Add status param
      
      // Prioritize URL params over state for initial load
      const params = new URLSearchParams(location.search);
      const urlDept = params.get('department');
      const urlSem = params.get('semester');
      const urlSec = params.get('section');
      const urlShift = params.get('shift');
      const urlBatch = params.get('batch');

      const dept = urlDept || activeTab;
      const sem = urlSem || selectedSemester;
      const sec = urlSec || selectedSection;
      const shift = urlShift || selectedShift;
      const batch = urlBatch || selectedBatch;

      if (dept && dept !== 'All Students') {
        url += `department=${dept}&`;
      }
      if (sem) {
        url += `semester=${sem}&`;
      }
      if (sec) {
        url += `section=${sec}&`;
      }
      if (shift) {
        url += `shift=${shift}&`;
      }
      if (batch) {
        url += `batch=${batch}&`;
      }
      if (keyword) {
        url += `keyword=${keyword}&`;
      }
      
      // Use api.js which handles base URL and token
      const res = await api.get(url);
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = (id, type) => {
    let title = '';
    let message = '';
    let isDanger = false;

    if (type === 'archive') {
      title = 'Archive Student';
      message = 'Are you sure you want to archive this student? They will be moved to the Archived list.';
      isDanger = true;
    } else if (type === 'restore') {
      title = 'Restore Student';
      message = 'Are you sure you want to restore this student? They will be moved back to the Active list.';
    } else if (type === 'graduate') {
      title = 'Graduate Student';
      message = 'Are you sure you want to mark this student as Alumni?';
    }

    setConfirmModal({
      isOpen: true,
      id,
      type,
      title,
      message,
      isDanger
    });
  };

  const handleModalConfirm = async () => {
    const { id, type } = confirmModal;
    let newStatus = '';
    
    if (type === 'archive') newStatus = 'Archived';
    else if (type === 'restore') newStatus = 'Active';
    else if (type === 'graduate') newStatus = 'Alumni';

    try {
      const res = await api.put(`/students/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchStudents();
        setConfirmModal({ ...confirmModal, isOpen: false });
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setDeleteConfirmation('');
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    
    try {
      const res = await api.delete(`/students/${studentToDelete._id}`);
      if (res.data.success) {
        setStudents(students.filter((s) => s._id !== studentToDelete._id));
        toast.success('Student permanently deleted');
        setShowDeleteModal(false);
      } else {
        toast.error(res.data.error || 'Failed to delete student');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      toast.error('Error deleting student');
    }
  };

  // ... openEditModal, handleUpdate remain same ...
  const openEditModal = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.user?.name || '',
      email: student.user?.personalEmail || '',
      phone: student.user?.phone || '',
      program: student.program,
      batch: student.batch,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      address: student.address,
      currentSemester: student.currentSemester,
      section: student.section || '',
      shift: student.shift || 'Morning',
      cgpa: student.cgpa || 0.0,
    });
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.put(`/students/${currentStudent._id}`, formData);

      if (res.data.success) {
        setSuccess('Student updated successfully');
        fetchStudents(); // Refresh list
        setTimeout(() => setShowEditModal(false), 1500);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Students Management</h1>
          <p className="text-gray-600 mt-1">Manage student records, admissions, and alumni.</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setViewStatus('Active')}
          className={`pb-2 px-4 font-medium transition-colors ${
            viewStatus === 'Active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🟢 Active Students
        </button>
        <button
          onClick={() => setViewStatus('Archived')}
          className={`pb-2 px-4 font-medium transition-colors ${
            viewStatus === 'Archived' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🟠 Archived/Deleted
        </button>
        <button
          onClick={() => setViewStatus('Alumni')}
          className={`pb-2 px-4 font-medium transition-colors ${
            viewStatus === 'Alumni' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🎓 Alumni/Passed
        </button>
      </div>

      {/* Department Tabs (Sub-filter) */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 overflow-x-auto">
        {departments.map((dept) => {
          // Map Display Name to Program Code for Count Lookup
          const deptMap = {
            'Computer Science': 'BSCS',
            'Software Engineering': 'BSSE',
            'Business Administration': 'BBA',
            'Electrical Engineering': 'BSEE',
            'Mathematics': 'BSMath',
            'Information Technology': 'BSIT'
          };
          
          const programCode = deptMap[dept] || dept;
          const count = dept === 'All Students' ? counts.total : (counts[programCode] || 0);

          return (
            <button
              key={dept}
              onClick={() => { setActiveTab(dept); setSelectedSemester(''); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === dept
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {dept} <span className={`ml-1 text-xs ${activeTab === dept ? 'text-gray-300' : 'text-gray-400'}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        {/* Batch Filter */}
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[150px]"
        >
          <option value="">All Batches</option>
          {batches.map(batch => (
            <option key={batch} value={batch}>{batch}</option>
          ))}
        </select>

        {/* Shift Filter */}
        <select
          value={selectedShift}
          onChange={(e) => setSelectedShift(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[150px]"
        >
          <option value="">All Shifts</option>
          <option value="Morning">Morning</option>
          <option value="Evening">Evening</option>
        </select>

        {/* Semester Filter */}
        {activeTab !== 'All Students' && (
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[150px]"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        )}

        {/* Section Filter */}
        {activeTab !== 'All Students' && (
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[150px]"
          >
            <option value="">All Sections</option>
            {sections
              .filter(sec => {
                if (!selectedShift) return true;
                if (selectedShift === 'Morning') return sec.startsWith('M') || sec.startsWith('A'); // Include 'A' for legacy/default
                if (selectedShift === 'Evening') return sec.startsWith('E');
                return true;
              })
              .map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))
            }
          </select>
        )}

        <div className="relative flex-1">
          <input
            type="text"
            placeholder={`Search in ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Students Table */}
      {selectedSection && (
        <div className="mb-4 flex items-center">
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
            Showing results for Section: <strong>{selectedSection}</strong>
            <button 
              onClick={() => setSelectedSection('')}
              className="hover:text-blue-900 focus:outline-none"
            >
              &times;
            </button>
          </span>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Photo</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Section</th>
                <th className="px-6 py-4">Shift</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Sem</th>
                <th className="px-6 py-4">CGPA</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">Loading students...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">No students found in {viewStatus} list.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{student.studentId}</td>
                    <td className="px-6 py-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${student.user?.name || 'Student'}&background=random`} 
                          alt="Avatar" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div>{student.user?.name}</div>
                      <div className="text-xs text-gray-500">{student.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.program}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {student.section ? (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                          {student.section}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        student.shift === 'Evening' ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.shift || 'Morning'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                        {student.batch}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.currentSemester}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono font-bold text-blue-600">
                      {student.cgpa ? student.cgpa.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => { setViewStudent(student); setIsPasswordModalOpen(true); }}
                        className="text-green-600 hover:text-green-800 font-medium text-sm transition-colors"
                        title="View Full Details"
                      >
                        View
                      </button>

                      {viewStatus === 'Active' && (
                        <>
                          <button 
                            onClick={() => openEditModal(student)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleResetPasswordClick(student.user._id)}
                            className="text-yellow-600 hover:text-yellow-800 font-medium text-sm transition-colors"
                            title="Reset Password"
                          >
                            Reset Pass
                          </button>
                          <button 
                            onClick={() => handleStatusClick(student._id, 'archive')}
                            className="text-orange-600 hover:text-orange-800 font-medium text-sm transition-colors"
                            title="Archive Student"
                          >
                            Archive
                          </button>
                          <button 
                            onClick={() => handleStatusClick(student._id, 'graduate')}
                            className="text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors"
                            title="Graduate Student"
                          >
                            Graduate
                          </button>
                        </>
                      )}

                      {viewStatus === 'Archived' && (
                        <>
                          <button 
                            onClick={() => handleStatusClick(student._id, 'restore')}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                            title="Restore Student"
                          >
                            Restore
                          </button>
                          <button 
                            onClick={() => handleDelete(student)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                            title="Permanently Delete"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {viewStatus === 'Alumni' && (
                         <span className="text-gray-400 text-xs italic">Read Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* ... Edit Modal Content (Same as before) ... */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-lg font-bold text-gray-800">Edit Student Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 bg-green-50 text-green-600 text-sm p-3 rounded-lg border border-green-100">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.currentSemester}
                    onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., E1"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                  <input
                    type="number"
                    min="0"
                    max="4.00"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ... Password and Detail Modals remain same ... */}
      {/* Password Verification Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Admin Verification</h3>
            <p className="text-gray-600 mb-4 text-sm">Please enter your password to view sensitive student details.</p>
            
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Admin Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsPasswordModalOpen(false); setAdminPassword(''); }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await api.post('/auth/verify-password', { password: adminPassword });
                    
                    if (res.data.success) {
                      setIsPasswordModalOpen(false);
                      setAdminPassword('');
                      setIsDetailModalOpen(true);
                    } else {
                      toast.error('Incorrect Password');
                      setAdminPassword(''); 
                    }
                  } catch (err) {
                    console.error(err);
                    // Use optional chaining to safely access error message
                    const msg = err.response?.data?.error || err.response?.data?.message || 'Verification Failed';
                    toast.error(msg);
                    setAdminPassword(''); 
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Verify & View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Detail Modal */}
      {isDetailModalOpen && viewStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0">
              <h3 className="text-xl font-bold text-gray-800">Student Full Profile</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${viewStudent.user?.name}&background=random&size=128`} 
                    alt="Avatar" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{viewStudent.user?.name}</h2>
                  <p className="text-gray-500">{viewStudent.studentId} | {viewStudent.program} (Batch {viewStudent.batch})</p>
                  <p className="text-sm text-gray-500 mt-1">Shift: <span className="font-medium text-gray-700">{viewStudent.shift || 'Morning'}</span></p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                    viewStudent.promotionStatus === 'Promoted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {viewStudent.promotionStatus || 'Active'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Personal Details</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3"><span className="text-gray-500">CNIC:</span> <span className="col-span-2 font-medium">{viewStudent.cnic}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500">DOB:</span> <span className="col-span-2 font-medium">{new Date(viewStudent.dob).toLocaleDateString()}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500">Personal Email:</span> <span className="col-span-2 font-medium">{viewStudent.user?.personalEmail || 'N/A'}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500">Official Email:</span> <span className="col-span-2 font-medium">{viewStudent.user?.uniEmail || viewStudent.user?.email}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500">Phone:</span> <span className="col-span-2 font-medium">{viewStudent.user?.phone}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500">Address:</span> <span className="col-span-2 font-medium">{viewStudent.address}</span></div>
                  </div>
                </div>

                {/* Guardian Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Guardian Details</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3"><span className="text-gray-500">Name:</span> <span className="col-span-2 font-medium">{viewStudent.guardianName}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500">Phone:</span> <span className="col-span-2 font-medium">{viewStudent.guardianPhone}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500">Occupation:</span> <span className="col-span-2 font-medium">{viewStudent.guardianOccupation || 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Academic Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Current Semester</p>
                      <p className="text-xl font-bold text-blue-600">{viewStudent.currentSemester}</p>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Admission Date</p>
                      <p className="text-lg font-medium">{new Date(viewStudent.admissionDate).toLocaleDateString()}</p>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Secure Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-red-600 mb-4">Confirm Permanent Deletion</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{studentToDelete?.user?.name}</strong>? This action removes their User account and Profile permanently.
            </p>
            <p className="text-sm font-medium text-gray-700 mb-2">Type "DELETE" to confirm:</p>
            <input 
              type="text" 
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full p-2 border border-red-300 rounded mb-4 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="DELETE"
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteSubmit}
                disabled={deleteConfirmation !== 'DELETE'}
                className={`px-4 py-2 rounded text-white ${
                  deleteConfirmation === 'DELETE' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleModalConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
      />

      {/* Reset Password Modals */}
      <AdminVerifyModal 
        isOpen={showVerifyModal} 
        onClose={() => setShowVerifyModal(false)} 
        onSuccess={handleVerifySuccess} 
      />
      
      <ResetPasswordModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
        userId={resetUserId} 
        adminPassword={verifiedAdminPass} 
      />
    </div>
  );
};

export default Students;
