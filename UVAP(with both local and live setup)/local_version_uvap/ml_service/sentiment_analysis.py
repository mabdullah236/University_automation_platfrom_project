import sys
import json
from transformers import pipeline

def analyze_sentiment(text):
    try:
        # Load BERT pipeline for sentiment analysis
        # Using a multilingual model as it's robust for various inputs
        # This will download the model on first run if not cached
        classifier = pipeline('sentiment-analysis', model='nlptown/bert-base-multilingual-uncased-sentiment')
        
        # Truncate text to 512 tokens to avoid model errors
        result = classifier(text[:512])[0]
        
        # Map labels (1 star to 5 stars) to a more usable format
        label = result['label'] # e.g., '5 stars'
        score = result['score']
        
        stars = int(label.split()[0])
        
        sentiment_type = "Positive" if stars > 3 else "Negative" if stars < 3 else "Neutral"

        output = {
            "sentiment": sentiment_type,
            "stars": stars,
            "confidence": round(score, 4),
            "original_label": label
        }
        
        return output
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Read input from command line argument (passed from Node.js)
    try:
        if len(sys.argv) > 1:
            input_text = sys.argv[1]
            result = analyze_sentiment(input_text)
            print(json.dumps(result))
        else:
            print(json.dumps({"error": "No input text provided"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
