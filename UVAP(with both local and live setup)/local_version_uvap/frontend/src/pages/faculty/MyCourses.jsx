import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaBook, FaChalkboardTeacher, FaClock, FaUsers } from 'react-icons/fa';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/faculty/my-courses');
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div className="p-6">Loading courses...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaChalkboardTeacher className="mr-3 text-blue-600" />
        My Assigned Courses
      </h1>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <FaBook className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Courses Assigned</h3>
          <p className="text-gray-500">You haven't been assigned any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((allocation) => (
            <div key={allocation._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {allocation.course.code}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    {allocation.course.credits} Credits
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 h-14">
                  {allocation.course.title}
                </h3>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaUsers className="mr-2 text-gray-400" />
                    <span className="font-medium">{allocation.program} {allocation.batch}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaChalkboardTeacher className="mr-2 text-gray-400" />
                    <span>Section: <span className="font-bold text-gray-900">{allocation.section}</span></span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaClock className="mr-2 text-gray-400" />
                    <span>Semester: {allocation.semester}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <button className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
