import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/complaints/${id}`, { status: newStatus });
      // Optimistic update
      setComplaints(complaints.map(c => c._id === id ? { ...c, status: newStatus } : c));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <FaExclamationCircle className="mr-3 text-red-500" /> Manage Complaints
      </h1>

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-750 text-gray-400 border-b border-gray-600">
                  <th className="p-4">Date</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Issue</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(complaint => (
                  <tr key={complaint._id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="p-4 text-gray-300 text-sm">{new Date(complaint.date).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-300">
                      <div className="font-bold text-white">{complaint.user?.name}</div>
                      <div className="text-xs text-gray-500">{complaint.user?.email}</div>
                    </td>
                    <td className="p-4 text-gray-300 text-sm">{complaint.category}</td>
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-white mb-1">{complaint.title}</div>
                      <div className="text-sm text-gray-400 truncate" title={complaint.description}>{complaint.description}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={complaint.status} 
                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                        className="bg-gray-700 text-white text-sm rounded border border-gray-600 p-2 focus:border-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {complaints.length === 0 && (
            <p className="p-8 text-center text-gray-400">No complaints found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
