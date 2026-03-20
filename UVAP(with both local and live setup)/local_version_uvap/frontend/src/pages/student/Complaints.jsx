import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaExclamationCircle, FaPlus, FaHistory } from 'react-icons/fa';

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic',
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', formData);
      alert('Complaint submitted successfully!');
      setShowForm(false);
      fetchComplaints();
      setFormData({ title: '', description: '', category: 'Academic' });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint.');
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FaExclamationCircle className="mr-3 text-red-500" /> Complaints & Grievances
        </h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <FaPlus className="mr-2" /> {showForm ? 'Close Form' : 'New Complaint'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Submit a Complaint</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1">Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
              >
                <option value="Academic">Academic</option>
                <option value="Hostel">Hostel</option>
                <option value="Transport">Transport</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                required
                placeholder="Brief summary of the issue"
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                required
                rows="4"
                placeholder="Detailed description..."
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
              ></textarea>
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded font-bold transition-colors">
              Submit Complaint
            </button>
          </form>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="p-4 bg-gray-700 border-b border-gray-600 flex items-center">
          <FaHistory className="mr-2" /> <h3 className="font-semibold">My Complaints History</h3>
        </div>
        {complaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-750 text-gray-400 border-b border-gray-600">
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(complaint => (
                  <tr key={complaint._id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="p-4 text-gray-300">{new Date(complaint.date).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-300">{complaint.category}</td>
                    <td className="p-4 font-medium text-white">{complaint.title}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-gray-400">No complaints found.</p>
        )}
      </div>
    </div>
  );
};

export default StudentComplaints;
