import { useAuth } from '../context/AuthContext';
import { FaUniversity, FaIdCard } from 'react-icons/fa';

const IDCard = () => {
  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Digital ID Card</h1>
      
      <div className="bg-white w-96 rounded-xl shadow-2xl overflow-hidden border border-gray-200 relative">
        {/* Header */}
        <div className="bg-primary h-24 flex items-center justify-center relative">
          <div className="absolute top-4 right-4 text-white/20">
            <FaUniversity size={60} />
          </div>
          <h2 className="text-white text-xl font-bold z-10">UVAP University</h2>
        </div>

        {/* Profile Image Area */}
        <div className="flex justify-center -mt-12 relative z-10">
          <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center text-4xl text-gray-500">
            {user.name.charAt(0)}
          </div>
        </div>

        {/* Details */}
        <div className="text-center p-6">
          <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
          <p className="text-primary font-medium uppercase tracking-wide text-sm mb-4">{user.role}</p>
          
          <div className="space-y-2 text-left bg-gray-50 p-4 rounded-lg text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">ID Number:</span>
              <span className="font-mono font-bold text-gray-700">{user._id.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="text-gray-700">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valid Thru:</span>
              <span className="text-gray-700">Dec 2025</span>
            </div>
          </div>

          <div className="mt-6">
             {/* Mock Barcode */}
            <div className="h-12 bg-gray-800 w-full rounded flex items-center justify-center text-white font-mono text-xs tracking-[0.5em]">
              ||| || ||| || |||| |||
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => window.print()} 
        className="mt-8 bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center hover:bg-gray-700 transition"
      >
        <FaIdCard className="mr-2" /> Print ID Card
      </button>
    </div>
  );
};

export default IDCard;
