import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaUsers, FaList, FaFilter, FaTrash, FaExchangeAlt, FaExclamationTriangle } from 'react-icons/fa';

const SectionsView = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    batch: '',
    shift: ''
  });
  const [deleteModal, setDeleteModal] = useState(null);
  const [mergeModal, setMergeModal] = useState(null);
  const [targetSection, setTargetSection] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/students/sections/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch section statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Extract Unique Options for Filters
  const uniqueDepartments = [...new Set(stats.map(item => item._id.program))].sort();
  const uniqueBatches = [...new Set(stats.map(item => item._id.batch))].sort().reverse();

  const filteredStats = stats.filter(item => {
    const { program, batch, shift } = item._id;
    return (
      (filters.department === '' || program === filters.department) &&
      (filters.batch === '' || batch === filters.batch) &&
      (filters.shift === '' || (shift || 'Morning') === filters.shift)
    );
  });

  const handleViewList = (program, semester, section) => {
    navigate(`/students?department=${program}&semester=${semester}&section=${section}`);
  };

  const handleDeleteSection = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      const { program, batch, semester, section, shift } = deleteModal;
      const res = await api.post('/students/sections/delete', {
        program, batch, semester, section, shift
      });
      if (res.data.success) {
        setDeleteModal(null);
        fetchStats(); // Refresh data
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Delete failed';
      alert(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMergeSections = async () => {
    if (!mergeModal || !targetSection) return;
    setActionLoading(true);
    try {
      const { program, batch, semester, section, shift } = mergeModal;
      const res = await api.post('/students/sections/merge', {
        program, batch, semester, sourceSection: section, targetSection, shift
      });
      if (res.data.success) {
        setMergeModal(null);
        setTargetSection('');
        fetchStats(); // Refresh data
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Merge failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Section Analytics</h1>
            <p className="text-gray-500 mt-1 text-sm">Real-time distribution of students across active sections.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Department Filter */}
            <div className="relative group">
              <FaFilter className="absolute left-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer hover:border-gray-300 transition-all"
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div className="relative group">
              <FaFilter className="absolute left-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <select
                name="batch"
                value={filters.batch}
                onChange={handleFilterChange}
                className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer hover:border-gray-300 transition-all"
              >
                <option value="">All Batches</option>
                {uniqueBatches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>

            {/* Shift Filter */}
            <div className="relative group">
              <FaFilter className="absolute left-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <select
                name="shift"
                value={filters.shift}
                onChange={handleFilterChange}
                className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer hover:border-gray-300 transition-all"
              >
                <option value="">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
             <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="px-6 py-4">Program</th>
                    <th className="px-6 py-4">Batch</th>
                    <th className="px-6 py-4">Shift</th>
                    <th className="px-6 py-4">Semester</th>
                    <th className="px-6 py-4">Section</th>
                    <th className="px-6 py-4 text-center">Students</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredStats.map((item, index) => {
                    const { program, batch, semester, section, shift } = item._id;
                    if (!section) return null; // Safety check for ghost rows
                    const isFull = item.count >= 50; // Assuming 50 is max
                    
                    return (
                      <tr key={index} className="hover:bg-blue-50/50 transition-colors duration-150 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-800">{program}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">{batch}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            shift === 'Evening' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {shift || 'Morning'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{semester}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shadow-sm">
                            {section}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <FaUsers className={`text-gray-400 ${isFull ? 'text-red-400' : ''}`} />
                            <span className={`font-semibold ${isFull ? 'text-red-600' : 'text-gray-700'}`}>{item.count}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewList(program, semester, section)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="View Student List"
                            >
                              <FaList />
                            </button>
                            <button
                              onClick={() => setMergeModal({ program, batch, semester, section, shift })}
                              className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Merge Section"
                            >
                              <FaExchangeAlt />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ program, batch, semester, section, shift })}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Section"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStats.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <FaFilter className="text-4xl mb-3 opacity-20" />
                          <p className="text-lg font-medium text-gray-500">No sections found</p>
                          <p className="text-sm">Try adjusting your filters to see more results.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
               <span>Showing {filteredStats.length} active sections</span>
               <span>Total Students: {filteredStats.reduce((acc, curr) => acc + curr.count, 0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all scale-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Section {deleteModal.section}?</h3>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete this section? All students currently in 
              <span className="font-bold text-gray-800 mx-1">{deleteModal.program} {deleteModal.batch} ({deleteModal.shift}) - Section {deleteModal.section}</span> 
              will be marked as <span className="font-semibold text-red-600">Unassigned</span>.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSection}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Section Modal */}
      {mergeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all scale-100">
             <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaExchangeAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-gray-900">Merge Sections</h3>
                 <p className="text-sm text-gray-500">Move students from one section to another.</p>
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Source</p>
                <p className="font-medium text-gray-800">{mergeModal.program} {mergeModal.batch} ({mergeModal.shift})</p>
                <p className="text-lg font-bold text-blue-600 mt-1">Section {mergeModal.section}</p>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                 <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                    <FaExchangeAlt className="text-gray-400 rotate-90" />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Section</label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Select Destination Section</option>
                  {/* Dynamic Sections from Stats */}
                  {[...new Set(stats
                    .filter(s => 
                      s._id.program === mergeModal.program && 
                      s._id.batch === mergeModal.batch && 
                      s._id.shift === mergeModal.shift &&
                      s._id.section !== mergeModal.section
                    )
                    .map(s => s._id.section)
                  )].sort().map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  All students from Section {mergeModal.section} will be moved to the selected target section.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setMergeModal(null); setTargetSection(''); }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMergeSections}
                disabled={actionLoading || !targetSection}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Merging...' : 'Merge Sections'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionsView;
