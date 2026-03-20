import React, { useState } from 'react';
import { FaLock } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminVerifyModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!password) return toast.error('Please enter your password');
    
    setLoading(true);
    try {
      // We verify locally first to ensure it's correct before proceeding to the actual action
      // Or we can just pass the password to the parent action.
      // However, the requirement says "firstly admin will enter his password if password correct then he will go to update form".
      // So we need to verify here.
      const res = await api.post('/auth/verify-password', { password });
      if (res.data.success) {
        onSuccess(password); // Pass password back for the next step (reset action needs it)
        onClose();
        setPassword('');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Incorrect Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-blue-600 text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Admin Verification</h3>
          <p className="text-gray-500 mt-2">Enter your password to proceed.</p>
        </div>
        
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none text-center text-lg tracking-widest"
          placeholder="••••••"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
        />
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleVerify}
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminVerifyModal;
