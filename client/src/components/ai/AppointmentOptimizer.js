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

const AppointmentOptimizer = () => {
  const [doctorSchedule, setDoctorSchedule] = useState('');
  const [patientPreferences, setPatientPreferences] = useState('');
  const [existingAppointments, setExistingAppointments] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const response = await axios.post('/api/ai/appointments/optimize', {
        doctorSchedule: doctorSchedule ? JSON.parse(doctorSchedule) : {},
        patientPreferences: patientPreferences ? JSON.parse(patientPreferences) : {},
        existingAppointments: existingAppointments ? JSON.parse(existingAppointments) : []
      });
      setResult(response.data.data);
    } catch (err) {
      setError('Failed to get appointment suggestions. Please check your input format.');
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Appointment Optimizer (AI Demo)
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Doctor Schedule (JSON)"
          multiline
          rows={2}
          value={doctorSchedule}
          onChange={(e) => setDoctorSchedule(e.target.value)}
          margin="normal"
          placeholder='{"Monday": ["09:00-12:00", "14:00-17:00"]}'
        />
        <TextField
          fullWidth
          label="Patient Preferences (JSON)"
          multiline
          rows={2}
          value={patientPreferences}
          onChange={(e) => setPatientPreferences(e.target.value)}
          margin="normal"
          placeholder='{"preferredDays": ["Monday", "Wednesday"], "preferredTimes": ["09:00-11:00"]}'
        />
        <TextField
          fullWidth
          label="Existing Appointments (JSON)"
          multiline
          rows={2}
          value={existingAppointments}
          onChange={(e) => setExistingAppointments(e.target.value)}
          margin="normal"
          placeholder='[{"date": "2024-06-10", "time": "09:30"}]'
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

export default AppointmentOptimizer; 