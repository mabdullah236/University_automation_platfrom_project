const User = require('../models/User');
// We need a Review model, but for now we can store it or just return the sentiment
// Ideally: const Review = require('../models/Review');
const { spawn } = require('child_process');
const path = require('path');

// @desc    Submit a review
// @route   POST /api/v1/reviews
// @access  Private (Student)
exports.submitReview = async (req, res, next) => {
  try {
    const { facultyId, reviewText } = req.body;

    if (!facultyId || !reviewText) {
      return res.status(400).json({ success: false, message: 'Faculty ID and review text are required' });
    }

    // 1. Run Sentiment Analysis
    const scriptPath = path.join(__dirname, '../../ml_service/sentiment_analysis.py');
    const pythonProcess = spawn('python', [scriptPath, reviewText]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      try {
        const sentimentResult = JSON.parse(dataString);
        
        // 2. Save Review to DB (Mocking DB save for now as Review model wasn't explicitly requested but logic is needed)
        // In a real app: 
        // await Review.create({ student: req.user.id, faculty: facultyId, text: reviewText, ...sentimentResult });

        res.status(201).json({
          success: true,
          data: {
            facultyId,
            reviewText,
            sentiment: sentimentResult
          },
          message: 'Review submitted and analyzed successfully'
        });
      } catch (error) {
        console.error('JSON Parse Error:', error);
        res.status(500).json({ success: false, message: 'Failed to analyze sentiment' });
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @access  Private (Admin/Faculty)
exports.getReviews = async (req, res, next) => {
  try {
    // Mock response
    res.status(200).json({
      success: true,
      data: [
        { id: 1, text: 'Great teacher!', sentiment: { stars: 5, sentiment: 'Positive' } }
      ]
    });
  } catch (err) {
    next(err);
  }
};
