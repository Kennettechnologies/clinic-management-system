import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';

const PrescriptionSuggestions = () => {
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const response = await axios.post('/api/ai/prescriptions', {
        symptoms,
        medicalHistory,
        currentMedications
      });
      setResult(response.data.data);
    } catch (err) {
      setError('Failed to get prescription suggestions');
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Prescription Suggestions (AI Demo)
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Symptoms"
          multiline
          rows={2}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Medical History"
          multiline
          rows={2}
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Current Medications"
          multiline
          rows={2}
          value={currentMedications}
          onChange={(e) => setCurrentMedications(e.target.value)}
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Get Suggestions'}
        </Button>
      </form>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">AI Suggestions:</Typography>
          <Typography>{result}</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PrescriptionSuggestions; 