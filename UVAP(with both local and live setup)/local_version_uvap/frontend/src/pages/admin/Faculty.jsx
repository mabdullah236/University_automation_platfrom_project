import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaEye, FaEdit, FaTrash, FaLock, FaUserTie, FaBriefcase, FaInfoCircle, FaKey, FaBook } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import AdminVerifyModal from '../../components/AdminVerifyModal';
import ResetPasswordModal from '../../components/ResetPasswordModal';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [viewStatus, setViewStatus] = useState('Active'); // Active, Inactive
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Secure View States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [viewFaculty, setViewFaculty] = useState(null);

  const [currentFaculty, setCurrentFaculty] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    id: null, 
    type: null, // 'archive', 'restore'
    title: '',
    message: '',
    isDanger: false
  });

  // Reset Password States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [verifiedAdminPass, setVerifiedAdminPass] = useState('');

  // Workload Viewer State
  const [viewWorkload, setViewWorkload] = useState(null);
  const [workloadModalOpen, setWorkloadModalOpen] = useState(false);
  const [teacherAllocations, setTeacherAllocations] = useState([]);
  const [loadingWorkload, setLoadingWorkload] = useState(false);

  const handleWorkloadClick = async (fac) => {
    setViewWorkload(fac);
    setWorkloadModalOpen(true);
    setLoadingWorkload(true);
    try {
      // Use user._id because CourseAllocation stores teacher as User ID
      const res = await api.get(`/courses/allocations/teacher/${fac.user._id}`);
      setTeacherAllocations(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch workload');
      setTeacherAllocations([]);
    } finally {
      setLoadingWorkload(false);
    }
  };

  const handleResetPasswordClick = (userId) => {
    setResetUserId(userId);
    setShowVerifyModal(true);
  };

  const handleVerifySuccess = (password) => {
    setVerifiedAdminPass(password);
    setShowVerifyModal(false);
    setShowResetModal(true);
  };

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gender: '', dob: '', cnic: '',
    department: '', designation: '', salary: '', joiningDate: '',
    qualification: '', specialization: '', experience: '', address: ''
  });

  const [departments, setDepartments] = useState(['All']);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(['All', ...res.data.map(d => d.name)]);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [activeTab, searchTerm, viewStatus]);

  const fetchFaculty = async () => {
    try {
      let url = `/faculty?status=${viewStatus}`;
      
      if (activeTab !== 'All') {
        url += `&department=${encodeURIComponent(activeTab)}`;
      }
      
      if (searchTerm) {
        url += `&keyword=${encodeURIComponent(searchTerm)}`;
      }

      const res = await api.get(url);
      setFaculty(res.data.data);
      setFilteredFaculty(res.data.data); // Set filtered directly from response
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch faculty');
    }
  };

  // Removed client-side filterFaculty as we are now doing it server-side
  // But we might want to keep it if we want hybrid, but user asked for backend fix.
  // Actually, let's keep it simple and rely on backend as requested.
  // However, the original code had a separate filterFaculty effect.
  // I will remove the separate filter effect and just use fetchFaculty.

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    const { email, phone, cnic, designation, qualification, specialization } = formData;

    // 1. Personal Email Validation
    // Must NOT be a university email (simple check: shouldn't contain 'uvap' or 'edu' if we wanted to be strict, 
    // but user asked for specific domains: gmail, hotmail, yahoo, outlook)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com|outlook\.com)$/;
    if (!emailRegex.test(email)) {
      errors.email = "Please use a valid personal email (Gmail, Hotmail, etc).";
    }

    // 2. Phone Validation (11 Digits, Numbers only)
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phone)) {
      errors.phone = "Phone number must be exactly 11 digits and contain only numbers.";
    }

    // 3. CNIC Validation (13 Digits, Numbers only)
    const cnicRegex = /^\d{13}$/;
    if (!cnicRegex.test(cnic)) {
      errors.cnic = "CNIC must be exactly 13 digits (no dashes) and contain only numbers.";
    }

    // 4. Text-Only Fields Validation
    const textOnlyRegex = /^[a-zA-Z\s\.]+$/;
    
    if (!textOnlyRegex.test(designation)) {
      errors.designation = "This field should only contain text.";
    }
    
    if (!textOnlyRegex.test(qualification)) {
      errors.qualification = "This field should only contain text.";
    }
    
    if (specialization && !textOnlyRegex.test(specialization)) {
      errors.specialization = "This field should only contain text.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({}); // Clear previous errors
    
    if (!validateForm()) return;

    try {
      await api.post('/faculty', formData);
      toast.success('Faculty member added successfully!');
      setShowAddModal(false);
      fetchFaculty();
      resetForm();
    } catch (error) {
      console.error(error);
      if (error.response?.status === 400 && error.response?.data?.field) {
        setFieldErrors({ [error.response.data.field]: error.response.data.message });
      } else {
        toast.error(error.response?.data?.message || 'Error adding faculty');
      }
    }
  };

  const handleEditClick = (fac) => {
    setCurrentFaculty(fac);
    setFormData({
      name: fac.user?.name || '',
      email: fac.user?.personalEmail || '',
      phone: fac.user?.phone || '',
      gender: fac.gender || '',
      dob: fac.dob ? fac.dob.split('T')[0] : '',
      cnic: fac.cnic || '',
      department: fac.department,
      designation: fac.designation,
      salary: fac.salary,
      joiningDate: fac.joiningDate ? fac.joiningDate.split('T')[0] : '',
      qualification: fac.qualifications?.[0]?.degree || '',
      specialization: fac.specialization || '',
      experience: fac.experience || '',
      address: fac.address || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({}); // Clear previous errors

    if (!validateForm()) return;

    try {
      await api.put(`/faculty/${currentFaculty._id}`, formData);
      toast.success('Faculty updated successfully!');
      setShowEditModal(false);
      fetchFaculty();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error updating faculty');
    }
  };

  const handleDeleteClick = (fac) => {
    setCurrentFaculty(fac);
    setDeleteConfirmation('');
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    try {
      await api.delete(`/faculty/${currentFaculty._id}`);
      toast.success('Faculty deleted successfully');
      setShowDeleteModal(false);
      fetchFaculty();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error deleting faculty');
    }
  };

  const handleStatusClick = (id, type) => {
    const isArchive = type === 'archive';
    setConfirmModal({
      isOpen: true,
      id,
      type,
      title: isArchive ? 'Archive Faculty Member' : 'Restore Faculty Member',
      message: isArchive 
        ? 'Are you sure you want to archive this faculty member? They will be moved to the Inactive tab and will not be able to login.' 
        : 'Are you sure you want to restore this faculty member? They will be moved to the Active tab and will regain access.',
      isDanger: isArchive
    });
  };

  const handleModalConfirm = async () => {
    const { id, type } = confirmModal;
    const newStatus = type === 'archive' ? 'Inactive' : 'Active';
    
    try {
        await api.put(`/faculty/${id}/status`, { status: newStatus });
        toast.success(`Faculty marked as ${newStatus}`);
        fetchFaculty();
        setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error) {
        console.error(error);
        toast.error('Failed to update status');
    }
  };

  const handleViewClick = (fac) => {
    setViewFaculty(fac);
    setAdminPassword('');
    setIsPasswordModalOpen(true);
  };

  const verifyPassword = async () => {
    try {
      const res = await api.post('/auth/verify-password', { password: adminPassword });
      if (res.data.success) {
        setIsPasswordModalOpen(false);
        setIsDetailModalOpen(true);
        toast.success('Access Granted');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Incorrect Password');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', gender: '', dob: '', cnic: '',
      department: '', designation: '', salary: '', joiningDate: '',
      qualification: '', specialization: '', experience: '', address: ''
    });
    setCurrentFaculty(null);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Faculty Management</h1>
          <p className="text-gray-500 mt-1">Manage faculty profiles, assignments, and details.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search faculty..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full md:w-72 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-medium flex items-center gap-2"
          >
            <FaUserTie /> Add Faculty
          </button>
        </div>
      </div>



      {/* Status Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setViewStatus('Active')}
          className={`pb-2 px-4 font-medium transition-colors ${
            viewStatus === 'Active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🟢 Active Faculty
        </button>
        <button
          onClick={() => setViewStatus('Inactive')}
          className={`pb-2 px-4 font-medium transition-colors ${
            viewStatus === 'Inactive' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔴 Inactive/Archived
        </button>
      </div>

      {/* Department Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2 border-b border-gray-200">
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setActiveTab(dept)}
            className={`px-5 py-2.5 rounded-t-lg font-medium transition-all whitespace-nowrap ${
              activeTab === dept 
                ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm' 
                : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-5 font-semibold text-gray-600">Name</th>
              <th className="p-5 font-semibold text-gray-600">Personal Email</th>
              <th className="p-5 font-semibold text-gray-600">Department</th>
              <th className="p-5 font-semibold text-gray-600">Workload</th>
              <th className="p-5 font-semibold text-gray-600">Designation</th>
              <th className="p-5 font-semibold text-gray-600">Qualification</th>
              <th className="p-5 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredFaculty.map((f) => (
              <tr key={f._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 font-medium text-gray-800">{f.user?.name || 'N/A'}</td>
                <td className="p-5 text-gray-600">{f.user?.personalEmail || 'N/A'}</td>
                <td className="p-5 text-gray-700">{f.department}</td>
                <td className="p-5">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    f.workload === 0 ? 'bg-gray-100 text-gray-600' :
                    f.workload < 3 ? 'bg-green-100 text-green-800' :
                    f.workload < 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {f.workload || 0} Courses
                  </span>
                </td>
                <td className="p-5">
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                    {f.designation}
                  </span>
                </td>
                <td className="p-5 text-gray-600">{f.qualifications?.map(q => q.degree).join(', ') || 'N/A'}</td>
                <td className="p-5 flex space-x-3">
                  <button 
                    onClick={() => handleViewClick(f)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="View Details"
                  >
                    <FaEye size={18} />
                  </button>
                  
                  <button 
                    onClick={() => handleWorkloadClick(f)}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                    title="View Workload"
                  >
                    <FaBook size={18} />
                  </button>
                  
                  {viewStatus === 'Active' && (
                    <>
                      <button 
                        onClick={() => handleEditClick(f)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleResetPasswordClick(f.user._id)}
                        className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                        title="Reset Password"
                      >
                        <FaKey size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusClick(f._id, 'archive')}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                        title="Archive (Soft Delete)"
                      >
                        <FaBriefcase size={18} />
                      </button>
                    </>
                  )}

                  {viewStatus === 'Inactive' && (
                    <>
                      <button 
                        onClick={() => handleStatusClick(f._id, 'restore')}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Restore"
                      >
                        <FaUserTie size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(f)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Permanent Delete"
                      >
                        <FaTrash size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredFaculty.length === 0 && (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-500">
                  No faculty members found in {activeTab}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal - 3 Column Grid */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">{showAddModal ? 'Add New Faculty' : 'Edit Faculty Profile'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Section 1: Personal Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 font-semibold border-b pb-2 mb-4">
                    <FaUserTie /> Personal Details
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                      <input 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`} 
                        required 
                      />
                      {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                      <input 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`} 
                        required
                      />
                      {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">DOB</label>
                        <input name="dob" type="date" value={formData.dob} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CNIC <span className="text-red-500">*</span></label>
                      <input 
                        name="cnic" 
                        value={formData.cnic} 
                        onChange={handleInputChange} 
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${fieldErrors.cnic ? 'border-red-500' : 'border-gray-300'}`} 
                        required 
                        placeholder="XXXXX-XXXXXXX-X" 
                      />
                      {fieldErrors.cnic && <p className="text-red-500 text-xs mt-1">{fieldErrors.cnic}</p>}
                    </div>
                  </div>
                </div>

                {/* Section 2: Professional Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 font-semibold border-b pb-2 mb-4">
                    <FaBriefcase /> Professional Details
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                      <select name="department" value={formData.department} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
                        <option value="">Select Department</option>
                        {departments.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Designation <span className="text-red-500">*</span></label>
                      <input 
                        name="designation" 
                        value={formData.designation} 
                        onChange={handleInputChange} 
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${fieldErrors.designation ? 'border-red-500' : 'border-gray-300'}`} 
                        required 
                      />
                      {fieldErrors.designation && <p className="text-red-500 text-xs mt-1">{fieldErrors.designation}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salary <span className="text-red-500">*</span></label>
                      <input name="salary" type="number" value={formData.salary} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                      <input name="joiningDate" type="date" value={formData.joiningDate} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Section 3: Additional Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 font-semibold border-b pb-2 mb-4">
                    <FaInfoCircle /> Additional Details
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualification <span className="text-red-500">*</span></label>
                      <input 
                        name="qualification" 
                        value={formData.qualification} 
                        onChange={handleInputChange} 
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${fieldErrors.qualification ? 'border-red-500' : 'border-gray-300'}`} 
                        required 
                      />
                      {fieldErrors.qualification && <p className="text-red-500 text-xs mt-1">{fieldErrors.qualification}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input 
                        name="specialization" 
                        value={formData.specialization} 
                        onChange={handleInputChange} 
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${fieldErrors.specialization ? 'border-red-500' : 'border-gray-300'}`} 
                      />
                      {fieldErrors.specialization && <p className="text-red-500 text-xs mt-1">{fieldErrors.specialization}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                      <input name="experience" type="number" value={formData.experience} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md">
                  {showAddModal ? 'Save Faculty Member' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Verification Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLock className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Secure Access</h3>
              <p className="text-gray-500 mt-2">Enter admin password to view sensitive details.</p>
            </div>
            
            <input 
              type="password" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none text-center text-lg tracking-widest"
              placeholder="••••••"
              autoFocus
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={verifyPassword}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors"
              >
                Verify Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Detail Modal */}
      {isDetailModalOpen && viewFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                &times;
              </button>
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${viewFaculty.user?.name}&background=random&size=128`} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-16 px-8 pb-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{viewFaculty.user?.name}</h2>
                <p className="text-blue-600 font-medium">{viewFaculty.designation} • {viewFaculty.department}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Personal Info */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaUserTie className="text-blue-500" /> Personal Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Personal Email</span>
                      <span className="font-medium text-gray-800">{viewFaculty.user?.personalEmail || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Phone</span>
                      <span className="font-medium text-gray-800">{viewFaculty.user?.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">CNIC</span>
                      <span className="font-medium text-gray-800">{viewFaculty.cnic || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Gender</span>
                      <span className="font-medium text-gray-800">{viewFaculty.gender || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Date of Birth</span>
                      <span className="font-medium text-gray-800">{viewFaculty.dob ? new Date(viewFaculty.dob).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaBriefcase className="text-blue-500" /> Professional Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Employee ID</span>
                      <span className="font-medium text-gray-800">{viewFaculty.employeeId}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Official Email</span>
                      <span className="font-medium text-gray-800">{viewFaculty.user?.uniEmail || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Department</span>
                      <span className="font-medium text-gray-800">{viewFaculty.department}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Designation</span>
                      <span className="font-medium text-gray-800">{viewFaculty.designation}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Salary</span>
                      <span className="font-medium text-green-600">PKR {viewFaculty.salary?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Joining Date</span>
                      <span className="font-medium text-gray-800">{viewFaculty.joiningDate ? new Date(viewFaculty.joiningDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaInfoCircle className="text-blue-500" /> Additional Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Qualification</span>
                      <span className="font-medium text-gray-800">{viewFaculty.qualifications?.[0]?.degree || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Specialization</span>
                      <span className="font-medium text-gray-800">{viewFaculty.specialization || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Experience</span>
                      <span className="font-medium text-gray-800">{viewFaculty.experience ? `${viewFaculty.experience} Years` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider">Address</span>
                      <span className="font-medium text-gray-800">{viewFaculty.address || 'N/A'}</span>
                    </div>

    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workload Modal */}
      {workloadModalOpen && viewWorkload && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaBook className="text-purple-600" /> Workload: {viewWorkload.user?.name}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Total Courses Assigned: <span className="font-bold text-purple-600">{teacherAllocations.length}</span>
                </p>
              </div>
              <button onClick={() => setWorkloadModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="p-6">
              {loadingWorkload ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading allocations...</p>
                </div>
              ) : teacherAllocations.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <FaBook className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Allocations Yet</h3>
                  <p className="text-gray-500">This teacher has not been assigned any courses.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sem</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teacherAllocations.map((alloc) => (
                        <tr key={alloc._id} className="hover:bg-purple-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{alloc.program}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alloc.batch}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alloc.semester}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alloc.section.startsWith('M') ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {alloc.section}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium">{alloc.course?.title}</div>
                            <div className="text-xs text-gray-500">{alloc.course?.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alloc.course?.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setWorkloadModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm"
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
            <h2 className="text-xl font-bold text-red-600 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this faculty member? This action removes their User account and Profile permanently.
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

export default Faculty;
