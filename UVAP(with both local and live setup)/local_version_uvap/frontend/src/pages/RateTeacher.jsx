import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaStar, FaChalkboardTeacher } from 'react-icons/fa';

const RateTeacher = () => {
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        // Assuming /api/v1/faculty returns list of faculty members
        // If not mounted, we might need to use /api/v1/auth/users?role=faculty or similar
        // But let's assume we will ensure /api/v1/faculty is working.
        const res = await api.get('/faculty'); 
        setFaculty(res.data.data);
      } catch (err) {
        console.error('Error fetching faculty:', err);
        setError('Failed to load faculty list.');
      }
    };
    fetchFaculty();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/reviews', {
        facultyId: selectedFaculty,
        reviewText
      });
      setResult(res.data.data);
      setReviewText('');
      setSelectedFaculty('');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center mb-6">
        <FaStar className="text-yellow-500 text-3xl mr-3" />
        <h1 className="text-2xl font-bold text-gray-800">Rate My Teacher</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-6">
          <h3 className="text-green-800 font-bold text-lg mb-2">Review Submitted!</h3>
          <div className="space-y-2">
            <p className="text-green-700">
              <span className="font-semibold">Sentiment Detected:</span> {result.sentiment.sentiment}
            </p>
            <p className="text-green-700">
              <span className="font-semibold">Confidence Score:</span> {(result.sentiment.confidence * 100).toFixed(1)}%
            </p>
            <div className="flex items-center text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < result.sentiment.stars ? 'fill-current' : 'text-gray-300'} />
              ))}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Teacher
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaChalkboardTeacher className="text-gray-400" />
            </div>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Choose a Faculty Member --</option>
              {faculty.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.department || 'General'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            rows="4"
            placeholder="Write your honest feedback here..."
            className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Analyzing...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default RateTeacher;
