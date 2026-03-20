import { useState } from 'react';
import axios from 'axios';

const TeacherReviews = () => {
  const [review, setReview] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call ML Service directly (assuming CORS is allowed or proxied)
      const res = await axios.post('http://localhost:5001/predict', { review });
      setResult(res.data.sentiment);
    } catch (error) {
      console.error(error);
      alert('Error analyzing sentiment');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Teacher Reviews (AI Powered)</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Submit a Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            rows="4"
            placeholder="Write your review here..."
            value={review}
            onChange={e => setReview(e.target.value)}
            required
          />
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
            Analyze Sentiment
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
            <span className="font-semibold text-gray-700">AI Analysis Result:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              result === 'Positive' ? 'bg-green-100 text-green-700' :
              result === 'Negative' ? 'bg-red-100 text-red-700' :
              'bg-gray-200 text-gray-700'
            }`}>
              {result}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherReviews;
