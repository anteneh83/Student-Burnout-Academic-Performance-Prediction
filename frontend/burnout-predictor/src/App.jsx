import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [studyHours, setStudyHours] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [screenTime, setScreenTime] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const study = parseFloat(studyHours);
    const sleep = parseFloat(sleepHours);
    const screen = parseFloat(screenTime);

    if ([study, sleep, screen].some(val => isNaN(val) || val < 0)) {
      setErrorMsg("Please enter valid non-negative numbers.");
      setResult(null);
      return;
    }

    if (study + sleep + screen > 24) {
      setErrorMsg("The total of Study Hours, Sleep Hours, and Screen Time cannot exceed 24 hours.");
      setResult(null);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await axios.post('http://127.0.0.1:5000/predict', {
        study_hours: study,
        sleep_hours: sleep,
        screen_time: screen,
      });

      setResult(res.data);
      console.error(res.data);

    } catch (err) {
      console.error(err);
      setErrorMsg('Prediction failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎓 Study Burnout Predictor</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.1"
          placeholder="Study Hours"
          value={studyHours}
          onChange={(e) => setStudyHours(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.1"
          placeholder="Sleep Hours"
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.1"
          placeholder="Screen Time (hours)"
          value={screenTime}
          onChange={(e) => setScreenTime(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Predicting...' : 'Predict'}
        </button>
      </form>

      {errorMsg && <p className="error">{errorMsg}</p>}

      {result && (
        <div className="result">
          <h2>📊 Prediction Results</h2>
          <p><strong>Predicted Score:</strong> {result.average_score}</p>
          <p><strong>Burnout Level:</strong> {result.burnout_level}</p>

          {result.burnout_level.toLowerCase() === 'sever' && (
            <p className="advice">🚨 Severe burnout detected! Please take immediate breaks, get sufficient sleep, and consider talking to a counselor.</p>
          )}
          {result.burnout_level.toLowerCase() === 'mild' && (
            <p className="advice">⚠️ Mild burnout. Try to balance your study with rest and reduce screen time.</p>
          )}
          {result.burnout_level.toLowerCase() === 'none' && (
            <p className="advice">✅ No burnout detected. Keep up the good work and maintain your healthy habits!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
