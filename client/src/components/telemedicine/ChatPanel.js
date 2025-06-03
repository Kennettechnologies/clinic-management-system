import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import { Send } from '@mui/icons-material';

const ChatPanel = ({ sessionId, auth }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/v1/telemedicine/${sessionId}`);
                setMessages(response.data.data.chatHistory);
                scrollToBottom();
            } catch (err) {
                console.error('Failed to fetch messages:', err);
            }
        };

        fetchMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);

        return () => clearInterval(interval);
    }, [sessionId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            await axios.post(`/api/v1/telemedicine/${sessionId}/chat`, {
                message: newMessage
            });
            setNewMessage('');
            // Fetch updated messages
            const response = await axios.get(`/api/v1/telemedicine/${sessionId}`);
            setMessages(response.data.data.chatHistory);
            scrollToBottom();
        } catch (err) {
            console.error('Failed to send message:', err);
        }
        setLoading(false);
    };

    return (
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Chat</Typography>
            </Box>

            <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messages.map((message, index) => (
                    <React.Fragment key={index}>
                        <ListItem alignItems="flex-start">
                            <ListItemText
                                primary={
                                    <Typography
                                        component="span"
                                        variant="subtitle2"
                                        color="text.primary"
                                    >
                                        {message.sender.firstName} {message.sender.lastName}
                                    </Typography>
                                }
                                secondary={
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        {message.message}
                                    </Typography>
                                }
                            />
                            <Typography variant="caption" color="text.secondary">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </Typography>
                        </ListItem>
                        {index < messages.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
                <div ref={messagesEndRef} />
            </List>

            <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 1
                }}
            >
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={loading}
                />
                <IconButton
                    color="primary"
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                >
                    <Send />
                </IconButton>
            </Box>
        </Paper>
    );
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps)(ChatPanel); 