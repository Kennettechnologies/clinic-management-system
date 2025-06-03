import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Button
} from '@mui/material';
import {
    Mic,
    MicOff,
    Videocam,
    VideocamOff,
    CallEnd,
    ScreenShare,
    StopScreenShare
} from '@mui/icons-material';

const VideoPanel = ({ localParticipant, participants, onEndCall }) => {
    const localVideoRef = useRef();
    const remoteVideoRefs = useRef({});
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [screenTrack, setScreenTrack] = useState(null);

    useEffect(() => {
        if (localParticipant) {
            localParticipant.videoTracks.forEach(track => {
                track.attach(localVideoRef.current);
            });
        }

        return () => {
            if (localParticipant) {
                localParticipant.videoTracks.forEach(track => {
                    track.detach();
                });
            }
        };
    }, [localParticipant]);

    useEffect(() => {
        participants.forEach(participant => {
            participant.videoTracks.forEach(track => {
                if (!remoteVideoRefs.current[participant.sid]) {
                    remoteVideoRefs.current[participant.sid] = document.createElement('div');
                    document.getElementById('remote-videos').appendChild(remoteVideoRefs.current[participant.sid]);
                }
                track.attach(remoteVideoRefs.current[participant.sid]);
            });
        });

        return () => {
            participants.forEach(participant => {
                participant.videoTracks.forEach(track => {
                    track.detach();
                });
                if (remoteVideoRefs.current[participant.sid]) {
                    remoteVideoRefs.current[participant.sid].remove();
                    delete remoteVideoRefs.current[participant.sid];
                }
            });
        };
    }, [participants]);

    const toggleAudio = async () => {
        if (localParticipant) {
            const audioTrack = localParticipant.audioTracks.values().next().value;
            if (audioTrack) {
                if (audioTrack.isEnabled) {
                    await audioTrack.disable();
                } else {
                    await audioTrack.enable();
                }
            }
        }
    };

    const toggleVideo = async () => {
        if (localParticipant) {
            const videoTrack = localParticipant.videoTracks.values().next().value;
            if (videoTrack) {
                if (videoTrack.isEnabled) {
                    await videoTrack.disable();
                } else {
                    await videoTrack.enable();
                }
            }
        }
    };

    const startScreenSharing = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];
            setScreenTrack(screenTrack);
            await localParticipant.publishTrack(screenTrack);
            setIsScreenSharing(true);
        } catch (err) {
            console.error('Failed to start screen sharing:', err);
        }
    };

    const stopScreenSharing = async () => {
        if (screenTrack) {
            screenTrack.stop();
            await localParticipant.unpublishTrack(screenTrack);
            setScreenTrack(null);
            setIsScreenSharing(false);
        }
    };

    const isAudioEnabled = localParticipant?.audioTracks.values().next().value?.isEnabled;
    const isVideoEnabled = localParticipant?.videoTracks.values().next().value?.isEnabled;

    return (
        <Paper sx={{ position: 'relative', height: '70vh' }}>
            {/* Local video */}
            <Box
                ref={localVideoRef}
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: '200px',
                    height: '150px',
                    backgroundColor: 'black',
                    borderRadius: 1,
                    overflow: 'hidden',
                    zIndex: 1
                }}
            />

            {/* Remote videos */}
            <Box
                id="remote-videos"
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    p: 2
                }}
            />

            {/* Controls */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: 1,
                    borderRadius: 2
                }}
            >
                <IconButton
                    color={isAudioEnabled ? 'primary' : 'error'}
                    onClick={toggleAudio}
                >
                    {isAudioEnabled ? <Mic /> : <MicOff />}
                </IconButton>
                <IconButton
                    color={isVideoEnabled ? 'primary' : 'error'}
                    onClick={toggleVideo}
                >
                    {isVideoEnabled ? <Videocam /> : <VideocamOff />}
                </IconButton>
                <IconButton
                    color={isScreenSharing ? 'error' : 'primary'}
                    onClick={isScreenSharing ? stopScreenSharing : startScreenSharing}
                >
                    {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                </IconButton>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<CallEnd />}
                    onClick={onEndCall}
                >
                    End Call
                </Button>
            </Box>
        </Paper>
    );
};

export default VideoPanel; 