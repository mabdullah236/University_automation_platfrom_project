import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaLinkedin, FaUserTie } from 'react-icons/fa';

const Alumni = () => {
  const [alumniList, setAlumniList] = useState([]);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const res = await api.get('/advanced/alumni');
      setAlumniList(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Alumni Network</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumniList.map(alum => (
          <div key={alum._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full mb-4 flex items-center justify-center text-blue-600">
              <FaUserTie size={32} />
            </div>
            <h3 className="font-bold text-lg text-gray-800">{alum.name}</h3>
            <p className="text-primary font-medium">{alum.designation}</p>
            <p className="text-sm text-gray-500 mb-2">{alum.currentCompany}</p>
            <div className="text-xs text-gray-400 mb-4">
              <p>Class of {alum.graduationYear}</p>
              <p>{alum.degree}</p>
            </div>
            {alum.linkedinProfile && (
              <a 
                href={alum.linkedinProfile} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-800"
              >
                <FaLinkedin size={24} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alumni;
