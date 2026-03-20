import React, { useState, useEffect } from 'react';
import { FaKey, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResetPasswordModal = ({ isOpen, onClose, userId, adminPassword }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });

  useEffect(() => {
    setValidations({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      match: newPassword && newPassword === confirmPassword
    });
  }, [newPassword, confirmPassword]);

  if (!isOpen) return null;

  const isFormValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      return toast.error('Please meet all password requirements');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password-admin', {
        userId,
        newPassword,
        adminPassword
      });

      if (res.data.success) {
        toast.success('Password reset successfully. Emails sent.');
        onClose();
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({ fulfilled, text }) => (
    <div className={`flex items-center gap-2 text-xs ${fulfilled ? 'text-green-600' : 'text-gray-400'}`}>
      {fulfilled ? <FaCheck /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
        <div className="text-center mb-6">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaKey className="text-green-600 text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Reset User Password</h3>
          <p className="text-gray-500 mt-2">Enter a secure password for the user.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="New Password"
              required
            />
            {/* Live Validation Indicators */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ValidationItem fulfilled={validations.length} text="At least 8 characters" />
              <ValidationItem fulfilled={validations.uppercase} text="One uppercase letter" />
              <ValidationItem fulfilled={validations.lowercase} text="One lowercase letter" />
              <ValidationItem fulfilled={validations.number} text="One number" />
              <ValidationItem fulfilled={validations.special} text="One special char" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all ${
                  confirmPassword && validations.match 
                    ? 'border-green-500 focus:ring-green-500' 
                    : confirmPassword 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-green-500'
                }`}
                placeholder="Confirm Password"
                required
              />
              {confirmPassword && (
                <div className="absolute right-3 top-3.5 text-lg">
                  {validations.match ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimes className="text-red-500" />
                  )}
                </div>
              )}
            </div>
            {confirmPassword && !validations.match && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading || !isFormValid}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
