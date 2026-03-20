from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import joblib
import os

app = Flask(__name__)
CORS(app)

MODEL_PATH = 'sentiment_model.pkl'

def train_model():
    # Sample dataset
    data = {
        'review': [
            'Great teacher, very helpful!',
            'Worst experience ever.',
            'Average class, nothing special.',
            'Excellent teaching style.',
            'Not recommended, very rude.',
            'Okay, but could be better.'
        ],
        'sentiment': ['Positive', 'Negative', 'Neutral', 'Positive', 'Negative', 'Neutral']
    }
    df = pd.DataFrame(data)
    
    model = make_pipeline(CountVectorizer(), MultinomialNB())
    model.fit(df['review'], df['sentiment'])
    
    joblib.dump(model, MODEL_PATH)
    print("Model trained and saved.")

# Train on startup if not exists
if not os.path.exists(MODEL_PATH):
    train_model()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'ML Service is running',
        'endpoints': {
            '/predict': 'POST - Predict sentiment',
            '/train': 'POST - Retrain model'
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    review = data.get('review')
    
    if not review:
        return jsonify({'error': 'No review provided'}), 400
    
    model = joblib.load(MODEL_PATH)
    prediction = model.predict([review])[0]
    
    return jsonify({'sentiment': prediction})

@app.route('/train', methods=['POST'])
def retrain():
    train_model()
    return jsonify({'message': 'Model retrained successfully'})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
