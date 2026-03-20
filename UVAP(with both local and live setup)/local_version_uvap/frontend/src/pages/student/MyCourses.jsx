import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaBook, FaChalkboardTeacher, FaGraduationCap, FaLayerGroup } from 'react-icons/fa';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/students/my-courses');
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
        <FaBook className="mr-3 text-indigo-600" />
        My Enrolled Courses
      </h1>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <FaLayerGroup className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Courses Found</h3>
          <p className="text-gray-500">You are not enrolled in any courses for this semester yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((allocation) => (
            <div key={allocation._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-2 bg-indigo-500 group-hover:bg-indigo-600 transition-colors"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {allocation.course.code}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    {allocation.course.credits} Credits
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 h-14">
                  {allocation.course.title}
                </h3>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <FaChalkboardTeacher />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Instructor</p>
                    <p className="text-sm font-bold text-gray-900">{allocation.teacher.name}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
