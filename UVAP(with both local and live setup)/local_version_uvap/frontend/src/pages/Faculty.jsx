import { useState, useEffect } from 'react';
import api from '../services/api';

const Faculty = () => {
  const [facultyList, setFacultyList] = useState([]);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/faculty');
      setFacultyList(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Faculty Directory</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facultyList.map(prof => (
          <div key={prof._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-2xl font-bold text-gray-500">
              {prof.user?.name?.charAt(0)}
            </div>
            <h3 className="font-bold text-lg text-gray-800">{prof.user?.name}</h3>
            <p className="text-primary font-medium">{prof.designation}</p>
            <p className="text-sm text-gray-500 mb-2">{prof.department}</p>
            <p className="text-xs text-gray-400">{prof.user?.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faculty;
