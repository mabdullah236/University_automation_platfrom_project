import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaCheck, FaTimes, FaClock, FaSave } from 'react-icons/fa';

const FacultyAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Assuming there's an endpoint to get courses taught by the faculty
      // For now, fetching all courses or a specific subset
      const res = await api.get('/courses'); 
      setCourses(res.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async (courseId) => {
    setLoading(true);
    try {
      // Fetch students enrolled in the course
      // This endpoint might need to be created or adjusted in courseController
      const res = await api.get(`/courses/${courseId}`);
      // Assuming the course object has an 'enrolledStudents' array populated
      // If not, we might need a separate endpoint like /courses/:id/students
      setStudents(res.data.data.enrolledStudents || []); 
      
      // Also try to fetch existing attendance for this date to pre-fill
      try {
        const attRes = await api.get(`/attendance/course/${courseId}?date=${date}`);
        const existingAttendance = attRes.data.data;
        if (existingAttendance.length > 0) {
           // Merge existing status
           // This logic depends on how we want to handle updates. 
           // For simplicity, we'll just map students and default to 'Present' if new.
        }
      } catch (err) {
        // Ignore if no attendance found
      }

    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    if (courseId) {
      fetchStudents(courseId);
    } else {
      setStudents([]);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => prev.map(s => 
      s._id === studentId ? { ...s, attendanceStatus: status } : s
    ));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const attendanceData = students.map(s => ({
        studentId: s._id,
        status: s.attendanceStatus || 'Present' // Default to Present
      }));

      await api.post('/attendance/mark', {
        courseId: selectedCourse,
        date,
        students: attendanceData
      });

      alert('Attendance marked successfully!');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-gray-400 mb-2">Select Course</label>
          <select 
            value={selectedCourse} 
            onChange={handleCourseChange}
            className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 text-white"
          >
            <option value="">-- Select Course --</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 text-white"
          />
        </div>
      </div>

      {selectedCourse && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          {loading ? (
            <p className="text-center text-gray-400">Loading students...</p>
          ) : students.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
                    <tr>
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {students.map(student => (
                      <tr key={student._id} className="hover:bg-gray-750">
                        <td className="py-3 px-4">{student.rollNumber || 'N/A'}</td>
                        <td className="py-3 px-4">{student.name}</td>
                        <td className="py-3 px-4 flex justify-center space-x-4">
                          <label className="flex items-center cursor-pointer space-x-2">
                            <input 
                              type="radio" 
                              name={`status-${student._id}`} 
                              checked={student.attendanceStatus === 'Present' || !student.attendanceStatus} 
                              onChange={() => handleStatusChange(student._id, 'Present')}
                              className="form-radio text-green-500"
                            />
                            <span className="text-green-400"><FaCheck /> Present</span>
                          </label>
                          <label className="flex items-center cursor-pointer space-x-2">
                            <input 
                              type="radio" 
                              name={`status-${student._id}`} 
                              checked={student.attendanceStatus === 'Absent'} 
                              onChange={() => handleStatusChange(student._id, 'Absent')}
                              className="form-radio text-red-500"
                            />
                            <span className="text-red-400"><FaTimes /> Absent</span>
                          </label>
                          <label className="flex items-center cursor-pointer space-x-2">
                            <input 
                              type="radio" 
                              name={`status-${student._id}`} 
                              checked={student.attendanceStatus === 'Late'} 
                              onChange={() => handleStatusChange(student._id, 'Late')}
                              className="form-radio text-yellow-500"
                            />
                            <span className="text-yellow-400"><FaClock /> Late</span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center shadow-lg transition-transform transform hover:scale-105"
                >
                  <FaSave className="mr-2" /> {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400">No students found for this course.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyAttendance;
