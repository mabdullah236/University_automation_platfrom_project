import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaPlus, FaTrash, FaBoxOpen, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Electronics',
    quantity: 0,
    condition: 'New',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory');
      setItems(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/inventory/${currentId}`, formData);
      } else {
        await api.post('/inventory', formData);
      }
      setShowModal(false);
      setFormData({
        itemName: '',
        category: 'Electronics',
        quantity: 0,
        condition: 'New',
      });
      setIsEditing(false);
      setCurrentId(null);
      fetchInventory();
    } catch (error) {
      console.error('Error saving item:', error);
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      condition: item.condition,
    });
    setCurrentId(item._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const openDeleteModal = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/inventory/${itemToDelete}`);
      toast.success('Item deleted successfully');
      fetchInventory();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
    setIsDeleteModalOpen(false);
  };

  const openAddModal = () => {
    setFormData({
      itemName: '',
      category: 'Electronics',
      quantity: 0,
      condition: 'New',
    });
    setIsEditing(false);
    setCurrentId(null);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <FaBoxOpen className="mr-3 text-yellow-500" /> Inventory Management
        </h1>
        <button
          onClick={openAddModal}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex items-center transition-colors"
        >
          <FaPlus className="mr-2" /> Add New Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item._id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{item.itemName}</td>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          item.condition === 'New'
                            ? 'bg-green-900 text-green-300'
                            : item.condition === 'Good'
                            ? 'bg-blue-900 text-blue-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {item.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-300 transition-colors">
                        <FaEdit />
                      </button>
                      <button onClick={() => openDeleteModal(item._id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500">
                    No items found. Add one to get started.
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
            <h2 className="text-2xl font-bold mb-4 text-white">{isEditing ? 'Update Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-500"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Lab Equipment">Lab Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex space-x-4 mb-4">
                <div className="w-1/2">
                  <label className="block text-gray-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-400 mb-1">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Repairable">Repairable</option>
                  </select>
                </div>
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
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors"
                >
                  {isEditing ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        isDanger={true}
      />
    </div>
  );
};

export default Inventory;
