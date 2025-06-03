import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import VideoConsultation from './components/telemedicine/VideoConsultation';
import Unauthorized from './components/auth/Unauthorized';
import SymptomChecker from './components/ai/SymptomChecker';
import PrescriptionSuggestions from './components/ai/PrescriptionSuggestions';
import AppointmentOptimizer from './components/ai/AppointmentOptimizer';
import WaitingRoom from './components/telemedicine/WaitingRoom';
import PrescriptionForm from './components/prescriptions/PrescriptionForm';
import PharmacyDashboard from './components/pharmacy/PharmacyDashboard';
import MedicationReminders from './components/reminders/MedicationReminders';
import PatientHistory from './components/patient/PatientHistory';
import LabTestOrder from './components/lab/LabTestOrder';
import LabTestResults from './components/lab/LabTestResults';
import InsuranceClaimForm from './components/insurance/InsuranceClaimForm';
import InsuranceClaimList from './components/insurance/InsuranceClaimList';
import ClinicForm from './components/clinic/ClinicForm';
import BranchForm from './components/clinic/BranchForm';
import TwoFactorSetup from './components/auth/TwoFactorSetup';

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 