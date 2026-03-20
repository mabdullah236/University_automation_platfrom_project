import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaBed, FaUtensils } from 'react-icons/fa';

const Hostel = () => {
  const [hostels, setHostels] = useState([]);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const res = await api.get('/facilities/hostels');
      setHostels(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Hostel Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hostels.map(hostel => (
          <div key={hostel._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl text-primary">{hostel.name}</h3>
                <span className="text-sm text-gray-500">{hostel.type} Hostel</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{hostel.availableRooms}</p>
                <p className="text-xs text-gray-400">Rooms Available</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4 text-gray-600">
              <FaBed />
              <span>Total Capacity: {hostel.totalRooms} Rooms</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2 text-gray-700 font-semibold">
                <FaUtensils />
                <span>Today's Mess Menu</span>
              </div>
              <p className="text-sm text-gray-600">
                {hostel.messMenu ? hostel.messMenu[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()] : 'Menu not available'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hostel;
