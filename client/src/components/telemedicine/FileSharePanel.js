import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Button,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    Description,
    Image,
    PictureAsPdf,
    Download,
    Upload
} from '@mui/icons-material';

const FileSharePanel = ({ sessionId, auth }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = React.useRef();

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get(`/api/telemedicine/${sessionId}`);
                setFiles(response.data.sharedFiles || []);
            } catch (err) {
                console.error('Failed to fetch files:', err);
            }
        };

        fetchFiles();
        // Poll for new files every 10 seconds
        const interval = setInterval(fetchFiles, 10000);

        return () => clearInterval(interval);
    }, [sessionId]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', file);

            // Upload file directly to telemedicine session
            await axios.post(`/api/telemedicine/${sessionId}/files`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Fetch updated files
            const response = await axios.get(`/api/telemedicine/${sessionId}`);
            setFiles(response.data.sharedFiles || []);
        } catch (err) {
            console.error('Failed to upload file:', err);
        }
        setLoading(false);
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) {
            return <Image />;
        } else if (type === 'application/pdf') {
            return <PictureAsPdf />;
        }
        return <Description />;
    };

    const handleDownload = async (file) => {
        try {
            // Download from the static uploads path
            const response = await axios.get(file.url, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to download file:', err);
        }
    };

    return (
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Shared Files</Typography>
            </Box>

            <Box sx={{ p: 2 }}>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                />
                <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={() => fileInputRef.current.click()}
                    disabled={loading}
                    fullWidth
                >
                    {loading ? <CircularProgress size={24} /> : 'Upload File'}
                </Button>
            </Box>

            <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {files.map((file, index) => (
                    <React.Fragment key={index}>
                        <ListItem
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    onClick={() => handleDownload(file)}
                                >
                                    <Download />
                                </IconButton>
                            }
                        >
                            <ListItemIcon>
                                {getFileIcon(file.type)}
                            </ListItemIcon>
                            <ListItemText
                                primary={file.name}
                                secondary={
                                    <Typography variant="caption">
                                        Uploaded by {file.uploadedBy.firstName} {file.uploadedBy.lastName}
                                        <br />
                                        {new Date(file.uploadedAt).toLocaleString()}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        {index < files.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps)(FileSharePanel); 