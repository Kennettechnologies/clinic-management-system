import React from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip
} from '@mui/material';
import { Person, Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material';

const ParticipantsPanel = ({ participants }) => {
    const getParticipantStatus = (participant) => {
        const isAudioEnabled = participant.audioTracks.size > 0 && 
            Array.from(participant.audioTracks.values())[0].isEnabled;
        const isVideoEnabled = participant.videoTracks.size > 0 && 
            Array.from(participant.videoTracks.values())[0].isEnabled;

        return (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                    size="small"
                    icon={isAudioEnabled ? <Mic /> : <MicOff />}
                    label={isAudioEnabled ? 'Audio On' : 'Audio Off'}
                    color={isAudioEnabled ? 'success' : 'error'}
                />
                <Chip
                    size="small"
                    icon={isVideoEnabled ? <Videocam /> : <VideocamOff />}
                    label={isVideoEnabled ? 'Video On' : 'Video Off'}
                    color={isVideoEnabled ? 'success' : 'error'}
                />
            </Box>
        );
    };

    return (
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Participants ({participants.length + 1})</Typography>
            </Box>

            <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <ListItem>
                    <ListItemIcon>
                        <Person />
                    </ListItemIcon>
                    <ListItemText
                        primary="You"
                        secondary={getParticipantStatus(participants[0])}
                    />
                </ListItem>

                {participants.map((participant, index) => (
                    <ListItem key={index}>
                        <ListItemIcon>
                            <Person />
                        </ListItemIcon>
                        <ListItemText
                            primary={participant.identity}
                            secondary={getParticipantStatus(participant)}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default ParticipantsPanel; 