import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';

const InsuranceClaimList = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await axios.get('/api/insurance/pending');
      setClaims(response.data.data);
    } catch (err) {
      setError('Failed to fetch insurance claims');
    }
    setLoading(false);
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`/api/insurance/${selectedClaim._id}/status`, { status });
      setOpenDialog(false);
      fetchClaims();
    } catch (err) {
      setError('Failed to update claim status');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Insurance Claims
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Insurance Provider</TableCell>
              <TableCell>Claim Number</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim._id}>
                <TableCell>{claim.patient.name}</TableCell>
                <TableCell>{claim.insuranceProvider}</TableCell>
                <TableCell>{claim.claimNumber}</TableCell>
                <TableCell>{claim.amount}</TableCell>
                <TableCell>{claim.status}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setStatus('');
                      setOpenDialog(true);
                    }}
                  >
                    Update Status
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Claim Status</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} color="primary">
            Save Status
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InsuranceClaimList; 