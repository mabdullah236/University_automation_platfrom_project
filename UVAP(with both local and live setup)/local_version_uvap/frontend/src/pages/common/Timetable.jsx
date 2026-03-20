import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaPlus, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const Timetable = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    roomNumber: '',
    semester: 'Fall 2023'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchTimetable();
    if (user.role === 'admin') {
      fetchCourses();
    }
  }, [user.role]);

  const fetchTimetable = async () => {
    try {
      const res = await api.get('/timetable/my');
      setTimetable(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching timetable:', error);
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
      await api.post('/timetable', formData);
      alert('Schedule added successfully!');
      setShowForm(false);
      fetchTimetable();
      setFormData({
        course: '',
        day: 'Monday',
        startTime: '',
        endTime: '',
        roomNumber: '',
        semester: 'Fall 2023'
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Failed to add schedule.');
    }
  };

  const getScheduleForDay = (day) => {
    return timetable.filter(t => t.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FaCalendarAlt className="mr-3 text-blue-500" /> Weekly Timetable
        </h1>
        {user.role === 'admin' && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <FaPlus className="mr-2" /> {showForm ? 'Close Form' : 'Add Slot'}
          </button>
        )}
      </div>

      {/* Add Slot Form (Admin Only) */}
      {showForm && user.role === 'admin' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Add Timetable Slot</h2>
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
              <label className="block text-gray-400 mb-1">Day</label>
              <select 
                name="day" 
                value={formData.day} 
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              >
                {days.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
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
              <label className="block text-gray-400 mb-1">End Time</label>
              <input 
                type="time" 
                name="endTime" 
                value={formData.endTime} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
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
            <div>
              <label className="block text-gray-400 mb-1">Semester</label>
              <input 
                type="text" 
                name="semester" 
                value={formData.semester} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold transition-colors">
                Save Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timetable Grid */}
      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map(day => (
            <div key={day} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
              <div className="bg-gray-700 p-3 text-center font-bold text-blue-300 uppercase tracking-wider border-b border-gray-600">
                {day}
              </div>
              <div className="p-3 space-y-3 min-h-[200px]">
                {getScheduleForDay(day).length > 0 ? (
                  getScheduleForDay(day).map(slot => (
                    <div key={slot._id} className="bg-gray-750 p-3 rounded border border-gray-600 hover:border-blue-500 transition-colors">
                      <h4 className="font-bold text-white text-sm">{slot.course?.title}</h4>
                      <p className="text-xs text-gray-400 mb-2">{slot.course?.code}</p>
                      <div className="flex items-center text-xs text-gray-300 mb-1">
                        <FaClock className="mr-1 text-blue-400" /> {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="flex items-center text-xs text-gray-300">
                        <FaMapMarkerAlt className="mr-1 text-red-400" /> {slot.roomNumber}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-sm py-4">No classes</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timetable;
