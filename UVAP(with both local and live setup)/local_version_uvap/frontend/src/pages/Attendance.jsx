import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaCalendarCheck, FaPercentage } from 'react-icons/fa';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/my');
      setAttendanceData(res.data.data);
      setStats(res.data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <FaCalendarCheck className="mr-3 text-blue-500" /> My Attendance
      </h1>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold mb-2">{stat.courseName}</h3>
                <p className="text-gray-400 text-sm mb-4">{stat.courseCode}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-green-400">Present: {stat.present}</p>
                    <p className="text-red-400">Absent: {stat.absent}</p>
                    <p className="text-yellow-400">Late: {stat.late}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white">{stat.percentage.toFixed(1)}%</span>
                    <p className="text-xs text-gray-500">Attendance</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed History */}
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
            <h2 className="p-6 text-xl font-semibold border-b border-gray-700">Recent History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
                  <tr>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Course</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {attendanceData.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-750">
                      <td className="py-4 px-6">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="py-4 px-6">{record.course?.name}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          record.status === 'Present' ? 'bg-green-900 text-green-200' :
                          record.status === 'Absent' ? 'bg-red-900 text-red-200' :
                          'bg-yellow-900 text-yellow-200'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
