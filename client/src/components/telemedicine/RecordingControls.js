import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  FiberManualRecord as RecordIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const RecordingControls = ({ sessionId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const startRecording = async () => {
    try {
      await axios.post(`/api/v1/telemedicine/${sessionId}/recording/start`);
      setIsRecording(true);
    } catch (err) {
      setError('Failed to start recording');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      await axios.post(`/api/v1/telemedicine/${sessionId}/recording/stop`);
      setIsRecording(false);
      setShowConfirmDialog(true);
    } catch (err) {
      setError('Failed to stop recording');
      console.error('Error stopping recording:', err);
    }
  };

  const saveRecording = async () => {
    setSaving(true);
    try {
      await axios.post(`/api/v1/telemedicine/${sessionId}/recording/save`);
      setShowConfirmDialog(false);
    } catch (err) {
      setError('Failed to save recording');
      console.error('Error saving recording:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecording = async () => {
    try {
      await axios.delete(`/api/v1/telemedicine/${sessionId}/recording`);
      setShowConfirmDialog(false);
    } catch (err) {
      setError('Failed to delete recording');
      console.error('Error deleting recording:', err);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {!isRecording ? (
          <Tooltip title="Start Recording">
            <IconButton
              color="error"
              onClick={startRecording}
              disabled={saving}
            >
              <RecordIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Stop Recording">
            <IconButton
              color="error"
              onClick={stopRecording}
              disabled={saving}
            >
              <StopIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Recording Complete</DialogTitle>
        <DialogContent>
          <Typography>
            Would you like to save this recording to the patient's medical records?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={deleteRecording}
            color="error"
            startIcon={<DeleteIcon />}
            disabled={saving}
          >
            Delete
          </Button>
          <Button
            onClick={saveRecording}
            color="primary"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </>
  );
};

export default RecordingControls; 