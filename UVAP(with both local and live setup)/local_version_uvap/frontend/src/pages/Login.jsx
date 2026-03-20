import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaUser, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [lockUntil, setLockUntil] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Timer Effect
  useEffect(() => {
    let timer;
    if (lockUntil) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = new Date(lockUntil).getTime() - now;

        if (distance < 0) {
          clearInterval(timer);
          setLockUntil(null);
          setTimeLeft('');
          setError('');
        } else {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.user.isFirstLogin) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const data = err.response?.data;
      let errorMsg = data?.error || 'Login failed';

      if (data?.attemptsRemaining !== undefined) {
        setAttemptsLeft(data.attemptsRemaining);
        errorMsg += `. You have ${data.attemptsRemaining} attempts remaining.`;
      }
      
      setError(errorMsg);
      
      if (data?.lockUntil) {
        setLockUntil(data.lockUntil);
        setAttemptsLeft(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01]">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-primary">
            <FaUniversity size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to UVAP Portal</p>
        </div>

        {error && !lockUntil && (
          <div className={`p-4 mb-6 rounded border-l-4 ${attemptsLeft !== null && attemptsLeft < 5 ? 'bg-yellow-50 border-yellow-500 text-yellow-800' : 'bg-red-50 border-red-500 text-red-700'}`}>
            <p className="font-bold">{error}</p>
            {attemptsLeft !== null && attemptsLeft < 5 && (
              <p className="text-sm mt-1">⚠️ You have <strong>{attemptsLeft}</strong> attempts remaining before lockout.</p>
            )}
          </div>
        )}

        {lockUntil && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6 animate-pulse">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <FaLock size={24} />
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Account Locked</h3>
            <p className="text-red-600 mb-4">Too many failed attempts.</p>
            <div className="text-3xl font-mono font-bold text-red-700 bg-white inline-block px-6 py-2 rounded-lg shadow-sm border border-red-100">
              {timeLeft}
            </div>
            <p className="text-xs text-red-500 mt-3">Please wait until the timer expires.</p>
          </div>
        )}

        {!lockUntil && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaUser />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="you@uvap.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaLock />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-primary text-white p-3 rounded-lg font-bold shadow-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Sign In'}
          </button>
        </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>&copy; 2025 University Automation System</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
