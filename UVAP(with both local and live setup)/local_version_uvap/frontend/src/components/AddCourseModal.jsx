import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AddCourseModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    credits: '',
    department: '',
    program: '',
    semester: ''
  });

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        code: initialData.code,
        credits: initialData.credits,
        department: initialData.department,
        program: initialData.program || '',
        semester: initialData.semester || ''
      });
    } else {
      setFormData({
        title: '',
        code: '',
        credits: '',
        department: '',
        program: '',
        semester: ''
      });
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      const selectedDept = departments.find(d => d.name === value);
      const program = selectedDept ? selectedDept.programCode : '';
      setFormData(prev => ({ ...prev, [name]: value, program }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        credits: Number(formData.credits),
        semester: Number(formData.semester)
      };

      if (initialData) {
        await api.put(`/courses/${initialData._id}`, payload);
        toast.success('Course updated successfully!');
      } else {
        await api.post('/courses', payload);
        toast.success('Course added successfully!');
      }
      
      await onSuccess(); // Trigger refresh in parent and wait
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Error saving course');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Subject' : 'Add New Subject'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
            <input name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Code (Optional)</label>
            <input name="code" value={formData.code} onChange={handleInputChange} className="w-full p-2 border rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <select name="credits" value={formData.credits} onChange={handleInputChange} className="w-full p-2 border rounded" required>
                <option value="">Select Credits</option>
                {[1, 2, 3, 4].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select name="semester" value={formData.semester} onChange={handleInputChange} className="w-full p-2 border rounded" required>
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select name="department" value={formData.department} onChange={handleInputChange} className="w-full p-2 border rounded" required>
              <option value="">Select Department</option>
              {departments.map(dept => <option key={dept._id} value={dept.name}>{dept.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program (Auto-Selected)</label>
            <input name="program" value={formData.program} readOnly className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed" />
          </div>
          <button type="submit" className="w-full bg-primary text-white p-2 rounded hover:bg-blue-700 transition">
            {initialData ? 'Update Subject' : 'Add Subject'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;
