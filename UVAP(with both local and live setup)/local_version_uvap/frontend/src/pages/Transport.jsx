import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaBus, FaMapMarkerAlt } from 'react-icons/fa';

const Transport = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/facilities/transport');
      setRoutes(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Transport Services</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map(route => (
          <div key={route._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                <FaBus size={24} />
              </div>
              <span className="font-bold text-2xl text-gray-800">{route.routeNumber}</span>
            </div>
            
            <h3 className="font-bold text-lg text-gray-800 mb-2">{route.routeName}</h3>
            <p className="text-sm text-gray-500 mb-4">Driver: {route.driverName}</p>
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stops</h4>
              {route.stops.map((stop, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="flex items-center text-gray-700">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" size={12} />
                    {stop.name}
                  </span>
                  <span className="text-gray-500">{stop.time}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transport;
