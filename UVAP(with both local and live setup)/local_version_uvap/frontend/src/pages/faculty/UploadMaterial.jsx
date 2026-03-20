import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaCloudUploadAlt, FaFileAlt } from 'react-icons/fa';

const UploadMaterial = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    setUploading(true);
    const data = new FormData();
    data.append('courseId', formData.courseId);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('file', file);

    try {
      await api.post('/lms/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Material uploaded successfully!');
      setFormData({ courseId: '', title: '', description: '' });
      setFile(null);
    } catch (error) {
      console.error('Error uploading material:', error);
      alert('Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FaCloudUploadAlt className="mr-3 text-blue-500" /> Upload Course Material
      </h1>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2">Select Course</label>
            <select 
              name="courseId" 
              value={formData.courseId} 
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white focus:border-blue-500"
            >
              <option value="">-- Select Course --</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange}
              required
              placeholder="e.g., Lecture 1 Slides"
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              rows="3"
              placeholder="Optional description..."
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">File (PDF, DOC, PPT)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaCloudUploadAlt className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, PPT, DOC (MAX. 10MB)</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx" />
              </label>
            </div>
            {file && <p className="mt-2 text-sm text-green-400 flex items-center"><FaFileAlt className="mr-2" /> {file.name}</p>}
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
          >
            {uploading ? 'Uploading...' : 'Upload Material'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadMaterial;
