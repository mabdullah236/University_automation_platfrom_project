import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaFileDownload, FaBook, FaChalkboardTeacher } from 'react-icons/fa';

const CourseMaterials = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Assuming student can only see courses they are enrolled in
      // Ideally, we should have an endpoint /courses/my-courses
      const res = await api.get('/courses'); 
      setCourses(res.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchMaterials = async (courseId) => {
    setLoading(true);
    try {
      const res = await api.get(`/lms/course/${courseId}`);
      setMaterials(res.data.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    if (courseId) {
      fetchMaterials(courseId);
    } else {
      setMaterials([]);
    }
  };

  const handleDownload = (fileUrl) => {
    // Construct full URL if needed, or use relative
    // Assuming backend serves uploads at /uploads
    const downloadUrl = `http://localhost:5001${fileUrl}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FaBook className="mr-3 text-blue-500" /> Course Materials
      </h1>

      <div className="mb-8">
        <label className="block text-gray-400 mb-2">Select Course</label>
        <select 
          value={selectedCourse} 
          onChange={handleCourseChange}
          className="w-full md:w-1/2 p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 text-white"
        >
          <option value="">-- Select Course --</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map(material => (
                <div key={material._id} className="bg-gray-700 p-5 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white truncate pr-2">{material.title}</h3>
                    <FaFileDownload className="text-blue-400 text-xl flex-shrink-0" />
                  </div>
                  <p className="text-gray-400 text-sm mb-4 h-10 overflow-hidden">{material.description || 'No description provided.'}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span className="flex items-center"><FaChalkboardTeacher className="mr-1" /> {material.uploadedBy?.name}</span>
                    <span>{new Date(material.uploadDate).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => handleDownload(material.fileUrl)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition-colors flex items-center justify-center"
                  >
                    <FaFileDownload className="mr-2" /> Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No materials uploaded for this course yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseMaterials;
