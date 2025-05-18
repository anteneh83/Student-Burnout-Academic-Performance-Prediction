from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables communication with frontend (React)

# Load trained models
try:
    lin_reg = joblib.load("linear_model.pkl")
    rf_clf = joblib.load("random_forest_model.pkl")
    label_encoder = joblib.load("label_encoder.pkl")
except Exception as e:
    print("Error loading models:", e)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    print("Received data:", data)

    try:
        # Extract features
        study_hours = data['study_hours']
        sleep_hours = data['sleep_hours']
        screen_time = data['screen_time']

        # Create DataFrame
        df = pd.DataFrame([[study_hours, sleep_hours, screen_time]],
                          columns=["study_hours", "sleep_hours", "screen_time"])

        # Predict average score
        predicted_score = lin_reg.predict(df)[0]

        # Predict burnout level using the same input (exclude average_score)
        burnout_encoded = rf_clf.predict(df)[0]
        burnout_label = label_encoder.inverse_transform([burnout_encoded])[0]

        return jsonify({
            "average_score": round(predicted_score, 2),
            "burnout_level": burnout_label
        })

    except Exception as e:
        print("Error during prediction:", e)
        return jsonify({"error": "Prediction failed"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
