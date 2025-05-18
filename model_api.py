from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app) 

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
        study_hours = float(data.get('study_hours', 0))
        sleep_hours = float(data.get('sleep_hours', 0))
        screen_time = float(data.get('screen_time', 0))

        if study_hours < 0 or sleep_hours < 0 or screen_time < 0:
            return jsonify({"error": "Hours must be non-negative"}), 400

        if study_hours + sleep_hours + screen_time > 24:
            return jsonify({"error": "Total hours exceed 24"}), 400

        df = pd.DataFrame([[study_hours, sleep_hours, screen_time]],
                          columns=["study_hours", "sleep_hours", "screen_time"])

        predicted_score = lin_reg.predict(df)[0]

        burnout_encoded = rf_clf.predict(df)[0]

        burnout_label = label_encoder.inverse_transform([burnout_encoded])[0]
        

        return jsonify({
            "average_score": round(predicted_score, 2),
            "burnout_level": burnout_label.lower()
        })

    except Exception as e:
        print("Error during prediction:", e)
        return jsonify({"error": "Prediction failed"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
