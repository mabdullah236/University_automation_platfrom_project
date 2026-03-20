import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaSearch, FaEdit } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [shortName, setShortName] = useState('');
  const [programCode, setProgramCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit State
  const [editId, setEditId] = useState(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null
  });

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim() || !shortName.trim() || !programCode.trim()) {
      toast.error('All fields are required');
      return;
    }

    try {
      if (editId) {
        // Update existing department
        await api.put(`/departments/${editId}`, { 
          name: newDeptName,
          shortName,
          programCode
        });
        toast.success('Department updated successfully');
        setEditId(null);
      } else {
        // Add new department
        await api.post('/departments', { 
          name: newDeptName,
          shortName,
          programCode
        });
        toast.success('Department added successfully');
      }
      
      setNewDeptName('');
      setShortName('');
      setProgramCode('');
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(error.response?.data?.message || 'Failed to save department');
    }
  };

  const handleEdit = (dept) => {
    setEditId(dept._id);
    setNewDeptName(dept.name);
    setShortName(dept.shortName);
    setProgramCode(dept.programCode);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setNewDeptName('');
    setShortName('');
    setProgramCode('');
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/departments/${deleteModal.id}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
    setDeleteModal({ isOpen: false, id: null });
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.programCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Department Management</h1>
          <p className="text-gray-500 mt-1">Manage university departments and programs.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Add/Edit Department Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {editId ? 'Edit Department' : 'Add New Department'}
            </h2>
            {editId && (
              <button 
                onClick={handleCancelEdit}
                className="text-sm text-red-500 hover:text-red-700 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <form onSubmit={handleAddDepartment} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
              <input
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g., Information Technology"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g., IT"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program Code</label>
              <input
                type="text"
                value={programCode}
                onChange={(e) => setProgramCode(e.target.value)}
                placeholder="e.g., BSIT"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className={`w-full px-6 py-2 text-white rounded-lg flex items-center justify-center gap-2 transition-colors h-[42px] ${editId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {editId ? <FaEdit size={20} /> : <FaPlus size={20} />}
              {editId ? 'Update' : 'Add'}
            </button>
          </form>
        </div>

        {/* Departments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">All Departments</h2>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-4">Department Name</th>
                  <th className="px-6 py-4">Short Name</th>
                  <th className="px-6 py-4">Program Code</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading departments...</td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No departments found</td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => (
                    <tr key={dept._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">{dept.name}</td>
                      <td className="px-6 py-4 text-gray-600">{dept.shortName}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          {dept.programCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(dept)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Department"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(dept._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Department"
                        >
                          <FaTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        isDanger={true}
      />
    </div>
  );
};

export default Departments;
