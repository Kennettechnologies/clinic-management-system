import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';

const LabTestOrder = () => {
  const [formData, setFormData] = useState({
    patient: '',
    testName: '',
    lab: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post('/api/lab/order', formData);
      setSuccess(true);
      setFormData({
        patient: '',
        testName: '',
        lab: '',
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to order lab test');
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Order Lab Test
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Lab test ordered successfully!</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Patient ID"
          name="patient"
          value={formData.patient}
          onChange={handleChange}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          label="Test Name"
          name="testName"
          value={formData.testName}
          onChange={handleChange}
          required
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Lab</InputLabel>
          <Select
            name="lab"
            value={formData.lab}
            onChange={handleChange}
            required
          >
            <MenuItem value="internal">Internal Lab</MenuItem>
            <MenuItem value="external1">External Lab 1</MenuItem>
            <MenuItem value="external2">External Lab 2</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          multiline
          rows={4}
          margin="normal"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Order Test'}
        </Button>
      </form>
    </Paper>
  );
};

export default LabTestOrder; 