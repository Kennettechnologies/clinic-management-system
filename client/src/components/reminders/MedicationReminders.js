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
import { Check as CheckIcon, Snooze as SnoozeIcon } from '@mui/icons-material';

const MedicationReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await axios.get('/api/reminders/patient/me');
        setReminders(response.data.data);
      } catch (err) {
        setError('Failed to fetch reminders');
      }
      setLoading(false);
    };

    fetchReminders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/reminders/${id}`, { status });
      setReminders(reminders.map(reminder => 
        reminder._id === id ? { ...reminder, status } : reminder
      ));
    } catch (err) {
      setError('Failed to update reminder status');
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
        Medication Reminders
      </Typography>
      <List>
        {reminders.map((reminder) => (
          <ListItem key={reminder._id}>
            <ListItemText
              primary={reminder.medication}
              secondary={`Time: ${new Date(reminder.time).toLocaleString()} | Status: ${reminder.status}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                color="primary"
                onClick={() => handleUpdateStatus(reminder._id, 'taken')}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                edge="end"
                color="secondary"
                onClick={() => handleUpdateStatus(reminder._id, 'snoozed')}
              >
                <SnoozeIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default MedicationReminders; 