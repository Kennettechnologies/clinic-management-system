import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { connect, createLocalVideoTrack } from 'twilio-video';
import VideoPanel from './VideoPanel';
import ChatPanel from './ChatPanel';
import FileSharePanel from './FileSharePanel';
import ParticipantsPanel from './ParticipantsPanel';
import WaitingRoom from './WaitingRoom';
import RecordingControls from './RecordingControls';
import axios from 'axios';

const VideoConsultation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const [session, setSession] = useState(null);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [localParticipant, setLocalParticipant] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isSessionStarted, setIsSessionStarted] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await axios.get(`/api/telemedicine/${id}`);
                setSession(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch session details');
                setLoading(false);
            }
        };

        fetchSession();
    }, [id]);

    const handleStartSession = async () => {
        try {
            const response = await axios.post(`/api/telemedicine/${id}/token`);
            const { token } = response.data;

            const localTrack = await createLocalVideoTrack();
            const room = await connect(token, {
                name: session.meetingId,
                tracks: [localTrack]
            });

            setRoom(room);
            setLocalParticipant(room.localParticipant);
            setParticipants(Array.from(room.participants.values()));
            setIsSessionStarted(true);

            room.on('participantConnected', participant => {
                setParticipants(prev => [...prev, participant]);
            });

            room.on('participantDisconnected', participant => {
                setParticipants(prev => prev.filter(p => p.sid !== participant.sid));
            });

            room.on('disconnected', () => {
                navigate('/appointments');
            });
        } catch (err) {
            setError('Failed to join video session');
        }
    };

    const handleEndSession = async () => {
        try {
            await axios.post(`/api/telemedicine/${id}/end`);
            if (room) {
                room.disconnect();
            }
            navigate('/appointments');
        } catch (err) {
            setError('Failed to end session');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!isSessionStarted) {
        return <WaitingRoom sessionId={id} onStartSession={handleStartSession} />;
    }

    return (
        <Box p={3}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <VideoPanel
                        localParticipant={localParticipant}
                        participants={participants}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <ParticipantsPanel
                                localParticipant={localParticipant}
                                participants={participants}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <ChatPanel sessionId={id} />
                        </Grid>
                        <Grid item xs={12}>
                            <FileSharePanel sessionId={id} />
                        </Grid>
                        {user.role === 'doctor' && (
                            <Grid item xs={12}>
                                <RecordingControls
                                    sessionId={id}
                                    onEndSession={handleEndSession}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default VideoConsultation; 