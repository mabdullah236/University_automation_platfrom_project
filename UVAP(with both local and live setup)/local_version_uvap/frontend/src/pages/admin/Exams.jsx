import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaPlus, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const Exams = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course: '',
    date: '',
    startTime: '',
    duration: '',
    type: 'Midterm',
    roomNumber: ''
  });

  useEffect(() => {
    fetchExams();
    if (user.role === 'admin') {
      fetchCourses();
    }
  }, [user.role]);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams', formData);
      alert('Exam scheduled successfully!');
      setShowForm(false);
      fetchExams();
      setFormData({
        course: '',
        date: '',
        startTime: '',
        duration: '',
        type: 'Midterm',
        roomNumber: ''
      });
    } catch (error) {
      console.error('Error scheduling exam:', error);
      alert('Failed to schedule exam.');
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FaCalendarAlt className="mr-3 text-blue-500" /> Exam Schedule
        </h1>
        {user.role === 'admin' && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <FaPlus className="mr-2" /> {showForm ? 'Close Form' : 'Schedule Exam'}
          </button>
        )}
      </div>

      {/* Schedule Form (Admin Only) */}
      {showForm && user.role === 'admin' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Schedule New Exam</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">Course</label>
              <select 
                name="course" 
                value={formData.course} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              >
                <option value="">-- Select Course --</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Date</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Start Time</label>
              <input 
                type="time" 
                name="startTime" 
                value={formData.startTime} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Duration (minutes)</label>
              <input 
                type="number" 
                name="duration" 
                value={formData.duration} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Type</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              >
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
                <option value="Quiz">Quiz</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Room Number</label>
              <input 
                type="text" 
                name="roomNumber" 
                value={formData.roomNumber} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold transition-colors">
                Save Exam
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exams Table */}
      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
                <tr>
                  <th className="py-4 px-6">Course</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Time</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {exams.length > 0 ? (
                  exams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-gray-750 transition-colors">
                      <td className="py-4 px-6 font-medium text-white">
                        {exam.course?.title} <span className="text-gray-400 text-sm">({exam.course?.code})</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          exam.type === 'Final' ? 'bg-red-900 text-red-200' : 
                          exam.type === 'Midterm' ? 'bg-yellow-900 text-yellow-200' : 
                          'bg-blue-900 text-blue-200'
                        }`}>
                          {exam.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">{new Date(exam.date).toLocaleDateString()}</td>
                      <td className="py-4 px-6 flex items-center"><FaClock className="mr-2 text-gray-500" /> {exam.startTime}</td>
                      <td className="py-4 px-6">{exam.duration} mins</td>
                      <td className="py-4 px-6 flex items-center"><FaMapMarkerAlt className="mr-2 text-gray-500" /> {exam.roomNumber}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No exams scheduled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
