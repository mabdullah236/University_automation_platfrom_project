import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaPlus, FaTrash, FaBus } from 'react-icons/fa';

const Transport = () => {
  const [transport, setTransport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    driverName: '',
    routeName: '',
    routeNumber: '',
    capacity: '',
  });

  useEffect(() => {
    fetchTransport();
  }, []);

  const fetchTransport = async () => {
    try {
      const res = await api.get('/transport');
      setTransport(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transport:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transport', formData);
      setShowModal(false);
      setFormData({
        vehicleNumber: '',
        driverName: '',
        routeName: '',
        routeNumber: '',
        capacity: '',
      });
      fetchTransport();
    } catch (error) {
      console.error('Error adding transport:', error);
      alert('Failed to add transport');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await api.delete(`/transport/${id}`);
        fetchTransport();
      } catch (error) {
        console.error('Error deleting transport:', error);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <FaBus className="mr-3 text-green-500" /> Transport Management
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center transition-colors"
        >
          <FaPlus className="mr-2" /> Add New Bus
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
              <tr>
                <th className="py-3 px-4">Bus Number</th>
                <th className="py-3 px-4">Driver Name</th>
                <th className="py-3 px-4">Route Name</th>
                <th className="py-3 px-4">Route No.</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {transport.length > 0 ? (
                transport.map((item) => (
                  <tr key={item._id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{item.vehicleNumber}</td>
                    <td className="py-3 px-4">{item.driverName}</td>
                    <td className="py-3 px-4">{item.routeName}</td>
                    <td className="py-3 px-4">{item.routeNumber}</td>
                    <td className="py-3 px-4">{item.capacity}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    No transport found. Add a bus to get started.
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
            <h2 className="text-2xl font-bold mb-4 text-white">Add New Bus</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Bus Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Driver Name</label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div className="flex space-x-4 mb-4">
                <div className="w-1/2">
                  <label className="block text-gray-400 mb-1">Route Name</label>
                  <input
                    type="text"
                    name="routeName"
                    value={formData.routeName}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-400 mb-1">Route No.</label>
                  <input
                    type="text"
                    name="routeNumber"
                    value={formData.routeNumber}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 mb-1">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-green-500"
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
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Add Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transport;
