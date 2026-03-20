import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaChalkboardTeacher, FaFlask, FaUsers, FaEdit, FaTrash, FaBuilding, FaBook } from 'react-icons/fa';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    capacity: '',
    type: 'Seminar Hall',
    block: ''
  });

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/v1/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch rooms');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingRoom) {
        await axios.put(`http://localhost:5001/api/v1/rooms/${editingRoom._id}`, formData, config);
        toast.success('Room updated successfully');
      } else {
        await axios.post('http://localhost:5001/api/v1/rooms', formData, config);
        toast.success('Room added successfully');
      }
      
      setShowModal(false);
      setEditingRoom(null);
      setFormData({ roomNumber: '', capacity: '', type: 'Seminar Hall', block: '' });
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = (id) => {
    setRoomToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/v1/rooms/${roomToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Room deleted');
      setShowDeleteModal(false);
      setRoomToDelete(null);
      fetchRooms();
    } catch (err) {
      toast.error('Failed to delete room');
    }
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      type: room.type,
      block: room.block || ''
    });
    setShowModal(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Lab': return <FaFlask className="text-purple-500" />;
      case 'Room': return <FaUsers className="text-green-500" />;
      case 'Library': return <FaBook className="text-orange-500" />;
      default: return <FaChalkboardTeacher className="text-blue-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Room Management</h1>
        <button
          onClick={() => {
            setEditingRoom(null);
            setFormData({ roomNumber: '', capacity: '', type: 'Seminar Hall', block: '' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Add Room
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(
            rooms.reduce((acc, room) => {
              const block = room.block || 'Unassigned';
              if (!acc[block]) acc[block] = [];
              acc[block].push(room);
              return acc;
            }, {})
          ).sort().map(([blockName, blockRooms]) => (
            <div key={blockName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => {
                  const el = document.getElementById(`block-${blockName}`);
                  el.classList.toggle('hidden');
                }}
                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FaBuilding className="text-gray-500" />
                  <h2 className="text-lg font-bold text-gray-800">{blockName}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {blockRooms.length} Rooms
                  </span>
                </div>
                <svg className="w-5 h-5 text-gray-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div id={`block-${blockName}`} className="hidden p-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {blockRooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })).map((room) => (
                    <div key={room._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 relative group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          {getTypeIcon(room.type)}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(room)} className="text-gray-400 hover:text-blue-600 transition-colors">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete(room._id)} className="text-gray-400 hover:text-red-600 transition-colors">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">{room.roomNumber}</h3>
                      <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                        <FaBuilding size={12} /> {room.block || 'Main Block'}
                      </p>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-600">{room.type}</span>
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Cap: {room.capacity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Room</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this room? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h2 className="text-xl font-bold mb-4">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. 4-G-6"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="Seminar Hall">Seminar Hall</option>
                  <option value="Lab">Lab</option>
                  <option value="Room">Room</option>
                  <option value="Library">Library</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Block (Optional)</label>
                <input
                  type="text"
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. CS Block"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
