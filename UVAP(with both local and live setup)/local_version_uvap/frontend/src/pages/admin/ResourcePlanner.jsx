import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FaChalkboardTeacher,
  FaBuilding,
  FaLayerGroup,
  FaSun,
  FaMoon,
  FaCalculator,
  FaExclamationCircle
} from 'react-icons/fa';

const ResourcePlanner = () => {
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    maxTeacherLoad: 3,
    workingDays: 5
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchForecast = async (isManual = false) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.post(
        'http://localhost:5001/api/v1/planning/forecast',
        inputs,
        config
      );

      setData(res.data.data);
      if (isManual) {
        toast.success('Forecast Updated');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetch forecast';
      
      // Handle 404 (No Data) gracefully without toast
      if (err.response && err.response.status === 404) {
        setError(errorMessage);
        setData(null); // Clear data to show empty state
      } else {
        // For other errors (500, network), show toast
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: parseInt(e.target.value) });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Resource Planning & Forecasting</h1>
        <p className="text-gray-600 mt-2">
          Calculate required infrastructure and faculty based on student enrollment and shift distribution.
        </p>
      </div>

      {/* Input Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Policy: Max Courses per Teacher</label>
            <input
              type="number"
              name="maxTeacherLoad"
              value={inputs.maxTeacherLoad}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Working Days / Week</label>
            <input
              type="number"
              name="workingDays"
              value={inputs.workingDays}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => fetchForecast(true)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 h-[42px]"
          >
            <FaCalculator />
            {loading ? 'Calculating...' : 'Recalculate'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
            <FaExclamationCircle className="text-red-500 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            {error}
          </p>
          <button
            onClick={() => fetchForecast(true)}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {data && !error && (
        <>
          {/* Result Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Rooms Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Rooms Required</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">{data.results.roomsRequired}</h3>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                  <FaBuilding size={24} />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <FaSun className="text-orange-400" /> Morning: {data.results.morningPeak}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaMoon className="text-indigo-400" /> Evening: {data.results.eveningPeak}
                  </span>
                </div>
                {data.results.roomsRequired > data.results.availableRooms && (
                  <div className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                    ⚠️ Shortage: {data.results.roomsRequired - data.results.availableRooms} (Available: {data.results.availableRooms})
                  </div>
                )}
              </div>
            </div>

            {/* Teachers Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Teachers Required</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">{data.results.teachersRequired}</h3>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  <FaChalkboardTeacher size={24} />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Based on {data.results.totalTeachingLoad} total teaching hours</p>
                {data.results.teachersRequired > data.results.availableTeachers && (
                  <div className="mt-2 text-red-600 font-medium bg-red-50 px-2 py-1 rounded inline-block">
                    ⚠️ Shortage: {data.results.teachersRequired - data.results.availableTeachers} (Available: {data.results.availableTeachers})
                  </div>
                )}
              </div>
            </div>

            {/* Sections Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">Total Sections</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">{data.results.totalSections}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <FaLayerGroup size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <FaSun className="text-orange-400" /> Morning: {data.results.morningSections}
                </span>
                <span className="flex items-center gap-1">
                  <FaMoon className="text-indigo-400" /> Evening: {data.results.eveningSections}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Detailed Breakdown by Program & Semester</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-medium uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Program</th>
                    <th className="px-6 py-3">Semester</th>
                    <th className="px-6 py-3">Shift</th>
                    <th className="px-6 py-3">Actual Students</th>
                    <th className="px-6 py-3">Actual Sections</th>
                    <th className="px-6 py-3">Courses</th>
                    <th className="px-6 py-3">Load (Hours)</th>
                    <th className="px-6 py-3">Teachers Req.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.breakdown.length > 0 ? (
                    <>
                      {data.breakdown.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800">{item.program}</td>
                          <td className="px-6 py-4">{item.semester}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.shift === 'Morning' ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {item.shift}
                            </span>
                          </td>
                          <td className="px-6 py-4">{item.studentCount}</td>
                          <td className="px-6 py-4 font-medium text-blue-600">{item.actualSections}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span>{item.courseCount}</span>
                              <button
                                onClick={() => alert(`Courses for ${item.program} Sem ${item.semester}:\n\n` + (item.courseTitles ? item.courseTitles.join('\n') : 'No titles available'))}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                View
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">{item.hoursNeeded}</td>
                          <td className="px-6 py-4 font-medium text-green-600">
                            {item.missingSections ? (
                              <a href="/admin/sectioning" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors">
                                ⚠️ Create Sections
                              </a>
                            ) : (
                              item.teachersRequired
                            )}
                          </td>
                        </tr>
                      ))}
                      {/* Grand Total Row */}
                      <tr className="bg-gray-100 font-bold text-gray-800">
                        <td colSpan="3" className="px-6 py-4 text-right uppercase text-xs tracking-wider">Grand Total</td>
                        <td className="px-6 py-4">
                          {data.breakdown.reduce((sum, item) => sum + item.studentCount, 0)}
                        </td>
                        <td className="px-6 py-4">
                          {data.breakdown.reduce((sum, item) => sum + item.actualSections, 0)}
                        </td>
                        <td className="px-6 py-4">
                          {data.breakdown.reduce((sum, item) => sum + item.courseCount, 0)}
                        </td>
                        <td className="px-6 py-4">
                          {data.breakdown.reduce((sum, item) => sum + item.hoursNeeded, 0)}
                        </td>
                        <td className="px-6 py-4 text-green-700">
                          {data.breakdown.reduce((sum, item) => sum + (item.teachersRequired || 0), 0)}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No active student data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResourcePlanner;
