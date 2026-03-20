import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaSave, FaGraduationCap } from 'react-icons/fa';

const Grading = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses'); 
      setCourses(res.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async (courseId) => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${courseId}`);
      const enrolledStudents = res.data.data.enrolledStudents || [];
      
      // Fetch existing results to pre-fill
      try {
        const resultsRes = await api.get(`/results/course/${courseId}`);
        const existingResults = resultsRes.data.data;
        
        // Merge existing results with enrolled students
        const mergedStudents = enrolledStudents.map(student => {
          const result = existingResults.find(r => r.student._id === student._id);
          return {
            ...student,
            marksObtained: result ? result.marksObtained : '',
            totalMarks: result ? result.totalMarks : 100,
            grade: result ? result.grade : 'F',
            semester: result ? result.semester : 'Fall 2023'
          };
        });
        setStudents(mergedStudents);
      } catch (err) {
        // If no results, just show students with defaults
        setStudents(enrolledStudents.map(s => ({ ...s, marksObtained: '', totalMarks: 100, grade: 'F', semester: 'Fall 2023' })));
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

  const handleGradeChange = (studentId, field, value) => {
    setStudents(prev => prev.map(s => 
      s._id === studentId ? { ...s, [field]: value } : s
    ));
  };

  const saveResult = async (student) => {
    try {
      await api.post('/results', {
        studentId: student._id,
        courseId: selectedCourse,
        marksObtained: Number(student.marksObtained),
        totalMarks: Number(student.totalMarks),
        grade: student.grade,
        semester: student.semester
      });
      alert(`Result saved for ${student.name}`);
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Failed to save result');
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FaGraduationCap className="mr-3 text-blue-500" /> Grading System
      </h1>
      
      <div className="mb-8">
        <label className="block text-gray-400 mb-2">Select Course</label>
        <select 
          value={selectedCourse} 
          onChange={handleCourseChange}
          className="w-full md:w-1/2 p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 text-white"
        >
          <option value="">-- Select Course --</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          {loading ? (
            <p className="text-center text-gray-400">Loading students...</p>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
                  <tr>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Marks Obtained</th>
                    <th className="py-3 px-4">Total Marks</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {students.map(student => (
                    <tr key={student._id} className="hover:bg-gray-750">
                      <td className="py-3 px-4">{student.rollNumber || 'N/A'}</td>
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">
                        <input 
                          type="number" 
                          value={student.marksObtained} 
                          onChange={(e) => handleGradeChange(student._id, 'marksObtained', e.target.value)}
                          className="w-24 p-2 bg-gray-700 rounded border border-gray-600 text-white"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input 
                          type="number" 
                          value={student.totalMarks} 
                          onChange={(e) => handleGradeChange(student._id, 'totalMarks', e.target.value)}
                          className="w-24 p-2 bg-gray-700 rounded border border-gray-600 text-white"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select 
                          value={student.grade} 
                          onChange={(e) => handleGradeChange(student._id, 'grade', e.target.value)}
                          className="w-20 p-2 bg-gray-700 rounded border border-gray-600 text-white"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => saveResult(student)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center text-sm transition-colors"
                        >
                          <FaSave className="mr-1" /> Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400">No students found for this course.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Grading;
