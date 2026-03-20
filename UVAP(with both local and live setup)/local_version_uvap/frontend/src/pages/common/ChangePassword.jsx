import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaLock } from 'react-icons/fa';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    setValidations({
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    });
  }, [newPassword]);

  const isFormValid = Object.values(validations).every(Boolean) && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      // Corrected endpoint based on authRoutes.js
      await api.put('/auth/change-password', {
        currentPassword: oldPassword,
        newPassword
      });
      
      toast.success('Password updated! Please login again.');
      
      // Auto-Logout
      localStorage.clear();
      navigate('/login');
      
    } catch (error) {
      console.error('Change Password Error:', error);
      let errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error updating password';
      
      if (error.response?.data?.attemptsRemaining !== undefined) {
        errorMessage += `. You have ${error.response.data.attemptsRemaining} attempts remaining.`;
      }
      
      toast.error(errorMessage);

      // SECURITY ENFORCEMENT: 
      // If the error is 'Incorrect current password' (400) or 'Account Locked' (403)
      if (error.response && (error.response.status === 400 || error.response.status === 403)) {
        setTimeout(() => {
          // Assuming you have a logout function from AuthContext, otherwise clear localStorage
          localStorage.removeItem('userInfo'); // Or whatever key you use
          localStorage.removeItem('token');
          navigate('/login'); // Use React Router for SPA navigation
        }, 2000); // 2 second delay so user can read the toast
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
          <p className="text-gray-500 mt-2">Secure your account with a strong password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input 
              type="password" 
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            
            {/* Validation Checklist */}
            <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg text-sm">
              <p className="font-medium text-gray-600 mb-2">Password Requirements:</p>
              
              <div className="flex items-center gap-2">
                {validations.length ? <FaCheck className="text-green-600" /> : <FaTimes className="text-red-500" />} 
                <span className={validations.length ? 'text-green-600' : 'text-gray-500'}>At least 8 characters</span>
              </div>

              <div className="flex items-center gap-2">
                {validations.upper ? <FaCheck className="text-green-600" /> : <FaTimes className="text-red-500" />}
                <span className={validations.upper ? 'text-green-600' : 'text-gray-500'}>One Uppercase letter</span>
              </div>

              <div className="flex items-center gap-2">
                {validations.lower ? <FaCheck className="text-green-600" /> : <FaTimes className="text-red-500" />}
                <span className={validations.lower ? 'text-green-600' : 'text-gray-500'}>One Lowercase letter</span>
              </div>

              <div className="flex items-center gap-2">
                {validations.number ? <FaCheck className="text-green-600" /> : <FaTimes className="text-red-500" />}
                <span className={validations.number ? 'text-green-600' : 'text-gray-500'}>One Number</span>
              </div>

              <div className="flex items-center gap-2">
                {validations.special ? <FaCheck className="text-green-600" /> : <FaTimes className="text-red-500" />}
                <span className={validations.special ? 'text-green-600' : 'text-gray-500'}>One Special Character</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={!isFormValid}
            className={`w-full py-3 rounded-lg font-medium transition-all shadow-md ${
              isFormValid 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
