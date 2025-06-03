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

const LabTestResults = () => {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [results, setResults] = useState('');

  useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    try {
      const response = await axios.get('/api/lab/pending');
      setLabTests(response.data.data);
    } catch (err) {
      setError('Failed to fetch lab tests');
    }
    setLoading(false);
  };

  const handleUpdateResults = async () => {
    try {
      await axios.put(`/api/lab/${selectedTest._id}/results`, { results });
      setOpenDialog(false);
      fetchLabTests();
    } catch (err) {
      setError('Failed to update results');
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
        Lab Test Results
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Test Name</TableCell>
              <TableCell>Lab</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labTests.map((test) => (
              <TableRow key={test._id}>
                <TableCell>{test.patient.name}</TableCell>
                <TableCell>{test.testName}</TableCell>
                <TableCell>{test.lab}</TableCell>
                <TableCell>{test.status}</TableCell>
                <TableCell>
                  {new Date(test.orderDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setSelectedTest(test);
                      setResults('');
                      setOpenDialog(true);
                    }}
                  >
                    Update Results
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Lab Test Results</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Results"
            multiline
            rows={4}
            value={results}
            onChange={(e) => setResults(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateResults} color="primary">
            Save Results
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LabTestResults; 