import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const PatientHistory = () => {
  const [history, setHistory] = useState({ appointments: [], prescriptions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/patient/history/me');
        setHistory(response.data.data);
      } catch (err) {
        setError('Failed to fetch patient history');
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Patient History
      </Typography>
      <Typography variant="h6" gutterBottom>
        Appointments
      </Typography>
      <List>
        {history.appointments.map((appointment) => (
          <ListItem key={appointment._id}>
            <ListItemText
              primary={`Date: ${new Date(appointment.date).toLocaleString()}`}
              secondary={`Status: ${appointment.status}`}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" gutterBottom>
        Prescriptions
      </Typography>
      <List>
        {history.prescriptions.map((prescription) => (
          <ListItem key={prescription._id}>
            <ListItemText
              primary={`Medication: ${prescription.medication}`}
              secondary={`Created: ${new Date(prescription.createdAt).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default PatientHistory; 