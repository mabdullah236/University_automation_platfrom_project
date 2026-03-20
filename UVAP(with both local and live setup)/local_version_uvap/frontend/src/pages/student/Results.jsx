import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaGraduationCap, FaChartLine } from 'react-icons/fa';

const Results = () => {
  const [results, setResults] = useState([]);
  const [gpa, setGpa] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get('/results/my');
      setResults(res.data.data);
      setGpa(res.data.gpa);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FaGraduationCap className="mr-3 text-blue-500" /> My Results
        </h1>
        <div className="bg-blue-900 px-6 py-3 rounded-lg shadow-lg flex items-center">
          <FaChartLine className="mr-3 text-blue-300" />
          <div>
            <p className="text-sm text-blue-200">CGPA</p>
            <p className="text-2xl font-bold text-white">{gpa}</p>
          </div>
        </div>
      </div>

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
                  <th className="py-4 px-6">Semester</th>
                  <th className="py-4 px-6">Marks Obtained</th>
                  <th className="py-4 px-6">Total Marks</th>
                  <th className="py-4 px-6">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {results.length > 0 ? (
                  results.map((result) => (
                    <tr key={result._id} className="hover:bg-gray-750 transition-colors">
                      <td className="py-4 px-6 font-medium text-white">
                        {result.course?.name} <span className="text-gray-400 text-sm">({result.course?.code})</span>
                      </td>
                      <td className="py-4 px-6">{result.semester}</td>
                      <td className="py-4 px-6">{result.marksObtained}</td>
                      <td className="py-4 px-6">{result.totalMarks}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded text-sm font-bold ${
                          result.grade === 'A' ? 'bg-green-900 text-green-200' :
                          result.grade === 'B' ? 'bg-blue-900 text-blue-200' :
                          result.grade === 'C' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-red-900 text-red-200'
                        }`}>
                          {result.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      No results declared yet.
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

export default Results;
