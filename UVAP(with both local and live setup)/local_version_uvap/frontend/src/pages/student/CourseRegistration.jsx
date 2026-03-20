import { useState, useEffect } from 'react';
import api from '../../services/api';

const CourseRegistration = () => {
  const [courses, setCourses] = useState([]);
  const [semester, setSemester] = useState(null);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfferedCourses();
  }, []);

  const fetchOfferedCourses = async () => {
    try {
      const res = await api.get('/students/offered-courses');
      setCourses(res.data.data);
      setSemester(res.data.semester);
      setProgram(res.data.program);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post('/students/enroll', { courseId });
      // Update local state to reflect enrollment
      setCourses(courses.map(course => 
        course._id === courseId ? { ...course, enrolled: true } : course
      ));
      alert('Successfully enrolled in course!');
      fetchOfferedCourses(); // Refresh list to remove enrolled course or update status
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error enrolling in course');
    }
  };

  if (loading) return <div className="p-6">Loading available courses...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Course Registration</h1>
        <p className="text-gray-600">
          Offered Courses for <span className="font-semibold text-primary">{program}</span> - Semester <span className="font-semibold text-primary">{semester}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Course Code</th>
              <th className="p-4">Title</th>
              <th className="p-4">Credits</th>
              <th className="p-4">Instructor</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{course.code}</td>
                <td className="p-4">{course.title}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {course.credits} Credits
                  </span>
                </td>
                <td className="p-4 text-gray-600">
                  {course.instructor ? course.instructor.name : 'TBA'}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleEnroll(course._id)}
                    disabled={course.enrolled}
                    className={`px-4 py-2 rounded-lg transition ${
                      course.enrolled
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-blue-700'
                    }`}
                  >
                    {course.enrolled ? 'Enrolled' : 'Enroll'}
                  </button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No courses available for registration at this time.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseRegistration;
