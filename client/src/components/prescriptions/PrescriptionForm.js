import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const PrescriptionForm = () => {
  const [patientId, setPatientId] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedication = (index) => {
    const newMedications = medications.filter((_, i) => i !== index);
    setMedications(newMedications);
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post('/api/prescriptions', {
        patient: patientId,
        medications,
        instructions
      });
      setSuccess(true);
      setPatientId('');
      setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
      setInstructions('');
    } catch (err) {
      setError('Failed to create prescription');
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create E-Prescription
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          margin="normal"
          required
        />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Medications
        </Typography>
        {medications.map((medication, index) => (
          <Grid container spacing={2} key={index} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Medication Name"
                value={medication.name}
                onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Dosage"
                value={medication.dosage}
                onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Frequency"
                value={medication.frequency}
                onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Duration"
                value={medication.duration}
                onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton onClick={() => handleRemoveMedication(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddMedication}
          sx={{ mt: 2 }}
        >
          Add Medication
        </Button>
        <TextField
          fullWidth
          label="Instructions"
          multiline
          rows={4}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Prescription'}
        </Button>
      </form>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Prescription created successfully!
        </Alert>
      )}
    </Paper>
  );
};

export default PrescriptionForm; 