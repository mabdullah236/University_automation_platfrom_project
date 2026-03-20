import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

const Admissions = () => {
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '', cnic: '', dateOfBirth: '', bloodGroup: '', religion: '', nationality: 'Pakistani',
    email: '', phone: '', address: '',
    guardianName: '', guardianOccupation: '', guardianIncome: '', guardianContact: '',
    matricMarks: '', matricBoard: '', matricYear: '', matricSchool: '',
    interMarks: '', interBoard: '', interYear: '', interCollege: '',
    programApplied: '', semester: 1, shift: 'Morning', department: ''
  });
  const [departments, setDepartments] = useState([]);
  const [files, setFiles] = useState({
    cnicFront: null, cnicBack: null, matricTranscript: null, interTranscript: null
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // New State for Tabs and Filters
  const [activeTab, setActiveTab] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null,
    action: null, // 'Approved', 'Rejected', 'Delete'
    title: '',
    message: '',
    isDanger: false
  });

  useEffect(() => {
    fetchApplications();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get('/admissions');
      setApplications(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (e) => {
    const selectedDeptName = e.target.value;
    const selectedDept = departments.find(d => d.name === selectedDeptName);
    
    setFormData({
      ...formData,
      department: selectedDeptName,
      programApplied: selectedDept ? selectedDept.programCode : ''
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB
        setFieldErrors(prev => ({ ...prev, [e.target.name]: "File size must be less than 1MB." }));
        return;
      } else {
        setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
      }
    }
    setFiles({ ...files, [e.target.name]: file });
  };

  const validateForm = () => {
    const errors = {};
    const { 
      fullName, cnic, email, phone, guardianName, guardianOccupation, guardianContact, 
      matricMarks, matricYear, interMarks, interYear, guardianIncome,
      schoolName, collegeName, matricBoard, interBoard, religion, nationality
    } = formData;

    // Helper Regex
    const textOnlyRegex = /^[a-zA-Z\s\.]+$/;
    const numberOnlyRegex = /^\d+$/;
    const cnicRegex = /^\d{13}$/;
    const phoneRegex = /^\d{11}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com|outlook\.com)$/;

    // 1. Text Only Fields
    if (!textOnlyRegex.test(fullName)) errors.fullName = "Full Name should only contain text.";
    if (!textOnlyRegex.test(guardianName)) errors.guardianName = "Guardian Name should only contain text.";
    if (!textOnlyRegex.test(guardianOccupation)) errors.guardianOccupation = "Occupation should only contain text.";
    if (!textOnlyRegex.test(religion)) errors.religion = "Religion should only contain text.";
    if (!textOnlyRegex.test(nationality)) errors.nationality = "Nationality should only contain text.";
    if (matricBoard && !textOnlyRegex.test(matricBoard)) errors.matricBoard = "Board should only contain text.";
    if (interBoard && !textOnlyRegex.test(interBoard)) errors.interBoard = "Board should only contain text.";

    // 2. Numbers Only
    if (guardianIncome && !numberOnlyRegex.test(guardianIncome)) errors.guardianIncome = "Income should only contain numbers.";
    if (!numberOnlyRegex.test(matricMarks)) errors.matricMarks = "Marks should only contain numbers.";
    if (!numberOnlyRegex.test(matricYear)) errors.matricYear = "Year should only contain numbers.";
    if (!numberOnlyRegex.test(interMarks)) errors.interMarks = "Marks should only contain numbers.";
    if (!numberOnlyRegex.test(interYear)) errors.interYear = "Year should only contain numbers.";

    // 3. Exact Length & Format
    if (!cnicRegex.test(cnic)) errors.cnic = "CNIC must be exactly 13 digits (no dashes).";
    if (!phoneRegex.test(phone)) errors.phone = "Phone must be exactly 11 digits.";
    if (!phoneRegex.test(guardianContact)) errors.guardianContact = "Guardian Contact must be exactly 11 digits.";
    
    // 4. Email Validation
    if (!emailRegex.test(email)) errors.email = "Please use a valid personal email (Gmail, Hotmail, etc).";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Find the first field with an error and scroll to it
      const firstErrorField = Object.keys(validateForm.errors || {})[0]; // Note: validateForm needs to return errors or we need to access state. 
      // Since validateForm sets state, we can't access updated state immediately. 
      // Better approach: Re-run validation logic or modify validateForm to return errors.
      
      // Let's modify the logic slightly to be robust:
      // We will rely on the fact that setFieldErrors was called. 
      // But state updates are async. So we should calculate errors here locally or wait.
      // Actually, let's just re-calculate errors for scrolling purposes since it's fast.
      const errors = {};
      const { 
        fullName, cnic, email, phone, guardianName, guardianOccupation, guardianContact, 
        matricMarks, matricYear, interMarks, interYear, guardianIncome,
        schoolName, collegeName, matricBoard, interBoard, religion, nationality
      } = formData;

      // Helper Regex (Same as validateForm)
      const textOnlyRegex = /^[a-zA-Z\s\.]+$/;
      const numberOnlyRegex = /^\d+$/;
      const cnicRegex = /^\d{13}$/;
      const phoneRegex = /^\d{11}$/;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com|outlook\.com)$/;

      if (!textOnlyRegex.test(fullName)) errors.fullName = true;
      if (!textOnlyRegex.test(guardianName)) errors.guardianName = true;
      if (!textOnlyRegex.test(guardianOccupation)) errors.guardianOccupation = true;
      if (!textOnlyRegex.test(religion)) errors.religion = true;
      if (!textOnlyRegex.test(nationality)) errors.nationality = true;
      if (matricBoard && !textOnlyRegex.test(matricBoard)) errors.matricBoard = true;
      if (interBoard && !textOnlyRegex.test(interBoard)) errors.interBoard = true;
      if (guardianIncome && !numberOnlyRegex.test(guardianIncome)) errors.guardianIncome = true;
      if (!numberOnlyRegex.test(matricMarks)) errors.matricMarks = true;
      if (!numberOnlyRegex.test(matricYear)) errors.matricYear = true;
      if (!numberOnlyRegex.test(interMarks)) errors.interMarks = true;
      if (!numberOnlyRegex.test(interYear)) errors.interYear = true;
      if (!cnicRegex.test(cnic)) errors.cnic = true;
      if (!phoneRegex.test(phone)) errors.phone = true;
      if (!phoneRegex.test(guardianContact)) errors.guardianContact = true;
      if (!emailRegex.test(email)) errors.email = true;

      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.getElementsByName(firstError)[0];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    const data = new FormData();
    
    // Append text fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    // Append files
    Object.keys(files).forEach(key => {
      if (files[key]) {
        data.append(key, files[key]);
      }
    });

    // Manual validation for files
    if (!files.cnicFront || !files.cnicBack || !files.matricTranscript || !files.interTranscript) {
      alert('Please upload all required documents.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.post('/admissions', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Application submitted successfully!');
      fetchApplications();
      
      // Reset form
      setFormData({
        fullName: '', cnic: '', dateOfBirth: '', bloodGroup: '', religion: '', nationality: 'Pakistani',
        email: '', phone: '', address: '',
        guardianName: '', guardianOccupation: '', guardianIncome: '', guardianContact: '',
        matricMarks: '', matricBoard: '', matricYear: '', matricSchool: '',
        interMarks: '', interBoard: '', interYear: '', interCollege: '',
        programApplied: '', semester: 1, shift: 'Morning', department: ''
      });
      setFiles({ cnicFront: null, cnicBack: null, matricTranscript: null, interTranscript: null });
      setFieldErrors({}); // Clear errors
      
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Error submitting application';
      toast.error(errorMsg);

      // Backend Error Scrolling
      const errorField = error.response?.data?.field;
      if (errorField) {
        const element = document.getElementsByName(errorField)[0];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
          // Optionally set field error state to show red border immediately
          setFieldErrors(prev => ({ ...prev, [errorField]: errorMsg }));
        }
      }
    }
  };

  const openConfirmModal = (id, action) => {
    let title = '';
    let message = '';
    let isDanger = false;

    if (action === 'Approved') {
      title = 'Approve Application';
      message = 'Are you sure you want to Approve this student? This will create a student account.';
      isDanger = false;
    } else if (action === 'Rejected') {
      title = 'Reject Application';
      message = 'Are you sure? This action cannot be undone.';
      isDanger = true;
    } else if (action === 'Delete') {
      title = 'Delete Application';
      message = 'Are you sure you want to delete this application? This action cannot be undone.';
      isDanger = true;
    }

    setConfirmModal({
      isOpen: true,
      id,
      action,
      title,
      message,
      isDanger
    });
  };

  const handleConfirmAction = async () => {
    const { id, action } = confirmModal;

    if (action === 'Delete') {
        try {
          await api.delete(`/admissions/${id}`);
          toast.success('Application deleted successfully');
          fetchApplications();
        } catch (error) {
          console.error(error);
          toast.error(error.response?.data?.message || 'Error deleting application');
        }
    } else {
        try {
          await api.put(`/admissions/${id}`, { status: action });
          toast.success(`Application ${action} successfully`);
          fetchApplications();
        } catch (error) {
          console.error(error);
          toast.error(error.response?.data?.message || 'Error updating status');
        }
    }
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  // Filtering Logic
  const getFilteredApplications = () => {
    let filtered = applications;

    if (activeTab === 'recent') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(app => app.applicationDate && app.applicationDate.split('T')[0] === today);
    } else {
      // History Tab Filters
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(app => 
          app.fullName.toLowerCase().includes(lowerTerm) || 
          app.cnic.includes(searchTerm)
        );
      }
      if (filterDate) {
        filtered = filtered.filter(app => app.applicationDate && app.applicationDate.split('T')[0] === filterDate);
      }
    }
    return filtered;
  };

  const displayedApplications = getFilteredApplications();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admissions</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">New Application</h2>
        <p className="text-sm text-red-600 mb-4">* Fields marked with * are required</p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Info */}
          <h3 className="col-span-2 font-medium text-gray-700 mt-2">Personal Information</h3>
          <div>
             <label className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
             <input 
               name="fullName" 
               value={formData.fullName} 
               placeholder="Full Name" 
               onChange={handleInputChange} 
               className={`p-2 border rounded w-full ${fieldErrors.fullName ? 'border-red-500' : ''}`} 
               required 
             />
             {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>}
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">CNIC <span className="text-red-500">*</span></label>
             <input 
               name="cnic" 
               value={formData.cnic} 
               placeholder="CNIC (13 digits)" 
               onChange={handleInputChange} 
               className={`p-2 border rounded w-full ${fieldErrors.cnic ? 'border-red-500' : ''}`} 
               required 
             />
             {fieldErrors.cnic && <p className="text-red-500 text-xs mt-1">{fieldErrors.cnic}</p>}
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
             <input name="dateOfBirth" value={formData.dateOfBirth} type="date" onChange={handleInputChange} className="p-2 border rounded w-full" required />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Blood Group</label>
             <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="p-2 border rounded w-full">
              <option value="">Select Blood Group</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Religion <span className="text-red-500">*</span></label>
             <input 
               name="religion" 
               value={formData.religion} 
               placeholder="Religion" 
               onChange={handleInputChange} 
               className={`p-2 border rounded w-full ${fieldErrors.religion ? 'border-red-500' : ''}`} 
               required 
             />
             {fieldErrors.religion && <p className="text-red-500 text-xs mt-1">{fieldErrors.religion}</p>}
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Nationality <span className="text-red-500">*</span></label>
             <input 
               name="nationality" 
               value={formData.nationality} 
               placeholder="Nationality" 
               onChange={handleInputChange} 
               className={`p-2 border rounded w-full ${fieldErrors.nationality ? 'border-red-500' : ''}`} 
               required 
             />
             {fieldErrors.nationality && <p className="text-red-500 text-xs mt-1">{fieldErrors.nationality}</p>}
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
             <input 
               name="email" 
               value={formData.email} 
               type="email" 
               placeholder="Personal Email" 
               onChange={handleInputChange} 
               className={`p-2 border rounded w-full ${fieldErrors.email ? 'border-red-500' : ''}`} 
               required 
             />
             {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
             <input 
               name="phone" 
               value={formData.phone} 
               placeholder="Phone (11 digits)" 
               onChange={handleInputChange} 
               className={`p-2 border rounded w-full ${fieldErrors.phone ? 'border-red-500' : ''}`} 
               required 
             />
             {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>
          <div className="col-span-2">
             <label className="block text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
             <textarea name="address" value={formData.address} placeholder="Address" onChange={handleInputChange} className="p-2 border rounded w-full" required />
          </div>

          {/* Guardian Info */}
          <h3 className="col-span-2 font-medium text-gray-700 mt-2">Guardian Information</h3>
          <div>
             <label className="block text-sm font-medium text-gray-700">Guardian Name <span className="text-red-500">*</span></label>
             <input 
               name="guardianName" 
               value={formData.guardianName} 
               placeholder="Guardian Name" 
               onChange={handleInputChange} 
               className={`p-2 border rounded w-full ${fieldErrors.guardianName ? 'border-red-500' : ''}`} 
               required 
             />
             {fieldErrors.guardianName && <p className="text-red-500 text-xs mt-1">{fieldErrors.guardianName}</p>}
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Occupation <span className="text-red-500">*</span></label>
             <input 
               name="guardianOccupation" 
               value={formData.guardianOccupation} 
               placeholder="Occupation" 
               onChange={handleInputChange} 
               className={`p-2 border rounded w-full ${fieldErrors.guardianOccupation ? 'border-red-500' : ''}`} 
               required 
             />
             {fieldErrors.guardianOccupation && <p className="text-red-500 text-xs mt-1">{fieldErrors.guardianOccupation}</p>}
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Annual Income</label>
             <input 
               name="guardianIncome" 
               value={formData.guardianIncome} 
               type="number" 
               placeholder="Annual Income" 
               onChange={handleInputChange} 
               className={`p-2 border rounded w-full ${fieldErrors.guardianIncome ? 'border-red-500' : ''}`} 
             />
             {fieldErrors.guardianIncome && <p className="text-red-500 text-xs mt-1">{fieldErrors.guardianIncome}</p>}
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Guardian Contact <span className="text-red-500">*</span></label>
             <input 
               name="guardianContact" 
               value={formData.guardianContact} 
               placeholder="Guardian Contact (11 digits)" 
               onChange={handleInputChange} 
               className={`p-2 border rounded w-full ${fieldErrors.guardianContact ? 'border-red-500' : ''}`} 
               required 
             />
             {fieldErrors.guardianContact && <p className="text-red-500 text-xs mt-1">{fieldErrors.guardianContact}</p>}
          </div>

          {/* Academic History */}
          <h3 className="col-span-2 font-medium text-gray-700 mt-2">Academic History (Matric / O-Levels)</h3>
          <div>
             <label className="block text-sm font-medium text-gray-700">Marks Obtained <span className="text-red-500">*</span></label>
             <input name="matricMarks" value={formData.matricMarks} type="number" placeholder="Marks Obtained" onChange={handleInputChange} className="p-2 border rounded w-full" required />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Board/University <span className="text-red-500">*</span></label>
             <input name="matricBoard" value={formData.matricBoard} placeholder="Board/University" onChange={handleInputChange} className="p-2 border rounded w-full" required />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Passing Year <span className="text-red-500">*</span></label>
             <input name="matricYear" value={formData.matricYear} type="number" placeholder="Passing Year" onChange={handleInputChange} className="p-2 border rounded w-full" required />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">School Name</label>
             <input name="matricSchool" value={formData.matricSchool} placeholder="School Name" onChange={handleInputChange} className="p-2 border rounded w-full" />
          </div>

          <h3 className="col-span-2 font-medium text-gray-700 mt-2">Academic History (Inter / A-Levels)</h3>
          <div>
             <label className="block text-sm font-medium text-gray-700">Marks Obtained <span className="text-red-500">*</span></label>
             <input name="interMarks" value={formData.interMarks} type="number" placeholder="Marks Obtained" onChange={handleInputChange} className="p-2 border rounded w-full" required />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Board/University <span className="text-red-500">*</span></label>
             <input name="interBoard" value={formData.interBoard} placeholder="Board/University" onChange={handleInputChange} className="p-2 border rounded w-full" required />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Passing Year <span className="text-red-500">*</span></label>
             <input name="interYear" value={formData.interYear} type="number" placeholder="Passing Year" onChange={handleInputChange} className="p-2 border rounded w-full" required />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">College Name</label>
             <input name="interCollege" value={formData.interCollege} placeholder="College Name" onChange={handleInputChange} className="p-2 border rounded w-full" />
          </div>

          {/* Program */}
          <h3 className="col-span-2 font-medium text-gray-700 mt-2">Program Details</h3>
          <div className="col-span-1">
             <label className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
             <select 
               name="department" 
               value={formData.department} 
               onChange={handleDepartmentChange} 
               className="p-2 border rounded w-full"
               required
             >
               <option value="">Select Department</option>
               {departments.map(dept => (
                 <option key={dept._id} value={dept.name}>{dept.name}</option>
               ))}
             </select>
          </div>
          <div className="col-span-1">
             <label className="block text-sm font-medium text-gray-700">Program Applied For <span className="text-red-500">*</span></label>
             <input 
               name="programApplied" 
               value={formData.programApplied} 
               placeholder="Auto-filled based on Department" 
               readOnly
               className="p-2 border rounded w-full bg-gray-100 cursor-not-allowed" 
             />
          </div>
          <div className="col-span-1">
             <label className="block text-sm font-medium text-gray-700">Shift <span className="text-red-500">*</span></label>
             <select name="shift" value={formData.shift} onChange={handleInputChange} className="p-2 border rounded w-full">
               <option value="Morning">Morning</option>
               <option value="Evening">Evening</option>
             </select>
          </div>

          {/* Documents */}
          <h3 className="col-span-2 font-medium text-gray-700 mt-2">Documents Upload</h3>
          <div className="col-span-1">
            <label className="block text-sm text-gray-600">CNIC Front <span className="text-red-500">*</span></label>
            <input type="file" name="cnicFront" onChange={handleFileChange} className="p-2 border rounded w-full" accept="image/*,application/pdf" required />
            {fieldErrors.cnicFront && <p className="text-red-500 text-xs mt-1">{fieldErrors.cnicFront}</p>}
          </div>
          <div className="col-span-1">
            <label className="block text-sm text-gray-600">CNIC Back <span className="text-red-500">*</span></label>
            <input type="file" name="cnicBack" onChange={handleFileChange} className="p-2 border rounded w-full" accept="image/*,application/pdf" required />
            {fieldErrors.cnicBack && <p className="text-red-500 text-xs mt-1">{fieldErrors.cnicBack}</p>}
          </div>
          <div className="col-span-1">
            <label className="block text-sm text-gray-600">Matric Transcript <span className="text-red-500">*</span></label>
            <input type="file" name="matricTranscript" onChange={handleFileChange} className="p-2 border rounded w-full" accept="image/*,application/pdf" required />
            {fieldErrors.matricTranscript && <p className="text-red-500 text-xs mt-1">{fieldErrors.matricTranscript}</p>}
          </div>
          <div className="col-span-1">
            <label className="block text-sm text-gray-600">Inter Transcript <span className="text-red-500">*</span></label>
            <input type="file" name="interTranscript" onChange={handleFileChange} className="p-2 border rounded w-full" accept="image/*,application/pdf" required />
            {fieldErrors.interTranscript && <p className="text-red-500 text-xs mt-1">{fieldErrors.interTranscript}</p>}
          </div>

          <button type="submit" className="bg-primary text-white p-3 rounded col-span-2 mt-4 font-bold hover:bg-blue-700 transition">Submit Application</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Applications</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'recent' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Recent (Today)
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'history' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              History (All)
            </button>
          </div>
        </div>

        {activeTab === 'history' && (
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <input 
              type="text" 
              placeholder="Search by Name or CNIC..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded flex-1"
            />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="p-2 border rounded"
            />
            <button 
              onClick={() => { setSearchTerm(''); setFilterDate(''); }}
              className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3">Name</th>
                <th className="p-3">CNIC</th>
                <th className="p-3">Date</th>
                <th className="p-3">Program</th>
                <th className="p-3">Shift</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedApplications.length > 0 ? (
                displayedApplications.map(app => (
                  <tr key={app._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{app.fullName}</td>
                    <td className="p-3">{app.cnic}</td>
                    <td className="p-3">{new Date(app.applicationDate).toLocaleDateString()}</td>
                    <td className="p-3">{app.programApplied}</td>
                    <td className="p-3">{app.shift || 'Morning'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-3 flex items-center space-x-2">
                      {app.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => openConfirmModal(app._id, 'Approved')}
                            className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button 
                            onClick={() => openConfirmModal(app._id, 'Rejected')}
                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            title="Reject"
                          >
                            ✕
                          </button>
                        </>
                      )}
                      {app.status === 'Rejected' && (
                        <button 
                          onClick={() => openConfirmModal(app._id, 'Delete')}
                          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">No applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
      />
    </div>
  );
};

export default Admissions;
