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
    ListItemAvatar,
    Avatar
} from '@mui/material';
import { useParams } from 'react-router-dom';

const WaitingRoom = () => {
    const { id } = useParams();
    const [participants, setParticipants] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await axios.get(`/api/telemedicine/${id}/participants`);
                setParticipants(response.data.data);
            } catch (err) {
                setError('Failed to fetch participants');
            }
            setLoading(false);
        };

        fetchParticipants();
    }, [id]);

    const handleStartSession = async () => {
        try {
            await axios.post(`/api/telemedicine/${id}/start`);
            // Redirect to video consultation or update UI
        } catch (err) {
            setError('Failed to start session');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Waiting Room
            </Typography>
            <List>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar>{participants?.patient?.name?.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={participants?.patient?.name}
                        secondary="Patient"
                    />
                </ListItem>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar>{participants?.doctor?.name?.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={participants?.doctor?.name}
                        secondary="Doctor"
                    />
                </ListItem>
            </List>
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleStartSession}
                sx={{ mt: 2 }}
            >
                Start Session
            </Button>
        </Paper>
    );
};

export default WaitingRoom; 