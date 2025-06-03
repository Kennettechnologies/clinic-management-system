import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, List, ListItem, ListItemText, ListItemIcon, CircularProgress, Button, Badge, IconButton } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  EventNote as AppointmentIcon,
  VideoCall as VideoIcon,
  People as PatientIcon,
  LocalHospital as DoctorIcon,
  Notifications as AlertIcon,
  AccessTime as TimeIcon,
  NotificationsActive as NotificationIcon,
  CalendarToday,
  LocalPharmacy,
  Science,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0,
    activeDoctors: 0,
    pendingConsultations: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes, notificationsRes] = await Promise.all([
          axios.get('/api/v1/dashboard/stats'),
          axios.get('/api/v1/dashboard/activity'),
          axios.get('/api/v1/dashboard/notifications')
        ]);
        setStats(statsRes.data);
        setRecentActivity(activityRes.data);
        setNotifications(notificationsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Set up polling for notifications
    const notificationInterval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(notificationInterval);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Icon sx={{ fontSize: 40, color }} />
      <Box>
        <Typography variant="h6">{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
      </Box>
    </Paper>
  );

  const appointmentData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Appointments',
        data: [12, 19, 15, 17, 22, 8, 5],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const patientData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Patients',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(54, 162, 235, 0.5)'
      }
    ]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const statsCards = [
    { title: 'Total Patients', value: stats.totalPatients, icon: <PatientIcon /> },
    { title: 'Today\'s Appointments', value: stats.todayAppointments, icon: <CalendarToday /> },
    { title: 'Pending Prescriptions', value: stats.pendingConsultations, icon: <LocalPharmacy /> },
    { title: 'Lab Results Pending', value: stats.pendingConsultations, icon: <Science /> },
  ];

  const recentActivities = [
    { text: 'New patient registration', time: '10 minutes ago' },
    { text: 'Appointment scheduled', time: '30 minutes ago' },
    { text: 'Lab results uploaded', time: '1 hour ago' },
    { text: 'Prescription issued', time: '2 hours ago' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Welcome, {user.name}
        </Typography>
        <IconButton 
          color="primary" 
          onClick={() => setShowNotifications(!showNotifications)}
          sx={{ position: 'relative' }}
        >
          <Badge badgeContent={notifications.length} color="error">
            <NotificationIcon />
          </Badge>
        </IconButton>
      </Box>

      {showNotifications && (
        <Paper sx={{ p: 2, mb: 3, maxHeight: 300, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>Notifications</Typography>
          <List>
            {notifications.map((notification, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <AlertIcon color={notification.type === 'urgent' ? 'error' : 'primary'} />
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.timestamp).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {stat.icon}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {stat.title}
                </Typography>
              </Box>
              <Typography variant="h4">{stat.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Appointments
            </Typography>
            <Line data={appointmentData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              New Patients (Last 6 Months)
            </Typography>
            <Bar data={patientData} />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={activity.text}
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <List>
              {stats.todayAppointments > 0 ? (
                <ListItem>
                  <ListItemIcon>
                    <TimeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${stats.todayAppointments} appointments today`}
                    secondary="Click to view details"
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/appointments')}
                  >
                    View All
                  </Button>
                </ListItem>
              ) : (
                <ListItem>
                  <ListItemText primary="No upcoming appointments" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {(user.role === 'doctor' || user.role === 'patient') && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Telemedicine
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<VideoIcon />}
                    fullWidth
                    onClick={() => navigate('/appointments/telemedicine')}
                  >
                    Schedule Video Consultation
                  </Button>
                </Grid>
                {stats.pendingConsultations > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<VideoIcon />}
                      fullWidth
                      onClick={() => navigate('/appointments/telemedicine/pending')}
                    >
                      {stats.pendingConsultations} Pending Consultations
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 