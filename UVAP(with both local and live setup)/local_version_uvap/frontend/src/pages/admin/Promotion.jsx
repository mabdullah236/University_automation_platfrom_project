import { useState, useEffect } from 'react';
import api from '../../services/api';

const Promotion = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [batch, setBatch] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (batch && semester) {
      const filtered = students.filter(s => 
        s.batch === batch && 
        s.currentSemester === parseInt(semester)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [batch, semester, students]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePromote = async () => {
    if (!batch || !semester) {
      alert('Please select Batch and Semester');
      return;
    }

    if (!window.confirm(`Are you sure you want to promote students of Batch ${batch} Semester ${semester}?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/students/promote', { batch, currentSemester: semester });
      alert(res.data.message);
      fetchStudents(); // Refresh data
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error promoting students');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique batches for dropdown
  const batches = [...new Set(students.map(s => s.batch))].filter(Boolean).sort();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Semester Promotion</h1>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select 
              value={batch} 
              onChange={(e) => setBatch(e.target.value)} 
              className="p-2 border rounded w-40"
            >
              <option value="">Select Batch</option>
              {batches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
            <select 
              value={semester} 
              onChange={(e) => setSemester(e.target.value)} 
              className="p-2 border rounded w-40"
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button 
            onClick={handlePromote}
            disabled={loading || filteredStudents.length === 0}
            className={`px-6 py-2 rounded-lg text-white font-medium transition ${
              loading || filteredStudents.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Processing...' : 'Run Auto-Promotion'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 font-medium text-gray-700">
          Eligible Students ({filteredStudents.length})
        </div>
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Roll No</th>
              <th className="p-4">Current Semester</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{student.user?.name || 'N/A'}</td>
                <td className="p-4 text-gray-600">{student.studentId || student.rollNumber || 'N/A'}</td>
                <td className="p-4">{student.currentSemester}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    student.promotionStatus === 'Promoted' ? 'bg-green-100 text-green-800' :
                    student.promotionStatus === 'Probation' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {student.promotionStatus || 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  {batch && semester ? 'No students found for this selection.' : 'Select Batch and Semester to view students.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Promotion;
