import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Sectioning = () => {
  const [formData, setFormData] = useState({
    batch: '',
    program: '',
    currentSemester: '',
    shift: 'Morning',
    maxStudents: 30
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [filters, setFilters] = useState({ batches: [], programs: [] });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await api.get('/students/filters');
        if (res.data.success) {
          setFilters(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch filters', err);
      }
    };
    fetchFilters();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/students/sectioning', formData);
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setShowConfirmModal(true);
      } else {
        setError(err.response?.data?.error || 'Sectioning failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverwrite = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/students/sectioning', { ...formData, force: true });
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Sectioning failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Auto-Sectioning Tool</h2>
          <p className="text-gray-600 mb-6">
            Automatically distribute students into sections based on batch, program, and class size limits.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                <select
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Batch</option>
                  {filters.batches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <select
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Program</option>
                  {filters.programs.map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                name="currentSemester"
                value={formData.currentSemester}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Students per Section</label>
              <input
                type="number"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                min="10"
                max="100"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Generating Sections...' : 'Generate Sections'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-bold text-green-800 mb-2">Success!</h3>
              <p className="text-green-700 mb-4">{result.message}</p>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-2xl font-bold text-gray-800">{result.data.totalStudents}</div>
                  <div className="text-xs text-gray-500 uppercase">Total Students</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-2xl font-bold text-gray-800">{result.data.numSections}</div>
                  <div className="text-xs text-gray-500 uppercase">Sections Created</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-lg font-bold text-gray-800">{result.data.sections.join(', ')}</div>
                  <div className="text-xs text-gray-500 uppercase">Section Names</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overwrite Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-center mb-4 text-yellow-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Existing Sections Found!</h3>
            <p className="text-gray-600 text-center mb-6">
              Students in this batch are already assigned to sections. Proceeding will <strong>RESET</strong> and re-distribute them. Are you sure?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleOverwrite}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Overwrite & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default Sectioning;
