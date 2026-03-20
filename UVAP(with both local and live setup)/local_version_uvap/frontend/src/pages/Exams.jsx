import { useState, useEffect } from 'react';
import api from '../services/api';

const Exams = () => {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Examination Schedule</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3">Course</th>
                <th className="p-3">Type</th>
                <th className="p-3">Date</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Total Marks</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam._id} className="border-b">
                  <td className="p-3">{exam.course?.code} - {exam.course?.title}</td>
                  <td className="p-3">{exam.type}</td>
                  <td className="p-3">{new Date(exam.date).toLocaleDateString()}</td>
                  <td className="p-3">{exam.duration} mins</td>
                  <td className="p-3">{exam.totalMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Exams;
