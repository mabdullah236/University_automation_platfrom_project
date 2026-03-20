import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaPlus, FaTrash, FaEdit, FaBed } from 'react-icons/fa';

const Hostel = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Boys',
    totalRooms: '',
    capacity: '',
    warden: '',
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const res = await api.get('/hostels');
      setHostels(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hostels', formData);
      setShowModal(false);
      setFormData({
        name: '',
        type: 'Boys',
        totalRooms: '',
        capacity: '',
        warden: '',
      });
      fetchHostels();
    } catch (error) {
      console.error('Error adding hostel:', error);
      alert('Failed to add hostel');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hostel?')) {
      try {
        await api.delete(`/hostels/${id}`);
        fetchHostels();
      } catch (error) {
        console.error('Error deleting hostel:', error);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <FaBed className="mr-3 text-blue-500" /> Hostel Management
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center transition-colors"
        >
          <FaPlus className="mr-2" /> Add New Hostel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
              <tr>
                <th className="py-3 px-4">Building Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Total Rooms</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Warden</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {hostels.length > 0 ? (
                hostels.map((hostel) => (
                  <tr key={hostel._id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{hostel.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${hostel.type === 'Boys' ? 'bg-blue-900 text-blue-300' : 'bg-pink-900 text-pink-300'}`}>
                        {hostel.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{hostel.totalRooms}</td>
                    <td className="py-3 px-4">{hostel.capacity}</td>
                    <td className="py-3 px-4">{hostel.warden}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button onClick={() => handleDelete(hostel._id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    No hostels found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">Add New Hostel</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Building Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>
              <div className="flex space-x-4 mb-4">
                <div className="w-1/2">
                  <label className="block text-gray-400 mb-1">Total Rooms</label>
                  <input
                    type="number"
                    name="totalRooms"
                    value={formData.totalRooms}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-400 mb-1">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 mb-1">Warden Name</label>
                <input
                  type="text"
                  name="warden"
                  value={formData.warden}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Add Hostel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hostel;
