import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';

const PharmacyDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axios.get('/api/prescriptions/pharmacy');
        setPrescriptions(response.data.data);
      } catch (err) {
        setError('Failed to fetch prescriptions');
      }
      setLoading(false);
    };

    fetchPrescriptions();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/prescriptions/${id}/status`, { status });
      setPrescriptions(prescriptions.filter(p => p._id !== id));
    } catch (err) {
      setError('Failed to update prescription status');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Pharmacy Dashboard
      </Typography>
      <List>
        {prescriptions.map((prescription) => (
          <ListItem key={prescription._id}>
            <ListItemText
              primary={`Patient: ${prescription.patient.name}`}
              secondary={`Doctor: ${prescription.doctor.name} | Created: ${new Date(prescription.createdAt).toLocaleDateString()}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                color="primary"
                onClick={() => handleUpdateStatus(prescription._id, 'filled')}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                edge="end"
                color="error"
                onClick={() => handleUpdateStatus(prescription._id, 'cancelled')}
              >
                <CloseIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default PharmacyDashboard; 