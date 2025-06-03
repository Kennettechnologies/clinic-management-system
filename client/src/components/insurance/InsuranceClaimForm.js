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

const InsuranceClaimForm = () => {
  const [formData, setFormData] = useState({
    patient: '',
    insuranceProvider: '',
    claimNumber: '',
    amount: '',
    description: ''
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
      await axios.post('/api/insurance/claim', formData);
      setSuccess(true);
      setFormData({
        patient: '',
        insuranceProvider: '',
        claimNumber: '',
        amount: '',
        description: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit insurance claim');
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Submit Insurance Claim
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Insurance claim submitted successfully!</Alert>}

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
          label="Insurance Provider"
          name="insuranceProvider"
          value={formData.insuranceProvider}
          onChange={handleChange}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          label="Claim Number"
          name="claimNumber"
          value={formData.claimNumber}
          onChange={handleChange}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          label="Amount"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
          required
          margin="normal"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Claim'}
        </Button>
      </form>
    </Paper>
  );
};

export default InsuranceClaimForm; 